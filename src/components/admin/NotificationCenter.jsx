// ─────────────────────────────────────────────────────────────────────────────
// components/admin/NotificationCenter.jsx — Pending actions & alerts
// ─────────────────────────────────────────────────────────────────────────────
// Shows actionable notifications: draft posts, events without images,
// items without Toast IDs, upcoming scheduled content, etc.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo } from "react";
import { AlertCircle, FileText, Calendar, ShoppingBag, Image } from "lucide-react";

const NotificationCenter = ({ siteData, onJump }) => {
  const notifications = useMemo(() => {
    const items = [];
    const now = new Date();

    // Draft blog posts
    const draftPosts = (siteData.blog || []).filter(p => p.published === false);
    if (draftPosts.length > 0) {
      items.push({
        id: "draft-posts",
        icon: <FileText size={14} />,
        title: `${draftPosts.length} draft blog post${draftPosts.length !== 1 ? "s" : ""} unpublished`,
        action: "Review",
        section: "blog",
        priority: "medium",
      });
    }

    // Events without images
    const eventsNoImage = (siteData.events || []).filter(e => !e.imageUrl && e.date && new Date(e.date + "T23:59:59") >= now);
    if (eventsNoImage.length > 0) {
      items.push({
        id: "events-no-image",
        icon: <Image size={14} />,
        title: `${eventsNoImage.length} upcoming event${eventsNoImage.length !== 1 ? "s" : ""} missing photos`,
        action: "Fix",
        section: "events",
        priority: "low",
      });
    }

    // Past events that could be archived
    const pastEvents = (siteData.events || []).filter(e => e.date && new Date(e.date + "T23:59:59") < now);
    if (pastEvents.length > 3) {
      items.push({
        id: "past-events",
        icon: <Calendar size={14} />,
        title: `${pastEvents.length} past events could be archived`,
        action: "Review",
        section: "events",
        priority: "low",
      });
    }

    // Merch drafts
    const merchDrafts = (siteData.merch || []).filter(m => m.draft);
    if (merchDrafts.length > 0) {
      items.push({
        id: "merch-drafts",
        icon: <ShoppingBag size={14} />,
        title: `${merchDrafts.length} merch item${merchDrafts.length !== 1 ? "s" : ""} in draft`,
        action: "Publish",
        section: "merch",
        priority: "medium",
      });
    }

    // Bottle drafts
    const bottleDrafts = (siteData.bottles || []).filter(b => b.draft);
    if (bottleDrafts.length > 0) {
      items.push({
        id: "bottle-drafts",
        icon: <ShoppingBag size={14} />,
        title: `${bottleDrafts.length} bottle${bottleDrafts.length !== 1 ? "s" : ""} in draft`,
        action: "Publish",
        section: "bottles",
        priority: "medium",
      });
    }

    // Gallery items without alt text (SEO)
    const galleryNoAlt = (siteData.gallery || []).filter(g => !g.alt || g.alt.length < 3);
    if (galleryNoAlt.length > 3) {
      items.push({
        id: "gallery-alt",
        icon: <AlertCircle size={14} />,
        title: `${galleryNoAlt.length} gallery items missing alt text (hurts SEO)`,
        action: "Fix",
        section: "gallery",
        priority: "low",
      });
    }

    return items;
  }, [siteData]);

  if (notifications.length === 0) return null;

  const priorityColors = {
    high: "border-l-red-400 bg-red-50/50",
    medium: "border-l-amber-400 bg-amber-50/30",
    low: "border-l-navy/10 bg-navy/[0.02]",
  };

  return (
    <div className="space-y-1.5">
      {notifications.map(n => (
        <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-[3px] transition-colors ${priorityColors[n.priority]}`}>
          <span className="text-navy/30 flex-shrink-0">{n.icon}</span>
          <p className="font-body text-xs text-navy/60 flex-1">{n.title}</p>
          {onJump && (
            <button onClick={() => onJump(n.section)}
              className="font-mono text-[9px] tracking-editorial uppercase text-flamingo/60 hover:text-flamingo px-2 py-1 rounded-lg hover:bg-flamingo/5 transition-colors flex-shrink-0">
              {n.action}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
