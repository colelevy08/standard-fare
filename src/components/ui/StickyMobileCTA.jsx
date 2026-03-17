// ─────────────────────────────────────────────────────────────────────────────
// components/ui/StickyMobileCTA.jsx
// Sticky Reserve + Order bar visible only on mobile as user scrolls.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useSite } from "../../context/AdminContext";

const StickyMobileCTA = () => {
  const { siteData } = useSite();
  const [visible, setVisible] = useState(false);
  const showOrder = siteData.settings?.showOrderButton !== false;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] md:hidden">
      <div className="bg-navy border-t border-cream border-opacity-10 px-4 py-3 flex gap-3">
        <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center py-3 bg-flamingo text-white font-body font-bold text-sm tracking-widest uppercase rounded">
          Reserve
        </a>
        {showOrder && (
          <a href={siteData.links.toastOnlineOrder} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-3 border border-cream border-opacity-30 text-cream font-body font-bold text-sm tracking-widest uppercase rounded hover:bg-cream hover:bg-opacity-10">
            Order
          </a>
        )}
      </div>
    </div>
  );
};

export default StickyMobileCTA;
