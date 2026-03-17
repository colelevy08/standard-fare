// ─────────────────────────────────────────────────────────────────────────────
// api/google-reviews.js  —  Vercel Serverless Function
// ─────────────────────────────────────────────────────────────────────────────
// Scrapes Google reviews for Standard Fare from Wanderlog (which aggregates
// Google reviews and embeds them as JSON in the page source).
//
// NO API KEY REQUIRED — completely free.
//
// Called by the React app at: /api/google-reviews
// Cached for 12 hours by Vercel's CDN. Returns 4- and 5-star reviews.
// ─────────────────────────────────────────────────────────────────────────────

const WANDERLOG_URL = "https://wanderlog.com/place/details/15823669/standard-fare";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(WANDERLOG_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) {
      throw new Error(`Wanderlog returned ${response.status}`);
    }

    const html = await response.text();

    // Extract the __MOBX_STATE__ JSON from the page using brace-depth counting.
    // Regex alone fails because Wanderlog has more JS assignments after the JSON
    // in the same <script> block, so we can't rely on `;</script>` as a boundary.
    const marker = "window.__MOBX_STATE__";
    const markerIdx = html.indexOf(marker);
    if (markerIdx === -1) {
      throw new Error("Could not find review data in page source");
    }

    const jsonStart = html.indexOf("{", markerIdx);
    if (jsonStart === -1) {
      throw new Error("Could not find JSON start after __MOBX_STATE__");
    }

    // Walk the string counting brace depth to find the end of the JSON object
    let depth = 0, end = -1, inStr = false, esc = false;
    for (let i = jsonStart; i < html.length; i++) {
      const c = html[i];
      if (esc) { esc = false; continue; }
      if (c === "\\" && inStr) { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === "{" || c === "[") depth++;
      if (c === "}" || c === "]") { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end === -1) throw new Error("Could not find end of review data JSON");

    let state;
    try {
      state = JSON.parse(html.substring(jsonStart, end));
    } catch (parseErr) {
      throw new Error("Failed to parse review data JSON");
    }

    // Navigate to the reviews array
    const placeData = state?.placePage?.data?.placeMetadata;
    const rawReviews = placeData?.reviews || [];
    const overallRating = placeData?.rating || null;
    const totalReviews = placeData?.numRatings || placeData?.numReviews || rawReviews.length;

    // Normalize into our format — include 4- and 5-star reviews (show real mix)
    const fiveStarReviews = rawReviews
      .filter((r) => r.rating >= 4 && r.reviewText && r.reviewText.length > 0)
      .map((r) => {
        // Calculate relative time
        let relativeTime = "";
        if (r.time) {
          const diff = Date.now() - new Date(r.time).getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          if (days < 1) relativeTime = "today";
          else if (days < 30) relativeTime = `${days} day${days !== 1 ? "s" : ""} ago`;
          else if (days < 365) {
            const months = Math.floor(days / 30);
            relativeTime = `${months} month${months !== 1 ? "s" : ""} ago`;
          } else {
            const years = Math.floor(days / 365);
            relativeTime = `${years} year${years !== 1 ? "s" : ""} ago`;
          }
        }

        // Check if review mentions key staff (used for soft prioritization)
        const textLower = (r.reviewText || "").toLowerCase();
        const mentionsStaff = textLower.includes("cole") || textLower.includes("staff")
          || textLower.includes("owner") || textLower.includes("team")
          || textLower.includes("service") || textLower.includes("hospitality");

        return {
          id: `google-${r.reviewId || r.time || Math.random()}`,
          name: r.reviewerName || "Google User",
          rating: r.rating,
          text: r.reviewText,
          time: r.time || null,
          relativeTime,
          source: "Google",
          reviewUrl: "https://www.google.com/maps/place/Standard+Fare/reviews",
          _priority: mentionsStaff ? 1 : 0,
        };
      });

    // Sort: staff/service mentions first, then by recency
    fiveStarReviews.sort((a, b) => {
      if (a._priority !== b._priority) return b._priority - a._priority;
      return new Date(b.time || 0) - new Date(a.time || 0);
    });

    // Strip internal priority field before sending
    const reviews = fiveStarReviews.map(({ _priority, ...rest }) => rest);

    // Cache for 12 hours
    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=21600");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json({
      reviews,
      rating: overallRating,
      totalReviews,
      fetchedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("google-reviews scrape error:", err.message);
    return res.status(200).json({
      reviews: [],
      error: err.message,
      rating: null,
      totalReviews: 0,
    });
  }
}
