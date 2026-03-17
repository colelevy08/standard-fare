// ─────────────────────────────────────────────────────────────────────────────
// components/sections/ResyAvailability.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Real-time table availability indicator from Resy.
// Shows available time slots for tonight.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { Clock, Users, ExternalLink } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const ResyAvailability = () => {
  const { siteData } = useSite();
  const [data, setData] = useState(null);
  const [partySize, setPartySize] = useState(2);

  useEffect(() => {
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isDev) {
      // Mock data for development
      setData({
        available: true,
        message: "6 times available tonight",
        slots: [
          { time: "2026-03-17 17:30:00", type: "Dining Room" },
          { time: "2026-03-17 18:00:00", type: "Dining Room" },
          { time: "2026-03-17 18:30:00", type: "Bar" },
          { time: "2026-03-17 19:00:00", type: "Dining Room" },
          { time: "2026-03-17 20:00:00", type: "Dining Room" },
          { time: "2026-03-17 21:00:00", type: "Bar" },
        ],
      });
      return;
    }

    const fetchAvailability = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/resy-availability?date=${today}&party=${partySize}`);
        const json = await res.json();
        setData(json);
      } catch {
        setData({ available: true, message: "Reserve on Resy", slots: [] });
      }
    };

    fetchAvailability();
  }, [partySize]);

  if (!data) return null;

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-cream-warm rounded-lg p-6 border border-navy border-opacity-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${data.available ? "bg-green-500" : "bg-flamingo"} animate-pulse`} />
          <h3 className="font-display text-navy text-lg">Tonight's Availability</h3>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-navy opacity-40" />
          <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))}
            className="font-body text-sm text-navy bg-transparent border-none focus:outline-none cursor-pointer">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} guest{n !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="font-body text-sm text-navy opacity-60 mb-4">{data.message}</p>

      {data.slots.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {data.slots.map((slot, i) => (
            <a key={i} href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-navy text-cream font-mono text-xs px-3 py-2 rounded
                         hover:bg-flamingo transition-colors">
              <Clock size={11} />
              {formatTime(slot.time)}
            </a>
          ))}
        </div>
      )}

      <a href={siteData.links.reservations} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors">
        <ExternalLink size={13} />
        View all times on Resy
      </a>
    </div>
  );
};

export default ResyAvailability;
