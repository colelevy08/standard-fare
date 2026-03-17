// ─────────────────────────────────────────────────────────────────────────────
// pages/BlogPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// "From the Kitchen" blog listing page. Displays a grid of blog post cards
// sourced from siteData.blog. Each card links to the individual post view
// at /blog/:slug.
//
// Admin can add/edit/delete blog posts in the /admin panel.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag } from "lucide-react";
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

// ── Blog Post Card ────────────────────────────────────────────────────────
const BlogCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group flex flex-col bg-cream-warm border border-navy border-opacity-10 rounded-lg
               overflow-hidden hover:border-flamingo hover:shadow-lg transition-all duration-300"
  >
    {/* Post image */}
    {post.imageUrl && (
      <div className="overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
    )}

    {/* Post details */}
    <div className="p-6 flex flex-col flex-1">
      {/* Date + Author */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 font-mono text-xs text-navy opacity-50">
          <Calendar size={12} className="text-flamingo" />
          {formatDate(post.date)}
        </span>
        {post.author && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-navy opacity-50">
            <User size={12} className="text-flamingo" />
            {post.author}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-display text-navy text-lg leading-snug mb-2 group-hover:text-flamingo-dark transition-colors">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="font-body text-navy opacity-60 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
        {post.excerpt}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 font-mono text-[10px] tracking-editorial uppercase
                         bg-navy bg-opacity-5 text-navy opacity-60 px-2 py-0.5 rounded-full"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Read More */}
      <span className="font-body text-xs text-flamingo font-medium group-hover:text-flamingo-dark transition-colors mt-auto">
        Read More &rarr;
      </span>
    </div>
  </Link>
);

// ── Main Blog Page ────────────────────────────────────────────────────────
const BlogPage = () => {
  const { siteData, isAdmin } = useSite();
  const posts = siteData.blog || [];

  // Sort posts by date, newest first — hide drafts from non-admin visitors
  const sortedPosts = [...posts]
    .filter((p) => isAdmin || p.published !== false)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <PageLayout>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          From the Kitchen
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">
          Stories &amp; Updates
        </h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      {/* ── Blog Grid ──────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          {sortedPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-navy text-2xl opacity-40 mb-3">
                No stories yet
              </p>
              <p className="font-body text-navy opacity-30 text-sm">
                Check back soon — we have plenty to share from the kitchen!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default BlogPage;
