// ─────────────────────────────────────────────────────────────────────────────
// api/contact-form.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Sends contact form submissions via Resend API.
//
// SETUP: Set RESEND_API_KEY in Vercel environment variables.
//        Get your key from https://resend.com/api-keys
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_TO = "colelevy08@gmail.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, email, department, subject, message, toEmail } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = toEmail || FALLBACK_TO;

  // If no API key, log the submission and return success
  if (!apiKey) {
    console.log("CONTACT FORM (Resend not configured):", { name, email, department, subject, message });
    return res.status(200).json({ success: true, note: "logged" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Standard Fare Website <onboarding@resend.dev>",
        to: recipient,
        reply_to: email,
        subject: `[Website] ${department ? `[${department}] ` : ""}${subject}`,
        html: `
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
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Resend error:", err);
      return res.status(500).json({ error: "Failed to send message." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err.message);
    return res.status(500).json({ error: "Failed to send message." });
  }
}
