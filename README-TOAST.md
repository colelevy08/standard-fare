# README-TOAST.md
# Connecting Standard Fare to Toast POS

This guide walks through how to sell **event tickets**, **artist paintings**,
**wine bottles**, and **branded merchandise** directly on the Standard Fare
website — with all sales appearing inside your existing Toast account alongside
in-person restaurant sales.

---

## How It Works

The website has **two independent cart systems**, both fulfilled through Toast:

### Shop Cart (Bottles, Paintings, Merch, Event Tickets)
Guests can add multiple items and check out in a single transaction.
Orders are submitted to Toast via the `/api/toast-order` endpoint.
Paintings enforce stock limits (1 per original work). Sold-out items cannot be added.

### Pickup Cart (Food Orders)
Guests browse the full menu (brunch, dinner, dessert) on the `/order` page, add items
to a separate pickup-only cart, fill in their details, and submit. The order is sent to
Toast with `orderType: "pickup"` — payment is collected at the restaurant.

Toast handles:
- Payment processing (credit/debit, Apple Pay, Google Pay)
- Order confirmation emails to the customer
- Sales reporting inside your Toast dashboard
- Refund processing if needed
- Inventory/stock sync (once API credentials are connected)

The website handles:
- Displaying all product info with photos, pricing, and variants
- Two independent carts with quantity controls and stock enforcement
- Checkout forms collecting customer name, email, phone, and order notes
- Submitting orders to Toast for fulfillment

Until Toast credentials are configured, the checkout shows a "Call to Order"
fallback so guests can still place orders by phone.

---

## Prerequisites

Before starting, you need:

1. **Toast account credentials** — your Toast restaurant login
2. **Toast Online Ordering** enabled for your account  
   (Contact your Toast rep if it's not active yet)
3. Admin access to the Standard Fare website (`/admin`)

---

## Step 1 — Set Up Toast Online Ordering

1. Log into [pos.toasttab.com](https://pos.toasttab.com)
2. In the left sidebar go to **Online Ordering → Setup**
3. Make sure Online Ordering is **enabled** and your base URL is confirmed:
   ```
   https://order.toasttab.com/online/tbd-name-bocage-group-21-phila-street
   ```
   > **Important:** Update `tbd-name-bocage-group-21-phila-street` with your real
   > Toast restaurant slug once confirmed. Update this in the website's Admin Panel
   > under **External Links → Toast Online Order Base URL**.

---

## Step 2 — Create a Menu Category for Events & Prints

This keeps event tickets and print sales separate from food orders in your reports.

1. In Toast POS: **Menus → Menu Management → Add Category**
2. Create a category called **"Events & Tickets"**
3. Create another category called **"Gallery Prints"**
4. Set availability: **Online only** (these won't show on your in-house POS)

---

## Step 3 — Create a Toast Product for Each Event

For each ticketed event on the website, create a corresponding Toast menu item:

1. Go to **Menus → Menu Items → Add Item**
2. Fill in:
   | Field | Value |
   |-------|-------|
   | Name | Same as event name (e.g., "Apollo's Praise Wine Tasting") |
   | Category | Events & Tickets |
   | Price | Ticket price (e.g., $95.00) |
   | Description | Brief event description |
   | Quantity | Set a quantity limit = max ticket capacity |
   | Availability | Online Ordering only |
3. Save the item
4. **Copy the Toast Product/Item ID** — you'll find it in the item's URL:
   ```
   https://pos.toasttab.com/menus/items/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```
   The long alphanumeric string is your **Toast Product ID**

---

## Step 4 — Add the Toast Product ID to the Website

1. Go to your website and navigate to **[yourdomain.com/admin]**
2. Log in with the owner password
3. Open the **Events & Tickets** section
4. Find the matching event
5. Paste the Toast Product ID into the **"Toast Product ID"** field
6. Click **Save Events**

The "Get Tickets" button on the website will now link directly to that product's
purchase page in Toast Online Ordering.

### How the URL is constructed

The website builds the ticket link like this:

```
https://order.toasttab.com/online/[your-slug]/v3#product-[TOAST_PRODUCT_ID]
```

Example:
```
https://order.toasttab.com/online/tbd-name-bocage-group-21-phila-street/v3#product-abc123-def456
```

---

## Step 5 — Create Toast Products for Artist Prints

Repeat Step 3 for each print in the Gallery Shop:

1. **Menus → Menu Items → Add Item**
2. Category: **Gallery Prints**
3. Name, price, and description matching the print listing
4. Availability: **Online Ordering only**
5. Copy the Toast Product ID
6. In Admin Panel → **Gallery Shop / Prints** → find the print → paste the ID → Save

---

## Step 6 — Set the Toast Base URL in Admin

Once your Toast restaurant slug is finalized:

1. Admin Panel → **External Links**
2. Update **"Toast Online Order Base URL"** to your confirmed URL:
   ```
   https://order.toasttab.com/online/YOUR-REAL-SLUG-HERE
   ```
3. Also update **"Toast Gift Cards URL"** if needed
4. Click **Save Links**

---

## Viewing Sales in Toast

All ticket and print purchases appear in your Toast dashboard under:

- **Reports → Sales Summary** — filter by category (Events & Tickets, Gallery Prints)
- **Reports → Net Sales by Category** — see breakdown alongside food/beverage
- **Online Ordering → Orders** — individual customer transactions

This means event ticket revenue and in-restaurant revenue are visible in one place,
making end-of-night and end-of-month reconciliation seamless.

---

## Handling Sold-Out Events

When an event sells out:

**Option A — In Toast:** Set the item quantity to 0. Toast will show it as unavailable.

**Option B — On the website:** In Admin Panel → Events → set the event date to the past.
It will automatically move to the "Past Events" section.

---

## Refunds for Event Tickets

Toast handles refunds directly:

1. Toast POS → **Guests → Find Order** (search by customer email or order #)
2. Select the order → **Refund**
3. Choose full or partial refund

The customer receives a refund to their original payment method.

---

## Testing Before Going Live

Before announcing events:

1. Create the Toast product at a price of **$0.01**
2. Go through the full purchase flow on the website
3. Verify the order appears in Toast
4. Refund the test transaction
5. Update the price to the real amount

---

## Questions / Support

- **Toast support:** 1-617-682-0225 or [central.toasttab.com](https://central.toasttab.com)
- **Website admin help:** Contact Cole Levy — [linkedin.com/in/colelevy](https://www.linkedin.com/in/colelevy/)

---

*Last updated: March 2026*
