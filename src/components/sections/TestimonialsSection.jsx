// ─────────────────────────────────────────────────────────────────────────────
// components/sections/TestimonialsSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Displays Google reviews auto-pulled via /api/google-reviews, with fallback
// to manually entered reviews from the admin panel.
// Single scrollable row — max 6 cards, scroll arrows on hover.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from "react";
import { Star, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useSite } from "../../context/AdminContext";
import useGoogleReviews from "../../hooks/useGoogleReviews";

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: rating }, (_, i) => (
      <Star key={i} size={14} className="fill-flamingo text-flamingo" />
    ))}
  </div>
);

const TestimonialCard = ({ review }) => {
  const hasLink = review.reviewUrl || review.profileUrl;
  const href = review.reviewUrl || review.profileUrl;
  const Wrapper = hasLink ? "a" : "div";
  const linkProps = hasLink
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper {...linkProps}
      className={`bg-white rounded-xl p-5 shadow-sm border border-navy border-opacity-5 flex flex-col h-full
        ${hasLink ? "hover:border-flamingo hover:shadow-md transition-all cursor-pointer group" : ""}`}>
      <StarRating rating={review.rating} />
      <p className="font-body text-navy opacity-70 text-sm leading-relaxed mt-3 flex-1 line-clamp-4">
        &ldquo;{review.text}&rdquo;
      </p>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-body text-navy font-bold text-sm">{review.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-navy opacity-30 uppercase">{review.source || "Google"}</span>
          {hasLink && (
            <ExternalLink size={12} className="text-navy opacity-0 group-hover:opacity-40 transition-opacity" />
          )}
        </div>
      </div>
    </Wrapper>
  );
};

const TestimonialsSection = () => {
  const { siteData } = useSite();
  const { reviews: googleReviews, rating, totalReviews } = useGoogleReviews();
  const manualReviews = siteData.testimonials || [];
  const scrollRef = useRef(null);

  // Use Google reviews if available, otherwise fall back to manual
  const reviews = googleReviews.length > 0 ? googleReviews : manualReviews;

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
          {/* Show aggregate rating if available from Google */}
          {rating && totalReviews > 0 && (
            <div className="flex items-center justify-center gap-3">
              <StarRating rating={Math.round(rating)} />
              <span className="font-body text-sm text-navy opacity-50">
                {rating.toFixed(1)} stars from {totalReviews} Google reviews
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
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id}
                className="flex-shrink-0 w-[280px] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] min-w-[260px] snap-start">
                <TestimonialCard review={review} />
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
    </section>
  );
};

export default TestimonialsSection;
