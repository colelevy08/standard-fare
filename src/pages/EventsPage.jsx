// ─────────────────────────────────────────────────────────────────────────────
// pages/EventsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Displays upcoming and past ticketed events for Standard Fare and Bocage.
// Bocage events show a champagne-bar badge to distinguish them.
// Past events are shown in a compact grid with grayscale images.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Calendar, Clock, Users, Wine, X } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import AddToCartButton from "../components/cart/AddToCartButton";
import { getEventPhoto, resetEventPhotos, setStockPhotoPool } from "../data/eventPhotos";

// Helper: format "2026-04-12" → "Saturday, April 12, 2026"
const formatDate = (dateStr) => {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatShortDate = (dateStr) => {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Venue badge
const VenueBadge = ({ venue }) => {
  if (venue === "bocage") {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-mono text-[10px] tracking-editorial uppercase px-2 py-0.5 rounded-full">
        <Wine size={10} /> Bocage
      </span>
    );
  }
  return null;
};

// ── Single Event Card (upcoming) ────────────────────────────────────────
const EventCard = ({ event }) => {
  const photo = event.imageUrl || getEventPhoto(event.id);
  return (
    <div className="bg-cream-warm rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
      <div className="md:w-80 flex-shrink-0">
        <img
          src={photo}
          alt={event.title}
          className="w-full h-56 md:h-full object-cover"
        />
      </div>

      <div className="p-8 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-navy text-2xl font-medium">{event.title}</h3>
            <VenueBadge venue={event.venue} />
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <span className="flex items-center gap-2 font-body text-sm text-navy opacity-70">
              <Calendar size={14} className="text-flamingo" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2 font-body text-sm text-navy opacity-70">
              <Clock size={14} className="text-flamingo" />
              {event.time}
            </span>
            {event.capacity && (
              <span className="flex items-center gap-2 font-body text-sm text-navy opacity-70">
                <Users size={14} className="text-flamingo" />
                Limited to {event.capacity} guests
              </span>
            )}
          </div>

          <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-6">
            {event.description}
          </p>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-flamingo tracking-editorial uppercase">
              Ticket Price
            </p>
            <p className="font-display text-navy text-2xl">${event.price} <span className="text-sm font-body opacity-50">per person</span></p>
          </div>

          <AddToCartButton
            item={{
              id: event.id,
              type: "event",
              name: `${event.title} — ${formatDate(event.date)}`,
              price: event.price,
              imageUrl: event.imageUrl,
              toastProductId: event.toastProductId,
            }}
            label="Add Ticket"
            className="w-auto"
          />
        </div>
      </div>
    </div>
  );
};

// ── Past Event Detail Modal ──────────────────────────────────────────
const PastEventModal = ({ event, onClose }) => {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-shrink-0">
          <img src={event.imageUrl || getEventPhoto(event.id)} alt={event.title}
            className="w-full h-56 sm:h-64 object-cover" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center
              text-white hover:bg-opacity-70 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <VenueBadge venue={event.venue} />
            <span className="font-mono text-[10px] text-navy opacity-40 tracking-editorial uppercase">
              Past Event
            </span>
          </div>
          <h2 className="font-display text-navy text-2xl mb-2">{event.title}</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="flex items-center gap-1.5 font-body text-sm text-navy opacity-60">
              <Calendar size={13} className="text-flamingo" />
              {formatDate(event.date)}
            </span>
            {event.time && (
              <span className="flex items-center gap-1.5 font-body text-sm text-navy opacity-60">
                <Clock size={13} className="text-flamingo" />
                {event.time}
              </span>
            )}
            {event.capacity && (
              <span className="flex items-center gap-1.5 font-body text-sm text-navy opacity-60">
                <Users size={13} className="text-flamingo" />
                {event.capacity} guests
              </span>
            )}
          </div>
          {event.description && (
            <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-4">
              {event.description}
            </p>
          )}
          {event.price > 0 && (
            <p className="font-mono text-flamingo text-sm">${event.price} per person</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Past Event Card (compact, clickable) ────────────────────────────
const PastEventCard = ({ event, onClick }) => (
  <div className="bg-cream-warm rounded-lg overflow-hidden border border-navy border-opacity-10 hover:border-flamingo hover:shadow-md transition-all cursor-pointer"
    onClick={onClick}>
    <img src={event.imageUrl || getEventPhoto(event.id)} alt={event.title} className="w-full h-36 object-cover" loading="lazy" />
    <div className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <VenueBadge venue={event.venue} />
        <span className="font-mono text-[10px] text-navy opacity-40 tracking-editorial uppercase">
          {formatShortDate(event.date)}
        </span>
      </div>
      <h3 className="font-display text-navy text-sm leading-tight mt-1">{event.title}</h3>
      {event.description && (
        <p className="font-body text-xs text-navy opacity-50 mt-1.5 line-clamp-2">{event.description}</p>
      )}
      <p className="font-mono text-xs text-navy opacity-40 mt-1.5 italic">Event has ended</p>
    </div>
  </div>
);

// ── Main Events Page ──────────────────────────────────────────────────
const EventsPage = () => {
  const { siteData } = useSite();
  const [venueFilter, setVenueFilter] = useState("all");
  const [selectedPast, setSelectedPast] = useState(null);
  resetEventPhotos();
  setStockPhotoPool(siteData.stockPhotos?.events);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = siteData.events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const allPast = siteData.events
    .filter((e) => new Date(e.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const pastFiltered = venueFilter === "all"
    ? allPast
    : allPast.filter((e) => e.venue === venueFilter);

  const hasBocage = allPast.some((e) => e.venue === "bocage");
  const hasSF = allPast.some((e) => e.venue === "standard-fare" || !e.venue);

  return (
    <PageLayout>
      <PastEventModal event={selectedPast} onClose={() => setSelectedPast(null)} />
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          What's Happening
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Events</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container">

          {/* Private Events CTA */}
          <Link to="/private-events"
            className="bg-navy rounded-xl p-6 flex items-center gap-4 mb-10
              hover:bg-navy-light transition-colors group">
            <Calendar size={20} className="text-flamingo flex-shrink-0" />
            <div>
              <p className="font-display text-cream text-base group-hover:text-flamingo-light transition-colors">
                Host a Private Event
              </p>
              <p className="font-body text-cream opacity-40 text-xs">
                Plan your next celebration at Standard Fare →
              </p>
            </div>
          </Link>

          {/* Upcoming */}
          {upcoming.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-navy text-2xl opacity-40 mb-3">No upcoming events</p>
              <p className="font-body text-navy opacity-30 text-sm">
                Check back soon — we have exciting evenings planned!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Past Events */}
          {allPast.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-8">
                <h2 className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 mb-4">
                  Past Events
                </h2>

                {/* Venue filter tabs */}
                {hasBocage && hasSF && (
                  <div className="flex justify-center gap-2">
                    {[
                      { key: "all", label: "All" },
                      { key: "standard-fare", label: "Standard Fare" },
                      { key: "bocage", label: "Bocage" },
                    ].map((tab) => (
                      <button key={tab.key} onClick={() => setVenueFilter(tab.key)}
                        className={`font-body text-xs tracking-editorial uppercase px-4 py-1.5 rounded-full border transition-all
                          ${venueFilter === tab.key
                            ? "bg-navy text-cream border-navy"
                            : "text-navy opacity-50 border-navy border-opacity-20 hover:opacity-80"}`}>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastFiltered.map((event) => (
                  <PastEventCard key={event.id} event={event} onClick={() => setSelectedPast(event)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default EventsPage;
