// ─────────────────────────────────────────────────────────────────────────────
// pages/PressPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lists all press coverage. Each card shows:
//   • Publication logo (if available) — fetched from the outlet's CDN
//   • Outlet name as fallback text if logo fails to load
//   • Article headline
//   • External link to the article
//
// Admin can add/edit/delete press articles in the /admin panel.
// The `logo` field accepts any publicly accessible image URL.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { ExternalLink, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

// ── Press Card ────────────────────────────────────────────────────────────
// Shows a publication logo on top, then the headline below
const PressCard = ({ outlet, headline, url, logo }) => {
  // Track whether the logo image successfully loaded
  // If it fails (404, CORS, etc.) we fall back to showing the outlet name as text
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-cream-warm border border-navy border-opacity-10 rounded-lg
                 overflow-hidden hover:border-flamingo hover:shadow-lg transition-all duration-300"
    >
      {/* ── Logo / Publication Header ────────────────────── */}
      <div className="bg-white flex items-center justify-center p-6 min-h-[100px] border-b border-navy border-opacity-10">
        {logo && !logoError ? (
          <img
            src={logo}
            alt={`${outlet} logo`}
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoError(true)}
            className={`w-10 h-10 object-contain transition-opacity duration-300
              ${logoLoaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : null}

        {/* Show outlet name as text only if no logo or logo failed */}
        {(!logo || logoError || !logoLoaded) && (
          <p className="font-mono text-navy text-sm tracking-editorial uppercase font-bold text-center">
            {outlet}
          </p>
        )}
      </div>

      {/* ── Article Headline ─────────────────────────────── */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Outlet name label above headline */}
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
            {outlet}
          </p>

          {/* The article headline */}
          <h3 className="font-display text-navy text-base leading-snug group-hover:text-flamingo-dark transition-colors">
            {headline}
          </h3>
        </div>

        {/* "Read Article" link indicator at the bottom */}
        <div className="flex items-center gap-2 mt-5 font-body text-xs text-navy opacity-40 group-hover:opacity-80 transition-opacity">
          <ExternalLink size={12} />
          <span>Read Article</span>
        </div>
      </div>
    </a>
  );
};

// ── Main Press Page ───────────────────────────────────────────────────────
const PressPage = () => {
  const { siteData } = useSite();
  const { press, contact } = siteData;

  const pressEmail = contact?.pressEmail || contact?.["Press"] || contact?.["press"] || "";

  return (
    <PageLayout>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          In the News
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Press</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-4" />
        {/* Press inquiry contact */}
        {pressEmail && (
          <p className="font-body text-cream opacity-50 text-sm">
            For press inquiries:{" "}
            <a
              href={`mailto:${pressEmail}`}
              className="text-flamingo hover:text-flamingo-light transition-colors"
            >
              {pressEmail}
            </a>
          </p>
        )}
      </div>

      {/* ── Press Grid ──────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          {press.length === 0 ? (
            <p className="text-center font-body text-navy opacity-40">
              No press articles yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Blog card — first position */}
              <Link to="/blog"
                className="group flex flex-col bg-cream-warm border border-navy border-opacity-10 rounded-lg
                           overflow-hidden hover:border-flamingo hover:shadow-lg transition-all duration-300">
                <div className="bg-navy flex items-center justify-center p-6 min-h-[100px] border-b border-navy border-opacity-10">
                  <img src="/sf-logo.svg" alt="Standard Fare" className="h-12 w-auto" />
                </div>
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
                      Standard Fare
                    </p>
                    <h3 className="font-display text-navy text-base leading-snug group-hover:text-flamingo-dark transition-colors">
                      From the Kitchen
                    </h3>
                    <p className="font-body text-navy opacity-50 text-xs mt-2">
                      Read our own stories — chef notes, sourcing, and behind the scenes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-5 font-body text-xs text-navy opacity-40 group-hover:opacity-80 transition-opacity">
                    <BookOpen size={12} />
                    <span>Visit Blog</span>
                  </div>
                </div>
              </Link>

              {press.map((item) => (
                <PressCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PressPage;
