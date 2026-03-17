// ─────────────────────────────────────────────────────────────────────────────
// pages/CheckoutPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Order summary + customer info form.
// Submits to /api/toast-order for fulfillment (when Toast credentials are set).
// Falls back to showing a "call to order" message until credentials are live.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, CheckCircle } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useCart } from "../context/CartContext";
import useOrderHistory from "../hooks/useOrderHistory";

const typeLabel = (type) => {
  switch (type) {
    case "bottle": return "Bottle";
    case "merch":  return "Merch";
    case "print":  return "Painting";
    case "event":  return "Ticket";
    case "pickup": return "Pickup Order";
    default:       return "Item";
  }
};

const CheckoutPage = () => {
  const { items, removeItem, updateQuantity, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const { addOrder } = useOrderHistory();

  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null); // null | { success, message }

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
            type: i.type,
            quantity: i.quantity,
            price: i.price,
            variant: i.variant || null,
            toastProductId: i.toastProductId || null,
          })),
          total: cartTotal,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Save to order history
        addOrder({
          items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, type: i.type })),
          total: cartTotal,
          customerName: form.name,
          customerEmail: form.email,
          status: "confirmed",
        });
        setOrderResult({ success: true, message: data.message || "Order placed successfully!" });
        clearCart();
      } else {
        setOrderResult({ success: false, message: data.message || "Something went wrong. Please try again." });
      }
    } catch {
      setOrderResult({
        success: false,
        message: "Unable to submit order. Please call us directly to place your order.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────
  if (orderResult?.success) {
    return (
      <PageLayout>
        <div className="bg-navy pt-32 pb-24 text-center">
          <CheckCircle size={48} className="text-flamingo mx-auto mb-6" />
          <h1 className="font-display text-cream text-3xl md:text-4xl mb-4">Order Confirmed!</h1>
          <p className="font-body text-cream opacity-60 text-sm max-w-md mx-auto mb-8">
            {orderResult.message}
          </p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </PageLayout>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────
  if (items.length === 0 && !orderResult) {
    return (
      <PageLayout>
        <div className="bg-navy pt-32 pb-24 text-center">
          <ShoppingBag size={48} className="text-cream opacity-20 mx-auto mb-6" />
          <h1 className="font-display text-cream text-3xl mb-4">Your Cart is Empty</h1>
          <p className="font-body text-cream opacity-50 text-sm mb-8">
            Browse our bottles, merch, paintings, and events to get started.
          </p>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="bg-navy pt-32 pb-12 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Review & Pay
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Checkout</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Order Summary (left, wider) ──────────────────────── */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)}
                  className="text-navy opacity-40 hover:opacity-80 transition-opacity touch-manipulation">
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-display text-navy text-xl">Order Summary</h2>
              </div>

              <div className="flex flex-col gap-4">
                {items.map((item) => {
                  const key = item._key || `${item.type}-${item.id}-${item.variant || ""}`;
                  return (
                    <div key={key} className="flex gap-4 bg-white rounded-lg p-4 shadow-sm">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name}
                          className="w-24 h-24 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-flamingo text-[10px] tracking-editorial uppercase">
                          {typeLabel(item.type)}
                        </p>
                        <h3 className="font-display text-navy text-base leading-tight">{item.name}</h3>
                        {item.variant && (
                          <p className="font-body text-xs text-navy opacity-50 mt-0.5">{item.variant}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(key, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-navy border-opacity-20 flex items-center justify-center
                                hover:border-flamingo hover:text-flamingo transition-colors touch-manipulation">
                              <Minus size={14} />
                            </button>
                            <span className="font-mono text-navy">{item.quantity}</span>
                            {(() => {
                              const atMax = item.stock != null && item.quantity >= item.stock;
                              return (
                                <button onClick={() => !atMax && updateQuantity(key, item.quantity + 1)}
                                  disabled={atMax}
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors touch-manipulation
                                    ${atMax
                                      ? "border-navy border-opacity-10 text-navy opacity-20 cursor-not-allowed"
                                      : "border-navy border-opacity-20 hover:border-flamingo hover:text-flamingo"
                                    }`}>
                                  <Plus size={14} />
                                </button>
                              );
                            })()}
                            <button onClick={() => removeItem(key)}
                              className="ml-2 text-navy opacity-30 hover:opacity-70 hover:text-flamingo-dark transition-all touch-manipulation">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <span className="font-display text-navy text-lg">
                            ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Payment / Customer Info (right) ──────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="font-display text-navy text-xl mb-6">Your Information</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input name="name" placeholder="Full Name" value={form.name}
                    onChange={handleChange} required className="form-input text-base" />
                  <input name="email" type="email" placeholder="Email" value={form.email}
                    onChange={handleChange} required className="form-input text-base" />
                  <input name="phone" type="tel" placeholder="Phone" value={form.phone}
                    onChange={handleChange} required className="form-input text-base" />
                  <textarea name="notes" placeholder="Order notes (optional)" value={form.notes}
                    onChange={handleChange} rows={3}
                    className="form-input text-base resize-none" />

                  {/* Totals */}
                  <div className="border-t border-navy border-opacity-10 pt-4 mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-navy opacity-60 text-sm">Subtotal</span>
                      <span className="font-mono text-navy text-sm">${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-navy opacity-60 text-sm">Tax & fees</span>
                      <span className="font-mono text-navy text-sm opacity-50">Calculated at pickup</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-navy border-opacity-10">
                    <span className="font-display text-navy text-lg">Total</span>
                    <span className="font-display text-navy text-2xl">${cartTotal.toLocaleString()}</span>
                  </div>

                  {orderResult && !orderResult.success && (
                    <p className="font-body text-flamingo-dark text-sm">{orderResult.message}</p>
                  )}

                  <button type="submit" disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    <ShoppingBag size={16} />
                    {submitting ? "Placing Order..." : "Place Order"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;
