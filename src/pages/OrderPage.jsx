// ─────────────────────────────────────────────────────────────────────────────
// pages/OrderPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Online ordering hub with full on-site pickup menu browsing + DoorDash delivery.
// Uses a SEPARATE PickupCartContext so food orders don't mix with merch/prints.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
// react-router-dom not needed — pickup checkout is inline
import {
  ShoppingBag, Truck, Clock, MapPin, Phone, Plus, Check, Minus,
  ChevronDown, ChevronUp, X, Trash2, CheckCircle,
} from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import { usePickupCart } from "../context/PickupCartContext";

const PICKUP_TABS = ["brunch", "dinner", "dessert"];

// ── GF / V Badges ────────────────────────────────────────────────────────
const GFBadge = () => (
  <span className="inline-flex items-center font-mono text-[9px] tracking-widest uppercase
    border border-flamingo text-flamingo px-1 py-0.5 rounded ml-1.5 leading-none flex-shrink-0">
    GF
  </span>
);
const VEGBadge = () => (
  <span className="inline-flex items-center font-mono text-[9px] tracking-widest uppercase
    border border-green-700 text-green-700 px-1 py-0.5 rounded ml-1.5 leading-none flex-shrink-0">
    V
  </span>
);

// ── Add to Order Button ──────────────────────────────────────────────────
const AddButton = ({ item, menuKey }) => {
  const { addItem } = usePickupCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      id: `${menuKey}-${item.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: item.name,
      price: Number(item.price) || 0,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!item.price) return null;

  return (
    <button
      onClick={handleAdd}
      className={`flex-shrink-0 flex items-center gap-1 font-mono text-[10px] tracking-editorial uppercase
        px-3 py-1.5 rounded-full transition-all duration-200 ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-flamingo text-white hover:bg-flamingo-dark"
      }`}
    >
      {added ? <><Check size={11} /> Added</> : <><Plus size={11} /> Add</>}
    </button>
  );
};

// ── Orderable Menu Item ──────────────────────────────────────────────────
const OrderMenuItem = ({ item, menuKey }) => (
  <div className="flex items-center gap-4 py-4 border-b border-navy border-opacity-10 last:border-0">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-0 flex-wrap">
        <h4 className="font-display text-navy text-base leading-snug">{item.name}</h4>
        {item.gf && <GFBadge />}
        {item.veg && <VEGBadge />}
      </div>
      {item.description && (
        <p className="font-body text-navy opacity-50 text-sm mt-0.5 leading-relaxed">{item.description}</p>
      )}
    </div>
    {item.price && (
      <span className="font-body text-navy text-sm font-medium flex-shrink-0">${item.price}</span>
    )}
    <AddButton item={item} menuKey={menuKey} />
  </div>
);

// ── Collapsible Menu Section ─────────────────────────────────────────────
const OrderMenuSection = ({ section, menuKey, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div>
          <h3 className="font-mono text-flamingo text-xs tracking-editorial uppercase">{section.title}</h3>
          <span className="block w-8 h-px bg-flamingo mt-1" />
        </div>
        {open ? (
          <ChevronUp size={16} className="text-navy opacity-30 group-hover:opacity-60 transition-opacity" />
        ) : (
          <ChevronDown size={16} className="text-navy opacity-30 group-hover:opacity-60 transition-opacity" />
        )}
      </button>
      {open && section.items.map((item, i) => (
        <OrderMenuItem key={i} item={item} menuKey={menuKey} />
      ))}
    </div>
  );
};

// ── Pickup Cart Drawer (inline on page) ──────────────────────────────────
const PickupCartPanel = ({ open, onClose }) => {
  const { items, removeItem, updateQuantity, itemCount, cartTotal, clearCart } = usePickupCart();
  const { siteData } = useSite();
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/toast-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total: cartTotal,
          orderType: "pickup",
        }),
      });
      const data = await res.json();
      setOrderResult({ success: data.success !== false, message: data.message || "Order received!" });
      if (data.success !== false) clearCart();
    } catch {
      setOrderResult({ success: false, message: "Something went wrong. Please call us to place your order." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[95] bg-black bg-opacity-60" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-[96] w-full max-w-md bg-cream shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy border-opacity-10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-flamingo" />
            <h2 className="font-display text-navy text-xl">Your Pickup Order</h2>
            {itemCount > 0 && (
              <span className="bg-flamingo text-white text-xs font-mono w-6 h-6 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={onClose}
            className="text-navy opacity-40 hover:opacity-80 transition-opacity p-1 touch-manipulation">
            <X size={22} />
          </button>
        </div>

        {/* Success state */}
        {orderResult?.success ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle size={48} className="text-emerald-500 mb-4" />
            <h3 className="font-display text-navy text-2xl mb-2">Order Placed!</h3>
            <p className="font-body text-navy opacity-60 text-sm mb-1">{orderResult.message}</p>
            <p className="font-body text-navy opacity-40 text-xs">
              Pick up at {siteData.location.address}, {siteData.location.city}
            </p>
            <button onClick={onClose}
              className="mt-8 btn-primary px-8">Done</button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={40} className="text-navy opacity-10 mx-auto mb-4" />
                  <p className="font-body text-navy opacity-40 text-sm">Your order is empty</p>
                  <p className="font-body text-navy opacity-30 text-xs mt-1">Browse the menu and add items</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-navy text-sm leading-tight truncate">{item.name}</h3>
                          <p className="font-mono text-navy text-sm font-bold mt-0.5">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border border-navy border-opacity-20 flex items-center justify-center
                              hover:border-flamingo hover:text-flamingo transition-colors touch-manipulation">
                            <Minus size={12} />
                          </button>
                          <span className="font-mono text-sm text-navy w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-navy border-opacity-20 flex items-center justify-center
                              hover:border-flamingo hover:text-flamingo transition-colors touch-manipulation">
                            <Plus size={12} />
                          </button>
                          <button onClick={() => removeItem(item.id)}
                            className="ml-1 text-navy opacity-30 hover:opacity-70 hover:text-flamingo-dark transition-all touch-manipulation">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer info form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">Your Details</p>
                    <input name="name" value={form.name} onChange={handleChange} required
                      placeholder="Full Name" className="w-full px-4 py-3 bg-white border border-navy border-opacity-15
                        rounded-lg font-body text-sm focus:outline-none focus:border-flamingo transition-colors" />
                    <input name="phone" value={form.phone} onChange={handleChange} required type="tel"
                      placeholder="Phone Number" className="w-full px-4 py-3 bg-white border border-navy border-opacity-15
                        rounded-lg font-body text-sm focus:outline-none focus:border-flamingo transition-colors" />
                    <input name="email" value={form.email} onChange={handleChange} type="email"
                      placeholder="Email (optional)" className="w-full px-4 py-3 bg-white border border-navy border-opacity-15
                        rounded-lg font-body text-sm focus:outline-none focus:border-flamingo transition-colors" />
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                      placeholder="Special instructions (optional)"
                      className="w-full px-4 py-3 bg-white border border-navy border-opacity-15
                        rounded-lg font-body text-sm focus:outline-none focus:border-flamingo transition-colors resize-none" />

                    {orderResult && !orderResult.success && (
                      <p className="font-body text-red-600 text-xs">{orderResult.message}</p>
                    )}

                    <div className="pt-2 border-t border-navy border-opacity-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-body text-navy text-sm">Subtotal</span>
                        <span className="font-display text-navy text-xl">${cartTotal.toLocaleString()}</span>
                      </div>
                      <button type="submit" disabled={submitting || items.length === 0}
                        className="btn-primary flex items-center justify-center gap-2 w-full disabled:opacity-50">
                        <ShoppingBag size={16} />
                        {submitting ? "Placing Order..." : "Place Pickup Order"}
                      </button>
                      <p className="font-body text-navy opacity-30 text-[10px] text-center mt-2">
                        Payment collected at pickup
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ── Main Order Page ──────────────────────────────────────────────────────
const OrderPage = () => {
  const { siteData } = useSite();
  const { itemCount, cartTotal } = usePickupCart();
  const { links, hours, location, menus } = siteData;
  const [activeTab, setActiveTab] = useState("dinner");
  const [showMenu, setShowMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const availableTabs = PICKUP_TABS.filter((t) => menus?.[t]);
  const currentMenu = menus?.[activeTab];

  return (
    <PageLayout>
      <PickupCartPanel open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Pickup & Delivery</p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Order Online</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-6" />
        <p className="font-body text-cream opacity-50 text-sm max-w-lg mx-auto">
          Browse our menu and build your pickup order, or get delivery via DoorDash.
        </p>
      </div>

      {/* ── Order Options ────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {/* Pickup Card */}
            <button
              onClick={() => setShowMenu(true)}
              className="bg-white rounded-xl border-2 border-navy border-opacity-10 p-8 text-center
                hover:border-flamingo hover:shadow-lg transition-all duration-300 group block w-full"
            >
              <div className="w-14 h-14 bg-navy rounded-full flex items-center justify-center mx-auto mb-5
                group-hover:bg-flamingo transition-colors">
                <ShoppingBag size={24} className="text-cream" />
              </div>
              <h2 className="font-display text-navy text-xl mb-2">Order for Pickup</h2>
              <p className="font-body text-navy opacity-60 text-sm leading-relaxed mb-4">
                Browse our menu, add items to your order, and pick up at the restaurant.
              </p>
              <div className="flex items-center justify-center gap-2 text-flamingo font-mono text-xs tracking-editorial uppercase">
                <Clock size={14} />
                <span>Ready in 20-30 min</span>
              </div>
            </button>

            {/* Delivery Card */}
            <a href={links.doordash} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl border-2 border-navy border-opacity-10 p-8 text-center
                hover:border-flamingo hover:shadow-lg transition-all duration-300 group block">
              <div className="w-14 h-14 bg-navy rounded-full flex items-center justify-center mx-auto mb-5
                group-hover:bg-flamingo transition-colors">
                <Truck size={24} className="text-cream" />
              </div>
              <h2 className="font-display text-navy text-xl mb-2">Order Delivery</h2>
              <p className="font-body text-navy opacity-60 text-sm leading-relaxed mb-4">
                Get Standard Fare delivered to your door via DoorDash.
              </p>
              <div className="flex items-center justify-center gap-2 text-flamingo font-mono text-xs tracking-editorial uppercase">
                <Truck size={14} />
                <span>Delivered to you</span>
              </div>
            </a>
          </div>

          {/* ── Pickup Menu ──────────────────────────────────── */}
          {showMenu && (
            <div className="mb-12">
              {/* Sticky tab bar + cart summary */}
              <div className="sticky top-16 z-30 bg-cream border-b border-navy border-opacity-10 -mx-4 px-4 pb-0">
                <div className="flex items-center justify-between py-3">
                  <div className="flex overflow-x-auto gap-0 no-scrollbar">
                    {availableTabs.map((key) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`font-mono text-xs tracking-editorial uppercase px-4 py-2 flex-shrink-0
                          transition-all duration-200 border-b-2 touch-manipulation
                          ${activeTab === key
                            ? "text-flamingo border-flamingo"
                            : "text-navy opacity-40 border-transparent hover:opacity-70"
                          }`}
                      >
                        {menus[key]?.name || key}
                      </button>
                    ))}
                  </div>

                  {itemCount > 0 && (
                    <button onClick={() => setCartOpen(true)}
                      className="flex items-center gap-2 bg-flamingo text-white font-mono text-[10px]
                        tracking-editorial uppercase px-4 py-2 rounded-full hover:bg-flamingo-dark
                        transition-colors flex-shrink-0 ml-4">
                      <ShoppingBag size={13} />
                      {itemCount} item{itemCount !== 1 ? "s" : ""} · ${cartTotal.toLocaleString()}
                    </button>
                  )}
                </div>
              </div>

              {/* Menu content */}
              <div className="mt-6">
                {currentMenu ? (
                  <>
                    {currentMenu.note && (
                      <p className="font-body text-navy opacity-50 text-sm mb-6 italic">{currentMenu.note}</p>
                    )}

                    {/* GF / V key */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <GFBadge />
                        <span className="font-body text-navy opacity-50 text-xs">Gluten free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <VEGBadge />
                        <span className="font-body text-navy opacity-50 text-xs">Vegetarian</span>
                      </div>
                    </div>

                    {(currentMenu.sections || []).map((section, i) => (
                      <OrderMenuSection
                        key={i}
                        section={section}
                        menuKey={activeTab}
                        defaultOpen={i === 0}
                      />
                    ))}
                  </>
                ) : (
                  <p className="font-body text-navy opacity-40 text-center py-12">
                    Menu not available yet.
                  </p>
                )}
              </div>

              {/* Floating checkout bar */}
              {itemCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-navy p-4 z-40 shadow-2xl
                  border-t border-flamingo border-opacity-30">
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                      <p className="font-display text-cream text-sm">
                        {itemCount} item{itemCount !== 1 ? "s" : ""} in your order
                      </p>
                      <p className="font-mono text-flamingo text-xs">${cartTotal.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setCartOpen(true)}
                      className="bg-flamingo text-white font-mono text-xs tracking-editorial uppercase
                        px-6 py-3 rounded-lg hover:bg-flamingo-dark transition-colors">
                      Review & Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Restaurant Info ─────────────────────────────────── */}
          <div className="bg-navy rounded-xl p-8 text-center">
            <h3 className="font-display text-cream text-xl mb-6">Hours & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-lg mx-auto">
              <div>
                <Clock size={18} className="text-flamingo mx-auto mb-3" />
                <div className="space-y-1">
                  {hours.map((h) => (
                    <div key={h.day} className="flex justify-between font-body text-cream text-xs opacity-70">
                      <span>{h.day}</span>
                      <span>{h.close ? `${h.open} – ${h.close}` : h.open}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <MapPin size={18} className="text-flamingo mx-auto mb-3" />
                  <p className="font-body text-cream text-sm opacity-70">{location.address}</p>
                  <p className="font-body text-cream text-sm opacity-70">{location.city}</p>
                </div>
                <div>
                  <Phone size={18} className="text-flamingo mx-auto mb-3" />
                  <a href={`tel:${location.phone}`}
                    className="font-body text-cream text-sm opacity-70 hover:text-flamingo transition-colors">
                    {location.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderPage;
