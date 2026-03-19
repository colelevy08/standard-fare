// ─────────────────────────────────────────────────────────────────────────────
// pages/HomePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Homepage block order:
//   1. Hero slideshow
//   2. Our Story
//   3. Events (1 row, 6 cols desktop / 3 mobile, scrollable)
//   4. Bottle Shop (1 row, 6 cols desktop / 3 mobile, scrollable, add-to-cart)
//   5. Gallery (1 row, 6 cols desktop / 3 mobile)
//   6. Paintings (1 row, 6 cols desktop / 3 mobile, add-to-cart)
//   7. Press (1 row, 6 cols desktop / 3 mobile, scrollable)
//   8. Hours & Location
//   9. Reviews (1 row, scrollable)
//  10. Contact (compact — quick links + email/SMS signup)
//  11. Reserve CTA
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Ticket, ShoppingBag, ExternalLink, Instagram,
  MapPin, Phone, Mail, Wine, ChevronLeft, ChevronRight,
  MessageCircle, Check, CheckCircle, Calendar,
} from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import HoursSection from "../components/sections/HoursSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import SpecialsBanner from "../components/sections/SpecialsBanner";
import SeasonalCountdown from "../components/sections/SeasonalCountdown";
import ItemDetailModal from "../components/ui/ItemDetailModal";
import ProfileCardModal from "../components/ui/ProfileCardModal";
import AddToCartButton from "../components/cart/AddToCartButton";
import { useSite } from "../context/AdminContext";
import { getEventPhoto, resetEventPhotos, setStockPhotoPool } from "../data/eventPhotos";

// ── Scroll Row Container ──────────────────────────────────────────────────
// Shows items in a single scrollable row with hover arrows.
const ScrollRow = ({ children, className = "" }) => {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth;
    ref.current.scrollBy({ left: dir * w * 0.8, behavior: "smooth" });
  };

  return (
    <div className={`relative group/scroll ${className}`}>
      <button onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-navy bg-opacity-60 text-cream
          rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity
          hover:bg-opacity-80 -ml-2 touch-manipulation hidden sm:flex">
        <ChevronLeft size={20} />
      </button>
      <div ref={ref}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory
          scrollbar-hide pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
      <button onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-navy bg-opacity-60 text-cream
          rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity
          hover:bg-opacity-80 -mr-2 touch-manipulation hidden sm:flex">
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

// Shared width classes: 6 cols desktop, 3 mobile, scrollable overflow
const ITEM_WIDTH = "flex-shrink-0 w-[calc(33.333%-11px)] lg:w-[calc(16.666%-20px)] min-w-[160px] snap-start";

// Helper: format event date
const formatDate = (dateStr) => {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    });
  } catch { return dateStr; }
};

// ── Weekly Features ───────────────────────────────────────────────────────
const TAG_COLORS = {
  "New": "bg-flamingo text-white",
  "Fan Favorite": "bg-amber-400 text-navy",
  "Seasonal": "bg-emerald-500 text-white",
  "Chef's Pick": "bg-flamingo text-white",
  "Limited": "bg-amber-400 text-navy",
};

