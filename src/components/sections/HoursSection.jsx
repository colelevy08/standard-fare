// ─────────────────────────────────────────────────────────────────────────────
// components/sections/HoursSection.jsx — compact horizontal layout
// ─────────────────────────────────────────────────────────────────────────────
// Hours, contact info, and map in a tight 3-column grid.
// Resy availability sits above in a single row.
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { MapPin, Phone, Mail, Clock, ExternalLink, AlertTriangle } from "lucide-react";
import { useSite } from "../../context/AdminContext";
import ResyAvailability from "./ResyAvailability";

const isToday = (dayName) => {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date().getDay()] === dayName;
};

const HoursSection = () => {
  const { siteData } = useSite();
  const { hours, location } = siteData;

  return (
    <section id="hours" className="section-padding bg-cream">
      <div className="section-container">
        <div className="text-center mb-8">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Find Us</p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Hours &amp; Location</h2>
          <span className="section-divider" />
        </div>

        {/* Hours Override Banner */}
        {siteData.hoursOverride?.enabled && (
          <div className="mb-6 bg-cream border-2 border-flamingo rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-flamingo flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-display text-navy text-base font-bold">
                {siteData.hoursOverride.message || "Schedule Change"}
              </p>
              {siteData.hoursOverride.dates && (
                <p className="font-body text-navy opacity-70 text-sm mt-1">
                  {siteData.hoursOverride.dates}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tonight's Availability — compact row */}
        <div className="mb-8">
          <ResyAvailability />
        </div>

        {/* 3-column grid: hours | contact | map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">

          {/* Hours — compact table */}
          <div className="bg-navy rounded-lg p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-flamingo flex-shrink-0" />
              <h3 className="font-display text-cream text-base">Hours</h3>
            </div>
            <ul className="space-y-0.5">
              {hours.map(({ day, open, close }) => (
                <li key={day}
                  className={`flex justify-between items-center py-1.5 border-b border-cream border-opacity-10 last:border-b-0
                    ${isToday(day) ? "text-flamingo" : "text-cream opacity-80"}`}>
                  <span className={`font-body text-xs ${isToday(day) ? "font-bold" : ""}`}>
                    {day.slice(0, 3)}
                    {isToday(day) && (
                      <span className="ml-1.5 text-[9px] bg-flamingo text-cream px-1 py-px rounded-full">Now</span>
                    )}
                  </span>
                  <span className="font-body text-xs">
                    {(open === "Closed" || open === "Gone Fishing") ? open : `${open} – ${close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="bg-navy rounded-lg p-5 shadow-lg flex flex-col">
            <h3 className="font-display text-cream text-base mb-3">Visit Us</h3>
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-flamingo mt-0.5 flex-shrink-0" />
                <div className="font-body text-cream opacity-80 text-xs leading-relaxed">
                  <p>{location.address}</p>
                  <p>{location.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-flamingo flex-shrink-0" />
                <a href={`tel:${location.phone}`}
                  className="font-body text-cream opacity-80 text-xs hover:text-flamingo transition-colors">
                  {location.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-flamingo flex-shrink-0" />
                <a href={`mailto:${location.email}`}
                  className="font-body text-cream opacity-80 text-xs hover:text-flamingo transition-colors break-all">
                  {location.email}
                </a>
              </div>
            </div>
            <a href={location.googleMapsUrl || "#"} target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-flamingo hover:text-flamingo-light transition-colors text-xs font-body">
              <ExternalLink size={11} /> Get Directions
            </a>
          </div>

          {/* Map — fills the third column */}
          <div className="rounded-lg overflow-hidden shadow-lg min-h-[200px]">
            <iframe title="Standard Fare Location Map"
              src={location.mapEmbedUrl} width="100%" height="100%"
              style={{ border: 0, minHeight: "200px" }} allowFullScreen="" loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HoursSection;
