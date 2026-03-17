// ─────────────────────────────────────────────────────────────────────────────
// context/PickupCartContext.js
// ─────────────────────────────────────────────────────────────────────────────
// Separate cart for food pickup orders. Kept independent from the main cart
// (bottles, merch, prints, event tickets) so the two flows don't conflict.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const PICKUP_KEY = "standard_fare_pickup_cart";
const PickupCartContext = createContext(undefined);

const load = () => {
  try {
    const raw = localStorage.getItem(PICKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const save = (items) => {
  try { localStorage.setItem(PICKUP_KEY, JSON.stringify(items)); }
  catch (e) { console.warn("Pickup cart save failed:", e); }
};

export const PickupCartProvider = ({ children }) => {
  const [items, setItems] = useState(load);

  useEffect(() => { save(items); }, [items]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id
          ? { ...i, quantity: i.quantity + (item.quantity || 1) }
          : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <PickupCartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      itemCount, cartTotal,
    }}>
      {children}
    </PickupCartContext.Provider>
  );
};

export const usePickupCart = () => {
  const ctx = useContext(PickupCartContext);
  if (!ctx) throw new Error("usePickupCart must be used inside <PickupCartProvider>");
  return ctx;
};