const WeeklyFeatures = () => {
  const { siteData } = useSite();
  const [selected, setSelected] = useState(null);
  const wf = siteData.weeklyFeatures || {};
  if (!wf.enabled || !wf.items || wf.items.length === 0) return null;

  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
            {wf.subtitle || "Chef's selections for the week"}
          </p>
          <h2 className="font-display text-cream text-3xl md:text-4xl">
            {wf.headline || "This Week's Features"}
          </h2>
          <span className="section-divider" />
        </div>

        <ProfileCardModal
          item={selected ? { ...selected, type: "feature" } : null}
          onClose={() => setSelected(null)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {wf.items.map((item) => (
            <div key={item.id}
              className="bg-navy-light rounded-lg p-6 flex flex-col cursor-pointer group hover:bg-opacity-80 transition-all"
              onClick={() => setSelected(item)}>
              {item.tag && (
                <span className={`inline-block self-start font-mono text-[10px] tracking-editorial uppercase px-3 py-1 rounded-full mb-3 ${TAG_COLORS[item.tag] || "bg-flamingo text-white"}`}>
                  {item.tag}
                </span>
              )}
              <h3 className="font-display text-cream text-lg mb-2 group-hover:text-flamingo transition-colors">{item.name}</h3>
              <p className="font-body text-cream opacity-60 text-sm leading-relaxed flex-1 line-clamp-2">{item.description}</p>
              <p className="font-display text-flamingo text-lg mt-4">${item.price}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/menu" className="btn-ghost">View Full Menu</Link>
          <Link to="/order" className="btn-primary">Order Now</Link>
        </div>
      </div>
    </section>
  );
};

// ── Events Preview ────────────────────────────────────────────────────────
const EventsPreview = () => {
  const { siteData } = useSite();
  const [selected, setSelected] = useState(null);
  resetEventPhotos();
  setStockPhotoPool(siteData.stockPhotos?.events);
  const today = new Date(); today.setHours(0,0,0,0);
  const allEvents = siteData.events || [];
  const upcoming = allEvents.filter((e) => new Date(e.date) >= today);
  const past = allEvents.filter((e) => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Fill with past events if fewer than 6 upcoming
  const TARGET = 6;
  const display = upcoming.length >= TARGET
    ? upcoming.slice(0, TARGET)
    : [...upcoming, ...past.slice(0, TARGET - upcoming.length)];

  if (display.length === 0) return null;

  const isMixed = upcoming.length > 0 && upcoming.length < TARGET && past.length > 0;
  const allPast = upcoming.length === 0;

  const openEvent = (ev) => {
    const isPast = new Date(ev.date) < today;
    const photo = ev.imageUrl || getEventPhoto(ev.id);
    setSelected({
      ...ev,
      type: "event",
      name: ev.title,
      imageUrl: photo,
      date: formatDate(ev.date),
      venue: ev.venue === "bocage" ? "Bocage Champagne Bar" : "Standard Fare",
      externalUrl: !isPast && ev.ticketUrl ? ev.ticketUrl : null,
      externalLabel: "Get Tickets",
    });
  };

  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
            {isMixed ? "Dine & Celebrate" : allPast ? "Recent Events" : "Coming Up"}
          </p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">
            {isMixed ? "Special Events" : allPast ? "Past Events" : "Upcoming Events"}
          </h2>
          <span className="section-divider" />
        </div>

        <ProfileCardModal
          item={selected}
          onClose={() => setSelected(null)}
        />

        <ScrollRow>
          {display.map((ev) => {
            const isPast = new Date(ev.date) < today;
            const photo = ev.imageUrl || getEventPhoto(ev.id);
            return (
              <div key={ev.id} className={`${ITEM_WIDTH} min-w-[220px] cursor-pointer`}
                onClick={() => openEvent(ev)}>
                <div className={`bg-white rounded-lg overflow-hidden group h-full flex flex-col shadow-sm
                  ${isPast ? "opacity-70" : ""}`}>
                  <div className="relative">
                    <img src={photo} alt={ev.title}
                      className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105" />
                    {ev.venue === "bocage" && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-amber-100 text-amber-800
                        font-mono text-[9px] tracking-editorial uppercase px-2 py-0.5 rounded-full">
                        <Wine size={10} /> Bocage
                      </span>
                    )}
                    {isPast && (
                      <span className="absolute top-2 right-2 font-mono text-[9px] tracking-editorial uppercase
                        bg-navy bg-opacity-80 text-cream opacity-60 px-2 py-0.5 rounded">
                        Past
                      </span>
                    )}
                    <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <span className="font-body text-cream text-xs opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="font-mono text-flamingo text-[10px] tracking-editorial uppercase mb-1">
                      {formatDate(ev.date)} · {ev.time}
                    </p>
                    <h3 className="font-display text-navy text-sm mb-2 line-clamp-2 group-hover:text-flamingo transition-colors">{ev.title}</h3>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {isPast ? (
                        <span className="font-body text-navy opacity-40 text-xs italic">Event has ended</span>
                      ) : (
                        <>
                          <span className="font-display text-navy text-sm">${ev.price}</span>
                          {ev.ticketUrl && (
                            <span className="flex items-center gap-1 text-flamingo text-xs font-body">
                              <Ticket size={12} /> Tickets
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollRow>

        <div className="text-center mt-8">
          <Link to="/events" className="btn-secondary">View All Events</Link>
        </div>
      </div>
    </section>
  );
};

// ── Bottle Shop Preview ───────────────────────────────────────────────────
const BottlePreview = () => {
  const { siteData } = useSite();
  const [selected, setSelected] = useState(null);
  const showBottleShop = siteData.settings?.showBottleShop !== false;
  const bottles = (siteData.bottles || []).filter((b) => b.available && !b.draft).slice(0, 6);

  if (!showBottleShop || bottles.length === 0) return null;

  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Take Home a Bottle</p>
          <h2 className="font-display text-cream text-3xl md:text-4xl">Bottle Shop</h2>
          <span className="section-divider" />
        </div>

        <ItemDetailModal
          item={selected ? { ...selected, type: "bottle", subtitle: selected.varietal } : null}
          onClose={() => setSelected(null)}
        />

        <ScrollRow>
          {bottles.map((b) => (
            <div key={b.id} className={`${ITEM_WIDTH} cursor-pointer group`}
              onClick={() => setSelected(b)}>
              <div className="relative aspect-[3/4] overflow-hidden rounded shadow-md mb-3 bg-navy">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Wine size={28} className="text-cream opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <span className="font-body text-cream text-xs opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                </div>
              </div>
              <h3 className="font-display text-cream text-sm leading-tight">{b.name}</h3>
              <p className="font-body text-xs text-cream opacity-50 mt-0.5">{b.varietal}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-cream text-sm font-bold">${Number(b.price).toLocaleString()}</span>
                <AddToCartButton
                  compact
                  item={{ id: b.id, type: "bottle", name: b.name, price: b.price, imageUrl: b.imageUrl, toastProductId: b.toastProductId }}
                />
              </div>
            </div>
          ))}
        </ScrollRow>

        <div className="text-center mt-8">
          <Link to="/bottles" className="btn-ghost">Shop All Bottles</Link>
        </div>
      </div>
    </section>
  );
};

// ── Gallery Preview ───────────────────────────────────────────────────────
// Single row: 6 on desktop, 3 on mobile — no multi-row grid
const GalleryPreview = () => {
  const { siteData } = useSite();
  const [selected, setSelected] = useState(null);
  const photos = siteData.gallery.slice(0, 6);

  const openPhoto = (photo) => {
    const src = photo.url || photo.imageUrl || null;
    const postUrl = photo.instagramUrl
      || (photo.instagramId ? `https://www.instagram.com/p/${photo.instagramId}/` : null)
      || siteData.links.instagram;
    setSelected({
      ...photo,
      type: "gallery",
      imageUrl: src,
      name: photo.comment || photo.alt || "Gallery Photo",
      description: photo.comment || null,
      externalUrl: postUrl,
      externalLabel: "View on Instagram",
    });
  };

  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">@standardfaresaratoga</p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Gallery</h2>
          <span className="section-divider" />
        </div>

        <ProfileCardModal
          item={selected}
          onClose={() => setSelected(null)}
        />

        <ScrollRow>
          {photos.map((photo) => {
            const src = photo.url || photo.imageUrl || null;

            return (
              <div key={photo.id}
                className={`${ITEM_WIDTH} aspect-square overflow-hidden rounded group relative block bg-navy-light cursor-pointer`}
                onClick={() => openPhoto(photo)}>
                {src ? (
                  <img src={src} alt={photo.alt || "Standard Fare"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-navy">
                    <Instagram size={18} className="text-flamingo opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                  <span className="font-body text-cream text-xs opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                </div>
              </div>
            );
          })}
        </ScrollRow>

        <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/gallery" className="btn-secondary">View Full Gallery</Link>
          <a href={siteData.links.instagram} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-body text-sm tracking-editorial uppercase text-navy opacity-60 hover:opacity-100 hover:text-flamingo transition-all">
            <ExternalLink size={14} />Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

// ── Paintings Preview ─────────────────────────────────────────────────────
const PrintsPreview = () => {
  const { siteData } = useSite();
  const [selected, setSelected] = useState(null);
  const showPaintings = siteData.settings?.showPaintings !== false;
  const prints = siteData.prints.slice(0, 6);

  if (!showPaintings || prints.length === 0) return null;

  return (
    <section className="section-padding bg-navy">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">In-House Gallery</p>
          <h2 className="font-display text-cream text-3xl md:text-4xl">Paintings</h2>
          <span className="section-divider" />
          <p className="font-body text-cream opacity-50 text-sm max-w-sm mx-auto">
            Original works by Daniel Fairley — available exclusively here.
          </p>
        </div>

        <ItemDetailModal
          item={selected ? { ...selected, type: "print", subtitle: `${selected.medium} by ${selected.artist}` } : null}
          onClose={() => setSelected(null)}
        />

        <ScrollRow>
          {prints.map((p) => (
            <div key={p.id} className={`${ITEM_WIDTH} cursor-pointer group`}
              onClick={() => setSelected(p)}>
              <div className="aspect-square overflow-hidden rounded mb-3">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                )}
              </div>
              <h3 className="font-display text-cream text-sm leading-tight">{p.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-flamingo text-sm">
                  {p.available ? `$${p.price.toLocaleString()}` : "Sold"}
                </span>
                {p.available && (
                  <AddToCartButton
                    compact
                    item={{ id: p.id, type: "print", name: p.title, price: p.price, imageUrl: p.imageUrl, toastProductId: p.toastProductId }}
                  />
                )}
              </div>
            </div>
          ))}
        </ScrollRow>

        <div className="text-center mt-8">
          <Link to="/prints" className="btn-ghost flex items-center justify-center gap-2 mx-auto w-fit">
            <ShoppingBag size={16} /> Shop All Paintings
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── Press Preview ─────────────────────────────────────────────────────────
const PressPreview = () => {
  const { siteData } = useSite();
  const [selected, setSelected] = useState(null);
  const topPress = siteData.press.slice(0, 6);

  const openPress = (p) => {
    setSelected({
      ...p,
      type: "press",
      name: p.headline,
      imageUrl: p.logo ? null : null,
      externalUrl: p.url,
      externalLabel: `Read on ${p.outlet}`,
    });
  };

  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">As Seen In</p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Press</h2>
          <span className="section-divider" />
        </div>

        <ProfileCardModal
          item={selected}
          onClose={() => setSelected(null)}
        />

        <ScrollRow>
          {topPress.map((p) => (
            <div key={p.id}
              className={`${ITEM_WIDTH} min-w-[220px] group block bg-cream-warm border border-navy border-opacity-10
                rounded-lg overflow-hidden hover:border-flamingo hover:shadow-md transition-all duration-300 cursor-pointer`}
              onClick={() => openPress(p)}>
              {p.logo && (
                <div className="bg-white flex items-center justify-center p-4 border-b border-navy border-opacity-10">
                  <img src={p.logo} alt={`${p.outlet} logo`} className="w-8 h-8 object-contain" />
                </div>
              )}
              <div className="p-5">
                <p className="font-mono text-flamingo text-[10px] tracking-editorial uppercase mb-2">{p.outlet}</p>
                <p className="font-display text-navy text-sm leading-snug group-hover:text-flamingo-dark transition-colors line-clamp-3">
                  {p.headline}
                </p>
              </div>
            </div>
          ))}
        </ScrollRow>

        <div className="text-center mt-8">
          <Link to="/press" className="btn-secondary">All Press Coverage</Link>
        </div>
      </div>
    </section>
  );
};

// ── Contact Section ───────────────────────────────────────────────────────
// Compact: quick-link tiles + email/SMS signup forms side by side
const ContactSection = () => {
  const { siteData } = useSite();
  const { location, contact, links, emailMarketing, smsClub } = siteData;
  const generalEmail = contact?.generalEmail || "";
  const emailConfig = emailMarketing || {};
  const club = smsClub || {};

  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [phone, setPhone] = useState("");
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (emailConfig.provider && emailConfig.listId) {
      try {
        const res = await fetch("/api/email-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, provider: emailConfig.provider, listId: emailConfig.listId }),
        });
        setEmailStatus(res.ok ? "success" : "error");
        if (res.ok) setEmail("");
      } catch { setEmailStatus("error"); }
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem("sf_email_signups") || "[]");
        stored.push({ email, date: new Date().toISOString() });
        localStorage.setItem("sf_email_signups", JSON.stringify(stored));
        setEmailStatus("success");
        setEmail("");
      } catch { setEmailStatus("error"); }
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    if (club.webhookUrl) {
      try { await fetch(club.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: phone.trim(), source: "website" }) }); } catch {}
    }
    setPhoneSubmitted(true);
    setPhone("");
  };

  return (
    <section className="py-16 bg-navy">
      <div className="section-container">
        <div className="text-center mb-8">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Get in Touch</p>
          <h2 className="font-display text-cream text-3xl md:text-4xl">Contact Us</h2>
          <span className="section-divider" />
        </div>

        {/* Quick links row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          <a href={`tel:${location.phone}`}
            className="bg-navy-light rounded-lg p-4 text-center hover:bg-opacity-80 transition-colors group">
            <Phone size={16} className="text-flamingo mx-auto mb-2" />
            <p className="font-body text-cream text-[10px] opacity-70 group-hover:text-flamingo transition-colors">Call</p>
          </a>
          <a href={`mailto:${generalEmail}`}
            className="bg-navy-light rounded-lg p-4 text-center hover:bg-opacity-80 transition-colors group">
            <Mail size={16} className="text-flamingo mx-auto mb-2" />
            <p className="font-body text-cream text-[10px] opacity-70 group-hover:text-flamingo transition-colors">Email</p>
          </a>
          <a href={location.googleMapsUrl || "#"} target="_blank" rel="noopener noreferrer"
            className="bg-navy-light rounded-lg p-4 text-center hover:bg-opacity-80 transition-colors group">
            <MapPin size={16} className="text-flamingo mx-auto mb-2" />
            <p className="font-body text-cream text-[10px] opacity-70 group-hover:text-flamingo transition-colors">Directions</p>
          </a>
          <a href={links.reservations} target="_blank" rel="noopener noreferrer"
            className="bg-navy-light rounded-lg p-4 text-center hover:bg-opacity-80 transition-colors group">
            <ExternalLink size={16} className="text-flamingo mx-auto mb-2" />
            <p className="font-body text-cream text-[10px] opacity-70 group-hover:text-flamingo transition-colors">Reserve</p>
          </a>
          <a href={links.giftCards} target="_blank" rel="noopener noreferrer"
            className="bg-navy-light rounded-lg p-4 text-center hover:bg-opacity-80 transition-colors group">
            <ShoppingBag size={16} className="text-flamingo mx-auto mb-2" />
            <p className="font-body text-cream text-[10px] opacity-70 group-hover:text-flamingo transition-colors">Gift Cards</p>
          </a>
          <Link to="/private-events"
            className="bg-navy-light rounded-lg p-4 text-center hover:bg-opacity-80 transition-colors group">
            <Calendar size={16} className="text-flamingo mx-auto mb-2" />
            <p className="font-body text-cream text-[10px] opacity-70 group-hover:text-flamingo transition-colors">Events</p>
          </Link>
        </div>

        {/* Signup row — compact, side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {emailConfig.enabled && (
            <div className="bg-navy-light rounded-lg px-4 py-3">
              {emailStatus === "success" ? (
                <div className="flex items-center justify-center gap-2 text-flamingo py-1">
                  <CheckCircle size={14} />
                  <span className="font-body text-sm">You're on the list!</span>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex gap-2 items-center">
                  <Mail size={14} className="text-flamingo flex-shrink-0" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-2 py-2 rounded bg-navy border border-cream border-opacity-15 text-cream font-body text-xs placeholder:text-cream placeholder:opacity-30 focus:border-flamingo focus:outline-none transition-colors min-w-0" />
                  <button type="submit" className="px-3 py-2 bg-flamingo text-white font-body font-bold text-[10px] tracking-wider uppercase rounded hover:bg-opacity-90 transition-colors flex-shrink-0">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          )}
          {club.enabled && (
            <div className="bg-navy-light rounded-lg px-4 py-3">
              {phoneSubmitted ? (
                <div className="flex items-center justify-center gap-2 text-flamingo py-1">
                  <Check size={14} />
                  <span className="font-body text-sm">You're in!</span>
                </div>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="flex gap-2 items-center">
                  <MessageCircle size={14} className="text-flamingo flex-shrink-0" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="flex-1 px-2 py-2 rounded bg-navy border border-cream border-opacity-15 text-cream font-body text-xs placeholder:text-cream placeholder:opacity-30 focus:border-flamingo focus:outline-none transition-colors min-w-0" />
                  <button type="submit" className="px-3 py-2 bg-flamingo text-white font-body font-bold text-[10px] tracking-wider uppercase rounded hover:bg-opacity-90 transition-colors flex-shrink-0">
                    Text Club
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/contact" className="font-body text-xs text-cream opacity-40 hover:opacity-80 hover:text-flamingo transition-all">
            Full Contact Page →
          </Link>
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
      <h2 className="font-display text-cream text-3xl md:text-5xl mb-4">Join Us for Dinner</h2>
      <p className="font-body text-cream opacity-80 mb-8 text-lg">
        Reserve your table at Standard Fare — Saratoga's most anticipated new restaurant.
      </p>
      <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
        className="inline-block bg-cream text-navy font-body font-bold tracking-widest uppercase text-sm px-10 py-4 transition-all duration-300 hover:bg-navy hover:text-cream">
        Reserve on Resy
      </a>
    </section>
  );
};

// ── Full Homepage ─────────────────────────────────────────────────────────
const HomePage = () => (
  <PageLayout>
    <SpecialsBanner />
    <HeroSection />
    <SeasonalCountdown />
    <AboutSection />
    <WeeklyFeatures />
    <EventsPreview />
    <BottlePreview />
    <GalleryPreview />
    <PrintsPreview />
    <PressPreview />
    <HoursSection />
    <TestimonialsSection />
    <ContactSection />
    <ReserveBanner />
  </PageLayout>
);

export default HomePage;
