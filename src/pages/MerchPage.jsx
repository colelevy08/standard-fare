// ─────────────────────────────────────────────────────────────────────────────
// pages/MerchPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Merchandise shop page. Items are managed from the admin panel.
// Purchase links point to Toast online ordering.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import AddToCartButton from "../components/cart/AddToCartButton";

// ── Merch Detail Modal ────────────────────────────────────────────────────
const MerchModal = ({ item, onClose }) => {
  const [selectedVariant, setSelectedVariant] = useState("");

  if (!item) return null;

  // Parse variants string "S / M / L / XL" into array
  const variantOptions = item.variants
    ? item.variants.split("/").map((v) => v.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}>
        <div className="md:w-1/2 flex-shrink-0">
          <img src={item.imageUrl} alt={item.name} className="w-full h-64 md:h-full object-cover" />
        </div>
        <div className="p-8 flex flex-col justify-between">
          <button onClick={onClose} className="self-end text-navy opacity-40 hover:opacity-80 mb-4">
            <X size={20} />
          </button>
          <div>
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
              {item.category || "Merchandise"}
            </p>
            <h2 className="font-display text-navy text-2xl font-medium mb-1">{item.name}</h2>
            <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-4">
              {item.description}
            </p>

            {/* Variant selector */}
            {variantOptions.length > 0 && (
              <div className="mb-4">
                <p className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {variantOptions.map((v) => (
                    <button key={v} onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded border font-body text-sm transition-all touch-manipulation
                        ${selectedVariant === v
                          ? "border-flamingo bg-flamingo text-white"
                          : "border-navy border-opacity-20 text-navy hover:border-flamingo"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="font-display text-navy text-3xl mb-4">
              {item.available ? `${Number(item.price).toLocaleString()}` : "Sold Out"}
            </p>
            {item.available ? (
              <AddToCartButton
                item={{
                  id: item.id,
                  type: "merch",
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  variant: selectedVariant || (variantOptions[0] || ""),
                  toastProductId: item.toastProductId,
                }}
                label={variantOptions.length > 0 && !selectedVariant ? "Select Size" : "Add to Cart"}
              />
            ) : (
              <button disabled
                className="w-full py-3 px-8 bg-navy bg-opacity-20 text-navy opacity-40 font-body font-bold tracking-widest uppercase text-sm cursor-not-allowed">
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Merch Card ────────────────────────────────────────────────────────────
const MerchCard = ({ item, onClick }) => (
  <div className="group cursor-pointer" onClick={() => onClick(item)}>
    <div className="relative overflow-hidden rounded shadow-md mb-3 aspect-square bg-navy-light">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ShoppingBag size={32} className="text-cream opacity-20" />
        </div>
      )}
      {!item.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-60 flex items-center justify-center">
          <span className="font-mono text-cream text-xs tracking-editorial uppercase">Sold Out</span>
        </div>
      )}
      {item.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <span className="font-body text-cream text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </span>
        </div>
      )}
    </div>
    <h3 className="font-display text-navy text-base leading-tight">{item.name}</h3>
    {item.category && (
      <p className="font-body text-sm text-navy opacity-50 mt-0.5">{item.category}</p>
    )}
    <p className="font-mono text-navy text-sm mt-1 font-bold">
      {item.available ? `${Number(item.price).toLocaleString()}` : "Sold Out"}
    </p>
  </div>
);

// ── Main Merch Page ───────────────────────────────────────────────────────
const MerchPage = () => {
  const { siteData } = useSite();
  const merch = (siteData.merch || []).filter((item) => !item.draft);
  const [selected, setSelected] = useState(null);

  return (
    <PageLayout>
      <MerchModal item={selected} onClose={() => setSelected(null)} />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Standard Fare Goods
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Merchandise</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-4" />
        <p className="font-body text-cream opacity-50 text-sm max-w-md mx-auto">
          Take a piece of Standard Fare home with you.
        </p>
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container">
          {merch.length === 0 ? (
            <p className="text-center font-body text-navy opacity-40 py-12">
              Merchandise coming soon. Check back for updates.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {merch.map((item) => (
                <MerchCard key={item.id} item={item} onClick={setSelected} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MerchPage;
