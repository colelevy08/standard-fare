// ─────────────────────────────────────────────────────────────────────────────
// pages/BlogPostPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Individual blog post view. Takes slug from URL params, finds the matching
// post in siteData.blog, and renders the full body with author/date/tags.
// Includes a "More Stories" section showing 2-3 other posts at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag, Share2, Link2, Check, X, ChefHat } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

// Helper: format "2026-03-15" → "March 15, 2026"
const formatDate = (dateStr) => {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// ── Related Post Card (compact) ───────────────────────────────────────────
const RelatedCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group flex flex-col bg-cream-warm border border-navy border-opacity-10 rounded-lg
               overflow-hidden hover:border-flamingo hover:shadow-lg transition-all duration-300"
  >
    {post.imageUrl && (
      <img
        src={post.imageUrl}
        alt={post.title}
        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
    )}
    <div className="p-5">
      <p className="font-mono text-xs text-navy opacity-40 mb-1">
        {formatDate(post.date)}
      </p>
      <h4 className="font-display text-navy text-base leading-snug group-hover:text-flamingo-dark transition-colors">
        {post.title}
      </h4>
      <p className="font-body text-navy opacity-50 text-xs mt-2 line-clamp-2">
        {post.excerpt}
      </p>
    </div>
  </Link>
);

// ── Chef Profile Card ───────────────────────────────────────────────────
const ChefProfileCard = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-navy bg-opacity-80 backdrop-blur-sm" />
    <div className="relative bg-cream rounded-xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose}
        className="absolute top-3 right-3 text-navy opacity-40 hover:opacity-100 hover:text-flamingo transition-all z-10">
        <X size={18} />
      </button>
      <div className="bg-navy p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-flamingo bg-opacity-20 flex items-center justify-center mx-auto mb-4">
          <ChefHat size={36} className="text-flamingo" />
        </div>
        <h3 className="font-display text-cream text-2xl">Chef Joe Michaud</h3>
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mt-1">Executive Chef</p>
      </div>
      <div className="p-6">
        <p className="font-body text-navy text-sm leading-relaxed opacity-80">
          Chef Joe Michaud leads the kitchen at Standard Fare, bringing years of culinary expertise
          to every dish. His commitment to quality sourcing, precise technique, and bold flavors
          defines the Standard Fare dining experience.
        </p>
        <p className="font-body text-navy text-sm leading-relaxed opacity-80 mt-3">
          Every blog post published on From the Kitchen is reviewed and approved by Chef Joe
          to ensure it reflects the standards and values of our kitchen.
        </p>
        <div className="mt-5 pt-4 border-t border-navy border-opacity-10">
          <Link to="/team" onClick={onClose}
            className="font-mono text-xs tracking-editorial uppercase text-flamingo hover:text-flamingo-dark transition-colors">
            Meet the Full Team &rarr;
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// ── Share Bar ───────────────────────────────────────────────────────────
const ShareBar = ({ title }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const text = `${title} — Standard Fare`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "X", href: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Check out this post from Standard Fare:\n\n${title}\n${url}`)}` },
  ];

  return (
    <div className="mt-10 pt-6 border-t border-navy border-opacity-10">
      <div className="flex items-center gap-2 mb-3">
        <Share2 size={14} className="text-flamingo" />
        <span className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50">
          Share This Post
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {shareLinks.map(({ label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            className="font-mono text-[11px] tracking-editorial uppercase bg-navy bg-opacity-5 text-navy opacity-60
                       hover:bg-flamingo hover:bg-opacity-10 hover:text-flamingo hover:opacity-100
                       px-4 py-2 rounded-full transition-all">
            {label}
          </a>
        ))}
        <button onClick={copyLink}
          className={`font-mono text-[11px] tracking-editorial uppercase px-4 py-2 rounded-full transition-all
            inline-flex items-center gap-1.5
            ${copied
              ? "bg-green-50 text-green-700 opacity-100"
              : "bg-navy bg-opacity-5 text-navy opacity-60 hover:bg-flamingo hover:bg-opacity-10 hover:text-flamingo hover:opacity-100"
            }`}>
          {copied ? <><Check size={11} />Copied!</> : <><Link2 size={11} />Copy Link</>}
        </button>
      </div>
    </div>
  );
};

