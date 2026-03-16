// ─────────────────────────────────────────────────────────────────────────────
// pages/EventsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Displays upcoming ticketed events.
// Each event card shows: photo, title, date/time, description, price, and a
// "Get Tickets" button.
//
// TICKET FLOW:
//   If the event has a `toastProductId` set (configured after Toast setup),
//   the button links directly to the Toast online ordering page for that product.
//   Until then, it uses the `ticketUrl` fallback (the general Toast order page).
//
//   See README-TOAST.md for full setup instructions.
//
// Admin can add/edit/delete events in the /admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Calendar, Clock, Ticket, Users } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

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

// ── Single Event Card ─────────────────────────────────────────────────────
const EventCard = ({ event }) => {
  // Determine the ticket URL:
  // - If toastProductId exists → build the Toast product URL
  // - Otherwise fall back to the general ticketUrl field
  const ticketHref = event.toastProductId
    ? `https://order.toasttab.com/online/tbd-name-bocage-group-21-phila-street/v3#product-${event.toastProductId}`
    : event.ticketUrl;

  return (
    <div className="bg-cream-warm rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
      {/* Event photo */}
      {event.imageUrl && (
        <div className="md:w-80 flex-shrink-0">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-56 md:h-full object-cover"
          />
        </div>
      )}

      {/* Event details */}
      <div className="p-8 flex flex-col justify-between flex-1">
        <div>
          {/* Title */}
          <h3 className="font-display text-navy text-2xl font-medium mb-3">{event.title}</h3>

          {/* Date/time chips */}
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

          {/* Description */}
          <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-6">
            {event.description}
          </p>
        </div>

        {/* Price + Ticket CTA */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-flamingo tracking-editorial uppercase">
              Ticket Price
            </p>
            <p className="font-display text-navy text-2xl">${event.price} <span className="text-sm font-body opacity-50">per person</span></p>
          </div>

          <a
            href={ticketHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2"
          >
            <Ticket size={16} />
            Get Tickets
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Main Events Page ──────────────────────────────────────────────────────
const EventsPage = () => {
  const { siteData } = useSite();

  // Split events into upcoming and past based on today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = siteData.events.filter((e) => new Date(e.date) >= today);
  const past     = siteData.events.filter((e) => new Date(e.date) <  today);

  return (
    <PageLayout>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          What's Happening
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Events</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      {/* ── Event Cards ─────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container">

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

          {/* Past Events (collapsed section) */}
          {past.length > 0 && (
            <div className="mt-20">
              <h2 className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 mb-6 text-center">
                Past Events
              </h2>
              <div className="flex flex-col gap-6 opacity-50">
                {past.map((event) => (
                  <div key={event.id} className="bg-cream-warm rounded-lg p-6 border border-navy border-opacity-10">
                    <h3 className="font-display text-navy text-lg">{event.title}</h3>
                    <p className="font-body text-sm text-navy opacity-60 mt-1">{formatDate(event.date)}</p>
                  </div>
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
