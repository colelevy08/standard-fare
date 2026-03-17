// ─────────────────────────────────────────────────────────────────────────────
// api/gift-card-balance.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Checks gift card balance via Toast API.
// Until TOAST_API_KEY is set, returns a helpful message.
//
// SETUP: Set TOAST_API_KEY and TOAST_RESTAURANT_ID in Vercel env vars.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const card = req.query.card;
  if (!card) return res.status(400).json({ error: "Card number is required." });

  const toastApiKey = process.env.TOAST_API_KEY;
  const toastRestaurantId = process.env.TOAST_RESTAURANT_ID;
  const toastApiUrl = process.env.TOAST_API_URL || "https://ws-api.toasttab.com";

  if (!toastApiKey || !toastRestaurantId) {
    return res.status(200).json({
      error: "Gift card balance checking is not yet configured. Please call us at (518) 450-0876 and we'll check for you!",
    });
  }

  try {
    // Toast gift card balance endpoint
    const response = await fetch(
      `${toastApiUrl}/giftCards/v1/giftCards/${encodeURIComponent(card)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Toast-Restaurant-External-ID": toastRestaurantId,
          Authorization: `Bearer ${toastApiKey}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(200).json({ error: "Card not found. Please check the number and try again." });
      }
      return res.status(200).json({ error: "Unable to check balance right now. Please try again later." });
    }

    const data = await response.json();
    return res.status(200).json({
      balance: data.currentBalance || data.balance || 0,
      lastUsed: data.lastTransactionDate || null,
    });
  } catch (err) {
    console.error("Gift card balance check failed:", err.message);
    return res.status(200).json({
      error: "Unable to check balance. Please call us at (518) 450-0876.",
    });
  }
}
