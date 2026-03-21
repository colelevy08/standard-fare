// ─────────────────────────────────────────────────────────────────────────────
// components/sections/SeasonalCountdown.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Countdown banner for upcoming seasonal menu launches.
// Shows days remaining until the launch date.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const SeasonalCountdown = () => {
  const { siteData } = useSite();
  const config = siteData.seasonalCountdown || {};
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!config.enabled || !config.launchDate) return;

    const calc = () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(config.launchDate)) return null;
      const now = new Date();
      const launch = new Date(config.launchDate + "T12:00:00");
      if (isNaN(launch.getTime())) return null;
      const diff = launch - now;
      if (diff <= 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { days, hours };
    };

    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(timer);
  }, [config.enabled, config.launchDate]);

  if (!config.enabled || !timeLeft) return null;

  return (
    <section className="bg-flamingo py-10 text-center">
      <div className="section-container">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock size={16} className="text-cream" />
          <p className="font-mono text-cream text-xs tracking-editorial uppercase">Coming Soon</p>
        </div>
        <h2 className="font-display text-cream text-2xl md:text-3xl mb-2">
          {config.title || "New Seasonal Menu"}
        </h2>
        <p className="font-body text-cream opacity-80 text-sm mb-6 max-w-md mx-auto">
          {config.teaser}
        </p>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <span className="font-display text-cream text-4xl">{timeLeft.days}</span>
            <p className="font-mono text-cream opacity-60 text-xs uppercase mt-1">Days</p>
          </div>
          <div className="text-center">
            <span className="font-display text-cream text-4xl">{timeLeft.hours}</span>
            <p className="font-mono text-cream opacity-60 text-xs uppercase mt-1">Hours</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalCountdown;
