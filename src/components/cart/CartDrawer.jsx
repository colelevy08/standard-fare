// ─────────────────────────────────────────────────────────────────────────────
// components/cart/CartDrawer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Slide-out cart panel from the right edge of the screen.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";

const typeLabel = (type) => {
  switch (type) {
    case "bottle": return "Bottle Shop";
    case "merch":  return "Merchandise";
    case "print":  return "Painting";
    case "event":  return "Event Ticket";
    case "pickup": return "Pickup Order";
    default:       return "Item";
  }
};

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, itemCount, cartTotal, drawerOpen, setDrawerOpen } = useCart();

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[85] bg-black bg-opacity-60 transition-opacity"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-[86] w-full max-w-md bg-cream shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy border-opacity-10">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-flamingo" />
            <h2 className="font-display text-navy text-xl">Your Cart</h2>
            {itemCount > 0 && (
              <span className="bg-flamingo text-white text-xs font-mono w-6 h-6 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="text-navy opacity-40 hover:opacity-80 transition-opacity p-1 touch-manipulation">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={40} className="text-navy opacity-10 mx-auto mb-4" />
              <p className="font-body text-navy opacity-40 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => {
                const key = item._key || `${item.type}-${item.id}-${item.variant || ""}`;
                return (
                  <div key={key} className="flex gap-4 bg-white rounded-lg p-3 shadow-sm">
                    {/* Thumbnail */}
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-20 h-20 object-cover rounded flex-shrink-0" />
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-flamingo text-[10px] tracking-editorial uppercase">
                        {typeLabel(item.type)}
                      </p>
                      <h3 className="font-display text-navy text-sm leading-tight truncate">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="font-body text-xs text-navy opacity-50">{item.variant}</p>
                      )}
                      <p className="font-mono text-navy text-sm font-bold mt-1">
                        ${Number(item.price).toLocaleString()}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-navy border-opacity-20 flex items-center justify-center
                            hover:border-flamingo hover:text-flamingo transition-colors touch-manipulation">
                          <Minus size={12} />
                        </button>
                        <span className="font-mono text-sm text-navy w-4 text-center">{item.quantity}</span>
                        {(() => {
                          const atMax = item.stock != null && item.quantity >= item.stock;
                          return (
                            <button onClick={() => !atMax && updateQuantity(key, item.quantity + 1)}
                              disabled={atMax}
                              className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors touch-manipulation
                                ${atMax
                                  ? "border-navy border-opacity-10 text-navy opacity-20 cursor-not-allowed"
                                  : "border-navy border-opacity-20 hover:border-flamingo hover:text-flamingo"
                                }`}>
                              <Plus size={12} />
                            </button>
                          );
                        })()}
                        <button onClick={() => removeItem(key)}
                          className="ml-auto text-navy opacity-30 hover:opacity-70 hover:text-flamingo-dark transition-all touch-manipulation">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {item.stock != null && item.stock <= 3 && item.stock > 0 && (
                        <p className="font-mono text-[10px] text-flamingo mt-1">
                          {item.stock === 1 ? "Only 1 available" : `Only ${item.stock} left`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-navy border-opacity-10 bg-cream-warm">
            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-navy text-sm">Subtotal</span>
              <span className="font-display text-navy text-xl">${cartTotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={() => setDrawerOpen(false)}
              className="btn-primary flex items-center justify-center gap-2 w-full text-center">
              <ShoppingBag size={16} /> Checkout
            </Link>
            <button onClick={() => setDrawerOpen(false)}
              className="w-full text-center font-body text-sm text-navy opacity-50 hover:opacity-80 transition-opacity mt-3 py-2 touch-manipulation">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
