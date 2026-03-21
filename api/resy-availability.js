// ─────────────────────────────────────────────────────────────────────────────
// api/resy-availability.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Queries Resy for real-time table availability / wait time.
// Returns available time slots for today.
//
// CACHING: 5-minute CDN cache to avoid hammering Resy.
// RATE LIMIT: In-memory sliding window — max 30 requests/minute per IP.
// ─────────────────────────────────────────────────────────────────────────────

const RESY_VENUE_ID = 87064; // Standard Fare Saratoga Springs — stable Resy venue ID

// ── Simple in-memory rate limiter (per serverless instance) ─────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX    = 30;     // requests per window

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  record.count++;
  if (record.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Periodically clean stale entries to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW * 2;
  for (const [ip, record] of rateLimitMap) {
    if (record.start < cutoff) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW * 2);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit by IP
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  }

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=120");

  // Use Eastern time for default date (Saratoga Springs, NY)
  const date = req.query.date || new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const partySize = req.query.party || 2;

  // Require API key — don't fall back to a hardcoded key
  const resyApiKey = process.env.RESY_API_KEY;
  if (!resyApiKey) {
    return res.status(200).json({
      available: true,
      message: "Reserve on Resy",
      slots: [],
      source: "fallback",
    });
  }

  try {
    // Direct availability lookup with known venue ID
    const availUrl = `https://api.resy.com/4/find?lat=43.0806&long=-73.7849&day=${date}&party_size=${partySize}&venue_id=${RESY_VENUE_ID}`;

    const availRes = await fetch(availUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Authorization: `ResyAPI api_key="${resyApiKey}"`,
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
