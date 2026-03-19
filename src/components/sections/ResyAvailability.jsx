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
  const [searchDate, setSearchDate] = useState(null);

  useEffect(() => {
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isDev) {
      setData({
        available: true,
        message: "6 times available tonight",
        slots: [
          { time: "2026-03-19 17:30:00", type: "Dining Room" },
          { time: "2026-03-19 18:00:00", type: "Dining Room" },
          { time: "2026-03-19 18:30:00", type: "Bar" },
          { time: "2026-03-19 19:00:00", type: "Dining Room" },
          { time: "2026-03-19 20:00:00", type: "Dining Room" },
          { time: "2026-03-19 21:00:00", type: "Bar" },
        ],
        date: new Date().toISOString().split("T")[0],
      });
      return;
    }

    const fetchAvailability = async (dateStr) => {
      try {
        const res = await fetch(`/api/resy-availability?date=${dateStr}&party=${partySize}`);
        const json = await res.json();
        return json;
      } catch {
        return { available: true, message: "Reserve on Resy", slots: [], date: dateStr };
      }
    };

    const findAvailability = async () => {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      // Try today first
      const todayData = await fetchAvailability(todayStr);
      if (todayData.slots && todayData.slots.length > 0) {
        setData({ ...todayData, date: todayStr });
        setSearchDate(null);
        return;
      }

      // No slots tonight — check next 7 days for the nearest availability
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(nextDate.getDate() + i);
        const nextStr = nextDate.toISOString().split("T")[0];
        const nextData = await fetchAvailability(nextStr);
        if (nextData.slots && nextData.slots.length > 0) {
          setData({ ...nextData, date: nextStr });
          setSearchDate(nextStr);
          return;
        }
      }

      // Nothing found in the next week — show fallback
      setData({ available: false, message: "No tables available this week — check Resy for more dates", slots: [], date: todayStr });
      setSearchDate(null);
    };

    findAvailability();
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

  const dateLabel = (() => {
    if (!searchDate) return "Tonight's Availability";
    try {
      const d = new Date(searchDate + "T12:00:00");
      return `Next Available: ${d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`;
    } catch {
      return "Upcoming Availability";
    }
  })();

  return (
    <div className="bg-cream-warm rounded-lg p-6 border border-navy border-opacity-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${data.available ? "bg-green-500" : "bg-flamingo"} animate-pulse`} />
          <h3 className="font-display text-navy text-lg">{dateLabel}</h3>
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
