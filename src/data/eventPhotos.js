// ─────────────────────────────────────────────────────────────────────────────
// data/eventPhotos.js
// ─────────────────────────────────────────────────────────────────────────────
// 50 unique Unsplash photos for events without a custom image.
// Admin can override these via siteData.stockPhotos.events.
// Uses a deterministic hash of the event ID so each event always gets the same
// photo, and no two events share one (unless there are 50+ without images).
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_EVENT_PHOTOS = [
  // Fine dining & plated dishes
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",

  // Wine & cocktails
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
  "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
  "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800&q=80",
  "https://images.unsplash.com/photo-1569950044272-e04b4b26300a?w=800&q=80",
  "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80",
  "https://images.unsplash.com/photo-1566995541428-f4e21d6e4972?w=800&q=80",
  "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800&q=80",
  "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80",
  "https://images.unsplash.com/photo-1582819509237-d5b75f20ff7a?w=800&q=80",

  // Restaurant interiors & ambiance
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800&q=80",
  "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&q=80",
  "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&q=80",
  "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&q=80",
  "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&q=80",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80",
  "https://images.unsplash.com/photo-1525610553eeb-c451082c44f4?w=800&q=80",
  "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",
  "https://images.unsplash.com/photo-1560053608-13721e0d69e8?w=800&q=80",

  // Chef & kitchen
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
  "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=800&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80",
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
  "https://images.unsplash.com/photo-1543353071-087092ec169a?w=800&q=80",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&q=80",

  // Celebration & gatherings
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80",
  "https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=800&q=80",
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
  "https://images.unsplash.com/photo-1485872299829-c44036b5cef4?w=800&q=80",
  "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
  "https://images.unsplash.com/photo-1536392706976-e486e898f3ad?w=800&q=80",
  "https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800&q=80",
];

/**
 * Returns a deterministic placeholder photo URL for an event.
 * Tracks used indices across calls to guarantee no two events in the same
 * render cycle share a photo. Resets each time the page mounts.
 *
 * @param {number|string} eventId - The event's unique ID
 * @param {string[]} [adminPhotos] - Optional admin-provided stock photo URLs
 */
const usedIndices = new Map(); // eventId → index
let activePool = null; // admin override pool

/** Set the active stock photo pool (call before rendering events) */
export const setStockPhotoPool = (photos) => { activePool = photos?.length > 0 ? photos : null; };

export const getEventPhoto = (eventId, adminPhotos) => {
  const pool = adminPhotos?.length > 0 ? adminPhotos : (activePool || DEFAULT_EVENT_PHOTOS);

  // Return cached result if we already assigned this event
  if (usedIndices.has(eventId)) {
    const idx = usedIndices.get(eventId);
    return pool[idx % pool.length];
  }

  // Deterministic starting point from event ID
  const str = String(eventId);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  let idx = Math.abs(hash) % pool.length;

  // If that index is taken, walk forward to find an unused one
  const taken = new Set(usedIndices.values());
  let attempts = 0;
  while (taken.has(idx) && attempts < pool.length) {
    idx = (idx + 1) % pool.length;
    attempts++;
  }

  usedIndices.set(eventId, idx);
  return pool[idx];
};

/** Reset tracking (call on unmount or when event list changes) */
export const resetEventPhotos = () => usedIndices.clear();

export { DEFAULT_EVENT_PHOTOS };
export default DEFAULT_EVENT_PHOTOS;
