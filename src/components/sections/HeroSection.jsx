// ─────────────────────────────────────────────────────────────────────────────
// components/sections/HeroSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen hero slideshow. All text — eyebrow, title, tagline, CTA buttons
// — is pulled from siteData.heroContent and editable in the admin panel.
// Slides are managed in siteData.heroSlides.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const FALLBACK_SLIDES = [
  { id: 1, url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&q=85", alt: "Standard Fare dining room" },
  { id: 2, url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1800&q=85", alt: "Beautiful dish at Standard Fare" },
  { id: 3, url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1800&q=85", alt: "Craft cocktails at Standard Fare" },
];

const SLIDE_INTERVAL = 5000;

const HeroSection = () => {
  const { siteData } = useSite();
  const isValidUrl = (u) =>
    typeof u === "string" &&
    (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:"));
  const rawSlides = siteData.heroSlides?.length > 0 ? siteData.heroSlides : FALLBACK_SLIDES;
  const slides = rawSlides.filter((s) => isValidUrl(s.url));
  if (slides.length === 0) slides.push(...FALLBACK_SLIDES);

  // Hero text content — falls back to defaults if not set
  const hero = {
    eyebrow:           "21 Phila St · Saratoga Springs, NY",
    title:             "Standard Fare",
    tagline:           "Creative American Dining\nBrunch, Dinner & Cocktails",
    ctaPrimaryLabel:   "Reserve a Table",
    ctaSecondaryLabel: "View Menu",
    ...(siteData.heroContent || {}),
  };

  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => setCurrent(i => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(t);
  }, [next, paused, slides.length]);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== current}>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${slide.url}')` }} />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/80 via-navy-dark/60 to-navy-dark/90 z-10" />

      {/* Grain */}
      <div className="absolute inset-0 z-10 opacity-20 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />

      {/* Content */}
      <div className="relative z-20 text-center px-5 max-w-2xl mx-auto w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>

        {hero.eyebrow && (
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-5 animate-fade-in">
            {hero.eyebrow}
          </p>
        )}

        <h1 className="font-display text-cream text-4xl sm:text-6xl md:text-7xl font-medium leading-tight mb-5 animate-fade-in">
          {hero.title}
        </h1>

        {hero.tagline && (
          <p className="font-body text-cream text-base sm:text-lg opacity-80 mb-8 leading-relaxed animate-slide-up">
            {hero.tagline.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
          <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
            className="btn-primary text-sm py-4 sm:py-3 touch-manipulation">
            {hero.ctaPrimaryLabel}
          </a>
          <Link to="/menu" className="btn-ghost text-sm py-4 sm:py-3 touch-manipulation">
            {hero.ctaSecondaryLabel}
          </Link>
        </div>
      </div>

      {/* Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-60 text-cream rounded-full p-2 transition-all touch-manipulation">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} aria-label="Next slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-30 hover:bg-opacity-60 text-cream rounded-full p-2 transition-all touch-manipulation">
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 touch-manipulation
                ${i === current ? "bg-flamingo w-6" : "bg-cream bg-opacity-40 w-2 hover:bg-opacity-70"}`}
              aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden sm:block">
        <ChevronDown size={22} className="text-cream opacity-30" />
      </div>
    </section>
  );
};

export default HeroSection;
