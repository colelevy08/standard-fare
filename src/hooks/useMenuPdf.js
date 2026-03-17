// ─────────────────────────────────────────────────────────────────────────────
// hooks/useMenuPdf.js
// ─────────────────────────────────────────────────────────────────────────────
// Generates a styled HTML representation of the full menu and opens it in a
// new browser tab so the user can print / save as PDF via Ctrl+P (Cmd+P).
//
// Usage:
//   import { generateMenuPdf } from "../hooks/useMenuPdf";
//   <button onClick={() => generateMenuPdf(siteData.menus, "Standard Fare")}>
//     Download Menu
//   </button>
// ─────────────────────────────────────────────────────────────────────────────

const MENU_ORDER = ["brunch", "dinner", "drinks", "wine", "dessert"];

const RESTAURANT_INFO = {
  name: "Standard Fare",
  tagline: "Creative American Dining",
  address: "21 Phila St, Saratoga Springs, NY 12866",
  phone: "(518) 450-0876",
};

/**
 * Build a badge span for GF / V indicators.
 */
const badge = (label, color) =>
  `<span style="
    display:inline-block;
    font-family:'Courier New',monospace;
    font-size:9px;
    letter-spacing:0.08em;
    text-transform:uppercase;
    border:1px solid ${color};
    color:${color};
    padding:1px 4px;
    border-radius:3px;
    margin-left:6px;
    vertical-align:middle;
    line-height:1;
  ">${label}</span>`;

/**
 * Render a single menu item row.
 */
const renderItem = (item) => {
  const badges = [
    item.gf ? badge("GF", "#E8635A") : "",
    item.veg ? badge("V", "#2d6a4f") : "",
  ].join("");

  return `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid rgba(26,34,56,0.08);vertical-align:top;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#1A2238;">
          ${item.name}${badges}
        </span>
        ${item.description ? `<br><span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:rgba(26,34,56,0.55);">${item.description}</span>` : ""}
      </td>
      <td style="padding:6px 0 6px 16px;border-bottom:1px solid rgba(26,34,56,0.08);vertical-align:top;text-align:right;white-space:nowrap;">
        ${item.price ? `<span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#1A2238;">$${item.price}</span>` : ""}
      </td>
    </tr>`;
};

/**
 * Render a menu section (e.g. "Starters", "Mains").
 */
const renderSection = (section) => `
  <div style="margin-bottom:28px;">
    <h3 style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#E8635A;margin:0 0 4px 0;">
      ${section.title}
    </h3>
    <div style="width:32px;height:1px;background:#E8635A;margin-bottom:12px;"></div>
    <table style="width:100%;border-collapse:collapse;">
      ${(section.items || []).map(renderItem).join("")}
    </table>
  </div>`;

/**
 * Render an entire menu (e.g. Brunch, Dinner).
 */
const renderMenu = (menu) => `
  <div style="page-break-inside:avoid;margin-bottom:48px;">
    <h2 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1A2238;margin:0 0 4px 0;text-align:center;">
      ${menu.name}
    </h2>
    ${menu.note ? `<p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:rgba(26,34,56,0.5);text-align:center;font-style:italic;margin:0 0 24px 0;">${menu.note}</p>` : '<div style="margin-bottom:24px;"></div>'}
    ${(menu.sections || []).map(renderSection).join("")}
  </div>`;

/**
 * Generate a full styled HTML document and open it in a new tab for printing.
 *
 * @param {Object} menus           — the siteData.menus object
 * @param {string} [restaurantName] — override restaurant name (optional)
 */
export function generateMenuPdf(menus, restaurantName) {
  if (!menus) return;

  const name = restaurantName || RESTAURANT_INFO.name;

  // Build ordered list of menus that actually exist
  const orderedMenus = MENU_ORDER
    .filter((key) => menus[key])
    .map((key) => menus[key]);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — Full Menu</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #FDF8F0;
      color: #1A2238;
    }
  </style>
</head>
<body>
  <!-- Print prompt banner (hidden when printing) -->
  <div class="no-print" style="
    background:#1A2238;
    color:#FDF8F0;
    text-align:center;
    padding:12px 16px;
    font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
    font-size:13px;
  ">
    Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) to save as PDF or print this menu.
  </div>

  <div style="max-width:680px;margin:0 auto;padding:48px 32px 64px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:36px;color:#1A2238;margin:0 0 4px 0;">
        ${name}
      </h1>
      <p style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#E8635A;margin:0 0 8px 0;">
        ${RESTAURANT_INFO.tagline}
      </p>
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;color:rgba(26,34,56,0.5);margin:0;">
        ${RESTAURANT_INFO.address} &nbsp;|&nbsp; ${RESTAURANT_INFO.phone}
      </p>
      <div style="width:64px;height:1px;background:#E8635A;margin:20px auto 0;"></div>
    </div>

    <!-- Legend -->
    <div style="display:flex;gap:16px;justify-content:center;margin-bottom:32px;">
      <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:rgba(26,34,56,0.5);">
        ${badge("GF", "#E8635A")} Gluten Free
      </span>
      <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:rgba(26,34,56,0.5);">
        ${badge("V", "#2d6a4f")} Vegetarian
      </span>
    </div>

    <!-- Menus -->
    ${orderedMenus.map(renderMenu).join("")}

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid rgba(26,34,56,0.1);">
      <p style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;color:rgba(26,34,56,0.35);margin:0;">
        Menu items and prices are subject to change. Please inform your server of any allergies.
      </p>
    </div>
  </div>
</body>
</html>`;

  // Open in a new tab
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");

  // Clean up the object URL after a short delay (tab already has the content)
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default generateMenuPdf;
