// ─────────────────────────────────────────────────────────────────────────────
// api/instagram-feed.js  —  Vercel Serverless Function
// ─────────────────────────────────────────────────────────────────────────────
// Fetches the 3 most recent posts from Standard Fare's public Instagram.
//
// Strategy (multi-fallback):
//   1. Fetch the profile embed page (/embed/) — lightweight, contains post data
//   2. Fall back to profile page HTML and extract shortcodes from script/meta tags
//   3. For each discovered post, fetch og:image from the individual post page
//
// CACHING:
//   12-hour Vercel CDN cache. Pass ?bust=<timestamp> to bypass.
// ─────────────────────────────────────────────────────────────────────────────

const INSTAGRAM_USERNAME = "standardfaresaratoga";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const HEADERS = {
  "User-Agent": BROWSER_UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Cache-Control": "no-cache",
};

// ── Strategy 1: Embed page ────────────────────────────────────────────────
// The /embed/ endpoint returns a lighter page with post images and shortcodes
async function tryEmbedPage() {
  const url = `https://www.instagram.com/${INSTAGRAM_USERNAME}/embed/`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const html = await res.text();

  const posts = [];

  // Extract image URLs from the embed HTML — they appear as background-image or img src
  // Pattern: class="EmbeddedMediaImage" src="..." or style="background-image: url(...)"
  const imgPattern = /(?:src|background-image:\s*url\()["']?(https:\/\/[^"'\s)]+(?:\.jpg|\.jpeg|\.png|\.webp)[^"'\s)]*)/gi;
  const imgUrls = [];
  let m;
  while ((m = imgPattern.exec(html)) !== null) {
    const url = m[1].replace(/&amp;/g, "&");
    // Only Instagram CDN URLs
    if (url.includes("instagram") || url.includes("cdninstagram") || url.includes("fbcdn")) {
      imgUrls.push(url);
    }
  }

  // Extract shortcodes linked in the embed
  const shortcodes = [];
  const scPattern = /\/(?:p|reel)\/([A-Za-z0-9_-]{6,30})\//g;
  while ((m = scPattern.exec(html)) !== null) {
    if (!shortcodes.includes(m[1])) shortcodes.push(m[1]);
  }

  // Pair shortcodes with images
  for (let i = 0; i < Math.min(shortcodes.length, 3); i++) {
    posts.push({
      id: shortcodes[i],
      imageUrl: imgUrls[i] || null,
      postUrl: `https://www.instagram.com/p/${shortcodes[i]}/`,
      caption: "",
    });
  }

  return posts;
}

// ── Strategy 2: Profile page scrape ───────────────────────────────────────
async function tryProfilePage() {
  const url = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) return [];
  const html = await res.text();

  const shortcodes = new Set();
  let m;

  // Links: /p/SHORTCODE/ or /reel/SHORTCODE/
  const linkPattern = /\/(?:p|reel)\/([A-Za-z0-9_-]{6,30})\//g;
  while ((m = linkPattern.exec(html)) !== null) shortcodes.add(m[1]);

  // JSON: "shortcode":"XXXXX"
  const jsonPattern = /"shortcode"\s*:\s*"([A-Za-z0-9_-]{6,30})"/g;
  while ((m = jsonPattern.exec(html)) !== null) shortcodes.add(m[1]);

  // Full URLs: instagram.com/p/SHORTCODE
  const urlPattern = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]{6,30})/g;
  while ((m = urlPattern.exec(html)) !== null) shortcodes.add(m[1]);

  // Extract image URLs from CDN references in script data
  const cdnImages = [];
  const cdnPattern = /(https?:\/\/(?:scontent|instagram)[^"'\s]+?\.(?:jpg|jpeg|png|webp)[^"'\s]*)/gi;
  while ((m = cdnPattern.exec(html)) !== null) {
    const imgUrl = m[1].replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
    if (!cdnImages.includes(imgUrl)) cdnImages.push(imgUrl);
  }

  const codes = [...shortcodes].slice(0, 3);
  return codes.map((sc, i) => ({
    id: sc,
    imageUrl: cdnImages[i] || null,
    postUrl: `https://www.instagram.com/p/${sc}/`,
    caption: extractCaption(html, sc),
  }));
}

// Extract caption text from embedded JSON near a shortcode
function extractCaption(html, shortcode) {
  const idx = html.indexOf(shortcode);
  if (idx === -1) return "";
  const nearby = html.substring(Math.max(0, idx - 500), Math.min(html.length, idx + 2000));
  const captionMatch = nearby.match(/"text"\s*:\s*"([^"]{1,200})"/);
  if (captionMatch) {
    try { return JSON.parse(`"${captionMatch[1]}"`); }
    catch { return captionMatch[1]; }
  }
  return "";
}

// ── Fetch og:image from individual post page ──────────────────────────────
async function fetchPostImage(shortcode) {
  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
      headers: HEADERS,
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Try og:image meta tag
    const ogMatch =
      html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) ||
      html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
    if (ogMatch?.[1]) return ogMatch[1].replace(/&amp;/g, "&");

    // Try twitter:image
    const twMatch =
      html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i) ||
      html.match(/<meta[^>]*content="([^"]+)"[^>]*name="twitter:image"/i);
    if (twMatch?.[1]) return twMatch[1].replace(/&amp;/g, "&");

    return null;
  } catch {
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const bustCache = !!req.query.bust;
  if (!bustCache) {
    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=21600");
  } else {
    res.setHeader("Cache-Control", "no-cache, no-store");
  }
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Strategy 1: Try embed page (lighter, more likely to have image URLs inline)
    let posts = await tryEmbedPage();

    // Strategy 2: Fall back to profile page scrape
    if (posts.length === 0) {
      posts = await tryProfilePage();
    }

    if (posts.length === 0) {
      return res.status(200).json({
        posts: [],
        fetchedAt: new Date().toISOString(),
        error: "Could not extract posts. Use admin to set manually.",
      });
    }

    // Fill in missing images by fetching individual post pages
    const resolved = await Promise.all(
      posts.slice(0, 3).map(async (post) => {
        if (post.imageUrl) return post;
        const imageUrl = await fetchPostImage(post.id);
        return { ...post, imageUrl };
      })
    );

    // Only return posts that have images
    const final = resolved.filter((p) => p.imageUrl);

    return res.status(200).json({
      posts: final,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("instagram-feed error:", err.message);
    return res.status(200).json({
      posts: [],
      fetchedAt: new Date().toISOString(),
      error: err.message,
    });
  }
}
