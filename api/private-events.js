// ─────────────────────────────────────────────────────────────────────────────
// api/private-events.js — Vercel Serverless Function
// ─────────────────────────────────────────────────────────────────────────────
// Receives private event inquiry submissions from the front-end form.
//
// TODO: Add email sending via SendGrid or Resend so the events team receives
//       an email notification for each inquiry. Example with Resend:
//
//   import { Resend } from "resend";
//   const resend = new Resend(process.env.RESEND_API_KEY);
//   await resend.emails.send({
//     from: "Standard Fare <noreply@standardfare.com>",
//     to: process.env.EVENTS_EMAIL,
//     subject: `New Private Event Inquiry — ${body.eventType}`,
//     html: formatEmailHtml(body),
//   });
//
// TODO: Optionally store inquiries in a database (e.g. Supabase, Planetscale)
//       for tracking and follow-up.
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // ── CORS preflight ────────────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  // Set CORS headers for all responses
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // ── Only accept POST ──────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;

    // Basic validation
    const required = ["eventType", "preferredDate", "guestCount", "budgetRange", "name", "email"];
    const missing = required.filter((field) => !body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // ── Log the inquiry (replace with email sending / DB write later) ──────
    console.log("──────────────────────────────────────────────");
    console.log("NEW PRIVATE EVENT INQUIRY");
    console.log("──────────────────────────────────────────────");
    console.log("Event Type:    ", body.eventType);
    console.log("Preferred Date:", body.preferredDate);
    console.log("Guest Count:   ", body.guestCount);
    console.log("Budget Range:  ", body.budgetRange);
    console.log("Name:          ", body.name);
    console.log("Email:         ", body.email);
    console.log("Phone:         ", body.phone || "(not provided)");
    console.log("Details:       ", body.details || "(none)");
    console.log("──────────────────────────────────────────────");

    // TODO: Send notification email to events team here (see top of file)

    return res.status(200).json({
      success: true,
      message: "Your private event inquiry has been received. We'll be in touch soon!",
    });
  } catch (err) {
    console.error("Private events API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
