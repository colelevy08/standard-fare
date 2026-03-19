// ─────────────────────────────────────────────────────────────────────────────
// pages/PrintsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// In-house gallery shop featuring artwork by Daniel Fairley (poemdexter).
//
// TWO SECTIONS:
//   1. "At Standard Fare" — paintings curated by the admin (sold via Toast)
//   2. "More from Daniel Fairley" — all products from poemdexter.com (Big Cartel)
//      that are NOT already in the Standard Fare section. Links to his shop.
//
// Admin can manage prints (add/edit/delete) in the /admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { X, ExternalLink, Palette } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import useBigCartel from "../hooks/useBigCartel";
import AddToCartButton from "../components/cart/AddToCartButton";

// ── Print Detail Modal — shown when a print is clicked ────────────────────
const PrintModal = ({ print, onClose, orderBaseUrl }) => {
  if (!print) return null;

  // All purchases through Standard Fare / Toast
  const purchaseUrl = print.toastProductId
    ? `${orderBaseUrl}#product-${print.toastProductId}`
    : orderBaseUrl;

  const isExternal = false;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:w-1/2 flex-shrink-0">
          <img
            src={print.imageUrl}
            alt={print.title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>

        <div className="p-8 flex flex-col justify-between">
          <button
            onClick={onClose}
            className="self-end text-navy opacity-40 hover:opacity-80 mb-4"
          >
            <X size={20} />
          </button>

          <div>
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
              {print.artist || "Daniel Fairley"}
            </p>
            <h2 className="font-display text-navy text-2xl font-medium mb-1">{print.title}</h2>
            <p className="font-body text-sm text-navy opacity-50 mb-4">{print.medium}</p>
            {print.description && (
              <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-6">
                {print.description}
              </p>
            )}
          </div>

          <div>
            <p className="font-display text-navy text-3xl mb-4">
              {print.available ? (print.price ? `${Number(print.price).toLocaleString()}` : "Contact for Price") : "Sold Out"}
            </p>

            {print.available ? (
              isExternal ? (
                <a href={purchaseUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-primary flex items-center justify-center gap-2 w-full">
                  <ExternalLink size={16} /> View on Artist's Shop
                </a>
              ) : (
                <AddToCartButton
                  item={{
                    id: print.id,
                    type: "print",
                    name: print.title,
                    price: print.price,
                    imageUrl: print.imageUrl,
                    toastProductId: print.toastProductId,
                    stock: print.stock != null ? print.stock : 1,
                  }}
                />
              )
            ) : (
              <button
                disabled
                className="w-full py-3 px-8 bg-navy bg-opacity-20 text-navy opacity-40 font-body font-bold tracking-widest uppercase text-sm cursor-not-allowed"
              >
                Sold Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Print Thumbnail Card ──────────────────────────────────────────────────
const PrintCard = ({ print, onClick }) => (
  <div
    className="group cursor-pointer"
    onClick={() => onClick(print)}
  >
    <div className="relative overflow-hidden rounded shadow-md mb-3 aspect-square bg-navy-light">
      {print.imageUrl ? (
        <img
          src={print.imageUrl}
          alt={print.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Palette size={32} className="text-cream opacity-20" />
        </div>
      )}
      {!print.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-60 flex items-center justify-center">
          <span className="font-mono text-cream text-xs tracking-editorial uppercase">Sold Out</span>
        </div>
      )}
      {print.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <span className="font-body text-cream text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </span>
        </div>
      )}
    </div>

    <h3 className="font-display text-navy text-base leading-tight">{print.title}</h3>
    <p className="font-body text-sm text-navy opacity-50 mt-1">{print.medium}</p>
    <p className="font-mono text-navy text-sm mt-1 font-bold">
      {print.available ? (print.price ? `${Number(print.price).toLocaleString()}` : "") : "Sold Out"}
    </p>
  </div>
);

// ── External Product Card (for Big Cartel items) ──────────────────────────
const ExternalProductCard = ({ product, onClick }) => (
  <div className="group cursor-pointer" onClick={() => onClick(product)}>
    <div className="relative overflow-hidden rounded shadow-md mb-3 aspect-square bg-navy-light">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Palette size={32} className="text-cream opacity-20" />
        </div>
      )}
      {!product.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-60 flex items-center justify-center">
          <span className="font-mono text-cream text-xs tracking-editorial uppercase">Sold Out</span>
        </div>
      )}
      {product.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <span className="font-body text-cream text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </span>
        </div>
      )}
    </div>
    <h3 className="font-display text-cream text-base leading-tight">{product.title}</h3>
    <p className="font-body text-sm text-cream opacity-40 mt-1">
      {product.categories?.join(", ") || "Original Work"}
    </p>
    <p className="font-mono text-cream text-sm mt-1 font-bold">
      {product.available ? (product.price ? `${Number(product.price).toLocaleString()}` : "") : "Sold Out"}
    </p>
  </div>
);

