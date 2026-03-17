// ─────────────────────────────────────────────────────────────────────────────
// hooks/useInstagramFeed.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches the 3 most recent Instagram posts from /api/instagram-feed.
// 12-hour localStorage cache. Auto-refreshes on mount if stale.
// Persists results to Supabase via updateData so they survive across devices.
// Falls back to siteData.instagramFeed if scrape returns empty.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

const CACHE_KEY = "sf_instagram_feed";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

const loadCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const saveCache = (data) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      ...data,
      cachedAt: Date.now(),
    }));
  } catch (e) {
    console.warn("Instagram feed cache save failed:", e);
  }
};

const useInstagramFeed = (manualFeed = [], updateData = null) => {
  const [posts, setPosts] = useState(() => {
    const cached = loadCache();
    if (cached?.posts?.length > 0) return cached.posts;
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(() => {
    const cached = loadCache();
    return cached?.fetchedAt || null;
  });
  const fetchedRef = useRef(false);

  const fetchFeed = useCallback(async (bustCache = false) => {
    // Only works in production (Vercel serverless)
    const isDev = typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (isDev) {
      // In dev, use manual feed from siteData
      const manualPosts = manualFeed.filter((p) => p.imageUrl);
      if (manualPosts.length > 0) setPosts(manualPosts);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = bustCache
        ? `/api/instagram-feed?bust=${Date.now()}`
        : "/api/instagram-feed";
      const res = await fetch(url);
      const data = await res.json();

      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts);
        setLastFetched(data.fetchedAt);
        saveCache(data);

        // Persist to Supabase so results survive across devices/sessions
        if (updateData) {
          const feedForStorage = data.posts.slice(0, 3).map((p) => ({
            id: p.id,
            imageUrl: p.imageUrl,
            postUrl: p.postUrl,
            caption: p.caption || "",
          }));
          updateData("instagramFeed", feedForStorage);
        }
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [manualFeed, updateData]);

  // Auto-fetch on mount if cache is stale (only once)
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const cached = loadCache();
    const isStale = !cached || (Date.now() - (cached.cachedAt || 0)) > CACHE_DURATION;
    if (isStale) {
      fetchFeed(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const forceRefresh = useCallback(() => fetchFeed(true), [fetchFeed]);

  // If no scraped posts, fall back to manual feed from siteData
  const effectivePosts = posts.length > 0
    ? posts
    : manualFeed.filter((p) => p.imageUrl);

  return {
    posts: effectivePosts,
    loading,
    error,
    lastFetched,
    forceRefresh,
  };
};

export default useInstagramFeed;
