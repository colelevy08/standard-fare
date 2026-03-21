// ─────────────────────────────────────────────────────────────────────────────
// components/ui/MediaLibrary.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal overlay showing all images previously uploaded to Supabase Storage.
// Click an image to select it and return its URL to the parent.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Search, Trash2, Image, Loader, AlertCircle } from "lucide-react";
import { listImages, deleteImage } from "../../lib/supabaseStorage";

const MediaLibrary = ({ isOpen, onClose, onSelect }) => {
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [deleting, setDeleting]   = useState(null); // filename being deleted
  const [confirmDel, setConfirmDel] = useState(null); // filename pending confirmation
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { images: imgs, error: err } = await listImages();
    if (err) setError(err);
    setImages(imgs);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      load();
      // Focus search after a tick
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, load]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleDelete = async (img) => {
    setDeleting(img.name);
    await deleteImage(img.url);
    setImages((prev) => prev.filter((i) => i.name !== img.name));
    setDeleting(null);
    setConfirmDel(null);
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  const filtered = search
    ? images.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : images;

  return (
    <div
      className="fixed inset-0 z-50 bg-navy bg-opacity-60 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Media Library"
    >
      <div
        className="bg-cream rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-navy border-opacity-10">
          <div className="flex items-center gap-3">
            <Image size={20} className="text-flamingo" />
            <h2 className="font-display text-navy text-xl">Media Library</h2>
            <span className="font-mono text-xs text-navy opacity-40">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-navy opacity-40 hover:opacity-80 transition-opacity p-1"
            aria-label="Close media library"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="px-5 py-3 border-b border-navy border-opacity-10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search uploads..."
              className="w-full font-body text-sm pl-9 pr-4 py-2 rounded-lg border border-navy border-opacity-15
                         focus:border-flamingo focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* ── Grid ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader size={24} className="text-flamingo animate-spin" />
              <p className="font-body text-sm text-navy opacity-40">Loading uploads...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle size={24} className="text-flamingo" />
              <p className="font-body text-sm text-navy opacity-60">{error}</p>
              <button onClick={load} className="font-mono text-xs text-flamingo hover:underline">
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Image size={32} className="text-navy opacity-20" />
              <p className="font-body text-sm text-navy opacity-40">
                {search ? "No images match your search." : "No images uploaded yet."}
              </p>
              <p className="font-body text-xs text-navy opacity-30">
                Upload images from any editor section — they'll appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((img) => (
                <div key={img.name} className="group relative">
                  {/* Image thumbnail — click to select */}
                  <button
                    onClick={() => { onSelect(img.url); onClose(); }}
                    className="w-full aspect-square rounded-lg overflow-hidden border-2 border-transparent
                               hover:border-flamingo transition-all focus:outline-none focus:border-flamingo"
                    title={`Select ${img.name}`}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>

                  {/* File info overlay on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-navy bg-opacity-70 text-cream
                                  text-[9px] font-mono px-2 py-1 rounded-b-lg opacity-0
                                  group-hover:opacity-100 transition-opacity pointer-events-none truncate">
                    {formatSize(img.size)}
                  </div>

                  {/* Delete button */}
                  {confirmDel === img.name ? (
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => handleDelete(img)}
                        disabled={deleting === img.name}
                        className="bg-red-500 text-white text-[9px] font-mono px-2 py-0.5 rounded
                                   hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleting === img.name ? "..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDel(null)}
                        className="bg-navy bg-opacity-60 text-white text-[9px] font-mono px-2 py-0.5 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDel(img.name); }}
                      className="absolute top-1 right-1 bg-navy bg-opacity-50 text-white rounded-full p-1
                                 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      title="Delete image"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-navy border-opacity-10 flex items-center justify-between">
          <p className="font-body text-xs text-navy opacity-40">
            Click an image to use it. Upload new images from any editor section.
          </p>
          <button
            onClick={onClose}
            className="font-mono text-xs text-navy opacity-50 hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
