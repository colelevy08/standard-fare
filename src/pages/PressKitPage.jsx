// ─────────────────────────────────────────────────────────────────────────────
// pages/PressKitPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Professional press kit page with downloadable assets, restaurant info,
// key facts, and links to recent press coverage.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Download, Mail, FileText, Image, User } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import { generateMenuPdf } from "../hooks/useMenuPdf";

// ── Asset Card ────────────────────────────────────────────────────────────
const AssetCard = ({ icon: Icon, title, description, onClick, href }) => {
  const className = `group flex items-start gap-4 p-6 bg-white border border-navy border-opacity-10
    rounded-lg hover:border-flamingo hover:shadow-lg transition-all duration-300 cursor-pointer`;

  const content = (
    <>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-flamingo bg-opacity-10 flex items-center justify-center">
        <Icon size={18} className="text-flamingo" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-display text-navy text-sm leading-snug group-hover:text-flamingo-dark transition-colors">
          {title}
        </h4>
        <p className="font-body text-navy opacity-50 text-xs mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <Download size={16} className="text-navy opacity-20 group-hover:opacity-60 flex-shrink-0 mt-1 transition-opacity" />
    </>
  );

  if (href) {
    return (
      <a href={href} download target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${className} w-full text-left`}>
      {content}
    </button>
  );
};

// ── Fact Row ──────────────────────────────────────────────────────────────
const FactRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-3 border-b border-navy border-opacity-8 last:border-0">
    <span className="font-mono text-flamingo text-xs tracking-editorial uppercase flex-shrink-0">
      {label}
    </span>
    <span className="font-body text-navy text-sm text-right">{value}</span>
  </div>
);

// ── Press Kit Page ────────────────────────────────────────────────────────
const PressKitPage = () => {
  const { siteData } = useSite();
  const { about, location, contact, press, menus } = siteData;

  const pressEmail = contact?.pressEmail || "";

  return (
    <PageLayout>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          For the Press
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Press Kit</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container max-w-4xl space-y-16">

          {/* ── About Standard Fare ───────────────────────────── */}
          <section>
            <h2 className="font-display text-navy text-2xl mb-2">About Standard Fare</h2>
            <span className="block w-10 h-px bg-flamingo mb-6" />
            <div className="font-body text-navy opacity-70 text-sm leading-relaxed whitespace-pre-line">
              {about?.body || ""}
            </div>
          </section>

          {/* ── Key Facts ─────────────────────────────────────── */}
          <section>
            <h2 className="font-display text-navy text-2xl mb-2">Key Facts</h2>
            <span className="block w-10 h-px bg-flamingo mb-6" />
            <div className="bg-white rounded-lg border border-navy border-opacity-10 p-6">
              <FactRow label="Address" value={`${location?.address || ""}, ${location?.city || ""}`} />
              <FactRow label="Phone" value={location?.phone || ""} />
              <FactRow label="Owners" value={about?.owners || ""} />
              <FactRow label="Cuisine" value={about?.heading || "Creative American Dining"} />
              <FactRow label="Opened" value="August 2025" />
              <FactRow label="Setting" value="Full-service restaurant & bar" />
            </div>
          </section>

          {/* ── Press Contact ─────────────────────────────────── */}
          {pressEmail && (
            <section>
              <h2 className="font-display text-navy text-2xl mb-2">Press Contact</h2>
              <span className="block w-10 h-px bg-flamingo mb-6" />
              <div className="flex items-center gap-4 bg-white rounded-lg border border-navy border-opacity-10 p-6">
                <div className="w-10 h-10 rounded-full bg-flamingo bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-flamingo" />
                </div>
                <div>
                  <p className="font-mono text-navy text-xs tracking-editorial uppercase mb-1">
                    Press Inquiries
                  </p>
                  <a
                    href={`mailto:${pressEmail}`}
                    className="font-body text-flamingo hover:text-flamingo-dark transition-colors text-sm"
                  >
                    {pressEmail}
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* ── Downloadable Assets ───────────────────────────── */}
          <section>
            <h2 className="font-display text-navy text-2xl mb-2">Downloadable Assets</h2>
            <span className="block w-10 h-px bg-flamingo mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo — transparent */}
              <AssetCard
                icon={Image}
                title="SF Logo (Transparent)"
                description="White SF monogram on transparent background (SVG)"
                href="/sf-logo.svg"
              />

              {/* Logo — navy background */}
              <AssetCard
                icon={Image}
                title="SF Logo (Navy Background)"
                description="White SF monogram on navy background (SVG)"
                href="/sf-logo-navy.svg"
              />

              {/* Menu PDF */}
              <AssetCard
                icon={FileText}
                title="Full Menu (PDF)"
                description="Current brunch, dinner, cocktails, wine & dessert menus"
                onClick={() => generateMenuPdf(menus, "Standard Fare")}
              />

              {/* Owner Headshots */}
              {(about?.team || []).map((member) => (
                <AssetCard
                  key={member.name}
                  icon={User}
                  title={`${member.name} — Headshot`}
                  description={member.role}
                  href={member.photo}
                />
              ))}
            </div>
          </section>

          {/* ── Recent Press ──────────────────────────────────── */}
          {press && press.length > 0 && (
            <section>
              <h2 className="font-display text-navy text-2xl mb-2">Recent Press</h2>
              <span className="block w-10 h-px bg-flamingo mb-6" />
              <div className="space-y-3">
                {press.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-5 bg-white border border-navy border-opacity-10
                               rounded-lg hover:border-flamingo hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">
                        {item.outlet}
                      </p>
                      <h4 className="font-display text-navy text-sm leading-snug group-hover:text-flamingo-dark transition-colors">
                        {item.headline}
                      </h4>
                    </div>
                    <span className="font-body text-navy opacity-30 text-xs flex-shrink-0 mt-1 group-hover:opacity-60 transition-opacity">
                      Read &rarr;
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </PageLayout>
  );
};

export default PressKitPage;
