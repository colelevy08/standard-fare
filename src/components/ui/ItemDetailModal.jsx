// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ItemDetailModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Shared profile-card modal for any shoppable item (bottles, prints, merch, events).
// Pops up on the current page without navigation.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { X } from "lucide-react";
import AddToCartButton from "../cart/AddToCartButton";

const ItemDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  const typeLabel = {
    bottle: "Bottle Shop",
    print: "Painting",
    merch: "Merchandise",
    event: "Event Ticket",
  }[item.type] || "Item";

  const isSoldOut = item.available === false;
  const price = Number(item.price);

  return (
    <div className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        {item.imageUrl && (
          <div className="relative flex-shrink-0">
            <img src={item.imageUrl} alt={item.name}
              className="w-full h-56 sm:h-64 object-cover" />
            <button onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center
                text-white hover:bg-opacity-70 transition-all">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Details */}
        <div className="p-6 overflow-y-auto">
          {!item.imageUrl && (
            <button onClick={onClose} className="self-end text-navy opacity-40 hover:opacity-80 float-right">
              <X size={20} />
            </button>
          )}
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">{typeLabel}</p>
          <h2 className="font-display text-navy text-2xl mb-1">{item.name}</h2>

          {item.subtitle && (
            <p className="font-body text-sm text-navy opacity-50 mb-1">{item.subtitle}</p>
          )}
          {item.region && (
            <p className="font-body text-xs text-navy opacity-40 mb-1">{item.region}</p>
          )}
          {item.artist && (
            <p className="font-body text-sm text-navy opacity-50 mb-1">{item.artist}</p>
          )}
          {item.medium && (
            <p className="font-body text-xs text-navy opacity-40 mb-1">{item.medium}</p>
          )}
          {item.variants && (
            <p className="font-body text-xs text-navy opacity-40 mb-1">Sizes: {item.variants}</p>
          )}

          {item.description && (
            <p className="font-body text-navy opacity-70 text-sm leading-relaxed mt-3 mb-4">
              {item.description}
            </p>
          )}

          {/* Price + Cart */}
          <div className="mt-4">
            <p className="font-display text-navy text-2xl mb-3">
              {isSoldOut ? "Sold Out" : `$${price.toLocaleString()}`}
            </p>
            {isSoldOut ? (
              <button disabled
                className="w-full py-3 bg-navy bg-opacity-20 text-navy opacity-40 font-body font-bold
                  tracking-widest uppercase text-sm cursor-not-allowed rounded">
                Sold Out
              </button>
            ) : (
              <AddToCartButton
                item={{
                  id: item.id,
                  type: item.type,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  toastProductId: item.toastProductId,
                  variant: item.variant,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
