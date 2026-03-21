// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ImageUploader.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable image upload component used throughout the admin panel.
//
// THREE WAYS TO ADD AN IMAGE:
//   1. Click drop zone → opens file picker → uploads to Supabase Storage
//   2. Drag & drop a file onto the zone → uploads to Supabase Storage
//   3. Click "paste a URL" → type or paste any image URL directly
//
// PASTE BUG FIX:
//   The previous version had an onClick on the outer div that opened the file
//   picker, which intercepted clicks on child inputs (including the URL field).
//   Fixed by only triggering the file picker when clicking the drop zone itself,
//   not any child elements — and by stopping propagation on the URL input area.
//
// STORAGE:
//   If Supabase is configured (.env has REACT_APP_SUPABASE_ANON_KEY), files are
//   uploaded to Supabase Storage and a permanent public URL is returned.
//   If Supabase is not configured, falls back to base64 (stored inline in JSON).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from "react";
import { Upload, X, Link, Loader, Image } from "lucide-react";
import { uploadImage } from "../../lib/supabaseStorage";
import resizeImage from "../../lib/imageResize";
import MediaLibrary from "./MediaLibrary";

const ImageUploader = ({ value, onChange, label = "Image", height = "h-40" }) => {
  const fileInputRef              = useRef(null);
  const [dragging,  setDragging]  = useState(false);
  const [showUrl,   setShowUrl]   = useState(false);
  const [urlValue,  setUrlValue]  = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);

  // ── Handle file — upload to Supabase Storage or fall back to base64 ──────
  const handleFile = async (file) => {
    if (!file) return;
    // Accept images, GIFs, and videos
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setUploadErr("Please select an image, GIF, or video file.");
      return;
    }
    setUploadErr("");
    setUploading(true);

    // Resize large images before upload (caps at 1800px, JPEG 85%)
    const processedFile = await resizeImage(file);

    // Try Supabase Storage first
    const { url } = await uploadImage(processedFile);

    if (url) {
      // Got a permanent Supabase Storage URL
      onChange(url);
    } else {
      // Supabase not configured or failed — fall back to base64
      if (file.size > 2 * 1024 * 1024) {
        const ok = window.confirm(
          `This image is ${(file.size / 1024 / 1024).toFixed(1)}MB. ` +
          `Large images increase storage size. Use an image under 1MB for best results. Continue?`
        );
        if (!ok) { setUploading(false); return; }
      }
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target.result);
      reader.readAsDataURL(file);
    }
    setUploading(false);
  };

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // Only open file picker when clicking the drop zone directly, not child elements
  const handleZoneClick = (e) => {
    // Don't trigger if click originated from the URL section or a button inside
    if (e.target.closest('[data-no-filepicker]')) return;
    fileInputRef.current?.click();
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setShowUrl(false);
      setUrlValue("");
    }
  };

  const isBase64 = value && value.startsWith("data:");
  const isSupabase = value && value.includes("supabase");

  return (
    <div className="mb-4">
      {/* Label */}
      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
        {label}
      </label>

      {/* Current image preview */}
      {value && (
        <div className="relative mb-2 group">
          <img
            src={value}
            alt={label}
            className={`w-full ${height} object-cover rounded border border-navy border-opacity-10`}
          />
          <span className="absolute top-2 left-2 text-xs font-mono bg-navy text-cream px-2 py-0.5 rounded opacity-80">
            {isSupabase ? "☁️ Supabase" : isBase64 ? "📁 Uploaded" : "🔗 URL"}
          </span>
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-flamingo text-cream rounded-full p-1
                       opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
          ${dragging
            ? "border-flamingo bg-flamingo bg-opacity-5"
            : "border-navy border-opacity-20 hover:border-flamingo hover:bg-flamingo hover:bg-opacity-5"
          }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader size={20} className="text-flamingo animate-spin" />
            <p className="font-body text-xs text-navy opacity-50">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload size={20} className="text-flamingo mx-auto mb-2 opacity-60" />
            <p className="font-body text-xs text-navy opacity-50">
              {value ? "Replace image — click or drag & drop" : "Click to upload or drag & drop"}
            </p>
            <p className="font-body text-xs text-navy opacity-30 mt-1">
              JPG · PNG · GIF · WebP · MP4 · WebM
            </p>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.gif,.mp4,.webm,.mov"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload error */}
      {uploadErr && (
        <p className="font-body text-xs text-flamingo-dark mt-1">{uploadErr}</p>
      )}

      {/* URL paste + Browse library — data-no-filepicker prevents zone click */}
      <div data-no-filepicker onClick={(e) => e.stopPropagation()}>
        {!showUrl ? (
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowUrl(true)}
              className="flex items-center gap-1 font-body text-xs text-navy opacity-40
                         hover:opacity-70 transition-opacity"
            >
              <Link size={12} />
              Paste URL
            </button>
            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-1 font-body text-xs text-flamingo opacity-70
                         hover:opacity-100 transition-opacity"
            >
              <Image size={12} />
              Browse uploads
            </button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              placeholder="https://example.com/photo.jpg"
              className="form-input text-base py-2 flex-1"
              autoFocus
              // Explicitly allow paste — stops event from bubbling to the drop zone
              onPaste={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="btn-primary py-2 px-4 text-xs flex-shrink-0"
            >
              Use URL
            </button>
            <button
              type="button"
              onClick={() => { setShowUrl(false); setUrlValue(""); }}
              className="text-navy opacity-40 hover:opacity-70 px-2"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Media Library modal */}
      <MediaLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
};

export default ImageUploader;
