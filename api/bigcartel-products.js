// ─────────────────────────────────────────────────────────────────────────────
// api/bigcartel-products.js  —  Vercel Serverless Function
// ─────────────────────────────────────────────────────────────────────────────
// Proxies the Big Cartel public products JSON for Daniel Fairley's shop
// (poemdexter.bigcartel.com) to avoid CORS issues in the browser.
//
// Called by the React app at:  /api/bigcartel-products
//
// CACHING:
//   Vercel caches responses for 1 hour via Cache-Control header.
//   The admin "Force Refresh" button adds ?bust=<timestamp> to bypass cache.
// ─────────────────────────────────────────────────────────────────────────────

const BIGCARTEL_URL = "https://poemdexter.bigcartel.com/products.json";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(BIGCARTEL_URL, {
      headers: {
        "User-Agent": "StandardFare-Website/1.0",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Big Cartel returned ${response.status}`);
    }

    const products = await response.json();

    // Normalize into a simpler shape for the frontend
    const normalized = products.map((p) => ({
      id: p.id,
      title: p.name,
      permalink: p.permalink,
      url: `https://poemdexter.bigcartel.com${p.url}`,
      status: p.status, // "active" or "sold-out"
      price: p.default_price || p.price || 0,
      imageUrl: p.images?.[0]?.url || null,
      categories: (p.categories || []).map((c) => c.name),
      description: (p.description || "").replace(/<[^>]+>/g, "").trim(),
      createdAt: p.created_at,
    }));

    // Cache for 1 hour, stale-while-revalidate for 6 hours
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=21600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json({ products: normalized, fetchedAt: new Date().toISOString() });

  } catch (err) {
    console.error("bigcartel-products error:", err.message);
    return res.status(500).json({ products: [], error: err.message });
  }
}
