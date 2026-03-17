// ─────────────────────────────────────────────────────────────────────────────
// hooks/useBigCartel.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches products from Daniel Fairley's Big Cartel shop (poemdexter.com)
// via the Vercel proxy at /api/bigcartel-products.
//
// Auto-refreshes once per day (checks localStorage timestamp).
// Provides a forceRefresh() for the admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "sf_bigcartel_products";
const CACHE_TS_KEY = "sf_bigcartel_fetched_at";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// In development, call Big Cartel directly (no Vercel proxy available).
// In production, use the Vercel serverless proxy to avoid CORS.
const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api/bigcartel-products"
    : "https://poemdexter.bigcartel.com/products.json";

const normalizeProduct = (p) => ({
  id: p.id,
  title: p.name || p.title,
  permalink: p.permalink,
  url: p.url?.startsWith("http") ? p.url : `https://poemdexter.bigcartel.com${p.url || `/product/${p.permalink}`}`,
  status: p.status,
  available: p.status === "active",
  price: p.default_price || p.price || 0,
  imageUrl: p.images?.[0]?.url || p.imageUrl || null,
  categories: (p.categories || []).map((c) => (typeof c === "string" ? c : c.name)),
  description: (p.description || "").replace(/<[^>]+>/g, "").trim(),
});

const loadCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const ts = localStorage.getItem(CACHE_TS_KEY);
    if (!raw || !ts) return null;
    return { products: JSON.parse(raw), fetchedAt: ts };
  } catch {
    return null;
  }
};

const saveCache = (products) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(CACHE_TS_KEY, new Date().toISOString());
  } catch (e) {
    console.warn("BigCartel cache write failed:", e);
  }
};

const isCacheStale = () => {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  if (!ts) return true;
  return Date.now() - new Date(ts).getTime() > ONE_DAY_MS;
};

const useBigCartel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchProducts = useCallback(async (bustCache = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = bustCache ? `${API_URL}?bust=${Date.now()}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Handle both proxy response shape and direct Big Cartel response
      const rawProducts = data.products || data;
      const normalized = Array.isArray(rawProducts)
        ? rawProducts.map(normalizeProduct)
        : [];

      setProducts(normalized);
      saveCache(normalized);
      setLastFetched(new Date().toISOString());
    } catch (e) {
      console.warn("BigCartel fetch failed:", e.message);
      setError(e.message);
      // Fall back to cache
      const cached = loadCache();
      if (cached) {
        setProducts(cached.products);
        setLastFetched(cached.fetchedAt);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount: load cache, then fetch if stale
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setProducts(cached.products);
      setLastFetched(cached.fetchedAt);
    }
    if (isCacheStale()) {
      fetchProducts();
    }
  }, [fetchProducts]);

  const forceRefresh = useCallback(() => fetchProducts(true), [fetchProducts]);

  return { products, loading, error, lastFetched, forceRefresh };
};

export default useBigCartel;
