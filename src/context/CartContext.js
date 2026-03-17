// ─────────────────────────────────────────────────────────────────────────────
// context/CartContext.js
// ─────────────────────────────────────────────────────────────────────────────
// Shopping cart state — persisted to localStorage.
// Supports bottles, merch, prints, and event tickets.
// Enforces stock limits: items with a `stock` field cannot exceed that qty.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const CART_KEY = "standard_fare_cart";
const CartContext = createContext(undefined);

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveCart = (items) => {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); }
  catch (e) { console.warn("Cart save failed:", e); }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Persist on every change
  useEffect(() => { saveCart(items); }, [items]);

  // Unique key for an item (combines id + type + variant)
  const itemKey = (item) => `${item.type}-${item.id}-${item.variant || ""}`;

  const addItem = useCallback((item, { openDrawer = true } = {}) => {
    setItems((prev) => {
      const key = itemKey(item);
      const existing = prev.find((i) => itemKey(i) === key);
      const maxStock = item.stock != null ? item.stock : Infinity;

      if (existing) {
        const newQty = Math.min(existing.quantity + (item.quantity || 1), maxStock);
        if (newQty <= existing.quantity) return prev; // already at max
        return prev.map((i) => itemKey(i) === key
          ? { ...i, quantity: newQty }
          : i
        );
      }

      const qty = Math.min(item.quantity || 1, maxStock);
      if (qty < 1) return prev; // stock is 0, can't add
      return [...prev, { ...item, quantity: qty, _key: key }];
    });
    if (openDrawer) setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => (i._key || itemKey(i)) !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    if (quantity < 1) return removeItem(key);
    setItems((prev) => prev.map((i) => {
      if ((i._key || itemKey(i)) !== key) return i;
      const maxStock = i.stock != null ? i.stock : Infinity;
      return { ...i, quantity: Math.min(quantity, maxStock) };
    }));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      itemCount, cartTotal,
      drawerOpen, setDrawerOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
