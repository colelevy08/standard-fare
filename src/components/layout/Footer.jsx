// ─────────────────────────────────────────────────────────────────────────────
// components/layout/Footer.jsx — mobile optimized
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, ExternalLink, Lock } from "lucide-react";
import FlamingoIcon from "../ui/FlamingoIcon";
import { useSite } from "../../context/AdminContext";

// ── Admin Login Modal ──────────────────────────────────────────────────────
const AdminLoginModal = ({ onClose }) => {
  const { login }         = useSite();
  const navigate          = useNavigate();
  const [pw, setPw]       = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(pw)) { onClose(); navigate("/admin"); }
    else setError("Incorrect password. Please try again.");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-70 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      {/* Slides up from bottom on mobile */}
      <div className="bg-cream rounded-t-2xl sm:rounded-lg p-8 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center mb-6">
          <Lock size={26} className="text-flamingo mb-3" />
          <h3 className="font-display text-2xl text-navy">Owner Login</h3>
          <p className="font-body text-sm text-navy opacity-60 mt-1 text-center">
            Enter your password to manage the website
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="password" placeholder="Password" value={pw}
            onChange={(e) => { setPw(e.target.value); setError(""); }}
            className="form-input text-base" /* text-base prevents iOS auto-zoom */ autoFocus />
          {error && <p className="text-flamingo-dark text-sm font-body">{error}</p>}
          <button type="submit" className="btn-primary w-full py-4">Enter</button>
          <button type="button" onClick={onClose}
            className="font-body text-sm text-navy opacity-50 hover:opacity-80 transition-opacity text-center py-2">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────
const Footer = () => {
  const { siteData, isAdmin, logout } = useSite();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const handleManageClick = () => {
    if (isAdmin) navigate("/admin"); else setShowLogin(true);
  };

  return (
    <>
      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}

      <footer className="bg-navy-dark text-cream">
        {/* Upper footer */}
        <div className="section-container py-12 md:py-16">
          {/* 1-col on mobile, 3-col on md */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-3 w-fit">
                <FlamingoIcon size={34} />
                <span className="font-display text-lg">Standard Fare</span>
              </Link>
              <p className="font-body text-sm text-cream opacity-70 leading-relaxed">
                Creative American Dining<br />
                {siteData.location.address}<br />
                {siteData.location.city}
              </p>
              {(siteData.location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z") && (
                <a href={siteData.location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z"} target="_blank" rel="noopener noreferrer"
                  className="font-body text-xs text-flamingo hover:text-flamingo-light transition-colors w-fit">
                  View on Google Maps →
                </a>
              )}
              <a href={siteData.links.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-flamingo hover:text-flamingo-light transition-colors w-fit">
                <Instagram size={15} />
                <span className="font-body text-sm">@standardfaresaratoga</span>
              </a>

              {/* Bocage sister-business link */}
              <div className="mt-1 pt-4 border-t border-cream border-opacity-10">
                <p className="font-mono text-xs tracking-editorial uppercase text-cream opacity-30 mb-2">
                  Also from our team
                </p>
                <a
                  href="https://www.instagram.com/bocagechampagnebar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group w-fit"
                >
                  <span className="text-lg">🥂</span>
                  <div>
                    <p className="font-display text-cream text-sm group-hover:text-gold transition-colors">
                      Bocage Champagne Bar
                    </p>
                    <p className="font-body text-xs text-cream opacity-40">
                      10 Phila St · Saratoga Springs
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-mono text-xs tracking-editorial uppercase text-flamingo mb-5">Explore</h4>
              {/* 2-column link grid on mobile for compact display */}
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-y-3 gap-x-4">
                {[
                  { label: "Menu",         path: "/menu" },
                  { label: "Events",       path: "/events" },
                  { label: "Gallery",      path: "/gallery" },
                  ...(siteData.settings?.showPaintings !== false ? [{ label: "Paintings", path: "/prints" }] : []),
                  { label: "Blog",         path: "/blog" },
                  { label: "Press",        path: "/press" },
                  { label: "Press Kit",    path: "/press-kit" },
                  { label: "Private Events", path: "/private-events" },
                  { label: "FAQ",          path: "/faq" },
                  { label: "Contact",      path: "/contact" },
                ].map(({ label, path }) => (
                  <li key={path}>
                    <Link to={path}
                      className="font-body text-sm text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all touch-manipulation">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visit Us */}
            <div>
              <h4 className="font-mono text-xs tracking-editorial uppercase text-flamingo mb-5">Visit Us</h4>
              <ul className="flex flex-col gap-3">
                <li>
                  <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-body text-sm text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all touch-manipulation">
                    <ExternalLink size={13} />Reservations
                  </a>
                </li>
                <li>
                  <Link to="/gift-cards"
                    className="flex items-center gap-2 font-body text-sm text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all touch-manipulation">
                    <ExternalLink size={13} />Gift Cards
                  </Link>
                </li>
                <li>
                  <a href={siteData.links.doordash} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-body text-sm text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all touch-manipulation">
                    <ExternalLink size={13} />Order on DoorDash
                  </a>
                </li>
                <li>
                  <a href={siteData.links.toastOnlineOrder} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 font-body text-sm text-cream opacity-70 hover:opacity-100 hover:text-flamingo transition-all touch-manipulation">
                    <ExternalLink size={13} />Order Pickup
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Lower bar */}
        <div className="border-t border-cream border-opacity-10">
          <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">

            {/* Left: copyright */}
            <p className="font-body text-xs text-cream opacity-40 text-center sm:text-left">
              © {new Date().getFullYear()} Standard Fare · Saratoga Springs, NY
            </p>

            {/* Center: Founders LinkedIn links */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-cream opacity-30 tracking-editorial uppercase hidden sm:block">
                Owners &amp; Founders
              </span>
              <a
                href="https://www.linkedin.com/in/clarkcgale/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs text-cream opacity-50 hover:opacity-100 hover:text-flamingo transition-all"
              >
                Clark Gale
              </a>
              <span className="text-cream opacity-20 text-xs">·</span>
              <a
                href="https://www.linkedin.com/in/zacdenham/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs text-cream opacity-50 hover:opacity-100 hover:text-flamingo transition-all"
              >
                Zac Denham
              </a>
            </div>

            {/* Right: Cole Levy credit + Manage */}
            <div className="flex items-center gap-5">
              <p className="font-body text-xs text-cream opacity-40">
                Website created by{" "}
                <a
                  href="https://www.linkedin.com/in/colelevy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream opacity-100 hover:opacity-100 hover:text-flamingo transition-all"
                >
                  Cole Levy
                </a>
              </p>

              {isAdmin ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate("/admin")}
                    className="font-body text-xs text-flamingo hover:text-flamingo-light transition-colors touch-manipulation">
                    Manage Site
                  </button>
                  <button onClick={logout}
                    className="font-body text-xs text-cream opacity-40 hover:opacity-80 transition-opacity touch-manipulation">
                    Log Out
                  </button>
                </div>
              ) : (
                <button onClick={handleManageClick}
                  className="font-body text-xs text-cream opacity-30 hover:opacity-70 transition-opacity flex items-center gap-1 touch-manipulation">
                  <Lock size={10} />Manage
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
