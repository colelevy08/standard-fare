// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAutoSave.js — Debounced auto-save for admin editors
// ─────────────────────────────────────────────────────────────────────────────
// Usage:
//   const { draft, setDraft, isDirty, saving, lastSaved } = useAutoSave(
//     "about", siteData.about, updateData, { delay: 1500 }
//   );
//
// Changes are auto-saved after `delay` ms of inactivity. The hook also
// provides a manual `save()` method and tracks dirty/saving/saved state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";

const useAutoSave = (sectionKey, initialData, updateData, options = {}) => {
  const { delay = 2000, enabled = true, onSave, deepClone = false } = options;

  const [draft, setDraft] = useState(() =>
    deepClone ? JSON.parse(JSON.stringify(initialData)) : { ...initialData }
  );
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveCount, setSaveCount] = useState(0);
  const timerRef = useRef(null);
  const draftRef = useRef(draft);

  // Keep ref in sync
  useEffect(() => { draftRef.current = draft; }, [draft]);

  // Manual save
  const save = useCallback(async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      await updateData(sectionKey, draftRef.current);
      setIsDirty(false);
      setLastSaved(new Date());
      setSaveCount(c => c + 1);
      onSave?.();
    } catch (err) {
      console.warn(`Auto-save failed for ${sectionKey}:`, err);
    } finally {
      setSaving(false);
    }
  }, [sectionKey, updateData, isDirty, onSave]);

  // Debounced auto-save (prevents overlapping saves via savingRef)
  const savingRef = useRef(false);
  const updateDraft = useCallback((updater) => {
    setDraft(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
    setIsDirty(true);

    if (enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Prevent overlapping saves
        if (savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        updateData(sectionKey, draftRef.current)
          .then(() => {
            setIsDirty(false);
            setLastSaved(new Date());
            setSaveCount(c => c + 1);
            onSave?.();
          })
          .catch(err => console.warn(`Auto-save failed for ${sectionKey}:`, err))
          .finally(() => { setSaving(false); savingRef.current = false; });
      }, delay);
    }
  }, [sectionKey, updateData, delay, enabled, onSave]);

  // Cleanup timer on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Reset when source data changes externally (e.g. undo)
  const resetDraft = useCallback((newData) => {
    setDraft(deepClone ? JSON.parse(JSON.stringify(newData)) : { ...newData });
    setIsDirty(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [deepClone]);

  return {
    draft,
    setDraft: updateDraft,
    rawSetDraft: setDraft, // for cases where you don't want auto-save triggered
    isDirty,
    saving,
    lastSaved,
    saveCount,
    save,        // manual save
    resetDraft,  // reset to external data
  };
};

export default useAutoSave;
