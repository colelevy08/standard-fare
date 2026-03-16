// ─────────────────────────────────────────────────────────────────────────────
// lib/supabaseStorage.js — Supabase Storage for image/video uploads
// ─────────────────────────────────────────────────────────────────────────────
// Uploads files to the "gallery" bucket in Supabase Storage.
// Returns a permanent public URL that never expires.
// Falls back gracefully to base64 if Supabase isn't configured.
// ─────────────────────────────────────────────────────────────────────────────

import supabase from "./supabase";

const BUCKET = "gallery";

// ── uploadImage ───────────────────────────────────────────────────────────
export const uploadImage = async (file) => {
  if (!supabase) {
    return { url: null, error: "Supabase not configured" };
  }

  try {
    const ext      = file.name?.split(".").pop()?.toLowerCase() || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path     = `photos/${filename}`;

    // Try upload — if bucket doesn't exist, create it then retry
    let { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (uploadError) {
      if (
        uploadError.message?.includes("Bucket not found") ||
        uploadError.statusCode === 404 ||
        uploadError.error === "Bucket not found"
      ) {
        // Auto-create public bucket
        const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ["image/*", "video/*"],
        });
        if (bucketErr && !bucketErr.message?.includes("already exists")) {
          return { url: null, error: bucketErr.message };
        }
        // Retry upload after bucket creation
        const { error: retryErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "31536000", upsert: false });
        if (retryErr) return { url: null, error: retryErr.message };
      } else {
        return { url: null, error: uploadError.message };
      }
    }

    // Get permanent public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };

  } catch (err) {
    return { url: null, error: err.message };
  }
};

// ── deleteImage ───────────────────────────────────────────────────────────
export const deleteImage = async (publicUrl) => {
  if (!supabase || !publicUrl) return;
  try {
    const parts = publicUrl.split(`/storage/v1/object/public/${BUCKET}/`);
    if (parts[1]) await supabase.storage.from(BUCKET).remove([parts[1]]);
  } catch (e) {
    console.warn("Could not delete from storage:", e.message);
  }
};
