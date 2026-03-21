// ─────────────────────────────────────────────────────────────────────────────
// components/admin/AnalyticsDashboard.jsx — Content analytics overview
// ─────────────────────────────────────────────────────────────────────────────
// Shows content health metrics, completeness scores, and content insights
// for the admin to understand what needs attention.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from "react";
import {
  BarChart3, TrendingUp, AlertTriangle, CheckCircle,
  Image, FileText, Calendar, ShoppingBag, Star,
} from "lucide-react";

const ProgressBar = ({ value, max, color = "bg-flamingo" }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 bg-navy bg-opacity-10 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const StatCard = ({ icon, label, value, sublabel, color = "text-flamingo" }) => (
  <div className="bg-cream-warm rounded-lg p-4">
    <div className={`${color} opacity-60 mb-2`}>{icon}</div>
    <p className="font-display text-navy text-2xl">{value}</p>
    <p className="font-mono text-[9px] tracking-editorial uppercase text-navy opacity-30">{label}</p>
    {sublabel && <p className="font-body text-[10px] text-navy opacity-40 mt-1">{sublabel}</p>}
  </div>
);

const AnalyticsDashboard = ({ siteData }) => {
  const insights = useMemo(() => {
    const events = siteData.events || [];
    const blog = siteData.blog || [];
    const gallery = siteData.gallery || [];
    const prints = siteData.prints || [];
    const merch = siteData.merch || [];
    const bottles = siteData.bottles || [];
    const testimonials = siteData.testimonials || [];
    const press = siteData.press || [];
    const faq = siteData.faq || [];
    const menus = siteData.menus || {};
    const specials = siteData.specials || [];

    const now = new Date();

    // Events insights
    const upcomingEvents = events.filter(e => e.date && new Date(e.date + "T23:59:59") >= now);
    const pastEvents = events.filter(e => e.date && new Date(e.date + "T23:59:59") < now);
    const eventsWithImages = events.filter(e => e.imageUrl).length;
    const eventsWithDescriptions = events.filter(e => e.description?.length > 20).length;

    // Blog insights
    const publishedPosts = blog.filter(p => p.published !== false);
    const draftPosts = blog.filter(p => p.published === false);
    const postsWithImages = blog.filter(p => p.imageUrl).length;
    const postsWithTags = blog.filter(p => p.tags?.length > 0).length;
    const avgWordCount = blog.length > 0
      ? Math.round(blog.reduce((sum, p) => sum + (p.body || "").split(/\s+/).filter(Boolean).length, 0) / blog.length)
      : 0;

    // Gallery insights
    const galleryWithAlt = gallery.filter(g => g.alt?.length > 3).length;
    const galleryWithInstagram = gallery.filter(g => g.instagramUrl).length;

    // Commerce insights
    const availablePrints = prints.filter(p => p.available).length;
    const availableMerch = merch.filter(m => m.available && !m.draft).length;
    const publishedBottles = bottles.filter(b => !b.draft).length;
    const totalRevenuePotential = [
      ...prints.filter(p => p.available).map(p => p.price || 0),
      ...merch.filter(m => m.available).map(m => m.price || 0),
      ...bottles.filter(b => !b.draft && b.available).map(b => b.price || 0),
    ].reduce((sum, p) => sum + p, 0);

    // Menu insights
    const menuSections = Object.values(menus);
    const totalMenuItems = menuSections.reduce((sum, m) =>
      sum + (m.sections || []).reduce((s, sec) => s + (sec.items || []).length, 0), 0);
    const gfItems = menuSections.reduce((sum, m) =>
      sum + (m.sections || []).reduce((s, sec) => s + (sec.items || []).filter(i => i.gf).length, 0), 0);
    const vegItems = menuSections.reduce((sum, m) =>
      sum + (m.sections || []).reduce((s, sec) => s + (sec.items || []).filter(i => i.veg).length, 0), 0);
    const itemsWithPrices = menuSections.reduce((sum, m) =>
      sum + (m.sections || []).reduce((s, sec) => s + (sec.items || []).filter(i => i.price).length, 0), 0);

    // Review insights
    const avgRating = testimonials.length > 0
      ? (testimonials.reduce((sum, r) => sum + (r.rating || 0), 0) / testimonials.length).toFixed(1)
      : "—";
    const fiveStarPct = testimonials.length > 0
      ? Math.round((testimonials.filter(r => r.rating === 5).length / testimonials.length) * 100)
      : 0;

    // Content health issues
    const issues = [];
    if (upcomingEvents.length === 0) issues.push({ severity: "warn", text: "No upcoming events scheduled" });
    if (pastEvents.length > upcomingEvents.length * 2) issues.push({ severity: "info", text: `${pastEvents.length} past events could be archived` });
    if (events.some(e => !e.imageUrl)) issues.push({ severity: "warn", text: `${events.filter(e => !e.imageUrl).length} event(s) missing photos` });
    if (draftPosts.length > 0) issues.push({ severity: "info", text: `${draftPosts.length} draft blog post(s) unpublished` });
    if (blog.some(p => !p.imageUrl)) issues.push({ severity: "warn", text: `${blog.filter(p => !p.imageUrl).length} blog post(s) missing cover image` });
    if (gallery.length < 6) issues.push({ severity: "warn", text: "Gallery has fewer than 6 items" });
    if (galleryWithAlt < gallery.length * 0.5) issues.push({ severity: "info", text: `${gallery.length - galleryWithAlt} gallery items missing alt text (hurts SEO)` });
    if (faq.length < 5) issues.push({ severity: "info", text: "Consider adding more FAQ items (great for SEO)" });
    if (specials.filter(s => s.active).length === 0) issues.push({ severity: "info", text: "No active daily specials" });
    if (merch.some(m => m.draft)) issues.push({ severity: "info", text: `${merch.filter(m => m.draft).length} merch item(s) still in draft` });
    if (bottles.some(b => b.draft)) issues.push({ severity: "info", text: `${bottles.filter(b => b.draft).length} bottle(s) still in draft` });

    // Completeness score (0-100)
    const checks = [
      events.length > 0, upcomingEvents.length > 0, eventsWithImages >= events.length * 0.7,
      blog.length > 0, postsWithImages >= blog.length * 0.7, postsWithTags >= blog.length * 0.5,
      gallery.length >= 6, galleryWithAlt >= gallery.length * 0.5,
      prints.length > 0, merch.length > 0, bottles.length > 0,
      testimonials.length >= 5, press.length >= 3, faq.length >= 5,
      totalMenuItems >= 10, specials.length > 0,
      siteData.about?.body?.length > 50, (siteData.about?.team || []).length >= 2,
      siteData.heroSlides?.length >= 2, siteData.location?.phone,
    ];
    const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    return {
      events: { total: events.length, upcoming: upcomingEvents.length, past: pastEvents.length, withImages: eventsWithImages, withDescriptions: eventsWithDescriptions },
      blog: { total: blog.length, published: publishedPosts.length, drafts: draftPosts.length, withImages: postsWithImages, withTags: postsWithTags, avgWordCount },
      gallery: { total: gallery.length, withAlt: galleryWithAlt, withInstagram: galleryWithInstagram },
      commerce: { prints: prints.length, availablePrints, merch: merch.length, availableMerch, bottles: bottles.length, publishedBottles, revenuePotential: totalRevenuePotential },
      menus: { total: totalMenuItems, gf: gfItems, veg: vegItems, withPrices: itemsWithPrices },
      reviews: { total: testimonials.length, avgRating, fiveStarPct },
      press: { total: press.length },
      faq: { total: faq.length },
      issues,
      completeness,
    };
  }, [siteData]);

  return (
    <div>
      {/* Completeness score */}
      <div className="mb-6 p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BarChart3 size={18} className="text-flamingo" />
            <div>
              <p className="font-display text-navy text-lg">Content Health</p>
              <p className="font-mono text-[10px] text-navy opacity-30">Overall site completeness score</p>
            </div>
          </div>
          <span className={`font-display text-3xl ${
            insights.completeness >= 80 ? "text-green-600" : insights.completeness >= 50 ? "text-amber-600" : "text-red-500"
          }`}>
            {insights.completeness}%
          </span>
        </div>
        <ProgressBar value={insights.completeness} max={100}
          color={insights.completeness >= 80 ? "bg-green-500" : insights.completeness >= 50 ? "bg-amber-500" : "bg-red-500"} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Calendar size={16} />} label="Events" value={insights.events.total}
          sublabel={`${insights.events.upcoming} upcoming`} />
        <StatCard icon={<FileText size={16} />} label="Blog Posts" value={insights.blog.total}
          sublabel={`${insights.blog.published} published`} />
        <StatCard icon={<Image size={16} />} label="Gallery" value={insights.gallery.total}
          sublabel={`${insights.gallery.withAlt} with alt text`} />
        <StatCard icon={<ShoppingBag size={16} />} label="Products" value={insights.commerce.prints + insights.commerce.merch + insights.commerce.bottles}
          sublabel={`$${insights.commerce.revenuePotential.toLocaleString()} potential`} />
        <StatCard icon={<Star size={16} />} label="Reviews" value={insights.reviews.total}
          sublabel={`${insights.reviews.avgRating} avg · ${insights.reviews.fiveStarPct}% 5-star`} />
        <StatCard icon={<TrendingUp size={16} />} label="Menu Items" value={insights.menus.total}
          sublabel={`${insights.menus.gf} GF · ${insights.menus.veg} V`} />
        <StatCard icon={<FileText size={16} />} label="Press" value={insights.press.total} />
        <StatCard icon={<FileText size={16} />} label="FAQ" value={insights.faq.total} />
      </div>

      {/* Content issues */}
      {insights.issues.length > 0 && (
        <div className="border border-navy border-opacity-10 rounded-xl p-5">
          <p className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 mb-3 flex items-center gap-2">
            <AlertTriangle size={13} /> Content Issues ({insights.issues.length})
          </p>
          <div className="space-y-2">
            {insights.issues.map((issue, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg ${
                issue.severity === "warn" ? "bg-amber-50" : "bg-navy bg-opacity-[0.03]"
              }`}>
                <span className={`mt-0.5 flex-shrink-0 ${issue.severity === "warn" ? "text-amber-500" : "text-navy opacity-30"}`}>
                  {issue.severity === "warn" ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                </span>
                <p className={`font-body text-xs ${issue.severity === "warn" ? "text-amber-700" : "text-navy opacity-50"}`}>
                  {issue.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog insights detail */}
      {insights.blog.total > 0 && (
        <div className="mt-4 p-4 bg-cream-warm rounded-lg border border-navy border-opacity-10">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3">Blog Insights</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <p className="font-display text-navy text-lg">{insights.blog.avgWordCount}</p>
              <p className="font-mono text-[8px] text-navy opacity-25">Avg Words/Post</p>
            </div>
            <div>
              <p className="font-display text-navy text-lg">{insights.blog.withImages}</p>
              <p className="font-mono text-[8px] text-navy opacity-25">With Cover Image</p>
            </div>
            <div>
              <p className="font-display text-navy text-lg">{insights.blog.withTags}</p>
              <p className="font-mono text-[8px] text-navy opacity-25">With Tags</p>
            </div>
            <div>
              <p className="font-display text-navy text-lg">{insights.blog.drafts}</p>
              <p className="font-mono text-[8px] text-navy opacity-25">Drafts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
