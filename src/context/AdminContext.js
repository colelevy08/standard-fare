// ─────────────────────────────────────────────────────────────────────────────
// context/AdminContext.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import defaultSiteData from "../data/siteData";
import supabase from "../lib/supabase";

const STORAGE_KEY    = "standard_fare_site_data";
const VERSION_KEY    = "standard_fare_data_version";
const DATA_VERSION   = 6; // ← bumped: nuked bad Supabase data, defense-in-depth URL validation
const SUPABASE_TABLE = "site_content";
const SUPABASE_ROW   = 1;

// Hardcoded fallback passwords — used only if siteData.settings has none yet
const DEFAULT_ADMIN_PASSWORD   = "zacnclark4evr<3";
const DEFAULT_PREVIEW_PASSWORD = "standardfare2026";

const AdminContext = createContext(undefined);

// ── URL validator ─────────────────────────────────────────────────────────
// Rejects bare filenames (e.g. "zac.jpg") that got saved accidentally.
// Only http/https/data URIs are valid image sources.
const isValidUrl = (u) =>
  typeof u === "string" &&
  (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:"));

// ── Deep merge ────────────────────────────────────────────────────────────
// Object sections are spread so new default keys are picked up after upgrades.
// Array sections use ?? so an empty array [] (cleared by admin) is respected.
// Image URL fields are validated — bare filenames fall back to defaults.
const deepMerge = (saved) => {
  if (!saved) return defaultSiteData;

  // Sanitize hero slides — drop any slide whose URL is a bare filename
  const rawSlides = saved.heroSlides ?? defaultSiteData.heroSlides;
  const validSlides = rawSlides.filter((s) => isValidUrl(s.url));
  // BUG FIX: use validSlides (filtered), not rawSlides (with bad URLs still in it)
  const heroSlides = validSlides.length > 0 ? validSlides : defaultSiteData.heroSlides;

  // Sanitize about image and team photos
  const savedAbout = saved.about || {};
  const aboutImageUrl = isValidUrl(savedAbout.imageUrl)
    ? savedAbout.imageUrl
    : defaultSiteData.about.imageUrl;
  const rawTeam = savedAbout.team?.length > 0 ? savedAbout.team : defaultSiteData.about.team;
  const team = rawTeam.map((m, i) => ({
    ...m,
    photo: isValidUrl(m.photo) ? m.photo : (defaultSiteData.about.team[i]?.photo || ""),
  }));

  // Sanitize gallery — drop items with bare filename URLs
  const rawGallery = saved.gallery ?? defaultSiteData.gallery;
  const validGallery = rawGallery.filter((g) => isValidUrl(g.url));
  const gallery = validGallery.length > 0 ? validGallery : defaultSiteData.gallery;

  return {
    ...defaultSiteData,
    ...saved,
    location:    { ...defaultSiteData.location,    ...(saved.location    || {}) },
    settings:    { ...defaultSiteData.settings,    ...(saved.settings    || {}) },
    links:       { ...defaultSiteData.links,       ...(saved.links       || {}) },
    heroContent: { ...defaultSiteData.heroContent, ...(saved.heroContent || {}) },
    contact:     { ...defaultSiteData.contact,     ...(saved.contact     || {}) },
    about: {
      ...defaultSiteData.about,
      ...savedAbout,
      imageUrl: aboutImageUrl,
      team,
    },
    heroSlides,
    gallery,
    press:    saved.press    ?? defaultSiteData.press,
    events:   saved.events   ?? defaultSiteData.events,
    prints:   saved.prints   ?? defaultSiteData.prints,
    hours:    saved.hours    ?? defaultSiteData.hours,
    menus:    saved.menus
      ? { ...defaultSiteData.menus, ...saved.menus }
      : defaultSiteData.menus,
  };
};

// ── localStorage helpers ──────────────────────────────────────────────────
const loadLocal = () => {
  try {
    // If data version doesn't match, wipe stale localStorage
    const savedVersion = parseInt(localStorage.getItem(VERSION_KEY) || "0", 10);
    if (savedVersion < DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? deepMerge(JSON.parse(raw)) : null;
  } catch { return null; }
};

const saveLocal = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
  }
  catch (e) { console.warn("localStorage write failed:", e); }
};

