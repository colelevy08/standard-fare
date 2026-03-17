// ─────────────────────────────────────────────────────────────────────────────
// pages/GalleryPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Gallery / Paintings page supporting:
//   • Images (JPG, PNG, WebP)
//   • Animated GIFs
//   • Videos (MP4, WebM) — play on hover, pause on mouse leave
//   • Optional Instagram link — shows "See on Instagram" overlay on hover
//   • Optional comment displayed beneath each item
//   • Click opens item fullscreen (lightbox) or Instagram link if set
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from "react";
import { Instagram, X, ExternalLink, ImageOff } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import useInstagramFeed from "../hooks/useInstagramFeed";

// Detect media type from URL or stored type field
const getMediaType = (item) => {
  if (item.mediaType) return item.mediaType; // Explicit type set by admin
  const url = (item.url || "").toLowerCase();
  if (url.match(/\.(mp4|webm|ogg|mov)$/)) return "video";
  if (url.match(/\.gif$/)) return "gif";
  return "image";
};

// ── Video item — plays on hover ───────────────────────────────────────────
const VideoItem = ({ src, alt }) => {
  const videoRef = useRef(null);
  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full object-cover"
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; }}
    />
  );
};

// ── Lightbox — full-screen media viewer ───────────────────────────────────
const Lightbox = ({ item, onClose }) => {
  if (!item) return null;
  const type = getMediaType(item);

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-5 right-5 text-cream opacity-60 hover:opacity-100 transition-opacity p-2">
        <X size={28} />
      </button>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        {type === "video" ? (
          <video src={item.url} controls autoPlay muted loop playsInline
            className="w-full max-h-[85vh] object-contain rounded" />
        ) : (
          <img src={item.url} alt={item.alt || "Gallery"}
            className="w-full max-h-[85vh] object-contain rounded" />
        )}
        {item.comment && (
          <p className="text-center text-cream opacity-60 font-body text-sm mt-4 leading-relaxed">
            {item.comment}
          </p>
        )}
        {item.instagramUrl && (
          <div className="text-center mt-3">
            <a href={item.instagramUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-xs text-flamingo hover:text-flamingo-light transition-colors">
              <Instagram size={13} /> See on Instagram
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Single Gallery Card ───────────────────────────────────────────────────
const GalleryCard = ({ item, onClick }) => {
  const type = getMediaType(item);
  const hasInstagram = !!item.instagramUrl;

  return (
    <div className="break-inside-avoid mb-4">
      {/* Media wrapper */}
      <div
        className="relative overflow-hidden rounded shadow-md group cursor-pointer bg-navy-light"
        onClick={() => onClick(item)}
      >
        {/* ── Media content ──────────────────────────── */}
        {item.url ? (
          type === "video" ? (
            <VideoItem src={item.url} alt={item.alt} />
          ) : (
            // Images and GIFs — GIFs animate naturally as <img>
            <img
              src={item.url}
              alt={item.alt || "Standard Fare"}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105 block"
              loading="lazy"
            />
          )
        ) : (
          // Placeholder — no media uploaded yet
          <div className="w-full aspect-square flex flex-col items-center justify-center gap-2 bg-navy">
            <ImageOff size={24} className="text-cream opacity-20" />
            <p className="font-mono text-cream opacity-20 text-xs text-center px-4">
              {item.caption || "No media uploaded"}
            </p>
          </div>
        )}

        {/* ── Hover overlay ──────────────────────────── */}
        <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-50
                        transition-all duration-300 flex flex-col items-center justify-center gap-2">
          {hasInstagram ? (
            // Instagram link indicator
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            flex items-center gap-2 bg-black bg-opacity-60 rounded-full px-4 py-2">
              <Instagram size={14} className="text-cream" />
              <span className="font-body text-cream text-xs font-medium">See on Instagram</span>
            </div>
          ) : (
            // Generic expand indicator
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ExternalLink size={20} className="text-cream opacity-70" />
            </div>
          )}
        </div>
      </div>

      {/* ── Comment beneath the photo ──────────────── */}
      {item.comment && (
        <p className="font-body text-navy opacity-60 text-xs leading-relaxed mt-2 px-1">
          {item.comment}
        </p>
      )}
    </div>
  );
};

// ── Gallery Page ──────────────────────────────────────────────────────────
const GalleryPage = () => {
  const { siteData, updateData } = useSite();
  const photos = siteData.gallery || [];
  const manualFeed = siteData.instagramFeed || [];
  const { posts: igFeed } = useInstagramFeed(manualFeed, updateData);
  const [lightboxItem, setLightboxItem] = useState(null);

  // Click handler: if item has Instagram URL open that, else open lightbox
  const handleClick = (item) => {
    if (item.instagramUrl) {
      window.open(item.instagramUrl, "_blank", "noopener,noreferrer");
    } else {
      setLightboxItem(item);
    }
  };

  return (
    <PageLayout>
      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />

      {/* Page header */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          From Our Table to Yours
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Gallery</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-4" />
        <a href={siteData.links.instagram} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-body text-sm text-cream opacity-60
                     hover:opacity-100 hover:text-flamingo transition-all">
          <Instagram size={14} />@standardfaresaratoga
        </a>
      </div>

      {/* Instagram Feed — 3 most recent posts, auto-refreshed every 12 hours */}
      {igFeed.length > 0 && (
        <div className="bg-cream pt-12 pb-4">
          <div className="section-container">
            <div className="flex flex-col items-center gap-1 mb-6">
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-flamingo" />
                <p className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50">
                  Latest from Instagram
                </p>
              </div>
              <p className="font-body text-[11px] text-navy opacity-35">
                Our 3 most recent posts &middot; updated automatically
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {igFeed.map((post) => (
                <a key={post.id} href={post.postUrl || siteData.links.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-lg aspect-square bg-navy-light">
                  <img src={post.imageUrl} alt={post.caption || "Instagram post"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy" />
                  <div className="absolute inset-0 bg-navy bg-opacity-0 group-hover:bg-opacity-40
                                  transition-all duration-300 flex items-center justify-center">
                    <Instagram size={24} className="text-cream opacity-0 group-hover:opacity-90 transition-opacity" />
                  </div>
                  {post.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3
                                    opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-body text-cream text-xs line-clamp-2">{post.caption}</p>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          {photos.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-body text-navy opacity-40">No photos yet — add them in the admin panel.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {photos.map((item) => (
                <GalleryCard key={item.id} item={item} onClick={handleClick} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <a href={siteData.links.instagram} target="_blank" rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2">
              <Instagram size={16} />Follow @standardfaresaratoga
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default GalleryPage;
