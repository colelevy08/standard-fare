// ─────────────────────────────────────────────────────────────────────────────
// api/sync-emails.js — Auto-pull customer emails from connected platforms
// ─────────────────────────────────────────────────────────────────────────────
// Called by the admin Email Hub on load. Pulls emails from any platform
// that has API credentials configured in Vercel env vars.
//
// Returns: { emails: [{ email, name, source, date }], sources: [...] }
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const emails = [];
  const sources = []; // which platforms were successfully queried

  // ── Resy: pull guest list from reservations ─────────────────────────────
  const resyKey = process.env.RESY_API_KEY;
  if (resyKey) {
    try {
      // Resy API: get reservations for last 90 days
      const venueId = process.env.RESY_VENUE_ID || "87064";
      const today = new Date().toISOString().split("T")[0];
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const resyRes = await fetch(
        `https://api.resy.com/3/venue/reservations?venue_id=${venueId}&start_date=${ninetyDaysAgo}&end_date=${today}&limit=500`,
        {
          headers: {
            Authorization: `ResyAPI api_key="${resyKey}"`,
            "User-Agent": "Mozilla/5.0",
          },
        }
      );

      if (resyRes.ok) {
        const data = await resyRes.json();
        const reservations = data.reservations || data.results || [];
        reservations.forEach((r) => {
          const guest = r.guest || r.user || {};
          const email = guest.email_address || guest.email || "";
          const name = [guest.first_name, guest.last_name].filter(Boolean).join(" ");
          if (email) {
            emails.push({
              email: email.toLowerCase(),
              name,
              source: "resy",
              date: r.date || r.created_at || "",
            });
          }
        });
        sources.push("resy");
      }
    } catch (e) {
      console.warn("Resy email sync failed:", e.message);
    }
  }

  // ── Toast: pull customer list from orders ───────────────────────────────
  const toastKey = process.env.TOAST_API_KEY;
  const toastRestaurant = process.env.TOAST_RESTAURANT_ID;
  if (toastKey && toastRestaurant) {
    const toastUrl = process.env.TOAST_API_URL || "https://ws-api.toasttab.com";
    try {
      const toastRes = await fetch(
        `${toastUrl}/orders/v2/orders?pageSize=500&businessDate=${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}`,
        {
          headers: {
            Authorization: `Bearer ${toastKey}`,
            "Toast-Restaurant-External-ID": toastRestaurant,
            "Content-Type": "application/json",
          },
        }
      );

      if (toastRes.ok) {
        const orders = await toastRes.json();
        (Array.isArray(orders) ? orders : []).forEach((order) => {
          const customer = order.customer || {};
          const email = customer.email || "";
          const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
          if (email) {
            emails.push({
              email: email.toLowerCase(),
              name,
              source: "toast",
              date: order.createdDate || order.businessDate || "",
            });
          }
        });
        sources.push("toast");
      }
    } catch (e) {
      console.warn("Toast email sync failed:", e.message);
    }
  }

  // ── Google Business: pull reviewer emails (limited by API) ──────────────
  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  if (googleKey) {
    // Google doesn't expose reviewer emails via Places API
    // But we note it as a configured source for the UI
    sources.push("google");
  }

  // Deduplicate
  const seen = new Set();
  const deduped = emails.filter((e) => {
    const key = e.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return res.status(200).json({
    emails: deduped,
    sources,
    count: deduped.length,
    syncedAt: new Date().toISOString(),
  });
}
