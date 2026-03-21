// ─────────────────────────────────────────────────────────────────────────────
// api/contact-form.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Sends contact form submissions via Resend API.
//
// SETUP: Set RESEND_API_KEY in Vercel environment variables.
//        Get your key from https://resend.com/api-keys
//
// RATE LIMIT: 5 submissions per minute per IP to prevent spam/abuse.
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_TO = "colelevy08@gmail.com";

// ── Simple in-memory rate limiter (per serverless instance) ─────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX    = 5;      // contact form submissions per window

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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limit by IP
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many submissions. Please try again in a minute." });
  }

  const { name, email, department, subject, message, toEmail } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const recipient = toEmail || FALLBACK_TO;

  // ── Try Resend (if configured) ──────────────────────────────────────────
  // NOTE: Resend free tier with onboarding@resend.dev can only send to the
  // account owner email. Once you verify your domain (e.g. standardfaresaratoga.com)
  // in Resend dashboard, you can send to any address and use a custom from.
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    // On free tier, always deliver to the account owner; include intended
    // recipient in the subject so you know who it was meant for.
    const resendAccountEmail = process.env.RESEND_ACCOUNT_EMAIL || FALLBACK_TO;
    const deliverTo = resendAccountEmail;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Standard Fare Website <onboarding@resend.dev>",
          to: deliverTo,
          reply_to: email,
          subject: `[Website] ${department ? `[${department}] ` : ""}${subject}${recipient !== deliverTo ? ` (for: ${recipient})` : ""}`,
          html: buildEmailHtml({ name, email, department, subject, message }),
        }),
      });

      if (response.ok) return res.status(200).json({ success: true, provider: "resend" });
      console.error("Resend error:", await response.text());
    } catch (err) {
      console.error("Resend failed:", err.message);
    }
  }

  // ── Fallback: Formspree (50/mo free, no API key needed) ──────────────
  const formspreeId = process.env.FORMSPREE_ID;
  if (formspreeId) {
    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          department: department || "General",
          subject,
          message,
          _replyto: email,
          _subject: `[Website] ${department ? `[${department}] ` : ""}${subject}`,
        }),
      });

      if (response.ok) return res.status(200).json({ success: true, provider: "formspree" });
      console.error("Formspree error:", response.status);
    } catch (err) {
      console.error("Formspree failed:", err.message);
    }
  }

  // ── No provider configured — return error so frontend uses mailto ───────
  console.log("CONTACT FORM (no provider configured):", { name, email, department, subject, message, recipient });
  return res.status(500).json({ error: "Email service not configured. Please email us directly." });
}

function buildEmailHtml({ name, email, department, subject, message }) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1A2238; border-bottom: 2px solid #E8748A; padding-bottom: 12px;">
        New Message from Website
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #777; font-size: 13px; width: 100px;">Name</td>
          <td style="padding: 8px 0; color: #1A2238; font-size: 15px;"><strong>${name}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #777; font-size: 13px;">Email</td>
          <td style="padding: 8px 0; color: #1A2238; font-size: 15px;">
            <a href="mailto:${email}" style="color: #E8748A;">${email}</a>
          </td>
        </tr>
        ${department ? `
        <tr>
          <td style="padding: 8px 0; color: #777; font-size: 13px;">Department</td>
          <td style="padding: 8px 0; color: #1A2238; font-size: 15px;">${department}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 8px 0; color: #777; font-size: 13px;">Subject</td>
          <td style="padding: 8px 0; color: #1A2238; font-size: 15px;">${subject}</td>
        </tr>
      </table>
      <div style="background: #FAF8F5; border-left: 3px solid #E8748A; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
        <p style="color: #1A2238; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <p style="color: #999; font-size: 11px; margin-top: 30px;">
        Sent from standardfaresaratoga.com contact form
      </p>
    </div>
  `;
}