// ─────────────────────────────────────────────────────────────────────────────
export const AdminProvider = ({ children }) => {
  const [siteData,   setSiteData]   = useState(() => loadLocal() || defaultSiteData);
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [dbReady,    setDbReady]    = useState(false);
  const [dbLoading,  setDbLoading]  = useState(!!supabase); // true while initial fetch runs
  const [dbError,    setDbError]    = useState(null);

  // ── Derived passwords — live from siteData so changes persist immediately ─
  const adminPassword   = siteData.settings?.adminPassword   || DEFAULT_ADMIN_PASSWORD;
  const previewPassword = siteData.settings?.previewPassword || DEFAULT_PREVIEW_PASSWORD;

  // ── Load from Supabase on mount ───────────────────────────────────────────
  const loadFromSupabase = useCallback(async () => {
    if (!supabase) return;
    setDbLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .select("content")
        .eq("id", SUPABASE_ROW)
        .maybeSingle();

      if (error) throw new Error(error.message);

      if (data?.content) {
        const merged = deepMerge(data.content);
        setSiteData(merged);
        saveLocal(merged);

        // If the merge sanitized anything (bad URLs replaced), write clean
        // data back to Supabase so future loads don't need to sanitize again.
        const rawJson    = JSON.stringify(data.content);
        const mergedJson = JSON.stringify(merged);
        if (rawJson !== mergedJson) {
          await supabase
            .from(SUPABASE_TABLE)
            .upsert({ id: SUPABASE_ROW, content: merged }, { onConflict: "id" });
        }
      } else {
        // No row yet — push current defaults up to initialise the table row
        const current = loadLocal() || defaultSiteData;
        const { error: upsertErr } = await supabase
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW, content: current }, { onConflict: "id" });
        if (upsertErr) throw new Error(upsertErr.message);
      }
      setDbReady(true);
      setDbError(null);
    } catch (e) {
      console.warn("Supabase load failed:", e.message);
      setDbError(e.message);
      setDbReady(false);
    } finally {
      setDbLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadFromSupabase(); }, [loadFromSupabase]);

  // ── updateData ────────────────────────────────────────────────────────────
  const updateData = async (section, value) => {
    const updated = { ...siteData, [section]: value };
    setSiteData(updated);
    saveLocal(updated);

    if (supabase) {
      try {
        const { error } = await supabase
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW, content: updated }, { onConflict: "id" });
        if (error) throw new Error(error.message);
      } catch (e) {
        console.warn("Supabase save failed:", e.message);
      }
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login  = (pw) => {
    if (pw === adminPassword) { setIsAdmin(true); return true; }
    return false;
  };
  const logout = () => setIsAdmin(false);

  // ── changeAdminPassword ───────────────────────────────────────────────────
  const changeAdminPassword = async (newPassword) => {
    const updatedSettings = { ...siteData.settings, adminPassword: newPassword };
    await updateData("settings", updatedSettings);
  };

  // ── changePreviewPassword ─────────────────────────────────────────────────
  const changePreviewPassword = async (newPassword) => {
    const updatedSettings = { ...siteData.settings, previewPassword: newPassword };
    await updateData("settings", updatedSettings);
  };

  const resetToDefaults = () => { setSiteData(defaultSiteData); saveLocal(defaultSiteData); };

  return (
    <AdminContext.Provider value={{
      siteData, updateData,
      isAdmin, login, logout,
      adminPassword, previewPassword,
      changeAdminPassword, changePreviewPassword,
      resetToDefaults,
      dbReady, dbLoading, dbError,
      retrySupabase: loadFromSupabase,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useSite = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useSite must be used inside <AdminProvider>");
  return ctx;
};
