// ─────────────────────────────────────────────────────────────────────────────
// components/sections/HoursSection.jsx — mobile optimized
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useSite } from "../../context/AdminContext";

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
        <div className="text-center mb-12">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Find Us</p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Hours &amp; Location</h2>
          <span className="section-divider" />
        </div>

        {/* Single column on mobile, two columns on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Hours table */}
          <div className="bg-navy rounded-lg p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <Clock size={16} className="text-flamingo flex-shrink-0" />
              <h3 className="font-display text-cream text-lg sm:text-xl">Hours of Operation</h3>
            </div>
            <ul className="space-y-2">
              {hours.map(({ day, open, close }) => (
                <li key={day}
                  className={`flex justify-between items-center py-2 border-b border-cream border-opacity-10
                    ${isToday(day) ? "text-flamingo" : "text-cream opacity-80"}`}>
                  <span className={`font-body text-sm ${isToday(day) ? "font-bold" : ""}`}>
                    {day}
                    {isToday(day) && (
                      <span className="ml-2 text-xs bg-flamingo text-cream px-1.5 py-0.5 rounded-full">Today</span>
                    )}
                  </span>
                  <span className="font-body text-sm">
                    {open === "Closed" ? "Closed" : `${open} – ${close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Address + map */}
          <div className="flex flex-col gap-4">
            <div className="bg-navy rounded-lg p-6 sm:p-8 shadow-lg">
              <h3 className="font-display text-cream text-lg sm:text-xl mb-5">Visit Us</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-flamingo mt-0.5 flex-shrink-0" />
                  <div className="font-body text-cream opacity-80 text-sm">
                    <p>{location.address}</p>
                    <p>{location.city}</p>
                    {(location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z") && (
                      <a href={location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z"} target="_blank" rel="noopener noreferrer"
                        className="text-flamingo hover:text-flamingo-light transition-colors text-xs mt-1 inline-flex items-center gap-1">
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={15} className="text-flamingo flex-shrink-0" />
                  <a href={`tel:${location.phone}`}
                    className="font-body text-cream opacity-80 text-sm hover:text-flamingo transition-colors">
                    {location.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={15} className="text-flamingo flex-shrink-0" />
                  <a href={`mailto:${location.email}`}
                    className="font-body text-cream opacity-80 text-sm hover:text-flamingo transition-colors break-all">
                    {location.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Map embed — full width, reasonable height on mobile */}
            <div className="rounded-lg overflow-hidden shadow-lg h-44 sm:h-52">
              <iframe title="Standard Fare Location Map"
                src={location.mapEmbedUrl} width="100%" height="100%"
                style={{ border: 0 }} allowFullScreen="" loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HoursSection;
