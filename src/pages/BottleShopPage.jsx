// ─────────────────────────────────────────────────────────────────────────────
// pages/BottleShopPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bottle shop — wine & beer available for purchase via Toast.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { X, Wine, TrendingUp } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import AddToCartButton from "../components/cart/AddToCartButton";

const FILTERS = ["All", "Wine", "Beer"];

// ── Bottle Detail Modal ───────────────────────────────────────────────────
const BottleModal = ({ bottle, onClose }) => {
  if (!bottle) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}>
        <div className="md:w-1/2 flex-shrink-0">
          <img src={bottle.imageUrl} alt={bottle.name} className="w-full h-64 md:h-full object-cover" />
        </div>
        <div className="p-8 flex flex-col justify-between">
          <button onClick={onClose} className="self-end text-navy opacity-40 hover:opacity-80 mb-4">
            <X size={20} />
          </button>
          <div>
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
              {bottle.category === "wine" ? "Wine" : "Beer"}
            </p>
            <h2 className="font-display text-navy text-2xl font-medium mb-1">{bottle.name}</h2>
            <p className="font-body text-sm text-navy opacity-50 mb-1">{bottle.varietal}</p>
            {bottle.region && (
              <p className="font-body text-sm text-navy opacity-40 mb-4">{bottle.region}</p>
            )}
            <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-6">
              {bottle.description}
            </p>
          </div>
          <div>
            <p className="font-display text-navy text-3xl mb-4">
              {bottle.available ? `${Number(bottle.price).toLocaleString()}` : "Sold Out"}
            </p>
            {bottle.available ? (
              <AddToCartButton
                item={{
                  id: bottle.id,
                  type: "bottle",
                  name: bottle.name,
                  price: bottle.price,
                  imageUrl: bottle.imageUrl,
                  toastProductId: bottle.toastProductId,
                }}
                label="Add to Cart"
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

// ── Bottle Card ───────────────────────────────────────────────────────────
const BottleCard = ({ bottle, onClick, isPopular }) => (
  <div className="group cursor-pointer" onClick={() => onClick(bottle)}>
    <div className="relative overflow-hidden rounded shadow-md mb-3 aspect-[3/4] bg-navy">
      {bottle.imageUrl ? (
        <img src={bottle.imageUrl} alt={bottle.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Wine size={32} className="text-cream opacity-20" />
        </div>
      )}
      {isPopular && bottle.available && (
        <div className="absolute top-2 left-2 bg-flamingo text-white px-2 py-1 rounded-full flex items-center gap-1 z-10">
          <TrendingUp size={10} />
          <span className="font-mono text-[10px] tracking-wider uppercase">Popular</span>
        </div>
      )}
      {!bottle.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-60 flex items-center justify-center">
          <span className="font-mono text-cream text-xs tracking-editorial uppercase">Sold Out</span>
        </div>
      )}
      {bottle.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <span className="font-body text-cream text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </span>
        </div>
      )}
    </div>
    <h3 className="font-display text-navy text-base leading-tight">{bottle.name}</h3>
    <p className="font-body text-sm text-navy opacity-50 mt-0.5">{bottle.varietal}</p>
    {bottle.region && (
      <p className="font-body text-xs text-navy opacity-40 mt-0.5">{bottle.region}</p>
    )}
    <div className="flex items-center justify-between mt-1.5">
      <p className="font-mono text-navy text-sm font-bold">
        {bottle.available ? `${Number(bottle.price).toLocaleString()}` : "Sold Out"}
      </p>
      {bottle.available && (
        <AddToCartButton
          compact
          item={{ id: bottle.id, type: "bottle", name: bottle.name, price: bottle.price, imageUrl: bottle.imageUrl, toastProductId: bottle.toastProductId }}
        />
      )}
    </div>
  </div>
);

// ── Main Bottle Shop Page ─────────────────────────────────────────────────
const BottleShopPage = () => {
  const { siteData } = useSite();
  const allBottles = (siteData.bottles || []).filter((b) => !b.draft);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const popularItems = (siteData.popularNow?.manualItems || [])
    .filter((p) => p.category === "bottles")
    .map((p) => p.name.toLowerCase());

  const filtered = filter === "All"
    ? allBottles
    : allBottles.filter((b) => b.category === filter.toLowerCase());

  return (
    <PageLayout>
      <BottleModal bottle={selected} onClose={() => setSelected(null)} />

      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Take Home a Bottle
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Bottle Shop</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-4" />
        <p className="font-body text-cream opacity-50 text-sm max-w-md mx-auto">
          Curated wines and craft beers — available for purchase through Standard Fare.
        </p>

        {/* Filter tabs */}
        <div className="flex justify-center gap-2 mt-8">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-xs tracking-editorial uppercase px-5 py-2 rounded-full border transition-all
                ${filter === f
                  ? "bg-flamingo border-flamingo text-white"
                  : "border-cream border-opacity-30 text-cream text-opacity-50 hover:text-opacity-100 hover:border-opacity-60"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container">
          {filtered.length === 0 ? (
            <p className="text-center font-body text-navy opacity-40 py-12">
              No bottles available right now. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((bottle) => (
                <BottleCard key={bottle.id} bottle={bottle} onClick={setSelected}
                  isPopular={popularItems.includes(bottle.name.toLowerCase())} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default BottleShopPage;
