// ─────────────────────────────────────────────────────────────────────────────
// api/email-signup.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Handles email newsletter signups. Supports Mailchimp and Klaviyo.
//
// SETUP:
//   For Mailchimp: Set MAILCHIMP_API_KEY and use listId from admin settings
//   For Klaviyo:   Set KLAVIYO_API_KEY and use listId from admin settings
// ─────────────────────────────────────────────────────────────────────────────

// ── Simple in-memory rate limiter (per serverless instance) ─────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX    = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) { rateLimitMap.set(ip, { count: 1, start: now }); return false; }
  if (now - record.start > RATE_LIMIT_WINDOW) { rateLimitMap.set(ip, { count: 1, start: now }); return false; }
  record.count++;
  return record.count > RATE_LIMIT_MAX;
}
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW * 2;
  for (const [ip, record] of rateLimitMap) { if (record.start < cutoff) rateLimitMap.delete(ip); }
}, RATE_LIMIT_WINDOW * 2);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { email, provider, listId } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  // ── Mailchimp ──────────────────────────────────────────────────────────
  if (provider === "mailchimp") {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    if (!apiKey || !listId) {
      console.log("EMAIL SIGNUP (Mailchimp not configured):", email);
      return res.status(200).json({ success: true });
    }

    const dc = apiKey.split("-").pop(); // e.g., "us21"
    try {
      const response = await fetch(
        `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            status: "subscribed",
            tags: ["Website Signup"],
          }),
        }
      );

      if (response.ok || response.status === 400) {
        // 400 = already subscribed, which is fine
        return res.status(200).json({ success: true });
      }
      throw new Error(`Mailchimp error: ${response.status}`);
    } catch (err) {
      console.error("Mailchimp signup failed:", err.message);
      return res.status(500).json({ error: "Signup failed." });
    }
  }

  // ── Klaviyo ────────────────────────────────────────────────────────────
  if (provider === "klaviyo") {
    const apiKey = process.env.KLAVIYO_API_KEY;
    if (!apiKey || !listId) {
      console.log("EMAIL SIGNUP (Klaviyo not configured):", email);
      return res.status(200).json({ success: true });
    }

    try {
      const response = await fetch(
        "https://a.klaviyo.com/api/v2/list/" + listId + "/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: apiKey,
            profiles: [{ email }],
          }),
        }
      );

      if (response.ok) return res.status(200).json({ success: true });
      throw new Error(`Klaviyo error: ${response.status}`);
    } catch (err) {
      console.error("Klaviyo signup failed:", err.message);
      return res.status(500).json({ error: "Signup failed." });
    }
  }

  // ── No provider configured — log it ────────────────────────────────────
  console.log("EMAIL SIGNUP (no provider):", email, new Date().toISOString());
  return res.status(200).json({ success: true });
}
