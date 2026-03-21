// ─────────────────────────────────────────────────────────────────────────────
// components/sections/SpecialsBanner.jsx
// Time-based banner that auto-shows active specials based on current day/time.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const isActiveNow = (special) => {
  if (!special.active) return false;
  if (!special.startTime || !special.endTime) return false;
  const now = new Date();
  const day = DAYS[now.getDay()];
  if (!special.days?.includes(day)) return false;

  const [sh, sm] = special.startTime.split(":").map(Number);
  const [eh, em] = special.endTime.split(":").map(Number);
  if (isNaN(sh) || isNaN(eh)) return false;
  const mins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + (sm || 0);
  const endMins = eh * 60 + (em || 0);
  // Handle crossing midnight (e.g. 22:00 - 01:00)
  if (endMins < startMins) return mins >= startMins || mins <= endMins;
  return mins >= startMins && mins <= endMins;
};

const getTimeRemaining = (endTime) => {
  if (!endTime) return null;
  const now = new Date();
  const [eh, em] = endTime.split(":").map(Number);
  if (isNaN(eh)) return null;
  const endMins = eh * 60 + (em || 0);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let diff = endMins - nowMins;
  // Handle crossing midnight
  if (diff < 0) diff += 24 * 60;
  if (diff <= 0 || diff > 24 * 60) return null;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return { hours, minutes, total: diff };
};

const CountdownBadge = ({ endTime }) => {
  const [remaining, setRemaining] = useState(() => getTimeRemaining(endTime));

  useEffect(() => {
    const tick = () => setRemaining(getTimeRemaining(endTime));
    const interval = setInterval(tick, 30000); // update every 30 seconds
    return () => clearInterval(interval);
  }, [endTime]);

  if (!remaining) return null;

  const isUrgent = remaining.total <= 30;
  const label = remaining.hours > 0
    ? `Ends in ${remaining.hours}h ${remaining.minutes}m`
    : `Ends in ${remaining.minutes}m`;

  return (
    <span className={`inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-mono font-bold
      ${isUrgent
        ? "bg-white text-flamingo animate-pulse"
        : "bg-cream bg-opacity-20 text-white"
      }`}>
      {label}
    </span>
  );
};

const SpecialsBanner = () => {
  const { siteData } = useSite();
  const [dismissed, setDismissed] = useState(false);
  const [activeSpecials, setActiveSpecials] = useState([]);

  useEffect(() => {
    const check = () => {
      const active = (siteData.specials || []).filter(isActiveNow);
      setActiveSpecials(active);
    };
    check();
    const interval = setInterval(check, 60000); // re-check every minute
    return () => clearInterval(interval);
  }, [siteData.specials]);

  if (dismissed || activeSpecials.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[60]">
      <div className="bg-flamingo text-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Clock size={16} className="flex-shrink-0" />
            <div className="flex gap-4 overflow-x-auto">
              {activeSpecials.map((s) => (
                <span key={s.id} className="font-body text-sm whitespace-nowrap">
                  <strong>{s.title}</strong> — {s.description}
                  <CountdownBadge endTime={s.endTime} />
                </span>
              ))}
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="flex-shrink-0 opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialsBanner;
