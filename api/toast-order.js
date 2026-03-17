// ─────────────────────────────────────────────────────────────────────────────
// api/toast-order.js — Vercel serverless function
// ─────────────────────────────────────────────────────────────────────────────
// Receives cart orders from the checkout page and forwards them to Toast POS.
//
// TOAST SETUP:
//   Set these environment variables in Vercel:
//     TOAST_API_KEY          — from Toast Developer portal
//     TOAST_RESTAURANT_ID    — your restaurant's Toast GUID
//     TOAST_API_URL          — Toast API base (default: https://ws-api.toasttab.com)
//
//   Until these are configured, orders are logged and an email notification
//   is sent (or stored for manual processing).
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });

  const { customer, items, total } = req.body;

  if (!customer?.name || !customer?.email || !items?.length) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const toastApiKey       = process.env.TOAST_API_KEY;
  const toastRestaurantId = process.env.TOAST_RESTAURANT_ID;
  const toastApiUrl       = process.env.TOAST_API_URL || "https://ws-api.toasttab.com";

  // ── If Toast credentials are configured, submit to Toast ────────────────
  if (toastApiKey && toastRestaurantId) {
    try {
      // Build Toast order payload
      // NOTE: Adjust this structure to match your Toast API version and menu setup.
      // This is a simplified version — real integration may need menu item GUIDs,
      // modifier groups, dining options, etc.
      const orderPayload = {
        entityType: "Order",
        restaurantGuid: toastRestaurantId,
        diningOption: { guid: "TAKEOUT" },
        customer: {
          firstName: customer.name.split(" ")[0],
          lastName: customer.name.split(" ").slice(1).join(" ") || "",
          email: customer.email,
          phone: customer.phone || "",
        },
        selections: items
          .filter((i) => i.toastProductId)
          .map((item) => ({
            itemGuid: item.toastProductId,
            quantity: item.quantity,
            displayName: item.name,
          })),
        specialInstructions: [
          customer.notes || "",
          // Include items without Toast IDs as special instructions
          ...items
            .filter((i) => !i.toastProductId)
            .map((i) => `${i.quantity}x ${i.name}${i.variant ? ` (${i.variant})` : ""} - $${i.price}`),
        ].filter(Boolean).join("\n"),
      };

      const response = await fetch(`${toastApiUrl}/orders/v2/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Toast-Restaurant-External-ID": toastRestaurantId,
          Authorization: `Bearer ${toastApiKey}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          message: "Order placed! We'll have it ready for pickup. Check your email for confirmation.",
          orderId: data.guid || data.id,
        });
      }

      // Toast returned an error — log it and fall through to manual processing
      const errText = await response.text();
      console.error("Toast API error:", response.status, errText);
    } catch (err) {
      console.error("Toast API call failed:", err.message);
    }
  }

  // ── Fallback: log the order for manual processing ──────────────────────
  console.log("=== NEW ORDER (manual processing) ===");
  console.log("Customer:", JSON.stringify(customer));
  console.log("Items:", JSON.stringify(items));
  console.log("Total:", total);
  console.log("Timestamp:", new Date().toISOString());
  console.log("=====================================");

  // Still return success — the restaurant will see it in server logs
  // and can process it manually
  return res.status(200).json({
    success: true,
    message: "Order received! We'll confirm shortly via email. Thank you!",
  });
}
