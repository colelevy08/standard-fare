// ─────────────────────────────────────────────────────────────────────────────
// components/cart/AddToCartButton.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable "Add to Cart" button. After adding, switches to
// "Go to Checkout" / "Continue Shopping" pair.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const AddToCartButton = ({ item, className = "", label = "Add to Cart", compact = false }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(item, { openDrawer: !compact });
    setAdded(true);
  };

  if (added && compact) {
    return (
      <div className={`flex flex-col items-end gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
        <Link to="/checkout" onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 bg-green-600 text-white font-body font-bold text-[10px] tracking-wider uppercase px-2.5 py-1.5 rounded hover:bg-green-700 transition-all touch-manipulation">
          <Check size={10} /> Checkout
        </Link>
        <button onClick={(e) => { e.stopPropagation(); setAdded(false); }}
          className="font-body text-[10px] text-navy opacity-40 hover:opacity-70 transition-opacity">
          Continue
        </button>
      </div>
    );
  }

  if (added) {
    return (
      <div className={`flex flex-col gap-2 w-full ${className}`} onClick={(e) => e.stopPropagation()}>
        <Link to="/checkout"
          className="btn-primary flex items-center justify-center gap-2 w-full text-center text-sm">
          <Check size={14} /> Go to Checkout
        </Link>
        <button onClick={(e) => { e.stopPropagation(); setAdded(false); }}
          className="font-body text-xs text-navy opacity-50 hover:opacity-80 transition-opacity text-center py-1">
          Continue Shopping
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button onClick={handleClick}
        className={`flex items-center justify-center gap-1.5 bg-flamingo text-white font-body font-bold
          text-xs tracking-wider uppercase px-3 py-2 rounded hover:bg-opacity-90 transition-all touch-manipulation ${className}`}>
        <ShoppingBag size={12} /> Add
      </button>
    );
  }

  return (
    <button onClick={handleClick}
      className={`btn-primary flex items-center justify-center gap-2 w-full transition-all ${className}`}>
      <ShoppingBag size={16} /> {label}
    </button>
  );
};

export default AddToCartButton;
