// ─────────────────────────────────────────────────────────────────────────────
// pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// The main homepage ("/"). Renders all homepage sections stacked vertically:
//   1. HeroSection        — full-screen hero with CTA
//   2. AboutSection       — two-column about description
//   3. HoursSection       — hours table + location + map
//   4. EventsPreview      — shows the next 2 upcoming events with a "See All" link
//   5. GalleryPreview     — shows 6 gallery photos with an "Instagram" link
//   6. PrintsPreview      — teases the gallery shop prints
//   7. PressPreview       — shows 3 press quotes
//
// Each section is a standalone component (see components/sections/).
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Link } from "react-router-dom";
import { Ticket, ShoppingBag, ExternalLink, Instagram } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import HoursSection from "../components/sections/HoursSection";
import { useSite } from "../context/AdminContext";

// Helper: format event date
const formatDate = (dateStr) => {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
};

// ── Events Preview Strip ──────────────────────────────────────────────────
const EventsPreview = () => {
  const { siteData } = useSite();
  const today = new Date(); today.setHours(0,0,0,0);
  const upcoming = siteData.events.filter((e) => new Date(e.date) >= today).slice(0, 2);

  if (upcoming.length === 0) return null; // Don't render section if no events

  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Coming Up</p>
          <h2 className="font-display text-cream text-3xl md:text-4xl">Upcoming Events</h2>
          <span className="section-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {upcoming.map((ev) => (
            <div key={ev.id} className="bg-navy-light rounded-lg overflow-hidden group">
              {ev.imageUrl && (
                <img src={ev.imageUrl} alt={ev.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <div className="p-6">
                <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">{formatDate(ev.date)} · {ev.time}</p>
                <h3 className="font-display text-cream text-xl mb-3">{ev.title}</h3>
                <p className="font-body text-cream opacity-60 text-sm mb-4 line-clamp-2">{ev.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-cream text-lg">${ev.price} <span className="text-sm font-body opacity-40">/ person</span></span>
                  <a href={ev.ticketUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-primary py-2 px-5 text-xs flex items-center gap-2">
                    <Ticket size={14} /> Tickets
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/events" className="btn-ghost">View All Events</Link>
        </div>
      </div>
    </section>
  );
};

// ── Gallery Preview Strip ─────────────────────────────────────────────────
// Shows up to 9 photos as clean square tiles. Each links to Instagram.
// Photos must have photo.url set (uploaded or URL pasted in admin panel).
const GalleryPreview = () => {
  const { siteData } = useSite();
  const photos = siteData.gallery.slice(0, 9);

  return (
    <section className="section-padding bg-cream-warm">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
            @standardfaresaratoga
          </p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Gallery</h2>
          <span className="section-divider" />
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-10">
          {photos.map((photo) => {
            const src = photo.url || photo.imageUrl || null;
            const postUrl = photo.instagramUrl
              || (photo.instagramId ? `https://www.instagram.com/p/${photo.instagramId}/` : null)
              || siteData.links.instagram;

            return (
              <a key={photo.id} href={postUrl} target="_blank" rel="noopener noreferrer"
                className="aspect-square overflow-hidden rounded group relative block bg-navy-light">
                {src ? (
                  <img src={src} alt={photo.alt || "Standard Fare"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" />
                ) : (
                  // Placeholder until photo URL is added in admin
                  <div className="w-full h-full flex items-center justify-center bg-navy">
                    <Instagram size={18} className="text-flamingo opacity-30" />
                  </div>
                )}
                {/* Instagram icon on hover */}
                <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40
                                transition-all duration-300 flex items-center justify-center">
                  <Instagram size={18} className="text-cream opacity-0 group-hover:opacity-80
                                                  transition-opacity duration-300" />
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/gallery" className="btn-secondary">View Full Gallery</Link>
          <a href={siteData.links.instagram} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-body text-sm tracking-editorial
                       uppercase text-navy opacity-60 hover:opacity-100 hover:text-flamingo transition-all">
            <ExternalLink size={14} />Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

// ── Prints Preview Strip ──────────────────────────────────────────────────
const PrintsPreview = () => {
  const { siteData } = useSite();
  const availablePrints = siteData.prints.filter((p) => p.available).slice(0, 3);

  if (availablePrints.length === 0) return null;

  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">In-House Gallery</p>
          <h2 className="font-display text-cream text-3xl md:text-4xl">Paintings</h2>
          <span className="section-divider" />
          <p className="font-body text-cream opacity-50 text-sm max-w-sm mx-auto">
            Original works by Daniel Fairley — available exclusively here.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {availablePrints.map((p) => (
            <div key={p.id} className="group">
              <div className="aspect-square overflow-hidden rounded mb-3">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
              </div>
              <h3 className="font-display text-cream text-base">{p.title}</h3>
              <p className="font-mono text-flamingo text-sm mt-1">${p.price.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/prints" className="btn-ghost flex items-center justify-center gap-2 mx-auto w-fit">
            <ShoppingBag size={16} /> Shop All Paintings
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── Press Preview Strip ───────────────────────────────────────────────────
const PressPreview = () => {
  const { siteData } = useSite();
  const topPress = siteData.press.slice(0, 3);

  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <div className="text-center mb-12">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
            As Seen In
          </p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Press</h2>
          <span className="section-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {topPress.map((p) => (
            <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
              className="group block bg-cream-warm border border-navy border-opacity-10 rounded-lg p-6
                         hover:border-flamingo hover:shadow-md transition-all duration-300">
              <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">{p.outlet}</p>
              <p className="font-display text-navy text-base leading-snug group-hover:text-flamingo-dark transition-colors">
                {p.headline}
              </p>
            </a>
          ))}
        </div>

        <div className="text-center">
          <Link to="/press" className="btn-secondary">All Press Coverage</Link>
        </div>
      </div>
    </section>
  );
};


// ── Reserve CTA Banner ────────────────────────────────────────────────────
const ReserveBanner = () => {
  const { siteData } = useSite();
  return (
    <section className="bg-flamingo py-20 text-center">
      <h2 className="font-display text-cream text-3xl md:text-5xl mb-4">
        Join Us for Dinner
      </h2>
      <p className="font-body text-cream opacity-80 mb-8 text-lg">
        Reserve your table at Standard Fare — Saratoga's most anticipated new restaurant.
      </p>
      <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
        className="inline-block bg-cream text-navy font-body font-bold tracking-widest uppercase text-sm px-10 py-4
                   transition-all duration-300 hover:bg-navy hover:text-cream">
        Reserve on Resy
      </a>
    </section>
  );
};

// ── Full Homepage ─────────────────────────────────────────────────────────
const HomePage = () => (
  <PageLayout>
    <HeroSection />
    <AboutSection />
    <HoursSection />
    <EventsPreview />
    <GalleryPreview />
    <PrintsPreview />
    <PressPreview />
    <ReserveBanner />
  </PageLayout>
);

export default HomePage;
