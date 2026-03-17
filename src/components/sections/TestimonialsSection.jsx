// ─────────────────────────────────────────────────────────────────────────────
// components/sections/TestimonialsSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Displays Google reviews auto-pulled via /api/google-reviews, with fallback
// to manually entered reviews from the admin panel.
// Single scrollable row — max 6 cards, scroll arrows on hover.
// Click a card to read the full review in a popup modal.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from "react";
import { Star, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSite } from "../../context/AdminContext";
import useGoogleReviews from "../../hooks/useGoogleReviews";

const StarRating = ({ rating, size = 14 }) => {
  const full = Math.floor(rating);
  const partial = rating - full;
  const empty = 5 - full - (partial > 0 ? 1 : 0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: full }, (_, i) => (
        <Star key={`f${i}`} size={size} className="fill-flamingo text-flamingo" />
      ))}
      {partial > 0 && (
        <span key="p" className="relative inline-block" style={{ width: size, height: size }}>
          <Star size={size} className="text-flamingo opacity-30 absolute inset-0" />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${partial * 100}%` }}>
            <Star size={size} className="fill-flamingo text-flamingo" />
          </span>
        </span>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <Star key={`e${i}`} size={size} className="text-flamingo opacity-30" />
      ))}
    </div>
  );
};

/* ── Review Modal ─────────────────────────────────────────────────────────── */
const ReviewModal = ({ review, onClose }) => {
  if (!review) return null;
  const googleUrl = review.reviewUrl || "https://www.google.com/maps/place/Standard+Fare/reviews";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy bg-opacity-60 backdrop-blur-sm" />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 text-navy opacity-40 hover:opacity-80 transition-opacity">
          <X size={20} />
        </button>

        <StarRating rating={review.rating} size={18} />
        <p className="font-body text-navy text-base leading-relaxed mt-4">
          &ldquo;{review.text}&rdquo;
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="font-body text-navy font-bold text-sm">{review.name}</p>
            {review.relativeTime && (
              <p className="font-body text-navy opacity-40 text-xs mt-0.5">{review.relativeTime}</p>
            )}
          </div>
          <span className="font-mono text-xs text-navy opacity-30 uppercase">{review.source || "Google"}</span>
        </div>

        <a href={googleUrl} target="_blank" rel="noopener noreferrer"
          className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
            bg-navy bg-opacity-5 hover:bg-opacity-10 transition-colors text-navy font-body text-sm">
          <ExternalLink size={14} />
          View on Google
        </a>
      </div>
    </div>
  );
};

/* ── Review Card ──────────────────────────────────────────────────────────── */
const TestimonialCard = ({ review, onClick }) => (
  <div onClick={onClick}
    className="bg-white rounded-xl p-5 shadow-sm border border-navy border-opacity-5 flex flex-col h-full
      hover:border-flamingo hover:shadow-md transition-all cursor-pointer group">
    <StarRating rating={review.rating} />
    <p className="font-body text-navy opacity-70 text-sm leading-relaxed mt-3 flex-1 line-clamp-4">
      &ldquo;{review.text}&rdquo;
    </p>
    <div className="mt-3 flex items-center justify-between">
      <p className="font-body text-navy font-bold text-sm">{review.name}</p>
      <span className="font-mono text-xs text-navy opacity-30 uppercase">{review.source || "Google"}</span>
    </div>
  </div>
);

/* ── Section ──────────────────────────────────────────────────────────────── */
const TestimonialsSection = () => {
  const { siteData } = useSite();
  const { reviews: googleReviews, rating: scrapedRating, totalReviews: scrapedTotal } = useGoogleReviews();
  const manualReviews = siteData.testimonials || [];
  const scrollRef = useRef(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Admin-set rating/count override scraped values (scraped data is often stale)
  const adminRating = siteData.googleRating?.rating;
  const adminCount  = siteData.googleRating?.count;
  const rating       = adminRating ?? scrapedRating;
  const totalReviews = adminCount  ?? scrapedTotal;

  // Use Google reviews if available, otherwise fall back to manual
  const rawReviews = googleReviews.length > 0 ? googleReviews : manualReviews;

  // Soft-sort: reviews mentioning key staff float to front (not obvious to visitors)
  const reviews = [...rawReviews].sort((a, b) => {
    const aP = (a._mentionsCole || /\bcole\b/i.test(a.text)) ? 1 : 0;
    const bP = (b._mentionsCole || /\bcole\b/i.test(b.text)) ? 1 : 0;
    return bP - aP;
  });

  if (reviews.length === 0) return null;

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir * w * 0.8, behavior: "smooth" });
  };

  return (
    <section className="section-padding bg-cream">
      <div className="section-container">
        <div className="text-center mb-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
            What People Are Saying
          </p>
          <h2 className="font-display text-navy text-3xl md:text-4xl">Guest Reviews</h2>
          <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-4" />
          {/* Show aggregate rating from Google */}
          {rating && totalReviews > 0 && (
            <div className="flex items-center justify-center gap-3">
              <StarRating rating={rating} size={16} />
              <span className="font-body text-sm text-navy opacity-50">
                {rating.toFixed(1)} from {totalReviews} Google review{totalReviews !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="relative group/scroll">
          <button onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-navy bg-opacity-60 text-cream
              rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity
              hover:bg-opacity-80 -ml-2 touch-manipulation hidden sm:flex">
            <ChevronLeft size={20} />
          </button>
          <div ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory
              scrollbar-hide pb-2 -mx-1 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {reviews.slice(0, 12).map((review) => (
              <div key={review.id}
                className="flex-shrink-0 w-[280px] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] min-w-[260px] snap-start">
                <TestimonialCard review={review} onClick={() => setSelectedReview(review)} />
              </div>
            ))}
          </div>
          <button onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-navy bg-opacity-60 text-cream
              rounded-full flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity
              hover:bg-opacity-80 -mr-2 touch-manipulation hidden sm:flex">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Full review popup */}
      <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
    </section>
  );
};

export default TestimonialsSection;