// ── Main Blog Post Page ───────────────────────────────────────────────────
const BlogPostPage = () => {
  const { slug } = useParams();
  const { siteData, isAdmin } = useSite();
  const [showChefCard, setShowChefCard] = useState(false);
  const posts = siteData.blog || [];

  const post = posts.find((p) => p.slug === slug && (isAdmin || p.published !== false));

  // 404 state — post not found
  if (!post) {
    return (
      <PageLayout>
        <div className="bg-navy pt-32 pb-16 text-center">
          <h1 className="font-display text-cream text-4xl md:text-5xl">
            Post Not Found
          </h1>
          <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
        </div>
        <div className="section-padding bg-cream">
          <div className="section-container text-center py-16">
            <p className="font-body text-navy opacity-50 mb-6">
              The story you're looking for doesn't exist or may have been removed.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-body text-flamingo hover:text-flamingo-dark transition-colors"
            >
              <ArrowLeft size={16} />
              Back to all stories
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Get related posts (exclude current, take up to 3)
  const relatedPosts = posts
    .filter((p) => p.id !== post.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  return (
    <PageLayout>
      {/* ── Post Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-cream text-xs tracking-editorial uppercase
                     opacity-50 hover:opacity-100 hover:text-flamingo transition-all mb-6"
        >
          <ArrowLeft size={12} />
          Back to Stories
        </Link>

        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          From the Kitchen
        </p>

        <h1 className="font-display text-cream text-3xl md:text-5xl max-w-3xl mx-auto leading-tight px-4">
          {post.title}
        </h1>

        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-5" />

        {/* Date + Approved by Chef */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-2 font-body text-cream text-sm opacity-60">
            <Calendar size={14} className="text-flamingo" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-2 font-body text-cream text-sm opacity-60">
            <ChefHat size={14} className="text-flamingo" />
            Approved by{" "}
            <button onClick={() => setShowChefCard(true)}
              className="text-flamingo hover:text-flamingo-light transition-colors underline underline-offset-2 decoration-flamingo decoration-opacity-40">
              Chef Joe Michaud
            </button>
          </span>
        </div>
      </div>

      {/* Chef Profile Modal */}
      {showChefCard && <ChefProfileCard onClose={() => setShowChefCard(false)} />}

      {/* ── Post Body ──────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container max-w-3xl">
          {/* Hero image */}
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden -mt-8 shadow-lg">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Author byline + Meet the Founders */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {post.author && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-flamingo" />
                <span className="font-body text-navy text-sm">
                  <span className="font-bold">{post.author}</span>
                  {post.authorRole && (
                    <span className="opacity-50"> · {post.authorRole}</span>
                  )}
                </span>
              </div>
            )}
            <Link to="/team"
              className="font-mono text-[11px] tracking-editorial uppercase text-flamingo hover:text-flamingo-dark transition-colors">
              Meet the Founders &rarr;
            </Link>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className={`${post.author ? "mt-3" : "mt-5"} mb-10 flex flex-wrap items-center gap-2`}>
              <Tag size={12} className="text-flamingo opacity-60" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block font-mono text-[11px] tracking-editorial uppercase
                             bg-navy bg-opacity-5 text-navy opacity-60 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post content — renders newlines as paragraphs */}
          <article className="font-body text-navy text-base leading-relaxed space-y-5">
            {post.body
              ? post.body.split("\n").filter(Boolean).map((paragraph, i) => (
                  <p key={i} className="opacity-80">
                    {paragraph}
                  </p>
                ))
              : (
                <p className="opacity-60 italic">
                  {post.excerpt}
                </p>
              )}
          </article>

          {/* Share */}
          <ShareBar title={post.title} />

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-navy border-opacity-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 font-body text-flamingo hover:text-flamingo-dark transition-colors text-sm"
            >
              <ArrowLeft size={14} />
              Back to all stories
            </Link>
          </div>
        </div>
      </div>

      {/* ── More Stories ───────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <div className="section-padding bg-cream-warm border-t border-navy border-opacity-5">
          <div className="section-container">
            <h2 className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 mb-8 text-center">
              More Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <RelatedCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default BlogPostPage;
