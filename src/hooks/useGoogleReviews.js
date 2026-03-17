// ─────────────────────────────────────────────────────────────────────────────
// hooks/useGoogleReviews.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches Google reviews for Standard Fare via the Vercel proxy at
// /api/google-reviews. Auto-refreshes every 12 hours.
//
// In production, calls the Vercel serverless function.
// In development, loads from cache only (no proxy available).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "sf_google_reviews";
const CACHE_TS_KEY = "sf_google_reviews_fetched_at";
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

const loadCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const ts = localStorage.getItem(CACHE_TS_KEY);
    if (!raw || !ts) return null;
    return { ...JSON.parse(raw), fetchedAt: ts };
  } catch {
    return null;
  }
};

const saveCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TS_KEY, new Date().toISOString());
  } catch (e) {
    console.warn("Google reviews cache write failed:", e);
  }
};

const isCacheStale = () => {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  if (!ts) return true;
  return Date.now() - new Date(ts).getTime() > TWELVE_HOURS_MS;
};

const useGoogleReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchReviews = useCallback(async (bustCache = false) => {
    // Only fetch in production (Vercel proxy required)
    if (process.env.NODE_ENV !== "production") {
      const cached = loadCache();
      if (cached?.reviews?.length) {
        setReviews(cached.reviews);
        setRating(cached.rating);
        setTotalReviews(cached.totalReviews);
        setLastFetched(cached.fetchedAt);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = bustCache
        ? `/api/google-reviews?bust=${Date.now()}`
        : "/api/google-reviews";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      }

      if (data.reviews?.length > 0) {
        setReviews(data.reviews);
        setRating(data.rating);
        setTotalReviews(data.totalReviews);
        setLastFetched(data.fetchedAt);
        saveCache(data);
      }
    } catch (e) {
      console.warn("Google reviews fetch failed:", e.message);
      setError(e.message);
      // Fall back to cache
      const cached = loadCache();
      if (cached?.reviews?.length) {
        setReviews(cached.reviews);
        setRating(cached.rating);
        setTotalReviews(cached.totalReviews);
        setLastFetched(cached.fetchedAt);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: load cache, fetch if stale
  useEffect(() => {
    const cached = loadCache();
    if (cached?.reviews?.length) {
      setReviews(cached.reviews);
      setRating(cached.rating);
      setTotalReviews(cached.totalReviews);
      setLastFetched(cached.fetchedAt);
    }
    if (isCacheStale()) {
      fetchReviews();
    }
  }, [fetchReviews]);

  const forceRefresh = useCallback(() => fetchReviews(true), [fetchReviews]);

  return { reviews, rating, totalReviews, loading, error, lastFetched, forceRefresh };
};

export default useGoogleReviews;