// ── Main Prints Page ──────────────────────────────────────────────────────
const PrintsPage = () => {
  const { siteData } = useSite();
  const [selectedPrint, setSelectedPrint] = useState(null);
  const { products: bigCartelProducts, loading: bcLoading } = useBigCartel();
  const showPaintings = siteData.settings?.showPaintings !== false;

  const orderBaseUrl = siteData.links.toastOnlineOrder;

  // If paintings are hidden, show a simple message
  if (!showPaintings) {
    return (
      <PageLayout>
        <div className="bg-navy pt-32 pb-24 text-center">
          <h1 className="font-display text-cream text-4xl mb-4">Paintings</h1>
          <p className="font-body text-cream opacity-50 text-sm">
            This section is currently unavailable. Please check back soon.
          </p>
        </div>
      </PageLayout>
    );
  }

  // Filter Big Cartel products to exclude ones already in the Standard Fare section
  const sfTitles = new Set(siteData.prints.map((p) => p.title.toLowerCase()));
  const otherProducts = bigCartelProducts.filter(
    (p) => !sfTitles.has(p.title.toLowerCase())
  );

  // When clicking a Big Cartel product, format it for the modal
  const handleExternalClick = (product) => {
    setSelectedPrint({
      ...product,
      artist: "Daniel Fairley",
      medium: product.categories?.join(", ") || "Original Work",
      bigCartelUrl: product.url,
    });
  };

  return (
    <PageLayout>
      <PrintModal
        print={selectedPrint}
        onClose={() => setSelectedPrint(null)}
        orderBaseUrl={orderBaseUrl}
      />

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          In-House Gallery
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Paintings</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-4" />
        <p className="font-body text-cream opacity-50 text-sm max-w-md mx-auto">
          Original works by <span className="text-flamingo">Daniel Fairley</span> — available
          exclusively through Standard Fare.
        </p>
      </div>

      {/* ── About the Artist ──────────────────────────────────── */}
      <div className="bg-cream-warm py-12">
        <div className="section-container max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">The Artist</p>
            <h2 className="font-display text-navy text-2xl mb-3">Daniel Fairley</h2>
            <p className="font-body text-navy opacity-60 text-sm leading-relaxed">
              Daniel Fairley is a Saratoga Springs-based artist working in acrylic and watercolor, known for
              his playful, boldly colored compositions that blend absurdity with fine art. His originals hang
              on the walls at Standard Fare, where diners can view — and purchase — his work in person. Each
              painting brings a sense of humor and energy that matches the creative spirit of the restaurant.
            </p>
            {/* External artist links removed — purchases through Standard Fare only */}
          </div>
        </div>
      </div>

      {/* ── Standard Fare Prints Grid ─────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          {siteData.prints.length === 0 ? (
            <p className="text-center font-body text-navy opacity-40">
              No prints available right now. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {siteData.prints.map((print) => (
                <PrintCard
                  key={print.id}
                  print={print}
                  onClick={setSelectedPrint}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Big Cartel section removed — all paintings sold exclusively through Standard Fare */}
    </PageLayout>
  );
};

export default PrintsPage;
