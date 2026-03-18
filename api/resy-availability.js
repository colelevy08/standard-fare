// ─────────────────────────────────────────────────────────────────────────────
// api/resy-availability.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Scrapes Resy for real-time table availability / wait time.
// Returns available time slots for today.
//
// CACHING: 5-minute CDN cache to avoid hammering Resy.
// ─────────────────────────────────────────────────────────────────────────────

const RESY_VENUE_SLUG = "standard-fare";
const RESY_CITY = "saratoga-springs-ny";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=120");

  const date = req.query.date || new Date().toISOString().split("T")[0];
  const partySize = req.query.party || 2;

  try {
    // Resy's public API endpoint for venue availability
    const url = `https://api.resy.com/4/find?lat=43.0806&long=-73.7849&day=${date}&party_size=${partySize}&venue_id=`;

    // Try to get venue info first from Resy's search
    const searchUrl = `https://api.resy.com/3/venuesearch/search?query=${encodeURIComponent("Standard Fare Saratoga")}&geo=%7B%22latitude%22%3A43.0806%2C%22longitude%22%3A-73.7849%7D`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Authorization: `ResyAPI api_key="${process.env.RESY_API_KEY || "VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5"}"`,
      },
    });

    if (!searchRes.ok) {
      return res.status(200).json({
        available: true,
        message: "Tables available — reserve on Resy",
        slots: [],
        source: "fallback",
      });
    }

    const searchData = await searchRes.json();
    const venue = searchData?.search?.hits?.[0];

    if (!venue) {
      return res.status(200).json({
        available: true,
        message: "Check Resy for availability",
        slots: [],
        source: "fallback",
      });
    }

    // Get availability for the venue
    const availUrl = `https://api.resy.com/4/find?lat=43.0806&long=-73.7849&day=${date}&party_size=${partySize}&venue_id=${venue.id?.resy}`;

    const availRes = await fetch(availUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Authorization: `ResyAPI api_key="${process.env.RESY_API_KEY || "VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5"}"`,
      },
    });

    if (!availRes.ok) {
      return res.status(200).json({
        available: true,
        message: "Check Resy for availability",
        slots: [],
        source: "fallback",
      });
    }

    const availData = await availRes.json();
    const results = availData?.results?.venues?.[0];
    const slots = results?.slots || [];

    const formattedSlots = slots.slice(0, 8).map((s) => ({
      time: s.date?.start,
      type: s.config?.type || "Dining Room",
    }));

    return res.status(200).json({
      available: formattedSlots.length > 0,
      message: formattedSlots.length > 0
        ? `${formattedSlots.length} time${formattedSlots.length !== 1 ? "s" : ""} available tonight`
        : "No tables available for this time — try a different date",
      slots: formattedSlots,
      date,
      partySize: Number(partySize),
    });
  } catch (err) {
    console.error("Resy availability error:", err.message);
    return res.status(200).json({
      available: true,
      message: "Reserve on Resy",
      slots: [],
      source: "fallback",
    });
  }
}
