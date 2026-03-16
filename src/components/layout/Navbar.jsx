// ─────────────────────────────────────────────────────────────────────────────
// components/layout/Navbar.jsx — fully mobile-optimized
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import FlamingoIcon from "../ui/FlamingoIcon";
import { useSite } from "../../context/AdminContext";

const NAV_LINKS = [
  { label: "Menu",      path: "/menu" },
  { label: "Events",    path: "/events" },
  { label: "Gallery",   path: "/gallery" },
  { label: "Paintings", path: "/prints" },
  { label: "Press",     path: "/press" },
  { label: "Contact",   path: "/contact" },
];

const Navbar = () => {
  const { siteData } = useSite();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled ? "bg-navy bg-opacity-97 backdrop-blur-sm shadow-lg py-2" : "bg-transparent py-3 md:py-4"}`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-12 flex items-center justify-between">

        {/* ── Flamingo home button ───────────────────────── */}
        <Link to="/" aria-label="Go to homepage" className="flex items-center gap-2 group flex-shrink-0">
          <div className="animate-flamingo-bob">
            <FlamingoIcon size={38} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="font-display text-cream text-base md:text-lg">Standard Fare</span>
        </Link>

        {/* ── Desktop nav links ──────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map(({ label, path }) => (
            <Link key={path} to={path}
              className={`font-body text-xs tracking-editorial uppercase transition-colors duration-200
                ${location.pathname === path ? "text-flamingo" : "text-cream hover:text-flamingo"}`}>
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right CTAs ─────────────────────────── */}
        <div className="hidden lg:flex items-center gap-4">
          <a href={siteData.links.giftCards} target="_blank" rel="noopener noreferrer"
            className="font-body text-xs tracking-editorial uppercase text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all">
            Gift Cards
          </a>
          <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
            className="btn-primary py-2 px-5 text-xs">
            Reserve
          </a>
        </div>

        {/* ── Mobile: Reserve CTA + Hamburger ───────────── */}
        <div className="flex lg:hidden items-center gap-3">
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
        <div className="lg:hidden fixed inset-0 top-[56px] bg-navy-dark z-40 flex flex-col overflow-y-auto">
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
              <a href={siteData.links.doordash} target="_blank" rel="noopener noreferrer"
                className="btn-ghost text-center text-sm py-4">
                Order Takeout
              </a>
              <a href={siteData.links.giftCards} target="_blank" rel="noopener noreferrer"
                className="text-center font-body text-sm text-cream opacity-60 hover:opacity-100 py-2 transition-all">
                Gift Cards
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
