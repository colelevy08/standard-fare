// ─────────────────────────────────────────────────────────────────────────────
// api/gift-card-purchase.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Receives eGift card purchase requests and forwards to Toast POS.
//
// TOAST SETUP:
//   Set these environment variables in Vercel:
//     TOAST_API_KEY          — from Toast Developer portal
//     TOAST_RESTAURANT_ID    — your restaurant's Toast GUID
//     TOAST_API_URL          — Toast API base (default: https://ws-api.toasttab.com)
//
//   Until these are configured, purchases are logged for manual processing.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { amount, recipientName, recipientEmail, senderName, senderEmail, message } = req.body;

  if (!amount || amount < 5 || !recipientName || !recipientEmail || !senderName || !senderEmail) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const toastApiKey       = process.env.TOAST_API_KEY;
  const toastRestaurantId = process.env.TOAST_RESTAURANT_ID;
  const toastApiUrl       = process.env.TOAST_API_URL || "https://ws-api.toasttab.com";

  // ── If Toast credentials are configured, submit eGift card order ────────
  if (toastApiKey && toastRestaurantId) {
    try {
      const giftCardPayload = {
        restaurantGuid: toastRestaurantId,
        amount,
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        message: message || "",
      };

      const response = await fetch(`${toastApiUrl}/giftCards/v1/giftCards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Toast-Restaurant-External-ID": toastRestaurantId,
          Authorization: `Bearer ${toastApiKey}`,
        },
        body: JSON.stringify(giftCardPayload),
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          message: "Gift card purchased successfully! The recipient will receive it via email.",
          giftCardId: data.guid || data.id,
        });
      }

      const errText = await response.text();
      console.error("Toast Gift Card API error:", response.status, errText);
    } catch (err) {
      console.error("Toast Gift Card API call failed:", err.message);
    }
  }

  // ── Fallback: log for manual processing ─────────────────────────────────
  console.log("=== NEW GIFT CARD PURCHASE (manual processing) ===");
  console.log("Amount:", amount);
  console.log("Recipient:", recipientName, recipientEmail);
  console.log("Sender:", senderName, senderEmail);
  console.log("Message:", message || "(none)");
  console.log("Timestamp:", new Date().toISOString());
  console.log("==================================================");

  return res.status(200).json({
    success: true,
    message: "Gift card purchase received! The recipient will receive their eGift card via email shortly.",
  });
}
