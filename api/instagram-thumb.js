// ─────────────────────────────────────────────────────────────────────────────
// api/instagram-thumb.js  —  Vercel Serverless Function
// ─────────────────────────────────────────────────────────────────────────────
// Called by the React app at:  /api/instagram-thumb?id=DVwVBuUEmM3
//
// What it does:
//   1. Fetches the Instagram post page (server-side, so no CORS issues)
//   2. Extracts the og:image meta tag — that's the plain post photo
//   3. Returns { imageUrl: "https://..." } as JSON
//
// WHY SERVER-SIDE:
//   Instagram blocks direct browser fetches (CORS). This function runs on
//   Vercel's servers where there's no CORS restriction. The browser calls
//   this function, which calls Instagram, and passes back just the image URL.
//
// CACHING:
//   Vercel caches responses for 24 hours via the Cache-Control header,
//   so the Instagram page is only fetched once per day per post ID.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  // Validate the post ID — Instagram shortcodes are alphanumeric + _ and -
  if (!id || !/^[A-Za-z0-9_-]{5,30}$/.test(id)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    // Fetch the Instagram post page, pretending to be a browser
    const response = await fetch(`https://www.instagram.com/p/${id}/`, {
      headers: {
        // Use a realistic browser user-agent to avoid Instagram blocking the request
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Instagram returned ${response.status}`);
    }

    const html = await response.text();

    // Extract the og:image meta tag — this is the post's main photo URL
    // Instagram sets this to the full-resolution post image
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
      || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);

    if (!ogImageMatch || !ogImageMatch[1]) {
      throw new Error("Could not find og:image in Instagram page");
    }

    // Decode HTML entities in the URL (Instagram uses &amp; in some URLs)
    const imageUrl = ogImageMatch[1].replace(/&amp;/g, "&");

    // Return the image URL with a 24-hour cache
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow the React app to call this
    return res.status(200).json({ imageUrl });

  } catch (err) {
    console.error(`instagram-thumb error for ${id}:`, err.message);
    // Return a null imageUrl — the UI will show a fallback
    return res.status(200).json({ imageUrl: null, error: err.message });
  }
}
