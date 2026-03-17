// ─────────────────────────────────────────────────────────────────────────────
// api/press-refresh.js  —  Vercel Serverless Function
// ─────────────────────────────────────────────────────────────────────────────
// Searches Google News RSS for press mentions of Standard Fare and Bocage
// Champagne Bar in Saratoga Springs. Filters out negative articles and returns
// only positive press with outlet name, headline, URL, and favicon logo.
//
// Cached for 12 hours by Vercel's CDN.  Pass ?force=true to bypass cache.
// ─────────────────────────────────────────────────────────────────────────────

const SEARCH_QUERIES = [
  "Standard Fare Saratoga",
  "Bocage Champagne Bar Saratoga",
];

const NEGATIVE_WORDS = [
  "closed",
  "closing",
  "violation",
  "violations",
  "complaint",
  "complaints",
  "shutdown",
  "shut down",
  "lawsuit",
  "health department",
  "failed",
  "failure",
  "shut down",
  "investigation",
  "recall",
  "contamination",
  "rodent",
  "roach",
  "infestation",
  "fine",
  "fined",
  "penalty",
  "arrest",
  "fraud",
  "bankrupt",
  "bankruptcy",
];

/**
 * Build the Google News RSS URL for a given query.
 */
function buildRssUrl(query) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

/**
 * Extract the domain from a URL string.
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/**
 * Very lightweight XML‑tag extractor.  Returns an array of the inner‑text
 * values for every occurrence of <tagName>…</tagName> in `xml`.
 */
function extractTag(xml, tagName) {
  const re = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tagName}>|<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "gi");
  const results = [];
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1] || m[2] || "");
  }
  return results;
}

/**
 * Parse a Google News RSS feed XML string into an array of article objects.
 */
function parseRssFeed(xml) {
  const articles = [];

  // Split on <item> blocks
  const items = xml.split("<item>");
  // First element is the channel header — skip it
  for (let i = 1; i < items.length; i++) {
    const block = items[i].split("</item>")[0];

    const titles = extractTag(block, "title");
    const links = extractTag(block, "link");
    const sources = extractTag(block, "source");

    const headline = (titles[0] || "").trim();
    const url = (links[0] || "").trim();
    const outlet = (sources[0] || "").trim();

    if (!headline || !url) continue;

    // Derive a logo from the source URL attribute or the article link
    let sourceDomain = "";
    const sourceUrlMatch = block.match(/<source[^>]+url="([^"]+)"/);
    if (sourceUrlMatch) {
      sourceDomain = extractDomain(sourceUrlMatch[1]);
    }
    if (!sourceDomain) {
      sourceDomain = extractDomain(url);
    }

    const logo = sourceDomain
      ? `https://www.google.com/s2/favicons?domain=${sourceDomain}&sz=128`
      : "";

    articles.push({ outlet, headline, url, logo });
  }

  return articles;
}

/**
 * Returns true if the headline appears to contain negative sentiment.
 */
function isNegative(headline) {
  const lower = headline.toLowerCase();
  return NEGATIVE_WORDS.some((word) => lower.includes(word));
}

/**
 * Deduplicate articles by URL.
 */
function deduplicateByUrl(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const forceRefresh = req.query.force === "true";

  // Cache headers — 12 hours unless force=true
  if (forceRefresh) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  } else {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=43200, stale-while-revalidate=21600"
    );
  }
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Fetch all RSS feeds in parallel
    const feedPromises = SEARCH_QUERIES.map(async (query) => {
      const rssUrl = buildRssUrl(query);
      const response = await fetch(rssUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
      });

      if (!response.ok) {
        console.error(`Google News RSS returned ${response.status} for query: "${query}"`);
        return [];
      }

      const xml = await response.text();
      return parseRssFeed(xml);
    });

    const allResults = await Promise.all(feedPromises);
    const combined = allResults.flat();

    // Deduplicate, then filter out negative press
    const unique = deduplicateByUrl(combined);
    const positive = unique.filter((article) => !isNegative(article.headline));

    return res.status(200).json({
      articles: positive,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("press-refresh error:", err.message);
    return res.status(200).json({
      articles: [],
      lastUpdated: new Date().toISOString(),
      error: err.message,
    });
  }
};
