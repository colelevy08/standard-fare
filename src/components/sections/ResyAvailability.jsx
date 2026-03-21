// ─────────────────────────────────────────────────────────────────────────────
// components/sections/ResyAvailability.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Real-time table availability indicator from Resy.
// Shows available time slots for tonight or the next available date.
// All dates use America/New_York timezone (Saratoga Springs, NY).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Users, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useSite } from "../../context/AdminContext";

// ── Timezone helper — always use Eastern time for Saratoga Springs ───────
const TIMEZONE = "America/New_York";

const getEasternDate = (offset = 0) => {
  const now = new Date();
  if (offset) now.setDate(now.getDate() + offset);
  // Format as YYYY-MM-DD in Eastern time
  return now.toLocaleDateString("en-CA", { timeZone: TIMEZONE }); // en-CA gives YYYY-MM-DD
};

const getEasternHour = () => {
  const now = new Date();
  return parseInt(now.toLocaleTimeString("en-US", { timeZone: TIMEZONE, hour: "numeric", hour12: false }), 10);
};

const formatTime = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TIMEZONE,
    });
  } catch {
    return dateStr;
  }
};

const formatDateLabel = (dateStr) => {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: TIMEZONE,
    });
  } catch {
    return dateStr;
  }
};

const isToday = (dateStr) => dateStr === getEasternDate();
const isTomorrow = (dateStr) => dateStr === getEasternDate(1);

const ResyAvailability = () => {
  const { siteData } = useSite();
  const resyUrl = siteData.links?.reservations || "";

  const [data, setData] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualDate, setManualDate] = useState(null); // for browsing dates

  const fetchAvailability = useCallback(async (dateStr) => {
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isDev) {
      // Dev mode — generate realistic mock slots based on CURRENT Eastern date/time
      const today = getEasternDate();
      const hour = getEasternHour();
      const isDateToday = dateStr === today;

      // Generate time slots starting from next half-hour if today, or from 5pm if future
      const startHour = isDateToday ? Math.max(hour + 1, 17) : 17;
      const slots = [];
      const types = ["Dining Room", "Dining Room", "Bar", "Dining Room", "Dining Room", "Bar", "Patio", "Dining Room"];
      for (let h = startHour; h <= 21; h++) {
        for (const m of [0, 30]) {
          if (slots.length >= 8) break;
          if (isDateToday && h === hour + 1 && m === 0) continue; // skip if too close
          const timeStr = `${dateStr} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
          slots.push({ time: timeStr, type: types[slots.length % types.length] });
        }
      }

      return {
        available: slots.length > 0,
        message: slots.length > 0
          ? `${slots.length} time${slots.length !== 1 ? "s" : ""} available`
          : "No tables available — try a different date",
        slots,
        date: dateStr,
        partySize,
      };
    }

    try {
      const res = await fetch(`/api/resy-availability?date=${dateStr}&party=${partySize}`);
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch {
      return { available: true, message: "Reserve on Resy", slots: [], date: dateStr };
    }
  }, [partySize]);

  // Auto-find availability: today first, then next 7 days
  const findAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);

    const today = getEasternDate();

    // If user manually selected a date, fetch that directly
    if (manualDate) {
      const result = await fetchAvailability(manualDate);
      setData({ ...result, date: manualDate });
      setLoading(false);
      return;
    }

    // Try today first
    const todayData = await fetchAvailability(today);
    if (todayData.slots && todayData.slots.length > 0) {
      setData({ ...todayData, date: today });
      setLoading(false);
      return;
    }

    // No slots today — check next 7 days
    for (let i = 1; i <= 7; i++) {
      const nextStr = getEasternDate(i);
      const nextData = await fetchAvailability(nextStr);
      if (nextData.slots && nextData.slots.length > 0) {
        setData({ ...nextData, date: nextStr });
        setLoading(false);
        return;
      }
    }

    // Nothing found
    setData({
      available: false,
      message: "No tables available this week — check Resy for more dates",
      slots: [],
      date: today,
    });
    setLoading(false);
  }, [fetchAvailability, manualDate]);

  useEffect(() => {
    findAvailability();
  }, [findAvailability]);

  // Navigate dates manually
  const browseDate = (direction) => {
    const current = manualDate || data?.date || getEasternDate();
    const d = new Date(current + "T12:00:00");
    d.setDate(d.getDate() + direction);
    const today = getEasternDate();
    const newDate = d.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
    // Don't go before today
    if (newDate < today) return;
    setManualDate(newDate);
  };

  const resetToAuto = () => {
    setManualDate(null);
  };

  if (!data && !loading) return null;

  // Date label
  const currentDate = manualDate || data?.date || getEasternDate();
  const dateLabel = (() => {
    if (isToday(currentDate)) return "Tonight's Availability";
    if (isTomorrow(currentDate)) return `Tomorrow — ${formatDateLabel(currentDate)}`;
    return `${manualDate ? "" : "Next Available: "}${formatDateLabel(currentDate)}`;
  })();

  const hasSlots = data?.slots?.length > 0;

  return (
    <div className="bg-cream-warm rounded-lg p-6 border border-navy border-opacity-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {loading ? (
            <RefreshCw size={14} className="text-flamingo animate-spin" />
          ) : (
            <div className={`w-2 h-2 rounded-full ${hasSlots ? "bg-green-500" : "bg-flamingo"} animate-pulse`} />
          )}
          <h3 className="font-display text-navy text-lg">{loading ? "Checking availability..." : dateLabel}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-navy opacity-40" />
          <select
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="font-body text-sm text-navy bg-transparent border-none focus:outline-none cursor-pointer"
            aria-label="Party size"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} guest{n !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => browseDate(-1)}
          disabled={isToday(currentDate)}
          className="p-1 text-navy opacity-30 hover:opacity-60 disabled:opacity-10 transition-opacity"
          aria-label="Previous day"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 flex-1 text-center">
          {currentDate}
        </span>
        <button
          onClick={() => browseDate(1)}
          className="p-1 text-navy opacity-30 hover:opacity-60 transition-opacity"
          aria-label="Next day"
        >
          <ChevronRight size={16} />
        </button>
        {manualDate && (
          <button
            onClick={resetToAuto}
            className="font-mono text-[10px] text-flamingo hover:text-flamingo-dark transition-colors ml-1"
          >
            Auto
          </button>
        )}
      </div>

      {/* Status message */}
      {!loading && (
        <p className="font-body text-sm text-navy opacity-60 mb-4">{data?.message}</p>
      )}

      {/* Time slots */}
      {!loading && hasSlots && (
        <div className="flex flex-wrap gap-2 mb-4">
          {data.slots.map((slot, i) => (
            <a
              key={i}
              href={resyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 bg-navy text-cream font-mono text-xs px-3 py-2 rounded
                         hover:bg-flamingo transition-colors"
              title={`${formatTime(slot.time)} — ${slot.type}`}
            >
              <Clock size={11} />
              <span>{formatTime(slot.time)}</span>
              <span className="hidden group-hover:inline text-cream text-opacity-60 text-[9px] ml-0.5">
                {slot.type}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* View all on Resy */}
      <a
        href={resyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors"
      >
        <ExternalLink size={13} />
        View all times on Resy
      </a>
    </div>
  );
};

export default ResyAvailability;
