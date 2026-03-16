// ─────────────────────────────────────────────────────────────────────────────
// pages/PrintsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// In-house gallery shop featuring artwork by Daniel Fairley (poemdexter).
// Prints are sold directly on this site — NOT linked to the artist's external shop.
//
// PURCHASE FLOW:
//   Each print's "Purchase" button links to Toast online ordering using the
//   print's toastProductId. Until products are created in Toast, clicking
//   "Purchase" sends the user to the general Toast order page.
//   See README-TOAST.md for setup.
//
// Admin can manage prints (add/edit/delete) in the /admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

// ── Print Detail Modal — shown when a print is clicked ────────────────────
const PrintModal = ({ print, onClose, orderBaseUrl }) => {
  if (!print) return null;

  // Build the purchase URL from Toast product ID, or fall back to general order page
  const purchaseUrl = print.toastProductId
    ? `${orderBaseUrl}#product-${print.toastProductId}`
    : orderBaseUrl;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Print image — left side */}
        <div className="md:w-1/2 flex-shrink-0">
          <img
            src={print.imageUrl}
            alt={print.title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>

        {/* Print details — right side */}
        <div className="p-8 flex flex-col justify-between">
          {/* Close button */}
          <button
            onClick={onClose}
            className="self-end text-navy opacity-40 hover:opacity-80 mb-4"
          >
            <X size={20} />
          </button>

          <div>
            {/* Artist label */}
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
              {print.artist}
            </p>

            {/* Title */}
            <h2 className="font-display text-navy text-2xl font-medium mb-1">{print.title}</h2>

            {/* Medium */}
            <p className="font-body text-sm text-navy opacity-50 mb-4">{print.medium}</p>

            {/* Description */}
            <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-6">
              {print.description}
            </p>
          </div>

          {/* Price + Purchase CTA */}
          <div>
            <p className="font-display text-navy text-3xl mb-4">
              {print.available ? `$${print.price.toLocaleString()}` : "Sold Out"}
            </p>

            {print.available ? (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-2 w-full"
              >
                <ShoppingBag size={16} />
                Purchase Print
              </a>
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
    {/* Image container with hover scale */}
    <div className="relative overflow-hidden rounded shadow-md mb-3 aspect-square">
      <img
        src={print.imageUrl}
        alt={print.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Sold out overlay */}
      {!print.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-60 flex items-center justify-center">
          <span className="font-mono text-cream text-xs tracking-editorial uppercase">Sold Out</span>
        </div>
      )}
      {/* Hover: show "View" */}
      {print.available && (
        <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <span className="font-body text-cream text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </span>
        </div>
      )}
    </div>

    {/* Title and price below the image */}
    <h3 className="font-display text-navy text-base leading-tight">{print.title}</h3>
    <p className="font-body text-sm text-navy opacity-50 mt-1">{print.medium}</p>
    <p className="font-mono text-navy text-sm mt-1 font-bold">
      {print.available ? `$${print.price.toLocaleString()}` : "Sold Out"}
    </p>
  </div>
);

// ── Main Prints Page ──────────────────────────────────────────────────────
const PrintsPage = () => {
  const { siteData } = useSite();
  const [selectedPrint, setSelectedPrint] = useState(null); // Which print is in the modal

  const orderBaseUrl = siteData.links.toastOnlineOrder; // Base Toast URL for purchases

  return (
    <PageLayout>
      {/* Print detail modal */}
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

      {/* ── Prints Grid ─────────────────────────────────────── */}
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
    </PageLayout>
  );
};

export default PrintsPage;
