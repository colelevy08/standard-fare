// ─────────────────────────────────────────────────────────────────────────────
// components/layout/Navbar.jsx — clean, uncluttered navigation
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag } from "lucide-react";
import FlamingoIcon from "../ui/FlamingoIcon";
import { useSite } from "../../context/AdminContext";
import { useCart } from "../../context/CartContext";

const ALL_NAV_LINKS = [
  { label: "Menu",      path: "/menu" },
  { label: "Events",    path: "/events" },
  { label: "Gallery",   path: "/gallery" },
  { label: "Paintings", path: "/prints", requiresPaintings: true },
  { label: "Bottles",   path: "/bottles", requiresBottleShop: true },
  { label: "Merch",     path: "/merch" },
  { label: "Press",     path: "/press" },
  { label: "Contact",   path: "/contact" },
];

const Navbar = () => {
  const { siteData } = useSite();
  const { itemCount, setDrawerOpen } = useCart();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const location = useLocation();
  const showOrder = siteData.settings?.showOrderButton !== false;
  const showPaintings = siteData.settings?.showPaintings !== false;
  const showBottleShop = siteData.settings?.showBottleShop !== false;
  const NAV_LINKS = ALL_NAV_LINKS.filter(l =>
    (!l.requiresPaintings || showPaintings) &&
    (!l.requiresBottleShop || showBottleShop)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Prevent body scroll when mobile menu is open (iOS-safe)
  useEffect(() => {
    if (!menuOpen) return;
    // Capture current scroll position before locking
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled ? "bg-navy bg-opacity-97 backdrop-blur-sm shadow-lg py-2" : "bg-transparent py-3 md:py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">

        {/* ── Flamingo home button ───────────────────────── */}
        <Link to="/" aria-label="Go to homepage" className="flex items-center gap-2 group flex-shrink-0">
          <div className="animate-flamingo-bob">
            <FlamingoIcon size={36} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="font-display text-cream text-base md:text-lg">Standard Fare</span>
        </Link>

        {/* ── Desktop nav links ──────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {NAV_LINKS.map(({ label, path }) => (
            <Link key={path} to={path}
              className={`font-body text-[11px] tracking-editorial uppercase transition-colors duration-200
                ${location.pathname === path ? "text-flamingo" : "text-cream opacity-80 hover:text-flamingo hover:opacity-100"}`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right CTAs ─────────────────────────── */}
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/gift-cards"
            className={`font-body text-[11px] tracking-editorial uppercase transition-all
              ${location.pathname === "/gift-cards" ? "text-flamingo" : "text-cream opacity-60 hover:opacity-100 hover:text-flamingo"}`}>
            Gift Cards
          </Link>
          {showOrder && (
            <Link to="/order"
              className="btn-ghost py-2 px-4 text-xs border border-cream border-opacity-30 hover:border-flamingo">
              Order
            </Link>
          )}
          <button onClick={() => setDrawerOpen(true)}
            className="relative text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all p-1 touch-manipulation">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-flamingo text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
            className="btn-primary py-2 px-5 text-xs">
            Reserve
          </a>
        </div>

        {/* ── Mobile: Reserve CTA + Cart + Hamburger ───────────── */}
        <div className="flex lg:hidden items-center gap-3">
          <button onClick={() => setDrawerOpen(true)}
            className="relative text-cream p-1.5 touch-manipulation">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-flamingo text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
            className="btn-primary py-2 px-4 text-xs">
            Reserve
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="text-cream p-1.5 rounded touch-manipulation"
            aria-label="Toggle navigation menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu ─────────────────────────── */}
      {menuOpen && (
        <div className="lg:hidden fixed left-0 right-0 bottom-0 bg-navy-dark z-40 flex flex-col overflow-y-auto"
          style={{ top: "56px" }}>
          <div className="px-6 py-8 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <Link key={path} to={path}
                className={`font-body text-lg py-4 border-b border-cream border-opacity-10
                  transition-colors touch-manipulation
                  ${location.pathname === path ? "text-flamingo" : "text-cream"}`}>
                {label}
              </Link>
            ))}

            {/* Mobile extra links */}
            <div className="mt-6 flex flex-col gap-3">
              <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-center text-sm py-4">
                Reserve a Table
              </a>
              {showOrder && (
                <Link to="/order"
                  className="btn-ghost text-center text-sm py-4">
                  Order Online
                </Link>
              )}
              <Link to="/gift-cards"
                className="btn-ghost text-center text-sm py-4">
                Gift Cards
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
