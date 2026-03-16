// ─────────────────────────────────────────────────────────────────────────────
// hooks/useInstagramPhoto.js
// ─────────────────────────────────────────────────────────────────────────────
// Returns the image URL for a gallery photo.
// Priority: photo.url (stored in siteData) → fallback null (shows placeholder)
//
// The previous approach of fetching Instagram on-the-fly via a proxy was
// unreliable. The correct approach is to store the image URL directly in
// siteData (via the admin panel) where it persists in Supabase.
//
// In the admin gallery editor, each photo has a "Fetch from Instagram" button
// that opens the post so the admin can copy the image URL.
// ─────────────────────────────────────────────────────────────────────────────

// This hook is now a simple pass-through — it just returns the stored URL.
// Keeping it as a hook so the gallery components don't need to change their API.
const useInstagramPhoto = (postId, storedUrl) => {
  return {
    imageUrl: storedUrl || null,
    loading: false,
    error: null,
  };
};

export default useInstagramPhoto;
