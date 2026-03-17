# Credentials & API Keys Checklist

Everything you need from the owners after the sale. Each credential includes what it does, where to get it, and where to put it.

---

## 1. Toast POS API (Online Orders & Checkout)

**What it does:** Connects the cart/checkout system to Toast so orders flow into the kitchen automatically.

**Credentials needed:**

| Credential | Where to find it | Where to set it |
|---|---|---|
| `TOAST_API_KEY` | Toast Developer Portal → API Keys → Create key with "Orders" scope | Vercel → Settings → Environment Variables |
| `TOAST_RESTAURANT_ID` | Toast Admin → Restaurant Info → "GUID" (a long alphanumeric string) | Vercel → Settings → Environment Variables |
| `TOAST_API_URL` | Usually `https://ws-api.toasttab.com` (default, only change for sandbox) | Vercel → Settings → Environment Variables (optional) |

**How to get access:**
1. Owner logs into [pos.toasttab.com](https://pos.toasttab.com)
2. Go to **Technology Partners** → **API Access**
3. Request API access (may need to contact Toast support or their Toast rep)
4. Once approved, generate an API key with **Orders** permissions
5. Copy the Restaurant GUID from Restaurant Admin → Info

**Status check:** Until these are set, checkout shows "Call to Order" fallback — no orders are lost.

---

## 2. Toast Product IDs (Per-Item Linking)

**What it does:** Maps each website item (bottles, merch, paintings, event tickets) to a specific Toast menu item so the POS knows exactly what was ordered.

**Where to find them:**
1. In Toast Admin → **Menu Management** → click any item → the URL contains the GUID
2. Or use Toast API: `GET /menus/v2/menus` to list all items with GUIDs

**Where to set them:**
- Admin Panel → edit each item → paste the Toast Product ID in the "Toast Product ID" field
- Items without a Toast ID will appear as special instructions on the order

**Items that need Toast IDs:**

| Category | Items |
|---|---|
| Bottles | All wine & beer bottles in the bottle shop |
| Merch | Logo Tee, Dad Hat, Enamel Pin, Tote Bag, Recipe Cards, Crewneck |
| Paintings | Each Daniel Fairley painting listed for sale |
| Events | Each ticketed event (wine tastings, etc.) |

---

## 3. Toast Online Ordering URL

**What it does:** Used as fallback for DoorDash delivery link. The website now has its own built-in pickup ordering page at `/order` where guests browse the menu, add items to a separate pickup cart, and submit orders directly to Toast.

**Current placeholder:** `https://order.toasttab.com/online/tbd-name-bocage-group-21-phila-street`

**Where to find it:**
1. Toast Admin → **Online Ordering** → Enable if not already
2. The URL format is: `https://order.toasttab.com/online/[restaurant-slug]`
3. Owner can find it under Toast Online Ordering settings

**Where to set it:**
- Admin Panel → Links → "Toast Online Order URL"
- Or directly in `siteData.js` → `links.toastOnlineOrder`

---

## 4. Toast Gift Cards

**What it does:** The website has a built-in gift card purchase page at `/gift-cards` where guests select an amount, enter recipient details, and submit. Orders are sent to `/api/gift-card-purchase` for Toast eGift card fulfillment. A balance checker is also available on the contact page and gift cards page.

**Current placeholder:** `https://order.toasttab.com/egiftcards/tbd-name-bocage-group-21-phila-street`

**Where to find it:**
1. Toast Admin → **Gift Cards** → Enable e-gift cards
2. The URL is: `https://order.toasttab.com/egiftcards/[restaurant-slug]`

**Where to set it:**
- Admin Panel → Links → "Gift Cards URL" (used as fallback)

---

## 5. Resy (Reservations)

**What it does:** Powers the "Reserve a Table" button everywhere on the site.

**Current value:** `https://resy.com/cities/saratoga-springs-ny/venues/standard-fare`

**Status:** Likely already correct if Standard Fare is live on Resy. Verify with owners.

**Where to verify:**
1. Go to resy.com and search "Standard Fare Saratoga Springs"
2. Confirm the URL matches what's in the site

**Where to set it:**
- Admin Panel → Links → "Reservations URL"

---

## 6. DoorDash URL

**What it does:** Powers the "Order on DoorDash" link.

**Current value:** `https://www.doordash.com/store/standard-fare-saratoga-springs-36042139/84089149/`

**Status:** Verify this store ID is correct with owners.

**Where to verify:**
1. Search DoorDash for "Standard Fare Saratoga Springs"
2. Copy the correct URL

**Where to set it:**
- Admin Panel → Links → "DoorDash URL"

---

## 7. Supabase (Database — Already Configured)

**What it does:** Stores all admin edits (menus, events, gallery, settings) persistently.

**Current status:** ✅ Already configured and working.

| Credential | Status |
|---|---|
| `REACT_APP_SUPABASE_URL` | Set in `.env` and Vercel |
| `REACT_APP_SUPABASE_ANON_KEY` | Set in `.env` and Vercel |

**If transferring ownership:**
1. Transfer the Supabase project to the owners' account
2. Or create a new project and update the env vars

---

## 8. SMS Text Club (Twilio / Webhook)

**What it does:** Allows customers to sign up for text message deals and flash specials.

**Credentials needed:**

| Credential | Where to find it | Where to set it |
|---|---|---|
| Twilio keyword | Twilio Console → Messaging → set up keyword | Admin Panel → SMS Club → Keyword |
| Twilio shortcode or number | Twilio Console → Phone Numbers | Admin Panel → SMS Club → Shortcode |
| Webhook URL | Twilio/Zapier/Make automation URL | Admin Panel → SMS Club → Webhook URL |

**Options (cheapest to most feature-rich):**
1. **Free**: Use Google Forms + a QR code (no texts, just collects numbers)
2. **$20/mo**: Twilio + Zapier — auto-sends texts when owner creates a deal
3. **$50-100/mo**: Dedicated SMS platform like SlickText or EZTexting

**Where to set it:**
- Admin Panel → SMS Text Club section
- Current placeholder shortcode is `12345` — replace with real one

---

## 9. Vercel Environment Variables Summary

**Where to set all server-side credentials:**
1. Go to [vercel.com](https://vercel.com) → Standard Fare project
2. Settings → Environment Variables
3. Add each variable for **Production** environment

| Variable | Required? | Notes |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | ✅ Yes | Already set |
| `REACT_APP_SUPABASE_ANON_KEY` | ✅ Yes | Already set |
| `REACT_APP_PREVIEW_PASSWORD` | Optional | Remove to disable password gate |
| `TOAST_API_KEY` | For checkout | Get from Toast Developer Portal |
| `TOAST_RESTAURANT_ID` | For checkout | Get from Toast Admin |
| `TOAST_API_URL` | Optional | Defaults to `https://ws-api.toasttab.com` |

---

## 10. Instagram (@standardfaresaratoga)

**What it does:** Auto-pulls the 3 most recent posts for the gallery page.

**Current status:** ✅ Works automatically — no credentials needed. Scrapes the public profile.

**If the handle changes:** Update `INSTAGRAM_USERNAME` in `api/instagram-feed.js`

---

## 11. Google Reviews (via Wanderlog)

**What it does:** Auto-pulls 5-star Google reviews for the testimonials section.

**Current status:** ✅ Works automatically — no credentials needed. Scrapes via Wanderlog.

**If the business listing changes:** Update the Wanderlog place ID in `api/google-reviews.js`

---

## 12. Big Cartel (Daniel Fairley's Art)

**What it does:** Auto-imports paintings and products from Daniel Fairley's Big Cartel shop.

**Current status:** ✅ Works automatically — no credentials needed. Uses public JSON API.

**Shop URL:** `poemdexter.bigcartel.com`

---

## Quick Start: Minimum Viable Launch

To get the site fully operational, you only need these from the owners:

1. ✅ **Verify Resy URL** — probably already correct
2. ✅ **Verify DoorDash URL** — probably already correct
3. 🔑 **Toast API Key + Restaurant ID** — enables online checkout, pickup orders, gift card purchases, and stock sync
4. 🔗 **Toast Online Ordering URL** — correct the placeholder
5. 🔗 **Toast Gift Cards URL** — correct the placeholder
6. 🆔 **Toast Product IDs** — for each bottle, merch item, painting, and event

Everything else (Instagram, reviews, paintings import, Supabase, FAQ, weekly features, specials, hours override) works out of the box.
