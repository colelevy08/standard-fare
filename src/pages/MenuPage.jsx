// ─────────────────────────────────────────────────────────────────────────────
// pages/MenuPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tabbed menu page: Brunch · Dinner · Cocktails & Beer · Wine · Dessert
// Items marked gf: true display a "GF" badge.
// All content is editable from the admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Download } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import { generateMenuPdf } from "../hooks/useMenuPdf";

// Tabs in display order
const TABS = ["brunch", "dinner", "drinks", "wine", "dessert"];

// ── GF Badge ─────────────────────────────────────────────────────────────
const GFBadge = () => (
  <span className="inline-flex items-center font-mono text-[10px] tracking-widest uppercase
                   border border-flamingo text-flamingo px-1.5 py-0.5 rounded ml-1.5 align-middle
                   leading-none flex-shrink-0">
    GF
  </span>
);

// ── VEG Badge ─────────────────────────────────────────────────────────────
const VEGBadge = () => (
  <span className="inline-flex items-center font-mono text-[10px] tracking-widest uppercase
                   border border-green-700 text-green-700 px-1.5 py-0.5 rounded ml-1.5 align-middle
                   leading-none flex-shrink-0">
    V
  </span>
);

// ── Single menu item ─────────────────────────────────────────────────────
const MenuItem = ({ item }) => (
  <div className="flex justify-between items-start gap-4 py-4 border-b border-navy border-opacity-10 last:border-0">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-0 flex-wrap">
        <h4 className="font-display text-navy text-base leading-snug">{item.name}</h4>
        {item.gf  && <GFBadge />}
        {item.veg && <VEGBadge />}
      </div>
      {item.description && (
        <p className="font-body text-navy opacity-60 text-sm mt-0.5 leading-relaxed">
          {item.description}
        </p>
      )}
    </div>
    {item.price && (
      <span className="font-body text-navy text-sm font-medium flex-shrink-0 mt-0.5">
        {item.price}
      </span>
    )}
  </div>
);

// ── Menu section ─────────────────────────────────────────────────────────
const MenuSection = ({ section }) => (
  <div className="mb-10">
    <h3 className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">
      {section.title}
    </h3>
    <span className="block w-8 h-px bg-flamingo mb-4" />
    {section.items.map((item, i) => (
      <MenuItem key={i} item={item} />
    ))}
  </div>
);

// ── Menu Page ─────────────────────────────────────────────────────────────
const MenuPage = () => {
  const { siteData } = useSite();
  const [active, setActive] = useState("brunch");

  const menus = siteData.menus || {};
  const current = menus[active];

  // Build tab list from available menus, preserving order
  const availableTabs = TABS.filter(t => menus[t]);

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Standard Fare
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Our Menus</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      {/* Download menu button */}
      <div className="bg-navy text-center pb-4">
        <button
          onClick={() => generateMenuPdf(menus, "Standard Fare")}
          className="inline-flex items-center gap-2 font-body text-xs text-cream opacity-50
                     hover:opacity-100 hover:text-flamingo transition-all border border-cream
                     border-opacity-20 hover:border-flamingo rounded-full px-4 py-2"
        >
          <Download size={13} />
          Download Menu PDF
        </button>
      </div>

      {/* Tab bar */}
      <div className="bg-navy sticky top-16 z-30 border-b border-cream border-opacity-10">
        <div className="section-container">
          <div className="flex overflow-x-auto gap-0 no-scrollbar">
            {availableTabs.map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`font-mono text-xs tracking-editorial uppercase px-5 py-4 flex-shrink-0
                  transition-all duration-200 border-b-2 touch-manipulation
                  ${active === key
                    ? "text-flamingo border-flamingo"
                    : "text-cream opacity-50 border-transparent hover:opacity-80"
                  }`}
              >
                {menus[key]?.name || key}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu content */}
      <div className="section-padding bg-cream">
        <div className="section-container max-w-3xl">
          {current ? (
            <>
              {/* Menu note */}
              {current.note && (
                <p className="font-body text-navy opacity-50 text-sm mb-8 italic">
                  {current.note}
                </p>
              )}

              {/* GF / V key — only show on food menus */}
              {(active === "brunch" || active === "dinner" || active === "dessert") && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                    <GFBadge />
                    <span className="font-body text-navy opacity-50 text-xs">Gluten free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VEGBadge />
                    <span className="font-body text-navy opacity-50 text-xs">Vegetarian</span>
                  </div>
                </div>
              )}

              {/* Sections */}
              {(current.sections || []).map((section, i) => (
                <MenuSection key={i} section={section} />
              ))}
            </>
          ) : (
            <p className="font-body text-navy opacity-40 text-center py-16">
              No menu items yet — add them in the admin panel.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MenuPage;
