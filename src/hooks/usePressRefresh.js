// ─────────────────────────────────────────────────────────────────────────────
// hooks/usePressRefresh.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches fresh press articles from /api/press-refresh every 12 hours.
// Merges new articles into existing press data without duplicating.
// Provides a forceRefresh() for the admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const REFRESH_KEY = "sf_press_last_refresh";
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

const usePressRefresh = (existingPress = [], onNewArticles) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newCount, setNewCount] = useState(0);

  const fetchPress = useCallback(async (force = false) => {
    setLoading(true);
    setNewCount(0);
    try {
      const url = force ? "/api/press-refresh?force=true" : "/api/press-refresh";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        // Filter out articles we already have (by URL match)
        const existingUrls = new Set(existingPress.map((p) => p.url));
        const newArticles = data.articles.filter((a) => !existingUrls.has(a.url));

        if (newArticles.length > 0 && onNewArticles) {
          // Convert to our press format with IDs
          const formatted = newArticles.map((a, i) => ({
            id: Date.now() + i,
            outlet: a.outlet,
            headline: a.headline,
            url: a.url,
            logo: a.logo,
            autoDiscovered: true,
          }));
          onNewArticles(formatted);
          setNewCount(formatted.length);
        }
      }

      setLastUpdated(data.lastUpdated || new Date().toISOString());
      localStorage.setItem(REFRESH_KEY, String(Date.now()));
    } catch (err) {
      console.warn("Press refresh failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [existingPress, onNewArticles]);

  // Auto-refresh on mount if 12+ hours since last check
  useEffect(() => {
    const last = parseInt(localStorage.getItem(REFRESH_KEY) || "0", 10);
    if (Date.now() - last > TWELVE_HOURS) {
      fetchPress(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const forceRefresh = () => fetchPress(true);

  return { loading, lastUpdated, newCount, forceRefresh };
};

export default usePressRefresh;
