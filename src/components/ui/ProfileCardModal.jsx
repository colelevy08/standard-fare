// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ProfileCardModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Generic profile-card modal for any item: menu features, events, gallery,
// press. Displays image, title, details, description, and optional external
// link. Pops up on the current page without navigation.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { X, ExternalLink, Ticket, Calendar, Clock, MapPin, Instagram } from "lucide-react";

const ProfileCardModal = ({ item, onClose }) => {
  if (!item) return null;

  const typeLabels = {
    feature: "Weekly Feature",
    event: "Event",
    gallery: "Gallery",
    press: "Press",
  };
  const typeLabel = typeLabels[item.type] || "Details";

  return (
    <div
      className="fixed inset-0 z-[90] bg-black bg-opacity-80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg overflow-hidden shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image ── */}
        {item.imageUrl && (
          <div className="relative flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name || item.title || ""}
              className="w-full h-56 sm:h-64 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center
                text-white hover:bg-opacity-70 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Details ── */}
        <div className="p-6 overflow-y-auto">
          {!item.imageUrl && (
            <button
              onClick={onClose}
              className="self-end text-navy opacity-40 hover:opacity-80 float-right"
            >
              <X size={20} />
            </button>
          )}

          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
            {typeLabel}
          </p>

          <h2 className="font-display text-navy text-2xl mb-1">
            {item.name || item.title || item.headline || ""}
          </h2>

          {/* Subtitle / outlet */}
          {item.subtitle && (
            <p className="font-body text-sm text-navy opacity-50 mb-1">{item.subtitle}</p>
          )}
          {item.outlet && (
            <p className="font-body text-sm text-navy opacity-50 mb-1">{item.outlet}</p>
          )}

          {/* Event meta row */}
          {item.type === "event" && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 mb-1">
              {item.date && (
                <span className="flex items-center gap-1 font-body text-xs text-navy opacity-60">
                  <Calendar size={12} /> {item.date}
                </span>
              )}
              {item.time && (
                <span className="flex items-center gap-1 font-body text-xs text-navy opacity-60">
                  <Clock size={12} /> {item.time}
                </span>
              )}
              {item.venue && (
                <span className="flex items-center gap-1 font-body text-xs text-navy opacity-60">
                  <MapPin size={12} /> {item.venue}
                </span>
              )}
              {item.capacity && (
                <span className="font-body text-xs text-navy opacity-60">
                  {item.capacity} seats
                </span>
              )}
            </div>
          )}

          {/* Price */}
          {item.price != null && (
            <p className="font-display text-navy text-xl mt-2">${Number(item.price).toLocaleString()}</p>
          )}

          {/* Tag */}
          {item.tag && (
            <span className="inline-block font-mono text-[10px] tracking-editorial uppercase px-3 py-1 rounded-full mt-2 bg-flamingo text-white">
              {item.tag}
            </span>
          )}

          {/* Description / comment / body */}
          {(item.description || item.comment || item.body) && (
            <p className="font-body text-navy opacity-70 text-sm leading-relaxed mt-3 mb-4">
              {item.description || item.comment || item.body}
            </p>
          )}

          {/* Gallery caption */}
          {item.alt && item.type === "gallery" && (
            <p className="font-body text-navy opacity-60 text-sm italic mt-2 mb-3">
              {item.alt}
            </p>
          )}

          {/* ── External link ── */}
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-5 py-3 bg-navy text-cream font-body font-bold
                tracking-widest uppercase text-xs rounded hover:bg-flamingo transition-colors w-full justify-center"
            >
              {item.type === "event" && <Ticket size={14} />}
              {item.type === "press" && <ExternalLink size={14} />}
              {item.type === "gallery" && <Instagram size={14} />}
              {item.externalLabel || "View on " + (item.type === "gallery" ? "Instagram" : item.type === "press" ? item.outlet || "Source" : item.type === "event" ? "Tickets" : "Source")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCardModal;
