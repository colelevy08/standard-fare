// ─────────────────────────────────────────────────────────────────────────────
// context/AdminContext.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import defaultSiteData from "../data/siteData";
import supabase from "../lib/supabase";

const STORAGE_KEY    = "standard_fare_site_data";
const VERSION_KEY    = "standard_fare_data_version";
const DATA_VERSION   = 14; // ← bumped: 67 real 5-star Google reviews, favicon fix
const SUPABASE_TABLE = "site_content";
const SUPABASE_ROW   = 1;

// Hardcoded fallback passwords — used only if siteData.settings has none yet
const DEFAULT_ADMIN_PASSWORD   = "zacnclark4evr<3";
const DEFAULT_PREVIEW_PASSWORD = "sf26";

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
      // Preserve bocageUrl — fall back to default if blank or pointing to broken domain
      bocageUrl: (savedAbout.bocageUrl && !savedAbout.bocageUrl.includes("bocagechampagnebar.com"))
        ? savedAbout.bocageUrl
        : defaultSiteData.about.bocageUrl,
    },
    heroSlides,
    gallery,
    merch:         saved.merch         ?? defaultSiteData.merch,
    bottles:       saved.bottles       ?? defaultSiteData.bottles,
    specials:      saved.specials      ?? defaultSiteData.specials,
    // Always use the real Google reviews from googleReviews.js as the default
    // pool. Admin customizations are saved via updateData("testimonials", ...).
    // Old seed/fake reviews in Supabase are replaced on version bump.
    testimonials:  defaultSiteData.testimonials,
    smsClub:       saved.smsClub       ? { ...defaultSiteData.smsClub, ...saved.smsClub } : defaultSiteData.smsClub,
    newsletter:    saved.newsletter    ?? defaultSiteData.newsletter,
    popularNow:    saved.popularNow    ? { ...defaultSiteData.popularNow, ...saved.popularNow } : defaultSiteData.popularNow,
    instagramFeed: saved.instagramFeed ?? defaultSiteData.instagramFeed,
    // Merge blog: keep saved posts, add any new defaults not already present (by id).
    blog: (() => {
      const savedBlog = saved.blog ?? [];
      if (savedBlog.length === 0) return defaultSiteData.blog;
      const savedIds = new Set(savedBlog.map((p) => p.id));
      const newDefaults = defaultSiteData.blog.filter((p) => !savedIds.has(p.id));
      return [...savedBlog, ...newDefaults];
    })(),
    seasonalCountdown: saved.seasonalCountdown ? { ...defaultSiteData.seasonalCountdown, ...saved.seasonalCountdown } : defaultSiteData.seasonalCountdown,
    emailMarketing:    saved.emailMarketing    ? { ...defaultSiteData.emailMarketing,    ...saved.emailMarketing    } : defaultSiteData.emailMarketing,
    privateEvents:     saved.privateEvents     ? { ...defaultSiteData.privateEvents,     ...saved.privateEvents     } : defaultSiteData.privateEvents,
    giftCards:         saved.giftCards         ? { ...defaultSiteData.giftCards,         ...saved.giftCards         } : defaultSiteData.giftCards,
    // Merge press: keep saved, add any new defaults not already present (by id).
    // Always refresh logos from defaults so favicon-service URLs replace old CDN ones.
    press: (() => {
      const savedPress = saved.press ?? [];
      if (savedPress.length === 0) return defaultSiteData.press;
      const defaultById = Object.fromEntries(defaultSiteData.press.map((p) => [p.id, p]));
      const merged = savedPress.map((p) => {
        const def = defaultById[p.id];
        return def ? { ...p, logo: def.logo } : p;
      });
      const savedIds = new Set(savedPress.map((p) => p.id));
      const newDefaults = defaultSiteData.press.filter((p) => !savedIds.has(p.id));
      return [...merged, ...newDefaults];
    })(),
    // Merge events: keep saved events, add any new defaults not already present (by id)
    events: (() => {
      const savedEvents = saved.events ?? [];
      if (savedEvents.length === 0) return defaultSiteData.events;
      const savedIds = new Set(savedEvents.map((e) => e.id));
      const newDefaults = defaultSiteData.events.filter((e) => !savedIds.has(e.id));
      return [...savedEvents, ...newDefaults];
    })(),
    hoursOverride:   saved.hoursOverride   ? { ...defaultSiteData.hoursOverride,   ...saved.hoursOverride   } : defaultSiteData.hoursOverride,
    weeklyFeatures:  saved.weeklyFeatures  ? { ...defaultSiteData.weeklyFeatures,  ...saved.weeklyFeatures  } : defaultSiteData.weeklyFeatures,
    stockPhotos:     saved.stockPhotos     ? { ...defaultSiteData.stockPhotos,     ...saved.stockPhotos     } : defaultSiteData.stockPhotos,
    googleRating: saved.googleRating ? { ...defaultSiteData.googleRating, ...saved.googleRating } : defaultSiteData.googleRating,
    faq:      saved.faq      ?? defaultSiteData.faq,
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
  const [canUndo,    setCanUndo]    = useState(false);
  const [draftMode,  setDraftMode]  = useState(false);
  const [hasDraft,   setHasDraft]   = useState(false);
  const prevDataRef = useRef(null);

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

  // ── Save status — exposed so UI can show feedback ───────────────────────
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "saved" | "error"
  const [lastSavedAt, setLastSavedAt] = useState(null); // Date

  // ── updateData ────────────────────────────────────────────────────────────
  const updateData = async (section, value) => {
    // Snapshot for undo (1 level)
    prevDataRef.current = { ...siteData };
    setCanUndo(true);

    const updated = { ...siteData, [section]: value };
    setSiteData(updated);
    saveLocal(updated);

    // In draft mode, only save locally — don't push to Supabase until publish
    if (draftMode) {
      setHasDraft(true);
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      return;
    }

    if (supabase) {
      setSaveStatus("saving");
      try {
        const { error } = await supabase
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW, content: updated }, { onConflict: "id" });
        if (error) throw new Error(error.message);
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      } catch (e) {
        console.warn("Supabase save failed:", e.message);
        setSaveStatus("error");
        // Data is still in localStorage — flag the error but don't lose data
      }
    } else {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    }
  };

  // ── Draft/Publish ──────────────────────────────────────────────────────
  const publishDraft = async () => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW, content: siteData }, { onConflict: "id" });
        if (error) throw new Error(error.message);
      } catch (e) {
        console.warn("Supabase publish failed:", e.message);
      }
    }
    setHasDraft(false);
    setDraftMode(false);
  };

  const discardDraft = async () => {
    // Reload from Supabase to revert local changes
    setDraftMode(false);
    setHasDraft(false);
    await loadFromSupabase();
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

  // ── Undo last save ───────────────────────────────────────────────────────
  const undo = async () => {
    if (!prevDataRef.current) return;
    const prev = prevDataRef.current;
    setSiteData(prev);
    saveLocal(prev);
    setCanUndo(false);
    prevDataRef.current = null;
    if (supabase) {
      try {
        await supabase
          .from(SUPABASE_TABLE)
          .upsert({ id: SUPABASE_ROW, content: prev }, { onConflict: "id" });
      } catch (e) { console.warn("Supabase undo failed:", e.message); }
    }
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
      canUndo, undo,
      draftMode, setDraftMode, hasDraft, publishDraft, discardDraft,
      saveStatus, lastSavedAt,
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
