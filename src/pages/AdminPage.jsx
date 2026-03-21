// ─────────────────────────────────────────────────────────────────────────────
// pages/AdminPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Password-protected admin dashboard. Accessible via the "Manage" button in the
// footer after entering the correct password.
//
// SECTIONS THE OWNER CAN EDIT:
//   • About         — heading, body text, image URL
//   • Hours         — open/close times per day
//   • Location      — address, phone, email, map embed URL
//   • Menus         — add/edit/delete items in any menu section
//   • Gallery       — add/remove/reorder photos
//   • Events        — add/edit/delete ticketed events
//   • Prints        — add/edit/delete artist print listings
//   • Press         — add/edit/delete press articles
//   • Links         — external URLs (Resy, DoorDash, Toast, Instagram)
//   • Contact       — email addresses
//
// All changes are saved to localStorage via AdminContext.updateData().
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Plus, Trash2, Save, ChevronDown, ChevronUp, Undo2, GripVertical, RefreshCw, Eye, Copy, Search, X, ArrowUp, Check, AlertCircle, Clock, Command } from "lucide-react";
import { useSite } from "../context/AdminContext";
import PageLayout from "../components/layout/PageLayout";
import ImageUploader from "../components/ui/ImageUploader";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useInstagramFeed from "../hooks/useInstagramFeed";
import PRESS_OUTLETS from "../data/pressOutlets";
import usePressRefresh from "../hooks/usePressRefresh";
import { DEFAULT_EVENT_PHOTOS } from "../data/eventPhotos";
import CommandPalette from "../components/admin/CommandPalette";
import ActivityLog from "../components/admin/ActivityLog";
import CRMPanel from "../components/admin/CRMPanel";
import ContentScheduler from "../components/admin/ContentScheduler";
import SEOEditor from "../components/admin/SEOEditor";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";
import useAdminSession from "../hooks/useAdminSession";
import { logActivity } from "../lib/crmDb";
import TemplatePicker, { EVENT_TEMPLATES, BLOG_TEMPLATES } from "../components/admin/ContentTemplates";
import IntegrationsPanel from "../components/admin/IntegrationsPanel";
import NotificationCenter from "../components/admin/NotificationCenter";

// ── Sortable wrapper for drag-and-drop reorder ──────────────────────────
const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 50 : "auto",
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-1">
        <button {...attributes} {...listeners}
          className="mt-3 p-1 cursor-grab active:cursor-grabbing text-navy opacity-20 hover:opacity-50 touch-manipulation flex-shrink-0"
          title="Drag to reorder">
          <GripVertical size={16} />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};

// ── Save Toast — shows success/error feedback after saves ──────────────
const SaveToast = ({ message, type = "success", onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-20 right-6 z-[60] animate-scale-in flex items-center gap-3 px-5 py-3.5 rounded-2xl font-body text-sm backdrop-blur-sm
      ${type === "success"
        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-700/20"
        : "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-600/20"}`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${type === "success" ? "bg-white/20" : "bg-white/20"}`}>
        {type === "success" ? <Check size={13} /> : <AlertCircle size={13} />}
      </span>
      {message}
    </div>
  );
};

// ── Delete Confirmation Dialog ────────────────────────────────────────
const ConfirmDelete = ({ itemName, onConfirm, onCancel }) => {
  // Auto-focus the cancel button and support Escape/Enter
  const cancelRef = useRef(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/30 backdrop-blur-sm animate-fade-in" onClick={onCancel} role="dialog" aria-modal="true" aria-label={`Delete ${itemName}`}>
      <div className="bg-white rounded-2xl shadow-admin-lg p-7 max-w-sm mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <p className="font-display text-navy text-lg mb-2 text-center">Delete {itemName}?</p>
        <p className="font-body text-sm text-navy opacity-50 mb-6 text-center leading-relaxed">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button ref={cancelRef} onClick={onCancel} className="flex-1 font-body text-sm text-navy opacity-60 hover:opacity-100 px-4 py-2.5 rounded-xl border border-navy border-opacity-15 hover:border-opacity-30 transition-all focus:outline-none focus:ring-2 focus:ring-flamingo focus:ring-opacity-40">Cancel</button>
          <button onClick={onConfirm} className="flex-1 font-body text-sm bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm hover:shadow-md">Delete</button>
        </div>
      </div>
    </div>
  );
};

// ── Scroll-to-top button ──────────────────────────────────────────────
const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 left-6 z-50 w-11 h-11 bg-navy/80 backdrop-blur-sm text-cream rounded-2xl shadow-admin-lg
        flex items-center justify-center hover:bg-flamingo hover:scale-110 transition-all duration-200" title="Scroll to top">
      <ArrowUp size={18} />
    </button>
  );
};

// ── Section definitions for grouping + quick-jump ─────────────────────
const SECTION_GROUPS = [
  { group: "Dashboard", icon: "📊", sections: [
    { id: "analytics", title: "Analytics & Content Health" },
    { id: "activitylog", title: "Activity Log" },
    { id: "schedule", title: "Content Scheduler" },
  ]},
  { group: "CRM", icon: "👥", sections: [
    { id: "crm", title: "Guest CRM" },
  ]},
  { group: "Content", icon: "📝", sections: [
    { id: "hero", title: "Hero — Text, Buttons & Slideshow" },
    { id: "about", title: "Our Story & Team" },
    { id: "weekly", title: "Weekly Features" },
    { id: "menus", title: "Menus" },
    { id: "blog", title: "Blog — From the Kitchen" },
    { id: "faq", title: "FAQ" },
  ]},
  { group: "Operations", icon: "🕐", sections: [
    { id: "hours", title: "Hours" },
    { id: "location", title: "Location & Map" },
    { id: "specials", title: "Daily Specials" },
    { id: "countdown", title: "Seasonal Menu Countdown" },
  ]},
  { group: "Commerce", icon: "🛒", sections: [
    { id: "events", title: "Events & Tickets" },
    { id: "paintings", title: "Paintings" },
    { id: "merch", title: "Merchandise" },
    { id: "bottles", title: "Bottle Shop" },
    { id: "giftcards", title: "Gift Cards" },
    { id: "privateevents", title: "Private Events" },
  ]},
  { group: "Media", icon: "📷", sections: [
    { id: "gallery", title: "Gallery" },
    { id: "instagram", title: "Instagram Feed" },
    { id: "stockphotos", title: "Stock Photos" },
    { id: "testimonials", title: "Testimonials" },
    { id: "press", title: "Press" },
    { id: "popular", title: "Popular Now Badges" },
  ]},
  { group: "Marketing", icon: "📣", sections: [
    { id: "email", title: "Email Marketing" },
    { id: "sms", title: "SMS Text Club" },
    { id: "newsletter", title: "Newsletter" },
    { id: "seo", title: "SEO & Social Sharing" },
  ]},
  { group: "Integrations", icon: "🔌", sections: [
    { id: "integrations", title: "Resy & Toast" },
  ]},
  { group: "Settings", icon: "⚙️", sections: [
    { id: "settings", title: "Site Settings" },
    { id: "links", title: "External Links" },
    { id: "contact", title: "Contact Emails" },
  ]},
];
const ALL_SECTIONS = SECTION_GROUPS.flatMap(g => g.sections);

// ── Quick-Jump Sidebar ────────────────────────────────────────────────
const QuickJump = ({ activeSection, onJump, searchQuery, onSearchChange }) => {
  const filtered = searchQuery.trim()
    ? SECTION_GROUPS.map(g => ({
        ...g,
        sections: g.sections.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
      })).filter(g => g.sections.length > 0)
    : SECTION_GROUPS;

  return (
    <div className="hidden xl:block fixed left-4 top-32 w-48 max-h-[calc(100vh-160px)] overflow-y-auto z-40
      admin-sidebar-glass border border-navy/[0.08] rounded-2xl shadow-admin-lg p-3 text-xs">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-navy opacity-30" />
        <input value={searchQuery} onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-7 pr-6 py-2 rounded-xl border border-navy/10 font-body text-xs text-navy placeholder:text-navy/25 bg-white/60 focus:bg-white focus:border-flamingo/30 focus:ring-1 focus:ring-flamingo/20 focus:outline-none transition-all"
          placeholder="Jump to section..." />
        {searchQuery && (
          <button onClick={() => onSearchChange("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60">
            <X size={11} />
          </button>
        )}
      </div>
      {filtered.map(g => (
        <div key={g.group} className="mb-2">
          <p className="font-mono text-[9px] tracking-editorial uppercase text-navy opacity-30 mb-1 px-1">{g.icon} {g.group}</p>
          {g.sections.map(s => (
            <button key={s.id} onClick={() => onJump(s.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg font-body text-[11px] truncate transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-flamingo/30
                ${activeSection === s.id
                  ? "bg-flamingo/10 text-flamingo font-semibold border-l-2 border-flamingo"
                  : "text-navy/50 hover:text-navy/80 hover:bg-cream-warm/60 border-l-2 border-transparent"}`}>
              {s.title.replace(" — ", " ")}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

// ── Validation helpers ─────────────────────────────────────────────────
const validateUrl = (v) => {
  if (!v) return null;
  try { new URL(v); return null; } catch { return "Enter a valid URL (https://...)"; }
};
const validateEmail = (v) => {
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address";
};
// validatePrice available if needed:
// const validatePrice = (v) => !v ? null : /^\d+(\.\d{1,2})?$/.test(v) ? null : "Enter a valid price";
const validateDate = (v) => {
  if (!v) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? null : "Use YYYY-MM-DD format (e.g. 2026-04-12)";
};
const validatePhone = (v) => {
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  return digits.length >= 10 ? null : "Enter a valid phone number";
};

// ── View on Site link ──────────────────────────────────────────────────
const ViewOnSite = ({ path }) => (
  <Link to={path} target="_blank" className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-editorial uppercase text-flamingo/50 hover:text-flamingo transition-all px-2.5 py-1 rounded-lg hover:bg-flamingo/5">
    <Eye size={11} /> View on site
  </Link>
);

// ── Empty State ──────────────────────────────────────────────────────
const EmptyState = ({ message, onAdd, addLabel }) => (
  <div className="text-center py-12 border-2 border-dashed border-navy/[0.08] rounded-2xl bg-navy/[0.01]">
    <div className="w-12 h-12 rounded-2xl bg-navy/[0.04] flex items-center justify-center mx-auto mb-4">
      <Plus size={20} className="text-navy/20" />
    </div>
    <p className="font-body text-sm text-navy/35 mb-4">{message}</p>
    {onAdd && (
      <button onClick={onAdd} className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-all hover:gap-3 px-5 py-2.5 rounded-xl bg-flamingo/5 hover:bg-flamingo/10">
        <Plus size={14} />{addLabel || "Add First Item"}
      </button>
    )}
  </div>
);

// ── Small utility components ───────────────────────────────────────────────

// Section accordion header — click to expand/collapse an admin section
const AdminSection = ({ title, children, defaultOpen = false, id, badge, description }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-card" id={id ? `section-${id}` : undefined}>
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left group"
        aria-expanded={open}
        aria-controls={id ? `content-${id}` : undefined}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-display text-navy text-lg group-hover:text-flamingo transition-colors duration-200">{title}</h3>
          {badge != null && badge > 0 && (
            <span className="font-mono text-[10px] bg-flamingo/10 text-flamingo px-2.5 py-0.5 rounded-full font-semibold">{badge}</span>
          )}
        </div>
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
          open ? "bg-flamingo/10 text-flamingo rotate-0" : "bg-navy/[0.04] text-navy/30 group-hover:bg-flamingo/5 group-hover:text-flamingo/50"
        }`}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {/* Description — visible even when collapsed */}
      {description && !open && (
        <p className="font-body text-xs text-navy/30 mt-3 leading-relaxed">{description}</p>
      )}
      {/* Collapsible content */}
      {open && <div className="mt-6 border-t border-navy/[0.06] pt-6 admin-collapse-enter" id={id ? `content-${id}` : undefined} role="region">{children}</div>}
    </div>
  );
};

// ── CollapsibleItem — wraps any card in a list editor with expand/collapse ──
// Used in: Paintings, Gallery, Events, Press, Team, Hero Slides, etc.
// defaultOpen=true for newly added items so the form is ready to fill in.
const CollapsibleItem = ({ label, sublabel, defaultOpen = false, onRemove, children, confirmDelete = true, thumbnail }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [showConfirm, setShowConfirm] = useState(false);
  const displayLabel = typeof label === "string" ? label : "this item";
  return (
    <div className={`border rounded-2xl mb-3 overflow-hidden transition-all duration-200 ${open ? "border-flamingo/25 shadow-admin" : "border-navy/[0.08] hover:border-navy/15 shadow-sm hover:shadow-admin"}`}>
      {showConfirm && (
        <ConfirmDelete
          itemName={typeof label === "string" ? `"${label}"` : "this item"}
          onConfirm={() => { setShowConfirm(false); onRemove(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {/* Header row — always visible */}
      <div className={`flex items-center justify-between px-5 py-3.5 cursor-pointer select-none transition-colors duration-200 ${open ? "bg-cream-warm" : "bg-cream-warm/50 hover:bg-cream-warm"}`}
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Thumbnail preview */}
          {thumbnail && !open && (
            <img src={thumbnail} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0 border border-navy border-opacity-10" />
          )}
          {/* Chevron */}
          {open
            ? <ChevronUp size={15} className="text-flamingo flex-shrink-0" />
            : <ChevronDown size={15} className="text-navy opacity-40 flex-shrink-0" />}
          {/* Title + optional sublabel */}
          <div className="min-w-0">
            <span className="font-body text-navy text-sm font-semibold truncate block">
              {label || "Untitled"}
            </span>
            {sublabel && (
              <span className="font-mono text-navy opacity-40 text-xs truncate block">
                {sublabel}
              </span>
            )}
          </div>
        </div>
        {/* Remove button — stops propagation so clicking it doesn't toggle expand */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); confirmDelete ? setShowConfirm(true) : onRemove(); }}
            className="text-flamingo-dark hover:text-flamingo transition-colors flex-shrink-0 ml-3 p-1"
            title="Remove"
            aria-label={`Remove ${displayLabel}`}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {/* Expandable detail area */}
      {open && (
        <div className="px-5 py-5 border-t border-navy/[0.06] bg-white admin-collapse-enter">
          {children}
        </div>
      )}
    </div>
  );
};


const Field = ({ label, value, onChange, type = "text", multiline = false, placeholder = "", required = false, maxLength, validate, helpText }) => {
  const fieldId = useMemo(() => `field-${label.replace(/\s+/g, "-").toLowerCase()}-${Math.random().toString(36).slice(2, 6)}`, [label]);
  const strVal = value == null ? "" : String(value);
  const error = validate ? validate(strVal) : null;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={fieldId} className="font-mono text-[11px] tracking-editorial uppercase text-navy/45 font-medium">
          {label}{required && <span className="text-flamingo/70 ml-0.5">*</span>}
        </label>
        {maxLength && (
          <span className={`font-mono text-[10px] tabular-nums ${strVal.length > maxLength ? "text-red-500 font-semibold" : strVal.length > maxLength * 0.9 ? "text-amber-500" : "text-navy/20"}`}>
            {strVal.length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => { setTimeout(() => onChange(e.target.value), 0); }}
          rows={4}
          className={`form-input text-base resize-y ${error ? "border-red-400" : ""}`}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => { setTimeout(() => onChange(e.target.value), 0); }}
          className={`form-input text-base ${error ? "border-red-400" : ""}`}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
        />
      )}
      {error && <p id={`${fieldId}-error`} className="font-body text-xs text-red-500 mt-1" role="alert">{error}</p>}
      {helpText && !error && <p id={`${fieldId}-help`} className="font-body text-xs text-navy opacity-30 mt-1">{helpText}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const { siteData, updateData, isAdmin, logout, dbReady, dbLoading, dbError, retrySupabase, canUndo, undo, draftMode, setDraftMode, hasDraft, publishDraft, discardDraft, saveStatus, lastSavedAt } = useSite();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );
  const navigate = useNavigate();

  // ── Quick-jump sidebar state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [toast, setToast] = useState(null); // { message, type }
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // ── Session management (auto-logout, timeout warning) ──────────────
  const { showTimeoutWarning, timeRemaining, extendSession } = useAdminSession(isAdmin, logout);

  // ── Wrap updateData to show save toast + log activity ─────────────────
  const saveWithToast = useCallback(async (key, value, label) => {
    try {
      await updateData(key, value);
      setToast({ message: label ? `${label} saved!` : "Saved!", type: "success" });
      logActivity("updated", key, `Saved ${label || key}`);
    } catch (err) {
      setToast({ message: "Save failed — please try again.", type: "error" });
    }
  }, [updateData]);

  // ── Track active section via IntersectionObserver ─────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id?.replace("section-", "");
            if (id) setActiveSection(id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    // Defer so DOM elements exist after render
    const timer = setTimeout(() => {
      ALL_SECTIONS.forEach((s) => {
        const el = document.getElementById(`section-${s.id}`);
        if (el) observer.observe(el);
      });
    }, 500);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [isAdmin]);

  // ── Collapse All / Expand All ──────────────────────────────────────
  const [allCollapsed, setAllCollapsed] = useState(true);
  const toggleAllSections = useCallback(() => {
    const buttons = document.querySelectorAll(".admin-card > button[aria-expanded]");
    buttons.forEach((btn) => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (allCollapsed ? isOpen : !isOpen) btn.click();
    });
    setAllCollapsed(!allCollapsed);
  }, [allCollapsed]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        const saveBtn = document.querySelector("button.btn-primary");
        if (saveBtn) {
          saveBtn.click();
          setToast({ message: "Saved!", type: "success" });
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && canUndo) {
        e.preventDefault();
        undo();
        setToast({ message: "Undone!", type: "success" });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        toggleAllSections();
      }
      if (e.key === "Escape") {
        if (showCommandPalette) { setShowCommandPalette(false); return; }
        const overlay = document.querySelector(".fixed.inset-0.z-\\[70\\]");
        if (overlay) overlay.click();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canUndo, undo, showCommandPalette, toggleAllSections]);

  // ── Warn before leaving with unsaved changes ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "Changes are still saving — are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveStatus]);

  // ── Quick-jump scroll handler ────────────────────────────────────────
  const handleJump = useCallback((id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  }, []);

  // Set page title for admin
  useEffect(() => {
    document.title = "Manage Website — Standard Fare";
    return () => { document.title = "Standard Fare"; };
  }, []);

  // Redirect non-admin users back to home (protects the route)
  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null; // Don't render anything while redirecting

  // ───────────────────────────────────────────────────────────────────────────
  // ABOUT EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  // ABOUT EDITOR — split into "Our Story" and "Our Team" sub-sections
  // ───────────────────────────────────────────────────────────────────────────
  const AboutEditor = () => {
    const [draft, setDraft] = useState({ ...siteData.about });
    const [team,  setTeam]  = useState(
      (siteData.about.team || []).map(m => ({ ...m }))
    );

    // Save both story fields and team array together
    const save = () => saveWithToast("about", { ...draft, team }, "About");

    const updateMember = (i, field, value) =>
      setTeam(team.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
    const addMember    = () => setTeam([...team, { name: "", role: "", photo: "", bio: "" }]);
    const removeMember = (i) => setTeam(team.filter((_, idx) => idx !== i));

    return (
      <div>
        {/* ── OUR STORY ──────────────────────────────────────────── */}
        <div className="mb-8 pb-8 border-b border-navy/[0.06]">
          <p className="font-mono text-flamingo/60 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2">
            <span className="w-1 h-4 bg-flamingo/40 rounded-full" /> Our Story
          </p>

          <Field
            label="Section Heading"
            value={draft.heading || ""}
            onChange={(v) => setDraft({ ...draft, heading: v })}
            placeholder="Creative American Dining"
            maxLength={60}
          />
          <Field
            label="Body Copy — type 'Bocage Champagne Bar' to auto-hyperlink it"
            value={draft.body || ""}
            onChange={(v) => setDraft({ ...draft, body: v })}
            multiline
            maxLength={600}
            helpText="This text appears in the 'Our Story' section. Mentioning 'Bocage Champagne Bar' automatically hyperlinks it."
          />

          <div className="border border-flamingo/15 rounded-2xl p-5 bg-flamingo/[0.03] mb-4">
            <p className="font-mono text-flamingo/60 text-[11px] tracking-editorial uppercase mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-flamingo/30 rounded-full" /> Also From Our Team — Bocage Champagne Bar
            </p>
            <p className="font-body text-sm text-navy opacity-60 mb-4 leading-relaxed">
              The button that appears under the founder photos linking to Bocage.
              Updating the URL here also updates it in External Links automatically.
            </p>
            <Field
              label="Button Label"
              value={draft.bocageLabel || "Bocage Champagne Bar"}
              onChange={(v) => setDraft({ ...draft, bocageLabel: v })}
              placeholder="Bocage Champagne Bar"
            />
            <Field
              label="Bocage URL — updating here also updates External Links"
              value={draft.bocageUrl || ""}
              onChange={(v) => {
                setDraft({ ...draft, bocageUrl: v });
                // Mirror to links so External Links stays in sync
                updateData("links", { ...siteData.links, bocage: v });
              }}
              placeholder="https://www.instagram.com/bocagechampagnebar/"
            />
            <Field
              label="Sub-label (shown under the button name)"
              value={draft.bocageSublabel || "10 Phila St · Saratoga Springs"}
              onChange={(v) => setDraft({ ...draft, bocageSublabel: v })}
              placeholder="10 Phila St · Saratoga Springs"
            />
          </div>

          <ImageUploader
            label="About Section Photo (right column)"
            value={draft.imageUrl || ""}
            onChange={(v) => setDraft({ ...draft, imageUrl: v })}
            height="h-44"
          />
        </div>

        {/* ── OUR TEAM ───────────────────────────────────────────── */}
        <div className="mb-6">
          <p className="font-mono text-flamingo/60 text-[11px] tracking-editorial uppercase mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-flamingo/40 rounded-full" /> Our Team ({team.length})
          </p>
          <p className="font-body text-xs text-navy/40 mb-5 leading-relaxed">
            Each team member appears as a clickable circle in the Our Story section. Clicking opens their full bio modal.
          </p>

          {team.map((member, i) => (
            <CollapsibleItem
              key={i}
              thumbnail={member.photo}
              label={member.name || `Team Member ${i + 1}`}
              sublabel={member.role || "No role set"}
              defaultOpen={!member.name}
              onRemove={() => removeMember(i)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Name</label>
                  <input value={member.name || ""} onChange={(e) => updateMember(i, "name", e.target.value)}
                    className="form-input text-base py-2" placeholder="Full name" />
                </div>
                <div>
                  <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Title / Role</label>
                  <input value={member.role || ""} onChange={(e) => updateMember(i, "role", e.target.value)}
                    className="form-input text-base py-2" placeholder="Co-Founder / Owner" />
                </div>
              </div>
              <ImageUploader label="Headshot Photo (shown as circle)" value={member.photo || ""}
                onChange={(v) => updateMember(i, "photo", v)} height="h-32" />
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">
                  Full Bio — separate paragraphs with a blank line
                </label>
                <textarea value={member.bio || ""} onChange={(e) => updateMember(i, "bio", e.target.value)}
                  rows={8} className="form-input text-base resize-y w-full"
                  placeholder="Write their bio here. Separate paragraphs with an empty line." />
              </div>
            </CollapsibleItem>
          ))}

          <button onClick={addMember}
            className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors">
            <Plus size={14} />Add Team Member
          </button>
        </div>

        <button onClick={save} className="btn-primary flex items-center gap-2 mt-4">
          <Save size={14} />Save About &amp; Team
        </button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // HOURS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const HoursEditor = () => {
    const [hours, setHours] = useState([...siteData.hours]);
    const [override, setOverride] = useState({ ...( siteData.hoursOverride || { enabled: false, message: "", dates: "" }) });

    // Update a single day's open or close value
    const setHour = (i, field, value) => {
      const updated = hours.map((h, idx) => idx === i ? { ...h, [field]: value } : h);
      setHours(updated);
    };

    const save = () => saveWithToast("hours", hours, "Hours");
    const saveOverride = () => saveWithToast("hoursOverride", override, "Hours override");

    return (
      <div>
        {/* Hours Override Controls */}
        <div className="mb-6 p-4 border border-flamingo border-opacity-30 rounded-lg bg-cream bg-opacity-50">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={override.enabled}
              onChange={(e) => setOverride({ ...override, enabled: e.target.checked })}
              className="accent-flamingo w-4 h-4"
            />
            <span className="font-display text-navy text-sm font-bold">Enable Hours Override / Holiday Notice</span>
          </label>
          {override.enabled && (
            <div className="space-y-3 ml-6">
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Override Message</label>
                <input type="text" value={override.message}
                  onChange={(e) => setOverride({ ...override, message: e.target.value })}
                  placeholder='e.g. "Closed for Private Event" or "Holiday Hours: Open 11AM–6PM"'
                  className="form-input text-base py-2 w-full" />
              </div>
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Dates</label>
                <input type="text" value={override.dates}
                  onChange={(e) => setOverride({ ...override, dates: e.target.value })}
                  placeholder='e.g. "March 25" or "Dec 24-25"'
                  className="form-input text-base py-2 w-full" />
              </div>
              <p className="font-body text-xs text-navy opacity-50 italic">
                Preview: "{override.message || "Schedule Change"}" {override.dates && `— ${override.dates}`}
              </p>
            </div>
          )}
          <button onClick={saveOverride} className="btn-primary flex items-center gap-2 mt-3"><Save size={14} />Save Override</button>
        </div>

        {hours.map((h, i) => {
          const isToday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()] === h.day;
          return (
          <CollapsibleItem
            key={h.day}
            label={isToday ? `${h.day} (today)` : h.day}
            sublabel={h.open === "Closed" || h.open === "Gone Fishing" || !h.open ? h.open || "Closed" : `${h.open} – ${h.close}`}
            defaultOpen={false}
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Opens</label>
                <input type="text" value={h.open} onChange={(e) => setHour(i, "open", e.target.value)}
                  placeholder="11:00 AM or Closed" className="form-input text-base py-2" />
              </div>
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Closes</label>
                <input type="text" value={h.close} onChange={(e) => setHour(i, "close", e.target.value)}
                  placeholder="9:00 PM" className="form-input text-base py-2" />
              </div>
            </div>
            {/* Quick set buttons */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button type="button" onClick={() => { setHour(i, "open", "Closed"); setHour(i, "close", ""); }}
                className="font-mono text-[10px] text-navy opacity-30 hover:opacity-60 border border-navy border-opacity-15 rounded px-2 py-1 transition-opacity">
                Set Closed
              </button>
              <button type="button" onClick={() => { setHour(i, "open", "5:00 PM"); setHour(i, "close", "10:00 PM"); }}
                className="font-mono text-[10px] text-navy opacity-30 hover:opacity-60 border border-navy border-opacity-15 rounded px-2 py-1 transition-opacity">
                Dinner Only
              </button>
              <button type="button" onClick={() => { setHour(i, "open", "10:00 AM"); setHour(i, "close", "10:00 PM"); }}
                className="font-mono text-[10px] text-navy opacity-30 hover:opacity-60 border border-navy border-opacity-15 rounded px-2 py-1 transition-opacity">
                Brunch + Dinner
              </button>
              {i > 0 && (
                <button type="button" onClick={() => { setHour(i, "open", hours[i - 1].open); setHour(i, "close", hours[i - 1].close); }}
                  className="font-mono text-[10px] text-flamingo opacity-40 hover:opacity-70 transition-opacity">
                  Copy from {hours[i - 1].day}
                </button>
              )}
            </div>
          </CollapsibleItem>
        );
        })}
        <button onClick={save} className="btn-primary flex items-center gap-2 mt-4"><Save size={14} />Save Hours</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LOCATION EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const LocationEditor = () => {
    const [loc, setLoc] = useState({ ...siteData.location });
    const save = () => saveWithToast("location", loc, "Location");

    const labels = {
      address:       "Street Address",
      city:          "City, State, ZIP",
      phone:         "Phone Number",
      email:         "Email Address",
      googleMapsUrl: "Google Maps URL (links 'View on Google Maps' in footer & Hours)",
      mapEmbedUrl:   "Google Maps Embed URL (the iframe src for the map preview)",
    };

    return (
      <div>
        {/* Map preview */}
        {loc.mapEmbedUrl && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-navy/[0.08] shadow-sm">
            <iframe src={loc.mapEmbedUrl} title="Map preview" className="w-full h-40" loading="lazy" />
            <div className="bg-white px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="font-body text-navy text-sm font-semibold">{loc.address}</p>
                <p className="font-body text-navy/40 text-xs">{loc.city}</p>
              </div>
              {loc.phone && <p className="font-mono text-[10px] text-navy/30">{loc.phone}</p>}
            </div>
          </div>
        )}

        {Object.entries(loc).map(([key, val]) => (
          <CollapsibleItem
            key={key}
            label={labels[key] || key.replace(/([A-Z])/g, " $1")}
            sublabel={val ? String(val).substring(0, 60) : "Not set"}
            defaultOpen={false}
          >
            <Field
              label={labels[key] || key.replace(/([A-Z])/g, " $1")}
              value={val}
              onChange={(v) => setLoc({ ...loc, [key]: v })}
              multiline={key === "mapEmbedUrl"}
              validate={key === "email" ? validateEmail : key === "phone" ? validatePhone : key.includes("Url") ? validateUrl : undefined}
              helpText={key === "mapEmbedUrl" ? "Paste the 'src' value from Google Maps embed code" : key === "googleMapsUrl" ? "The URL visitors see when they click 'View on Google Maps'" : undefined}
            />
          </CollapsibleItem>
        ))}
        <button onClick={save} className="btn-primary flex items-center gap-2 mt-2"><Save size={14} />Save Location</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // MENU EDITOR — one sub-section for each menu (brunch, dinner, drinks, dessert)
  // ───────────────────────────────────────────────────────────────────────────
  const MenuEditor = () => {
    const [menus, setMenus] = useState(JSON.parse(JSON.stringify(siteData.menus))); // Deep clone
    const [activeMenu, setActiveMenu] = useState("dinner");
    const [menuSearch, setMenuSearch] = useState("");

    // Update a single item's field within a section
    const updateItem = (sectionIdx, itemIdx, field, value) => {
      const m = JSON.parse(JSON.stringify(menus));
      m[activeMenu].sections[sectionIdx].items[itemIdx][field] = value;
      setMenus(m);
    };

    // Add a new blank item to a section
    const addItem = (sectionIdx) => {
      const m = JSON.parse(JSON.stringify(menus));
      m[activeMenu].sections[sectionIdx].items.push({ name: "", description: "", price: "", gf: false, veg: false });
      setMenus(m);
    };

    // Remove an item from a section
    const removeItem = (sectionIdx, itemIdx) => {
      const m = JSON.parse(JSON.stringify(menus));
      m[activeMenu].sections[sectionIdx].items.splice(itemIdx, 1);
      setMenus(m);
    };

    // Update a section's note (e.g. serving times)
    const updateNote = (value) => {
      const m = JSON.parse(JSON.stringify(menus));
      m[activeMenu].note = value;
      setMenus(m);
    };

    const save = () => saveWithToast("menus", menus, "Menus");

    return (
      <div>
        {/* Menu tab selector with item counts */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.keys(menus).map((key) => {
            const itemCount = (menus[key].sections || []).reduce((sum, s) => sum + (s.items || []).length, 0);
            return (
              <button
                key={key}
                onClick={() => setActiveMenu(key)}
                className={`font-mono text-xs tracking-editorial uppercase px-4 py-2.5 rounded-xl border transition-all ${
                  activeMenu === key
                    ? "bg-navy text-cream border-navy shadow-admin"
                    : "border-navy/20 text-navy hover:border-navy/40 hover:shadow-sm"
                }`}
              >
                {menus[key].name}
                <span className={`ml-1.5 text-[9px] ${activeMenu === key ? "text-flamingo" : "opacity-30"}`}>{itemCount}</span>
              </button>
            );
          })}
        </div>

        {/* Menu note */}
        <Field
          label="Menu Note (serving times etc.)"
          value={menus[activeMenu].note || ""}
          onChange={updateNote}
          placeholder="Served Saturday & Sunday..."
        />

        {/* Search within menu items */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
          <input
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
            placeholder="Search menu items..."
          />
          {menuSearch && (
            <button onClick={() => setMenuSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sections and items */}
        {menus[activeMenu].sections.map((section, si) => {
          const filteredItems = menuSearch
            ? section.items.map((item, ii) => ({ ...item, _idx: ii })).filter(item =>
                item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                (item.description || "").toLowerCase().includes(menuSearch.toLowerCase()))
            : section.items.map((item, ii) => ({ ...item, _idx: ii }));
          if (menuSearch && filteredItems.length === 0) return null;
          return (
          <div key={si} className="mb-8 border border-navy/[0.08] rounded-2xl p-5 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-mono text-flamingo/70 text-xs tracking-editorial uppercase flex items-center gap-2">
                {section.title}
                <span className="font-mono text-[9px] bg-navy/[0.05] text-navy/30 px-2 py-0.5 rounded-full">{section.items.length}</span>
              </h4>
            </div>

            {filteredItems.map((item) => {
              const ii = item._idx;
              return (
              <CollapsibleItem
                key={ii}
                label={item.name || "Untitled dish"}
                sublabel={[item.price ? `$${item.price}` : "", item.gf ? "GF" : "", item.veg ? "V" : "", item.description].filter(Boolean).join(" · ").substring(0, 60)}
                defaultOpen={!item.name}
                onRemove={() => removeItem(si, ii)}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Dish Name</label>
                    <input value={item.name} onChange={(e) => updateItem(si, ii, "name", e.target.value)}
                      className="form-input text-base py-2" placeholder="e.g. Pork Belly" />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Price</label>
                    <input value={item.price} onChange={(e) => updateItem(si, ii, "price", e.target.value)}
                      className="form-input text-base py-2" placeholder="e.g. 24" />
                  </div>
                  <div className="flex items-end pb-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!item.gf}
                        onChange={(e) => updateItem(si, ii, "gf", e.target.checked)}
                        className="accent-flamingo w-4 h-4"
                      />
                      <span className="font-body text-sm text-navy">Gluten Free <span className="font-mono text-flamingo text-xs border border-flamingo border-opacity-50 rounded px-1">GF</span></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!item.veg}
                        onChange={(e) => updateItem(si, ii, "veg", e.target.checked)}
                        className="accent-green-700 w-4 h-4"
                      />
                      <span className="font-body text-sm text-navy">Vegetarian <span className="font-mono text-green-700 text-xs border border-green-700 border-opacity-50 rounded px-1">V</span></span>
                    </label>
                  </div>
                  <div className="md:col-span-3">
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Description</label>
                    <input value={item.description} onChange={(e) => updateItem(si, ii, "description", e.target.value)}
                      className="form-input text-base py-2" placeholder="Description" />
                  </div>
                </div>
                {/* Item actions: duplicate, move to section */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-navy/[0.06]">
                  <button onClick={() => {
                    const m = JSON.parse(JSON.stringify(menus));
                    m[activeMenu].sections[si].items.splice(ii + 1, 0, { ...item, _idx: undefined });
                    setMenus(m);
                  }}
                    className="flex items-center gap-1 font-mono text-[10px] text-navy/30 hover:text-flamingo transition-colors">
                    <Copy size={10} /> Duplicate
                  </button>
                  {menus[activeMenu].sections.length > 1 && (
                    <select
                      value=""
                      onChange={(e) => {
                        const targetSi = parseInt(e.target.value, 10);
                        if (isNaN(targetSi)) return;
                        const m = JSON.parse(JSON.stringify(menus));
                        const moved = m[activeMenu].sections[si].items.splice(ii, 1)[0];
                        m[activeMenu].sections[targetSi].items.push(moved);
                        setMenus(m);
                      }}
                      className="font-mono text-[10px] text-navy/30 bg-transparent border-none cursor-pointer hover:text-flamingo focus:outline-none"
                    >
                      <option value="">Move to...</option>
                      {menus[activeMenu].sections.map((sec, idx) => idx !== si ? (
                        <option key={idx} value={idx}>{sec.title}</option>
                      ) : null)}
                    </select>
                  )}
                </div>
              </CollapsibleItem>
            );
            })}

            {/* Add new item to this section */}
            <button onClick={() => addItem(si)} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors mt-2">
              <Plus size={14} /> Add Item
            </button>
          </div>
          );
        })}

        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Menus</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // HERO SLIDESHOW EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const HeroSlideshowEditor = () => {
    // ── Hero text content ─────────────────────────────────────────────────
    const [hero, setHero] = useState({
      eyebrow:           "21 Phila St · Saratoga Springs, NY",
      title:             "Standard Fare",
      tagline:           "Creative American Dining\nBrunch, Dinner & Cocktails",
      ctaPrimaryLabel:   "Reserve a Table",
      ctaSecondaryLabel: "View Menu",
      ...(siteData.heroContent || {}),
    });

    // ── Slideshow images ──────────────────────────────────────────────────
    const [slides, setSlides] = useState(
      siteData.heroSlides?.length > 0 ? [...siteData.heroSlides] : []
    );

    const updateSlide = (i, field, value) =>
      setSlides(slides.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
    const addSlide    = () => setSlides([...slides, { id: Date.now(), url: "", alt: "" }]);
    const removeSlide = (i) => setSlides(slides.filter((_, idx) => idx !== i));

    // Save both heroContent and heroSlides together
    const save = async () => {
      await updateData("heroContent", hero);
      await updateData("heroSlides",  slides);
      setToast({ message: "Hero saved!", type: "success" });
    };

    return (
      <div>
        {/* ── Text Content ─────────────────────────────────────── */}
        <CollapsibleItem
          label="Hero Text & Buttons"
          sublabel={`Title: "${hero.title}" · Eyebrow: "${hero.eyebrow}"`}
          defaultOpen={false}
        >
          <Field label="Eyebrow (small text above the title)" value={hero.eyebrow}
            onChange={(v) => setHero({ ...hero, eyebrow: v })} placeholder="21 Phila St · Saratoga Springs, NY" />
          <Field label="Main Title" value={hero.title}
            onChange={(v) => setHero({ ...hero, title: v })} placeholder="Standard Fare" />
          <Field label="Tagline (use a new line for line breaks)" value={hero.tagline}
            onChange={(v) => setHero({ ...hero, tagline: v })} multiline
            placeholder="Creative American Dining&#10;Brunch, Dinner & Cocktails" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Primary Button Label" value={hero.ctaPrimaryLabel}
              onChange={(v) => setHero({ ...hero, ctaPrimaryLabel: v })} placeholder="Reserve a Table" />
            <Field label="Secondary Button Label" value={hero.ctaSecondaryLabel}
              onChange={(v) => setHero({ ...hero, ctaSecondaryLabel: v })} placeholder="View Menu" />
          </div>
          <p className="font-body text-xs text-navy opacity-40 mt-1">Button links are managed in External Links below.</p>
        </CollapsibleItem>

        {/* ── Slideshow Images ─────────────────────────────────── */}
        <div className="mt-3">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2 mt-4">
            Background Slideshow
          </p>
          <p className="font-body text-sm text-navy opacity-50 mb-4">
            Slides auto-advance every 5 seconds. Visitors can use arrows to navigate.
          </p>

          {slides.map((slide, i) => (
            <CollapsibleItem
              key={slide.id}
              label={`Slide ${i + 1}`}
              sublabel={slide.url ? "✓ Image set" : "No image yet"}
              defaultOpen={!slide.url}
              onRemove={() => removeSlide(i)}
            >
              <ImageUploader label="Slide Image" value={slide.url}
                onChange={(v) => updateSlide(i, "url", v)} height="h-32" />
              <input value={slide.alt || ""} onChange={(e) => updateSlide(i, "alt", e.target.value)}
                className="form-input text-base py-2 mt-2" placeholder="Alt text (e.g. 'Standard Fare dining room')" />
            </CollapsibleItem>
          ))}

          <button onClick={addSlide}
            className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark mb-4">
            <Plus size={14} />Add Slide
          </button>
        </div>

        <button onClick={save} className="btn-primary flex items-center gap-2">
          <Save size={14} />Save Hero
        </button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // GALLERY EDITOR — supports images, GIFs, videos, comments, Instagram links
  // ───────────────────────────────────────────────────────────────────────────
  const GalleryEditor = () => {
    const [photos, setPhotos] = useState([...siteData.gallery]);
    const [gallerySearch, setGallerySearch] = useState("");

    const update = (i, field, value) => {
      const updated = photos.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
      setPhotos(updated);
    };

    const add = () => setPhotos([...photos, {
      id: Date.now(), url: "", alt: "", comment: "", instagramUrl: "", mediaType: "image"
    }]);

    const remove = (i) => setPhotos(photos.filter((_, idx) => idx !== i));
    const save   = () => saveWithToast("gallery", photos, "Gallery");

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = photos.findIndex((p) => p.id === active.id);
        const newIdx = photos.findIndex((p) => p.id === over.id);
        setPhotos(arrayMove(photos, oldIdx, newIdx));
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm text-navy opacity-60">{photos.length} photo{photos.length !== 1 ? "s" : ""} in gallery</p>
          <ViewOnSite path="/gallery" />
        </div>
        <div className="bg-navy rounded-lg p-5 mb-6">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">Media Types Supported</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {[
              { icon: "🖼️", label: "Images", desc: "JPG, PNG, WebP — static photos" },
              { icon: "🎞️", label: "GIFs",   desc: "Animated GIFs — upload or link" },
              { icon: "🎬", label: "Videos",  desc: "MP4/WebM — plays on hover, loops" },
            ].map((t) => (
              <div key={t.label} className="flex items-start gap-2">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <p className="font-body text-cream text-sm font-bold">{t.label}</p>
                  <p className="font-body text-cream opacity-50 text-xs">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="font-body text-cream opacity-40 text-xs mt-4">
            If an Instagram URL is set, clicking the item opens that post. "See on Instagram" appears on hover.
          </p>
        </div>

        {/* Gallery search */}
        {photos.length > 5 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input value={gallerySearch} onChange={(e) => setGallerySearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
              placeholder="Search gallery items..." />
            {gallerySearch && (
              <button onClick={() => setGallerySearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60"><X size={14} /></button>
            )}
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {photos.map((photo, i) => {
          if (gallerySearch && !(photo.alt?.toLowerCase().includes(gallerySearch.toLowerCase()) || photo.comment?.toLowerCase().includes(gallerySearch.toLowerCase()) || photo.caption?.toLowerCase().includes(gallerySearch.toLowerCase()))) return null;
          return (
          <SortableItem key={photo.id} id={photo.id}>
          <CollapsibleItem
            label={photo.alt || photo.caption || `Gallery Item ${i + 1}`}
            thumbnail={photo.url && (photo.mediaType || "image") !== "video" ? photo.url : undefined}
            sublabel={photo.url ? `✓ ${photo.mediaType || "image"}${photo.instagramUrl ? " · Instagram linked" : ""}` : "No media yet"}
            defaultOpen={!photo.url}
            onRemove={() => remove(i)}
          >

            {/* Media type selector */}
            <div className="mb-3">
              <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                Media Type
              </label>
              <div className="flex gap-3">
                {["image", "gif", "video"].map((type) => (
                  <button
                    key={type}
                    onClick={() => update(i, "mediaType", type)}
                    className={`font-mono text-xs tracking-editorial uppercase px-3 py-1.5 border rounded transition-all
                      ${(photo.mediaType || "image") === type
                        ? "bg-navy text-cream border-navy"
                        : "border-navy border-opacity-30 text-navy hover:border-navy"}`}
                  >
                    {type === "image" ? "🖼️ Image" : type === "gif" ? "🎞️ GIF" : "🎬 Video"}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload / URL */}
            <ImageUploader
              label="Upload or paste URL (image, GIF, or video)"
              value={photo.url}
              onChange={(v) => update(i, "url", v)}
              height="h-40"
            />

            {/* Preview for video */}
            {(photo.mediaType === "video") && photo.url && (
              <div className="mb-3 rounded overflow-hidden">
                <video src={photo.url} muted playsInline preload="metadata"
                  className="w-full h-32 object-cover rounded" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {/* Instagram URL — optional, enables "See on Instagram" on hover */}
              <input
                value={photo.instagramUrl || ""}
                onChange={(e) => update(i, "instagramUrl", e.target.value)}
                onBlur={(e) => update(i, "instagramUrl", e.target.value.trim())}
                onPaste={(e) => setTimeout(() => update(i, "instagramUrl", e.target.value.trim()), 0)}
                className="form-input text-base py-2"
                placeholder="Instagram post URL (optional)"
              />
              {/* Alt text for accessibility */}
              <input
                value={photo.alt || ""}
                onChange={(e) => update(i, "alt", e.target.value)}
                className="form-input text-base py-2"
                placeholder="Alt text (e.g. Pork belly dish)"
              />
              {/* Comment — shown beneath the photo on the gallery page */}
              <input
                value={photo.comment || ""}
                onChange={(e) => update(i, "comment", e.target.value)}
                className="form-input text-base py-2 md:col-span-2"
                placeholder="Comment shown beneath the photo (optional)"
              />
            </div>
            <button onClick={() => setPhotos([...photos, { ...photo, id: Date.now(), alt: (photo.alt || "") + " (copy)" }])}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Item
            </button>
          </CollapsibleItem>
          </SortableItem>
        );
        })}
        </SortableContext>
        </DndContext>

        <div className="flex gap-4 flex-wrap mt-2">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark">
            <Plus size={14} />Add Item
          </button>
          <button onClick={save} className="btn-primary flex items-center gap-2">
            <Save size={14} />Save Gallery
          </button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // EVENTS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const EventsEditor = () => {
    const [events, setEvents] = useState(JSON.parse(JSON.stringify(siteData.events)));
    const [eventSearch, setEventSearch] = useState("");
    const [eventFilter, setEventFilter] = useState("all"); // all | upcoming | past

    const update = (i, field, value) => {
      setEvents(events.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
    };

    const add = () => setEvents([...events, {
      id: Date.now(), title: "", date: "", time: "", description: "",
      price: 0, capacity: null, venue: "standard-fare", imageUrl: "", toastProductId: null, ticketUrl: ""
    }]);

    const duplicate = (i) => {
      const src = events[i];
      setEvents([...events, { ...src, id: Date.now(), title: src.title + " (copy)" }]);
    };

    const remove = (i) => setEvents(events.filter((_, idx) => idx !== i));

    const save = () => saveWithToast("events", events, "Events");

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = events.findIndex((e) => e.id === active.id);
        const newIdx = events.findIndex((e) => e.id === over.id);
        setEvents(arrayMove(events, oldIdx, newIdx));
      }
    };

    const now = new Date();
    const upcomingCount = events.filter(e => e.date && new Date(e.date + "T23:59:59") >= now).length;
    const pastCount = events.filter(e => e.date && new Date(e.date + "T23:59:59") < now).length;

    const filteredEvents = events
      .map((ev, i) => ({ ...ev, _origIdx: i }))
      .filter(ev => {
        if (eventSearch) {
          const q = eventSearch.toLowerCase();
          if (!(ev.title?.toLowerCase().includes(q) || ev.description?.toLowerCase().includes(q) || ev.venue?.toLowerCase().includes(q))) return false;
        }
        if (eventFilter === "upcoming") return !ev.date || new Date(ev.date + "T23:59:59") >= now;
        if (eventFilter === "past") return ev.date && new Date(ev.date + "T23:59:59") < now;
        return true;
      });

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm text-navy opacity-60">Manage ticketed events, wine dinners, and special nights.</p>
          <ViewOnSite path="/events" />
        </div>

        {/* Event stats */}
        {events.length > 0 && (
          <div className="flex gap-4 mb-4 flex-wrap items-center">
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy/35">{events.length} total</span>
            <span className="font-mono text-[10px] tracking-editorial uppercase text-green-600/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{upcomingCount} upcoming
            </span>
            {pastCount > 0 && (
              <span className="font-mono text-[10px] tracking-editorial uppercase text-amber-600/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{pastCount} past
              </span>
            )}
            <div className="flex gap-1 ml-auto">
              {["all", "upcoming", "past"].map(f => (
                <button key={f} onClick={() => setEventFilter(f)}
                  className={`font-mono text-[10px] tracking-editorial uppercase px-2.5 py-1 rounded-lg transition-all ${
                    eventFilter === f ? "bg-navy text-cream shadow-sm" : "text-navy/35 hover:text-navy/60 hover:bg-navy/[0.04]"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Event search */}
        {events.length > 3 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input value={eventSearch} onChange={(e) => setEventSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
              placeholder="Search events..." />
            {eventSearch && (
              <button onClick={() => setEventSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60"><X size={14} /></button>
            )}
          </div>
        )}

        {events.length === 0 ? (
          <EmptyState message="No events yet" onAdd={add} addLabel="Add First Event" />
        ) : (
        <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        {filteredEvents.map((ev) => {
          const i = ev._origIdx;
          return (
          <SortableItem key={ev.id} id={ev.id}>
          <CollapsibleItem
            label={ev.title || "New Event"}
            thumbnail={ev.imageUrl}
            sublabel={(() => {
              const isPast = ev.date && new Date(ev.date + "T23:59:59") < new Date();
              const parts = [];
              if (isPast) parts.push("⏱ PAST");
              if (ev.venue === "bocage") parts.push("🥂 Bocage");
              if (ev.date) parts.push(ev.date);
              if (ev.price) parts.push(`$${ev.price}`);
              return parts.join(" · ") || "No date set";
            })()}
            defaultOpen={!ev.title}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={ev.title} onChange={(v) => update(i, "title", v)} required maxLength={80} />
              <div className="mb-4">
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Venue</label>
                <select value={ev.venue || "standard-fare"} onChange={(e) => update(i, "venue", e.target.value)}
                  className="form-input text-base">
                  <option value="standard-fare">Standard Fare</option>
                  <option value="bocage">Bocage Champagne Bar</option>
                </select>
              </div>
              <Field label="Date (YYYY-MM-DD)" value={ev.date} onChange={(v) => update(i, "date", v)} placeholder="2026-04-12" validate={validateDate} />
              <Field label="Time" value={ev.time} onChange={(v) => update(i, "time", v)} placeholder="6:30 PM – 9:00 PM" />
              <Field label="Price ($)" value={String(ev.price)} onChange={(v) => update(i, "price", Number(v))} type="number" />
              <Field label="Capacity (leave blank for unlimited)" value={ev.capacity || ""} onChange={(v) => update(i, "capacity", v ? Number(v) : null)} />
              <Field label="Ticket Fallback URL" value={ev.ticketUrl} onChange={(v) => update(i, "ticketUrl", v)} placeholder="https://order.toasttab.com/..." validate={validateUrl} />
              <Field label="Toast Product ID (see README-TOAST.md)" value={ev.toastProductId || ""} onChange={(v) => update(i, "toastProductId", v || null)} placeholder="TOAST-PROD-ID" />
            </div>
            <Field label="Description" value={ev.description} onChange={(v) => update(i, "description", v)} multiline maxLength={500} helpText="Appears on the event detail page. Keep it concise." />
            <ImageUploader
              label="Event Photo"
              value={ev.imageUrl}
              onChange={(v) => update(i, "imageUrl", v)}
              height="h-40"
            />
            <button onClick={() => duplicate(i)}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Event
            </button>
          </CollapsibleItem>
          </SortableItem>
        );
        })}
        </SortableContext>
        </DndContext>
        {filteredEvents.length === 0 && (eventSearch || eventFilter !== "all") && (
          <p className="text-center font-body text-sm text-navy opacity-35 py-4">No events match your filter.</p>
        )}
        <div className="flex gap-4 flex-wrap items-center">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Event</button>
          <TemplatePicker templates={EVENT_TEMPLATES} label="From Template"
            onSelect={(data) => {
              setEvents([...events, { ...data, id: Date.now(), date: "", imageUrl: "", toastProductId: null, ticketUrl: "", capacity: data.capacity || null }]);
              logActivity("created", "events", `Created event from template "${data.title}"`);
            }} />
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Events</button>
          <button onClick={() => {
            const sorted = [...events].sort((a, b) => {
              if (!a.date) return 1;
              if (!b.date) return -1;
              return a.date.localeCompare(b.date);
            });
            setEvents(sorted);
          }}
            className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
            Sort by Date
          </button>
          {pastCount > 0 && (
            <button onClick={() => {
              if (window.confirm(`Archive ${pastCount} past event(s)? They'll be removed from the list.`)) {
                const now = new Date();
                setEvents(events.filter(e => !e.date || new Date(e.date + "T23:59:59") >= now));
                logActivity("deleted", "events", `Archived ${pastCount} past events`);
              }
            }}
              className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              Archive {pastCount} Past
            </button>
          )}
        </div>
        </>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PRINTS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const PrintsEditor = () => {
    const [prints, setPrints] = useState(JSON.parse(JSON.stringify(siteData.prints)));
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState(null);
    const [printSearch, setPrintSearch] = useState("");

    const update = (i, field, value) => {
      setPrints(prints.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    };

    const add = () => setPrints([...prints, {
      id: Date.now(), title: "", artist: "Daniel Fairley", medium: "", price: 0,
      imageUrl: "", available: true, description: "", toastProductId: null
    }]);

    const remove = (i) => setPrints(prints.filter((_, idx) => idx !== i));

    const save = () => saveWithToast("prints", prints, "Paintings");

    // Sync from poemdexter.com (Big Cartel)
    const syncFromBigCartel = async () => {
      setSyncing(true);
      setSyncMsg(null);
      try {
        const apiUrl = process.env.NODE_ENV === "production"
          ? `/api/bigcartel-products?bust=${Date.now()}`
          : `https://poemdexter.bigcartel.com/products.json`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rawProducts = data.products || data;
        if (!Array.isArray(rawProducts) || rawProducts.length === 0) throw new Error("No products returned");

        // Merge: update existing prints by title match, add new ones
        const existingByTitle = {};
        prints.forEach((p) => { existingByTitle[p.title.toLowerCase()] = p; });

        const merged = [];
        const seen = new Set();
        rawProducts.forEach((bp) => {
          const title = bp.name || bp.title;
          const key = title.toLowerCase();
          seen.add(key);
          const existing = existingByTitle[key];
          if (existing) {
            // Update availability and price from Big Cartel, keep local overrides
            merged.push({
              ...existing,
              available: (bp.status === "active"),
              price: bp.default_price || bp.price || existing.price,
              imageUrl: existing.imageUrl || bp.images?.[0]?.url || bp.imageUrl || "",
              bigCartelUrl: bp.url?.startsWith("http") ? bp.url : `https://poemdexter.bigcartel.com${bp.url || `/product/${bp.permalink}`}`,
            });
          } else {
            // New product from Big Cartel
            const cats = (bp.categories || []).map((c) => typeof c === "string" ? c : c.name);
            merged.push({
              id: bp.id || Date.now() + Math.random(),
              title,
              artist: "Daniel Fairley",
              medium: cats.join(", ") || "Mixed Media",
              price: bp.default_price || bp.price || 0,
              imageUrl: bp.images?.[0]?.url || bp.imageUrl || "",
              available: bp.status === "active",
              description: (bp.description || "").replace(/<[^>]+>/g, "").trim(),
              toastProductId: null,
              bigCartelUrl: bp.url?.startsWith("http") ? bp.url : `https://poemdexter.bigcartel.com${bp.url || `/product/${bp.permalink}`}`,
            });
          }
        });
        // Keep any local-only prints that weren't on Big Cartel
        prints.forEach((p) => {
          if (!seen.has(p.title.toLowerCase())) merged.push(p);
        });

        setPrints(merged);
        setSyncMsg(`Synced ${rawProducts.length} products from poemdexter.com`);
      } catch (e) {
        setSyncMsg(`Sync failed: ${e.message}`);
      } finally {
        setSyncing(false);
      }
    };

    return (
      <div>
        {/* Sync banner */}
        <div className="mb-4 bg-white border border-navy/[0.08] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-body text-sm text-navy font-bold">Auto-Import from poemdexter.com</p>
              <p className="font-body text-xs text-navy opacity-50">
                Paintings sync automatically once per day. Use the button to refresh now.
              </p>
            </div>
            <button onClick={syncFromBigCartel} disabled={syncing}
              className="btn-ghost py-2 px-4 text-xs flex items-center gap-2 disabled:opacity-40">
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          </div>
          {syncMsg && (
            <p className={`font-mono text-xs mt-2 ${syncMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
              {syncMsg}
            </p>
          )}
        </div>

        {/* Prints stats + search */}
        {prints.length > 0 && (
          <div className="flex gap-4 mb-4 flex-wrap">
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40">{prints.length} painting{prints.length !== 1 ? "s" : ""}</span>
            <span className="font-mono text-[10px] tracking-editorial uppercase text-green-700 opacity-50">{prints.filter(p => p.available).length} available</span>
            {prints.some(p => !p.available) && <span className="font-mono text-[10px] tracking-editorial uppercase text-amber-600 opacity-50">{prints.filter(p => !p.available).length} sold out</span>}
          </div>
        )}
        {prints.length > 3 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input value={printSearch} onChange={(e) => setPrintSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
              placeholder="Search paintings..." />
            {printSearch && (
              <button onClick={() => setPrintSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60"><X size={14} /></button>
            )}
          </div>
        )}

        {prints.filter(p => !printSearch || p.title?.toLowerCase().includes(printSearch.toLowerCase()) || p.artist?.toLowerCase().includes(printSearch.toLowerCase())).map((p, i) => (
          <CollapsibleItem
            key={p.id}
            label={p.title || "New Print"}
            thumbnail={p.imageUrl}
            sublabel={`${p.artist || "No artist"}${p.price ? ` · $${p.price}` : ""}${p.available ? "" : " · SOLD OUT"}`}
            defaultOpen={!p.title}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={p.title} onChange={(v) => update(i, "title", v)} required />
              <Field label="Artist" value={p.artist} onChange={(v) => update(i, "artist", v)} required />
              <Field label="Medium" value={p.medium} onChange={(v) => update(i, "medium", v)} placeholder="Acrylic on Canvas" />
              <Field label="Price ($)" value={String(p.price)} onChange={(v) => update(i, "price", Number(v))} type="number" />
              <Field label="Toast Product ID" value={p.toastProductId || ""} onChange={(v) => update(i, "toastProductId", v || null)} placeholder="TOAST-PROD-ID" />
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id={`avail-${i}`} checked={p.available}
                  onChange={(e) => update(i, "available", e.target.checked)}
                  className="accent-flamingo w-4 h-4" />
                <label htmlFor={`avail-${i}`} className="font-body text-sm text-navy">Available for purchase</label>
              </div>
            </div>
            <Field label="Description" value={p.description} onChange={(v) => update(i, "description", v)} multiline />
            <ImageUploader
              label="Print Photo"
              value={p.imageUrl}
              onChange={(v) => update(i, "imageUrl", v)}
              height="h-48"
            />
            <button onClick={() => {
              const src = prints[i];
              setPrints([...prints, { ...src, id: Date.now(), title: src.title + " (copy)" }]);
            }}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Painting
            </button>
          </CollapsibleItem>
        ))}
        <div className="flex gap-4 flex-wrap items-center">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Print</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Prints</button>
          <button onClick={() => setPrints([...prints].sort((a, b) => (b.price || 0) - (a.price || 0)))}
            className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
            Sort by Price
          </button>
          <button onClick={() => setPrints([...prints].sort((a, b) => (a.title || "").localeCompare(b.title || "")))}
            className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
            Sort A-Z
          </button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PRESS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  // Searchable outlet dropdown — type to filter known publications, select to
  // auto-fill outlet name + logo. Still allows custom entries.
  const OutletSelector = ({ value, logo, onChange }) => {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const filtered = query.trim()
      ? PRESS_OUTLETS.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
      : PRESS_OUTLETS;

    // Group by category
    const grouped = {};
    filtered.forEach((o) => {
      if (!grouped[o.category]) grouped[o.category] = [];
      grouped[o.category].push(o);
    });
    const categoryOrder = ["Local", "Regional", "National", "Platform"];

    const select = (outlet) => {
      onChange(outlet.name, outlet.logo);
      setQuery("");
      setOpen(false);
    };

    return (
      <div className="relative">
        <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Publication</label>
        <div className="flex items-center gap-2">
          {logo && (
            <img src={logo} alt="" className="w-6 h-6 object-contain rounded flex-shrink-0" />
          )}
          <input
            value={open ? query : value}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            className="form-input text-base py-2 flex-1"
            placeholder="Search or type outlet name..."
          />
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-navy border-opacity-15 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {categoryOrder.map((cat) => {
              if (!grouped[cat]) return null;
              return (
                <div key={cat}>
                  <div className="px-3 py-1.5 bg-cream-warm font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 sticky top-0">
                    {cat}
                  </div>
                  {grouped[cat].map((o) => (
                    <button key={o.name} type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => select(o)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-cream-warm transition-colors text-left">
                      <img src={o.logo} alt="" className="w-5 h-5 object-contain rounded flex-shrink-0"
                        onError={(e) => { e.target.style.display = "none"; }} />
                      <span className="font-body text-sm text-navy">{o.name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const PressEditor = () => {
    const [press, setPress] = useState(JSON.parse(JSON.stringify(siteData.press)));

    const handleNewArticles = (newArticles) => {
      setPress((prev) => [...prev, ...newArticles]);
    };

    const { loading: refreshing, lastUpdated, newCount, forceRefresh } = usePressRefresh(
      press, handleNewArticles
    );

    const update = (i, field, value) => {
      setPress(press.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    };

    const selectOutlet = (i, name, logo) => {
      setPress(press.map((p, idx) => idx === i ? { ...p, outlet: name, logo } : p));
    };

    const add = () => setPress([...press, { id: Date.now(), outlet: "", headline: "", url: "", logo: "" }]);
    const remove = (i) => setPress(press.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("press", press, "Press");

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm text-navy opacity-60">{press.length} article{press.length !== 1 ? "s" : ""}</p>
          <ViewOnSite path="/press" />
        </div>
        {press.length === 0 && (
          <EmptyState message="No press articles yet" onAdd={add} addLabel="Add First Article" />
        )}
        {press.map((p, i) => (
          <CollapsibleItem
            key={p.id}
            label={p.outlet || "New Article"}
            sublabel={p.headline || "No headline"}
            defaultOpen={!p.outlet}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <OutletSelector
                value={p.outlet}
                logo={p.logo}
                onChange={(name, logo) => selectOutlet(i, name, logo)}
              />
              <Field label="Article URL" value={p.url} onChange={(v) => update(i, "url", v)} placeholder="https://..." validate={validateUrl} />
              <div className="md:col-span-2">
                <Field label="Article Headline" value={p.headline} onChange={(v) => update(i, "headline", v)} placeholder="Article headline or pull quote" required maxLength={120} />
              </div>
            </div>
            <ImageUploader
              label="Custom Logo (overrides preset — optional)"
              value={p.logo || ""}
              onChange={(v) => update(i, "logo", v)}
              height="h-16"
            />
            <button onClick={() => {
              setPress([...press, { ...p, id: Date.now(), headline: p.headline + " (copy)" }]);
            }}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Article
            </button>
          </CollapsibleItem>
        ))}
        <div className="flex gap-4 flex-wrap mt-2 items-center">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Article</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Press</button>
          <button onClick={forceRefresh} disabled={refreshing}
            className="flex items-center gap-2 font-body text-sm text-navy opacity-50 hover:opacity-100 hover:text-flamingo transition-all disabled:opacity-30">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Scanning..." : "Scan for New Press"}
          </button>
        </div>
        {/* Refresh status */}
        {(lastUpdated || newCount > 0) && (
          <div className="mt-2 font-body text-xs text-navy opacity-40">
            {newCount > 0 && (
              <span className="text-flamingo font-bold opacity-100 mr-3">
                {newCount} new article{newCount > 1 ? "s" : ""} found — hit Save to keep
              </span>
            )}
            {lastUpdated && (
              <span>Last scan: {new Date(lastUpdated).toLocaleString()}</span>
            )}
          </div>
        )}
        <p className="mt-1 font-body text-xs text-navy opacity-30">
          Press is automatically scanned every 12 hours. Only positive reviews are shown.
        </p>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LINKS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const LinksEditor = () => {
    const [links, setLinks] = useState({ ...siteData.links });
    const save = () => saveWithToast("links", links, "Links");
    const labels = {
      reservations:    "Resy Reservations URL",
      doordash:        "DoorDash Order URL",
      giftCards:       "Toast Gift Cards URL",
      instagram:       "Instagram URL",
      toastOnlineOrder:"Toast Online Order Base URL",
      bocage:          "Bocage Champagne Bar URL",
    };

    return (
      <div>
        {Object.entries(links).map(([key, val]) => (
          <CollapsibleItem
            key={key}
            label={labels[key] || key}
            sublabel={val ? String(val).substring(0, 50) : "Not set"}
            defaultOpen={false}
          >
            <Field label={labels[key] || key} value={val} onChange={(v) => setLinks({ ...links, [key]: v })} validate={validateUrl} placeholder="https://" />
            {val && (
              <div className="flex gap-3 mt-1">
                <button onClick={() => { navigator.clipboard?.writeText(val); setToast({ message: "URL copied!", type: "success" }); }}
                  className="font-body text-[10px] text-navy opacity-30 hover:opacity-60 transition-opacity underline underline-offset-2">
                  Copy URL
                </button>
                <a href={val} target="_blank" rel="noopener noreferrer"
                  className="font-body text-[10px] text-flamingo opacity-50 hover:opacity-80 transition-opacity underline underline-offset-2">
                  Open in new tab
                </a>
              </div>
            )}
          </CollapsibleItem>
        ))}
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Links</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CONTACT EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  // CONTACT EDITOR — add / remove / label any number of contact emails
  // ───────────────────────────────────────────────────────────────────────────
  const ContactEditor = () => {
    // Convert the contact object into an editable array of { label, email } pairs
    const toArray = (obj) => Object.entries(obj || {}).map(([label, email]) => ({ label, email }));
    const toObject = (arr) => arr.reduce((acc, { label, email }) => {
      if (label) acc[label] = email;
      return acc;
    }, {});

    const [entries, setEntries] = useState(toArray(siteData.contact));

    const update = (i, field, value) =>
      setEntries(entries.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
    const add    = () => setEntries([...entries, { label: "", email: "" }]);
    const remove = (i) => setEntries(entries.filter((_, idx) => idx !== i));
    const save   = () => saveWithToast("contact", toObject(entries), "Contact");

    return (
      <div>
        <p className="font-body text-sm text-navy opacity-50 mb-5 leading-relaxed">
          These email addresses appear on the Contact page. Add as many as you need —
          press, private events, general inquiries, etc.
        </p>

        {entries.map((entry, i) => (
          <CollapsibleItem
            key={i}
            label={entry.label || `Email ${i + 1}`}
            sublabel={entry.email || "No email yet"}
            defaultOpen={!entry.label}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Label</label>
                <input value={entry.label} onChange={(e) => update(i, "label", e.target.value)}
                  className="form-input text-base py-2" placeholder="e.g. Press" />
              </div>
              <Field
                label="Email Address"
                value={entry.email}
                onChange={(v) => update(i, "email", v)}
                placeholder="email@example.com"
                type="email"
                validate={validateEmail}
              />
            </div>
          </CollapsibleItem>
        ))}

        <div className="flex gap-4 flex-wrap mt-3">
          <button onClick={add}
            className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors">
            <Plus size={14} />Add Email
          </button>
          <button onClick={save} className="btn-primary flex items-center gap-2">
            <Save size={14} />Save Contact Emails
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SITE SETTINGS EDITOR
  // ─────────────────────────────────────────────────────────────────────────
  const SiteSettingsEditor = () => {
    const {
      siteData: sd,
      adminPassword, previewPassword,
      changeAdminPassword, changePreviewPassword,
    } = useSite();

    const [previewMode, setPreviewMode] = useState(
      sd.settings?.previewMode !== false
    );
    const [showOrderBtn, setShowOrderBtn] = useState(
      sd.settings?.showOrderButton !== false
    );
    const [showBottleShop, setShowBottleShop] = useState(
      sd.settings?.showBottleShop !== false
    );
    const [showPaintings, setShowPaintings] = useState(
      sd.settings?.showPaintings !== false
    );
    const [paintingsPw, setPaintingsPw] = useState("");
    const [paintingsMsg, setPaintingsMsg] = useState(null);
    const PAINTINGS_PASSWORD = "iluvartbydan26";

    // Admin password change state
    const [newAdmin,        setNewAdmin]        = useState("");
    const [confirmAdmin,    setConfirmAdmin]     = useState("");
    const [adminMsg,        setAdminMsg]         = useState(null); // { ok, text }
    const [showAdminPw,     setShowAdminPw]      = useState(false);

    // Preview password change state
    const [newPreview,      setNewPreview]       = useState("");
    const [confirmPreview,  setConfirmPreview]   = useState("");
    const [previewMsg,      setPreviewMsg]       = useState(null);
    const [showPreviewPw,   setShowPreviewPw]    = useState(false);

    // Save preview mode toggle
    const savePreviewMode = async () => {
      await updateData("settings", { ...sd.settings, previewMode });
    };

    // Save order button toggle
    const saveOrderBtn = async () => {
      await updateData("settings", { ...sd.settings, showOrderButton: showOrderBtn });
    };

    // Save bottle shop toggle
    const saveBottleShop = async () => {
      await updateData("settings", { ...sd.settings, showBottleShop });
    };

    // Save paintings toggle (requires separate password)
    const savePaintings = async () => {
      if (paintingsPw !== PAINTINGS_PASSWORD) {
        setPaintingsMsg({ ok: false, text: "Incorrect password." });
        return;
      }
      await updateData("settings", { ...sd.settings, showPaintings });
      setPaintingsMsg({ ok: true, text: showPaintings ? "Paintings section is now visible." : "Paintings section is now hidden." });
      setPaintingsPw("");
    };

    // Change admin password
    const handleAdminPwChange = async (e) => {
      e.preventDefault();
      if (!newAdmin.trim()) return setAdminMsg({ ok: false, text: "Password can't be empty." });
      if (newAdmin !== confirmAdmin) return setAdminMsg({ ok: false, text: "Passwords don't match." });
      await changeAdminPassword(newAdmin.trim());
      setAdminMsg({ ok: true, text: `✓ Admin password updated. New password: "${newAdmin.trim()}"` });
      setNewAdmin(""); setConfirmAdmin("");
    };

    // Change preview password
    const handlePreviewPwChange = async (e) => {
      e.preventDefault();
      if (!newPreview.trim()) return setPreviewMsg({ ok: false, text: "Password can't be empty." });
      if (newPreview !== confirmPreview) return setPreviewMsg({ ok: false, text: "Passwords don't match." });
      await changePreviewPassword(newPreview.trim());
      setPreviewMsg({ ok: true, text: `✓ Preview password updated. New password: "${newPreview.trim()}"` });
      setNewPreview(""); setConfirmPreview("");
    };

    return (
      <div className="space-y-3">

        {/* ── Preview Gate Toggle ─────────────────────────────── */}
        <CollapsibleItem
          label="Password Landing Page"
          sublabel={previewMode ? "ON — gate is active" : "OFF — site is public"}
          defaultOpen={true}
        >
          <div className="flex items-start justify-between gap-6 p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
            <div className="flex-1">
              <p className="font-body text-navy font-bold text-sm mb-1">Password Gate</p>
              <p className="font-body text-navy opacity-50 text-xs leading-relaxed">
                When ON, visitors see a password prompt before accessing the site.
                Turn OFF when the site is ready to go fully public.
              </p>
              <p className={`font-mono text-xs tracking-editorial uppercase mt-2 ${previewMode ? "text-flamingo" : "text-navy opacity-40"}`}>
                {previewMode ? "ON — gate is active" : "OFF — site is public"}
              </p>
            </div>
            <button
              onClick={() => setPreviewMode(v => !v)}
              aria-label={previewMode ? "Disable password gate" : "Enable password gate"}
              role="switch"
              aria-checked={previewMode}
              className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-colors duration-300
                ${previewMode ? "bg-flamingo" : "bg-navy bg-opacity-20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow
                transition-transform duration-300 ${previewMode ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>
          <button onClick={savePreviewMode} className="btn-primary flex items-center gap-2 mt-3">
            <Save size={14} />Save Gate Setting
          </button>
        </CollapsibleItem>

        {/* ── Order Button Toggle ───────────────────────────────── */}
        <CollapsibleItem
          label="Order Button"
          sublabel={showOrderBtn ? "Visible to visitors" : "Hidden from visitors"}
          defaultOpen={false}
        >
          <div className="flex items-start justify-between gap-6 p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
            <div className="flex-1">
              <p className="font-body text-navy font-bold text-sm mb-1">Show Order Button</p>
              <p className="font-body text-navy opacity-50 text-xs leading-relaxed">
                Toggle the "Order" button in the navigation bar. Hide it when online ordering isn't available.
              </p>
              <p className={`font-mono text-xs tracking-editorial uppercase mt-2 ${showOrderBtn ? "text-flamingo" : "text-navy opacity-40"}`}>
                {showOrderBtn ? "Visible" : "Hidden"}
              </p>
            </div>
            <button
              onClick={() => setShowOrderBtn(v => !v)}
              aria-label={showOrderBtn ? "Hide order button" : "Show order button"}
              role="switch"
              aria-checked={showOrderBtn}
              className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-colors duration-300
                ${showOrderBtn ? "bg-flamingo" : "bg-navy bg-opacity-20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow
                transition-transform duration-300 ${showOrderBtn ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>
          <button onClick={saveOrderBtn} className="btn-primary flex items-center gap-2 mt-3">
            <Save size={14} />Save
          </button>
        </CollapsibleItem>

        {/* ── Bottle Shop Toggle ──────────────────────────────────── */}
        <CollapsibleItem
          label="Bottle Shop"
          sublabel={showBottleShop ? "Visible to visitors" : "Hidden from visitors"}
          defaultOpen={false}
        >
          <div className="flex items-start justify-between gap-6 p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
            <div className="flex-1">
              <p className="font-body text-navy font-bold text-sm mb-1">Show Bottle Shop</p>
              <p className="font-body text-navy opacity-50 text-xs leading-relaxed">
                Toggle the Bottle Shop page, nav link, and homepage preview.
                Hide it if wine/bottle sales aren't active yet.
              </p>
              <p className={`font-mono text-xs tracking-editorial uppercase mt-2 ${showBottleShop ? "text-flamingo" : "text-navy opacity-40"}`}>
                {showBottleShop ? "Visible" : "Hidden"}
              </p>
            </div>
            <button
              onClick={() => setShowBottleShop(v => !v)}
              aria-label={showBottleShop ? "Hide bottle shop" : "Show bottle shop"}
              role="switch"
              aria-checked={showBottleShop}
              className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-colors duration-300
                ${showBottleShop ? "bg-flamingo" : "bg-navy bg-opacity-20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow
                transition-transform duration-300 ${showBottleShop ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>
          <button onClick={saveBottleShop} className="btn-primary flex items-center gap-2 mt-3">
            <Save size={14} />Save
          </button>
        </CollapsibleItem>

        {/* ── Paintings Section Toggle ────────────────────────────── */}
        <CollapsibleItem
          label="Paintings Section"
          sublabel={showPaintings ? "Visible to visitors" : "Hidden from visitors"}
          defaultOpen={false}
        >
          <div className="flex items-start justify-between gap-6 p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
            <div className="flex-1">
              <p className="font-body text-navy font-bold text-sm mb-1">Show Paintings</p>
              <p className="font-body text-navy opacity-50 text-xs leading-relaxed">
                Toggle Daniel Fairley's paintings section. Hides the Paintings page, nav link, and
                homepage preview. Requires a separate password to change.
              </p>
              <p className={`font-mono text-xs tracking-editorial uppercase mt-2 ${showPaintings ? "text-flamingo" : "text-navy opacity-40"}`}>
                {showPaintings ? "Visible" : "Hidden"}
              </p>
            </div>
            <button
              onClick={() => setShowPaintings(v => !v)}
              aria-label={showPaintings ? "Hide paintings" : "Show paintings"}
              role="switch"
              aria-checked={showPaintings}
              className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-colors duration-300
                ${showPaintings ? "bg-flamingo" : "bg-navy bg-opacity-20"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow
                transition-transform duration-300 ${showPaintings ? "translate-x-7" : "translate-x-0"}`} />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2 max-w-sm">
            <input
              type="password"
              value={paintingsPw}
              onChange={(e) => { setPaintingsPw(e.target.value); setPaintingsMsg(null); }}
              className="form-input text-base py-2"
              placeholder="Enter paintings password to save"
            />
            {paintingsMsg && (
              <p className={`font-body text-sm ${paintingsMsg.ok ? "text-green-700" : "text-flamingo-dark"}`}>
                {paintingsMsg.text}
              </p>
            )}
            <button onClick={savePaintings} className="btn-primary flex items-center gap-2 w-fit">
              <Save size={14} />Save Paintings Setting
            </button>
          </div>
        </CollapsibleItem>

        {/* ── Change Preview Password ─────────────────────────── */}
        <CollapsibleItem
          label="Preview Password"
          sublabel={`Current: ${previewPassword}`}
          defaultOpen={false}
        >
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">
            Preview Password
          </p>
          <p className="font-body text-navy opacity-50 text-xs mb-4">
            Current: <span className="font-bold text-navy opacity-70">{previewPassword}</span>
            {" "}— shared with anyone who needs to preview the site before launch.
          </p>
          <form onSubmit={handlePreviewPwChange} className="flex flex-col gap-3 max-w-sm">
            <div className="relative">
              <input
                type={showPreviewPw ? "text" : "password"}
                value={newPreview}
                onChange={(e) => { setNewPreview(e.target.value); setPreviewMsg(null); }}
                className="form-input text-base py-2 pr-20"
                placeholder="New preview password"
              />
              <button type="button" onClick={() => setShowPreviewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-navy opacity-40 hover:opacity-80">
                {showPreviewPw ? "hide" : "show"}
              </button>
            </div>
            <input
              type={showPreviewPw ? "text" : "password"}
              value={confirmPreview}
              onChange={(e) => { setConfirmPreview(e.target.value); setPreviewMsg(null); }}
              className="form-input text-base py-2"
              placeholder="Confirm new preview password"
            />
            {previewMsg && (
              <p className={`font-body text-sm ${previewMsg.ok ? "text-green-700" : "text-flamingo-dark"}`}>
                {previewMsg.text}
              </p>
            )}
            <button type="submit" className="btn-primary flex items-center gap-2 w-fit">
              <Save size={14} />Update Preview Password
            </button>
          </form>
        </CollapsibleItem>

        {/* ── Change Admin Password ───────────────────────────── */}
        <CollapsibleItem
          label="Admin Password"
          sublabel={`Current: ${adminPassword}`}
          defaultOpen={false}
        >
          <p className="font-body text-navy opacity-50 text-xs mb-4">
            Current: <span className="font-bold text-navy opacity-70">{adminPassword}</span>
            {" "}— used to log into this admin panel.
          </p>
          <form onSubmit={handleAdminPwChange} className="flex flex-col gap-3 max-w-sm">
            <div className="relative">
              <input
                type={showAdminPw ? "text" : "password"}
                value={newAdmin}
                onChange={(e) => { setNewAdmin(e.target.value); setAdminMsg(null); }}
                className="form-input text-base py-2 pr-20"
                placeholder="New admin password"
              />
              <button type="button" onClick={() => setShowAdminPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-navy opacity-40 hover:opacity-80">
                {showAdminPw ? "hide" : "show"}
              </button>
            </div>
            <input
              type={showAdminPw ? "text" : "password"}
              value={confirmAdmin}
              onChange={(e) => { setConfirmAdmin(e.target.value); setAdminMsg(null); }}
              className="form-input text-base py-2"
              placeholder="Confirm new admin password"
            />
            {adminMsg && (
              <p className={`font-body text-sm ${adminMsg.ok ? "text-green-700" : "text-flamingo-dark"}`}>
                {adminMsg.text}
              </p>
            )}
            <button type="submit" className="btn-primary flex items-center gap-2 w-fit">
              <Save size={14} />Update Admin Password
            </button>
          </form>
          <p className="font-body text-xs text-navy opacity-30 mt-3">
            Write down your new password before saving — if you forget it you'll need to reset the site data.
          </p>
        </CollapsibleItem>

      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // MERCH EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const MerchEditor = () => {
    const [items, setItems] = useState(JSON.parse(JSON.stringify(siteData.merch || [])));
    const [merchSearch, setMerchSearch] = useState("");

    const update = (i, field, value) =>
      setItems(items.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

    const add = () => setItems([...items, {
      id: Date.now(), name: "", category: "", description: "",
      price: 0, imageUrl: "", variants: "", available: true, draft: true, toastProductId: null,
    }]);

    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("merch", items, "Merchandise");

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = items.findIndex((m) => m.id === active.id);
        const newIdx = items.findIndex((m) => m.id === over.id);
        setItems(arrayMove(items, oldIdx, newIdx));
      }
    };

    const publishedCount = items.filter(m => !m.draft).length;
    const filteredMerch = items
      .map((m, i) => ({ ...m, _origIdx: i }))
      .filter(m => !merchSearch || m.name?.toLowerCase().includes(merchSearch.toLowerCase()) || m.category?.toLowerCase().includes(merchSearch.toLowerCase()));

    return (
      <div>
        {/* Merch stats */}
        {items.length > 0 && (
          <div className="flex gap-4 mb-4 flex-wrap">
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40">{items.length} item{items.length !== 1 ? "s" : ""}</span>
            <span className="font-mono text-[10px] tracking-editorial uppercase text-green-700 opacity-50">{publishedCount} published</span>
            {items.some(m => !m.available) && (
              <span className="font-mono text-[10px] tracking-editorial uppercase text-amber-600 opacity-50">{items.filter(m => !m.available).length} sold out</span>
            )}
          </div>
        )}

        {/* Search */}
        {items.length > 3 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input value={merchSearch} onChange={(e) => setMerchSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
              placeholder="Search merchandise..." />
            {merchSearch && (
              <button onClick={() => setMerchSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60"><X size={14} /></button>
            )}
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        {filteredMerch.map((item) => {
          const i = item._origIdx;
          return (
          <SortableItem key={item.id} id={item.id}>
          <CollapsibleItem
            label={item.name || "New Item"}
            thumbnail={item.imageUrl}
            sublabel={`${item.draft ? "DRAFT · " : ""}${item.category || "No category"}${item.price ? ` · $${item.price}` : ""}${item.available ? "" : " · SOLD OUT"}`}
            defaultOpen={!item.name}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Item Name" value={item.name} onChange={(v) => update(i, "name", v)} placeholder="Logo Tee" required />
              <Field label="Category" value={item.category} onChange={(v) => update(i, "category", v)} placeholder="Apparel" />
              <Field label="Price ($)" value={String(item.price)} onChange={(v) => update(i, "price", Number(v))} type="number" />
              <Field label="Variants (sizes, colors)" value={item.variants} onChange={(v) => update(i, "variants", v)} placeholder="S / M / L / XL" />
              <Field label="Toast Product ID" value={item.toastProductId || ""} onChange={(v) => update(i, "toastProductId", v || null)} placeholder="TOAST-PROD-ID" />
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id={`merch-draft-${i}`} checked={!item.draft}
                  onChange={(e) => update(i, "draft", !e.target.checked)}
                  className="accent-flamingo w-4 h-4" />
                <label htmlFor={`merch-draft-${i}`} className="font-body text-sm text-navy">Published (visible to guests)</label>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id={`merch-avail-${i}`} checked={item.available}
                  onChange={(e) => update(i, "available", e.target.checked)}
                  className="accent-flamingo w-4 h-4" />
                <label htmlFor={`merch-avail-${i}`} className="font-body text-sm text-navy">Available for purchase</label>
              </div>
            </div>
            <Field label="Description" value={item.description} onChange={(v) => update(i, "description", v)} multiline />
            <ImageUploader label="Product Photo" value={item.imageUrl} onChange={(v) => update(i, "imageUrl", v)} height="h-48" />
            <button onClick={() => {
              const src = items[i];
              setItems([...items, { ...src, id: Date.now(), name: src.name + " (copy)" }]);
            }}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Item
            </button>
          </CollapsibleItem>
          </SortableItem>
        );
        })}
        </SortableContext>
        </DndContext>
        {filteredMerch.length === 0 && merchSearch && (
          <p className="text-center font-body text-sm text-navy opacity-35 py-4">No items match your search.</p>
        )}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Item</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Merchandise</button>
          {items.some(m => m.draft) && (
            <button onClick={() => setItems(items.map(m => ({ ...m, draft: false })))}
              className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Check size={12} /> Publish All Drafts
            </button>
          )}
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // BOTTLES EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const BottlesEditor = () => {
    const [items, setItems] = useState(JSON.parse(JSON.stringify(siteData.bottles || [])));
    const [bottleFilter, setBottleFilter] = useState("all"); // all | wine | beer
    const [bottleSearch, setBottleSearch] = useState("");

    const update = (i, field, value) =>
      setItems(items.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));

    const add = () => setItems([...items, {
      id: Date.now(), name: "", category: "wine", varietal: "", region: "",
      description: "", price: 0, imageUrl: "", available: true, draft: true, toastProductId: null,
    }]);

    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("bottles", items, "Bottle Shop");

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = items.findIndex((b) => b.id === active.id);
        const newIdx = items.findIndex((b) => b.id === over.id);
        setItems(arrayMove(items, oldIdx, newIdx));
      }
    };

    const wineCount = items.filter(b => b.category === "wine").length;
    const beerCount = items.filter(b => b.category === "beer").length;
    const publishedCount = items.filter(b => !b.draft).length;

    const filteredBottles = items
      .map((b, i) => ({ ...b, _origIdx: i }))
      .filter(b => {
        if (bottleFilter !== "all" && b.category !== bottleFilter) return false;
        if (bottleSearch) {
          const q = bottleSearch.toLowerCase();
          if (!(b.name?.toLowerCase().includes(q) || b.varietal?.toLowerCase().includes(q) || b.region?.toLowerCase().includes(q))) return false;
        }
        return true;
      });

    return (
      <div>
        {/* Bottle stats */}
        {items.length > 0 && (
          <div className="flex gap-4 mb-4 flex-wrap items-center">
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40">{items.length} total</span>
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30">{wineCount} wine · {beerCount} beer</span>
            <span className="font-mono text-[10px] tracking-editorial uppercase text-green-700 opacity-50">{publishedCount} published</span>
            <div className="flex gap-1 ml-auto">
              {[["all", "All"], ["wine", "Wine"], ["beer", "Beer"]].map(([val, label]) => (
                <button key={val} onClick={() => setBottleFilter(val)}
                  className={`font-mono text-[10px] tracking-editorial uppercase px-2 py-1 rounded transition-colors
                    ${bottleFilter === val ? "bg-navy text-cream" : "text-navy opacity-40 hover:opacity-70"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottle search */}
        {items.length > 3 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input value={bottleSearch} onChange={(e) => setBottleSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
              placeholder="Search bottles..." />
            {bottleSearch && (
              <button onClick={() => setBottleSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60"><X size={14} /></button>
            )}
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {filteredBottles.map((bottle) => {
          const i = bottle._origIdx;
          return (
          <SortableItem key={bottle.id} id={bottle.id}>
          <CollapsibleItem
            label={bottle.name || "New Bottle"}
            thumbnail={bottle.imageUrl}
            sublabel={`${bottle.draft ? "DRAFT · " : ""}${bottle.category === "wine" ? "Wine" : "Beer"} · ${bottle.varietal || "No varietal"}${bottle.price ? ` · $${bottle.price}` : ""}${bottle.available ? "" : " · SOLD OUT"}`}
            defaultOpen={!bottle.name}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Bottle Name" value={bottle.name} onChange={(v) => update(i, "name", v)} placeholder="Château Margaux 2018" required />
              <div>
                <label className="font-mono text-[11px] tracking-editorial uppercase text-navy/45 font-medium block mb-1">Category</label>
                <select value={bottle.category} onChange={(e) => update(i, "category", e.target.value)}
                  className="form-input text-base">
                  <option value="wine">Wine</option>
                  <option value="beer">Beer</option>
                  <option value="spirits">Spirits</option>
                  <option value="cider">Cider</option>
                  <option value="sake">Sake</option>
                  <option value="non-alcoholic">Non-Alcoholic</option>
                </select>
              </div>
              <Field label="Varietal / Style" value={bottle.varietal} onChange={(v) => update(i, "varietal", v)} placeholder="Cabernet Sauvignon" />
              <Field label="Region / Brewery" value={bottle.region} onChange={(v) => update(i, "region", v)} placeholder="Bordeaux, France" />
              <Field label="Vintage / Year" value={bottle.vintage || ""} onChange={(v) => update(i, "vintage", v)} placeholder="2021" />
              <Field label="Price ($)" value={String(bottle.price)} onChange={(v) => update(i, "price", Number(v))} type="number" />
              <Field label="Toast Product ID" value={bottle.toastProductId || ""} onChange={(v) => update(i, "toastProductId", v || null)} placeholder="TOAST-PROD-ID" />
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id={`btl-draft-${i}`} checked={!bottle.draft}
                  onChange={(e) => update(i, "draft", !e.target.checked)}
                  className="accent-flamingo w-4 h-4" />
                <label htmlFor={`btl-draft-${i}`} className="font-body text-sm text-navy">Published (visible to guests)</label>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input type="checkbox" id={`btl-avail-${i}`} checked={bottle.available}
                  onChange={(e) => update(i, "available", e.target.checked)}
                  className="accent-flamingo w-4 h-4" />
                <label htmlFor={`btl-avail-${i}`} className="font-body text-sm text-navy">Available for purchase</label>
              </div>
            </div>
            <Field label="Description" value={bottle.description} onChange={(v) => update(i, "description", v)} multiline />
            <ImageUploader label="Bottle Photo" value={bottle.imageUrl} onChange={(v) => update(i, "imageUrl", v)} height="h-48" />
            <button onClick={() => {
              const src = items[i];
              setItems([...items, { ...src, id: Date.now(), name: src.name + " (copy)" }]);
            }}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Bottle
            </button>
          </CollapsibleItem>
          </SortableItem>
        );
        })}
        </SortableContext>
        </DndContext>
        {filteredBottles.length === 0 && (bottleSearch || bottleFilter !== "all") && (
          <p className="text-center font-body text-sm text-navy opacity-35 py-4">No bottles match your filter.</p>
        )}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Bottle</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Bottles</button>
          <button onClick={() => setItems([...items].sort((a, b) => (b.price || 0) - (a.price || 0)))}
            className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
            Sort by Price
          </button>
          {items.some(b => b.draft) && (
            <button onClick={() => setItems(items.map(b => ({ ...b, draft: false })))}
              className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Check size={12} /> Publish All Drafts
            </button>
          )}
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SPECIALS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const SpecialsEditor = () => {
    const [items, setItems] = useState(JSON.parse(JSON.stringify(siteData.specials || [])));
    const update = (i, field, value) => setItems(items.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
    const toggleDay = (i, day) => {
      const days = items[i].days.includes(day) ? items[i].days.filter((d) => d !== day) : [...items[i].days, day];
      update(i, "days", days);
    };
    const add = () => setItems([...items, { id: Date.now(), title: "", description: "", days: [], startTime: "16:00", endTime: "18:00", active: true }]);
    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("specials", items, "Daily Specials");
    const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    return (
      <div>
        {items.map((s, i) => (
          <CollapsibleItem key={s.id}
            label={<span className="flex items-center gap-2">
              {s.title || "New Special"}
              {s.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
            </span>}
            sublabel={`${s.active ? "" : "Inactive · "}${s.days?.length || 0} day${(s.days?.length || 0) !== 1 ? "s" : ""}${s.startTime ? ` · ${s.startTime}–${s.endTime}` : ""}`}
            defaultOpen={!s.title} onRemove={() => remove(i)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={s.title} onChange={(v) => update(i, "title", v)} placeholder="Happy Hour" />
              <Field label="Description" value={s.description} onChange={(v) => update(i, "description", v)} placeholder="$8 cocktails, $5 drafts" />
              <Field label="Start Time" value={s.startTime} onChange={(v) => update(i, "startTime", v)} type="time" />
              <Field label="End Time" value={s.endTime} onChange={(v) => update(i, "endTime", v)} type="time" />
            </div>
            <div className="mt-4">
              <label className="font-mono text-[11px] tracking-editorial uppercase text-navy/45 font-medium block mb-2">Active Days</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {allDays.map((day) => (
                  <button key={day} onClick={() => toggleDay(i, day)} type="button"
                    className={`w-10 h-10 rounded-xl text-[10px] font-mono uppercase font-bold transition-all ${
                      s.days.includes(day)
                        ? "bg-flamingo text-white shadow-sm"
                        : "bg-navy/[0.04] text-navy/30 hover:bg-navy/[0.08]"
                    }`}>
                    {day.slice(0, 2)}
                  </button>
                ))}
                <button onClick={() => update(i, "days", s.days.length === 7 ? [] : [...allDays])} type="button"
                  className="font-mono text-[9px] text-navy/25 hover:text-flamingo ml-2 px-2 py-1 rounded-lg hover:bg-flamingo/5 transition-all">
                  {s.days.length === 7 ? "Clear" : "All"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input type="checkbox" checked={s.active} onChange={(e) => update(i, "active", e.target.checked)} className="accent-flamingo w-4 h-4" />
              <span className="font-body text-sm text-navy">{s.active ? "Active — visible to guests" : "Inactive — hidden"}</span>
            </div>
            <button onClick={() => setItems([...items, { ...s, id: Date.now(), title: s.title + " (copy)" }])}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Special
            </button>
          </CollapsibleItem>
        ))}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Special</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Specials</button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // GOOGLE RATING EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const GoogleRatingEditor = () => {
    const gr = siteData.googleRating || { rating: 4.6, count: 78 };
    const [gRating, setGRating] = useState(gr.rating);
    const [gCount, setGCount] = useState(gr.count);
    const saveRating = () => saveWithToast("googleRating", { rating: parseFloat(gRating) || 0, count: parseInt(gCount, 10) || 0 }, "Google Rating");
    return (
      <div className="mb-4 bg-white border border-navy/[0.08] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(star => (
              <span key={star} className={`text-lg ${star <= Math.round(gRating) ? "text-amber-400" : "text-navy/10"}`}>★</span>
            ))}
          </div>
          <span className="font-display text-navy text-2xl">{parseFloat(gRating || 0).toFixed(1)}</span>
          <span className="font-mono text-[10px] text-navy/30">({gCount} reviews)</span>
        </div>
        <p className="font-body text-xs text-navy/40 mb-3">
          Shown above the reviews section. Update when your Google rating changes.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-navy/40 uppercase tracking-editorial">Rating</span>
            <input type="number" step="0.1" min="1" max="5" value={gRating} onChange={(e) => setGRating(e.target.value)}
              className="form-input w-20 text-center py-2 text-sm" />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-navy/40 uppercase tracking-editorial">Reviews</span>
            <input type="number" min="0" value={gCount} onChange={(e) => setGCount(e.target.value)}
              className="form-input w-24 text-center py-2 text-sm" />
          </label>
          <button onClick={saveRating} className="bg-flamingo text-white font-body text-xs px-4 py-2 rounded-xl hover:bg-flamingo-dark transition-colors flex items-center gap-2">
            <Save size={12} /> Save
          </button>
        </div>
      </div>
    );
  };

  // TESTIMONIALS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const TestimonialsEditor = () => {
    const [items, setItems] = useState(JSON.parse(JSON.stringify(siteData.testimonials || [])));
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState(null);
    const update = (i, field, value) => setItems(items.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    const add = () => setItems([...items, { id: Date.now(), name: "", source: "Google", rating: 5, text: "", reviewUrl: "" }]);
    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("testimonials", items, "Testimonials");

    // Pull reviews from Google Places API
    const syncGoogle = async () => {
      setSyncing(true);
      setSyncMsg(null);
      try {
        const res = await fetch(`/api/google-reviews?bust=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!data.reviews?.length) throw new Error("No reviews returned");

        // Convert Google reviews to our format
        const googleReviews = data.reviews.map((r) => ({
          id: r.id || `google-${r.time || Date.now()}`,
          name: r.name,
          source: "Google",
          rating: r.rating,
          text: r.text,
          reviewUrl: r.reviewUrl || r.profileUrl || "",
          relativeTime: r.relativeTime || "",
        }));

        // Merge: keep existing manual reviews, add/update Google ones
        const existingManual = items.filter((r) => r.source !== "Google" || !r.id?.toString().startsWith("google-"));
        const merged = [...googleReviews, ...existingManual];
        setItems(merged);
        // Auto-save reviews and update aggregate rating
        await updateData("testimonials", merged);
        if (data.rating || data.totalReviews) {
          await updateData("googleRating", {
            rating: data.rating || siteData.googleRating?.rating || 4.6,
            count: data.totalReviews || siteData.googleRating?.count || 78,
          });
        }
        setSyncMsg(`Synced ${googleReviews.length} reviews from Google (${data.rating?.toFixed(1)} stars, ${data.totalReviews} total). Saved automatically.`);
      } catch (e) {
        setSyncMsg(`Sync failed: ${e.message}`);
      } finally {
        setSyncing(false);
      }
    };

    return (
      <div>
        {/* Google aggregate rating (admin-editable) */}
        <GoogleRatingEditor />

        {/* Google sync banner */}
        <div className="mb-4 bg-white border border-navy/[0.08] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-sm">G</span>
              </div>
              <div>
                <p className="font-body text-sm text-navy font-bold">Auto-Import Google Reviews</p>
                <p className="font-body text-xs text-navy/40">
                  Pulled automatically once per day. No API key needed.
                </p>
              </div>
            </div>
            <button onClick={syncGoogle} disabled={syncing}
              className="font-body text-xs text-navy/50 hover:text-flamingo px-4 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 transition-all flex items-center gap-2 disabled:opacity-30">
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Pull from Google"}
            </button>
          </div>
          {syncMsg && (
            <p className={`font-mono text-xs mt-2 ${syncMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
              {syncMsg}
            </p>
          )}
        </div>

        {/* Review stats with rating distribution */}
        {items.length > 0 && (
          <div className="mb-4 p-4 bg-white rounded-2xl border border-navy/[0.06] shadow-sm">
            <div className="flex items-center gap-6 mb-3 flex-wrap">
              <span className="font-mono text-[10px] tracking-editorial uppercase text-navy/35">
                {items.length} review{items.length !== 1 ? "s" : ""}
              </span>
              <span className="font-mono text-[10px] tracking-editorial uppercase text-navy/35">
                avg {(items.reduce((sum, r) => sum + (r.rating || 0), 0) / items.length).toFixed(1)} stars
              </span>
            </div>
            {/* Rating distribution */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(star => {
                const count = items.filter(r => r.rating === star).length;
                const pct = items.length > 0 ? (count / items.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-navy/25 w-4 text-right">{star}</span>
                    <span className="text-amber-400 text-[10px]">★</span>
                    <div className="flex-1 h-1.5 bg-navy/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-[9px] text-navy/20 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {items.length > 0 && (
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy/30">
              {items.filter(r => r.rating === 5).length} five-star
            </span>
          </div>
        )}

        {items.map((r, i) => (
          <CollapsibleItem key={r.id} label={r.name || "New Review"} sublabel={`${r.source} · ${"★".repeat(r.rating)}${r.text ? ` · ${r.text.substring(0, 40)}...` : ""}`} defaultOpen={!r.name} onRemove={() => remove(i)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Reviewer Name" value={r.name} onChange={(v) => update(i, "name", v)} placeholder="Jane D." />
              <div>
                <label className="block font-body text-navy text-sm font-bold mb-1">Source</label>
                <select value={r.source} onChange={(e) => update(i, "source", e.target.value)}
                  className="w-full p-3 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white">
                  <option value="Google">Google</option>
                  <option value="Yelp">Yelp</option>
                  <option value="TripAdvisor">TripAdvisor</option>
                </select>
              </div>
              <div>
                <label className="block font-body text-navy text-sm font-bold mb-1">Rating</label>
                <select value={r.rating} onChange={(e) => update(i, "rating", Number(e.target.value))}
                  className="w-full p-3 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white">
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
            </div>
            <Field label="Review Text" value={r.text} onChange={(v) => update(i, "text", v)} multiline />
            <Field label="Review URL" value={r.reviewUrl || ""} onChange={(v) => update(i, "reviewUrl", v)} placeholder="https://g.co/kgs/... or https://www.yelp.com/..." validate={validateUrl} helpText="Link to the original review. Clicking a review card opens this URL." />
          </CollapsibleItem>
        ))}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Review</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Reviews</button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // NEWSLETTER EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const NewsletterEditor = () => {
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [preview, setPreview] = useState(false);
    const [drafts, setDrafts] = useState(siteData.newsletter?.drafts || []);

    const saveDraft = () => {
      if (!subject.trim()) return;
      const draft = { id: Date.now(), subject, body, savedAt: new Date().toISOString() };
      const updated = [...drafts, draft];
      setDrafts(updated);
      updateData("newsletter", { ...siteData.newsletter, drafts: updated });
      setSubject(""); setBody("");
    };

    const removeDraft = (id) => {
      const updated = drafts.filter((d) => d.id !== id);
      setDrafts(updated);
      updateData("newsletter", { ...siteData.newsletter, drafts: updated });
    };

    const loadDraft = (draft) => {
      setSubject(draft.subject);
      setBody(draft.body);
    };

    return (
      <div className="space-y-4">
        <CollapsibleItem label="Compose Newsletter" sublabel="Create and preview email blasts" defaultOpen={true}>
          <Field label="Subject Line" value={subject} onChange={setSubject} placeholder="This Week at Standard Fare" maxLength={100} helpText="Keep it short — aim for under 50 characters for best open rates." />
          <Field label="Email Body" value={body} onChange={setBody} multiline />
          <div className="flex gap-3 mt-3">
            <button onClick={() => setPreview(!preview)} className="btn-ghost flex items-center gap-2 text-sm">
              {preview ? "Hide Preview" : "Preview"}
            </button>
            <button onClick={saveDraft} className="btn-primary flex items-center gap-2"><Save size={14} />Save Draft</button>
          </div>
          {preview && (
            <div className="mt-4 border border-navy border-opacity-10 rounded-xl p-6 bg-white">
              {/* Email header bar */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-navy/10">
                <div className="w-8 h-8 bg-flamingo/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-flamingo text-xs font-bold">SF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-navy text-xs font-bold">Standard Fare</p>
                  <p className="font-mono text-[9px] text-navy/30 truncate">hello@standardfaresaratoga.com</p>
                </div>
              </div>
              <p className="font-body text-navy font-bold text-lg mb-1">{subject || "(No subject)"}</p>
              <hr className="my-3 border-navy/10" />
              <div className="font-body text-navy text-sm opacity-70 whitespace-pre-wrap leading-relaxed">{body || "(No content)"}</div>
              <hr className="my-3 border-navy/10" />
              <div className="text-center">
                <p className="font-display text-navy/40 text-sm mb-1">Standard Fare</p>
                <p className="font-mono text-[9px] text-navy/25">21 Phila St · Saratoga Springs, NY 12866</p>
                <p className="font-mono text-[8px] text-navy/15 mt-2">Unsubscribe · Manage preferences</p>
              </div>
            </div>
          )}
        </CollapsibleItem>

        {drafts.length > 0 && (
          <CollapsibleItem label="Saved Drafts" sublabel={`${drafts.length} draft${drafts.length !== 1 ? "s" : ""}`} defaultOpen={false}>
            {drafts.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-navy/[0.06] mb-2 shadow-sm hover:shadow-admin transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="font-body text-navy text-sm font-bold truncate">{d.subject}</p>
                  <p className="font-mono text-[10px] text-navy/30">{new Date(d.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-3">
                  <button onClick={() => loadDraft(d)} className="font-mono text-[10px] text-flamingo/60 hover:text-flamingo px-2.5 py-1 rounded-lg hover:bg-flamingo/5 transition-all">Load</button>
                  <button onClick={() => removeDraft(d.id)} className="font-mono text-[10px] text-navy/20 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-all">Delete</button>
                </div>
              </div>
            ))}
          </CollapsibleItem>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SMS CLUB EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const SmsClubEditor = () => {
    const [club, setClub] = useState({ ...siteData.smsClub });
    const update = (field, value) => setClub({ ...club, [field]: value });
    const save = () => saveWithToast("smsClub", club, "SMS Club");

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={club.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable SMS Text Club</span>
        </div>
        <Field label="Headline" value={club.headline || ""} onChange={(v) => update("headline", v)} placeholder="Join the Text Club" />
        <Field label="Subtext" value={club.subtext || ""} onChange={(v) => update("subtext", v)} placeholder="Get exclusive deals delivered to your phone." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Keyword" value={club.keyword || ""} onChange={(v) => update("keyword", v)} placeholder="FARE" helpText="The word guests text to your shortcode to opt in." />
          <Field label="Shortcode" value={club.shortcode || ""} onChange={(v) => update("shortcode", v)} placeholder="12345" helpText="The phone number guests text the keyword to." />
        </div>
        <Field label="Webhook URL (optional)" value={club.webhookUrl || ""} onChange={(v) => update("webhookUrl", v)} placeholder="https://hooks.zapier.com/..." validate={validateUrl} helpText="Optional Zapier or webhook URL for automating sign-up notifications." />
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save SMS Club</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // POPULAR NOW EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const PopularNowEditor = () => {
    const [popular, setPopular] = useState({ ...siteData.popularNow });
    const items = popular.manualItems || [];
    const updateItem = (i, field, value) => {
      const updated = items.map((p, idx) => (idx === i ? { ...p, [field]: value } : p));
      setPopular({ ...popular, manualItems: updated });
    };
    const add = () => {
      const updated = [...items, { name: "", category: "menu" }];
      setPopular({ ...popular, manualItems: updated });
    };
    const remove = (i) => {
      const updated = items.filter((_, idx) => idx !== i);
      setPopular({ ...popular, manualItems: updated });
    };
    const save = () => saveWithToast("popularNow", popular, "Popular Now");

    return (
      <div>
        <p className="font-body text-sm text-navy opacity-60 mb-4 leading-relaxed">
          Mark items as "Popular Now" — they'll get a badge on the menu and bottle shop pages.
          Names must match exactly as they appear in the menu or bottle shop.
        </p>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 bg-cream-warm rounded-lg p-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)}
                placeholder="Item name (must match exactly)"
                className="p-2 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white" />
              <select value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)}
                className="p-2 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white">
                <option value="menu">Menu Item</option>
                <option value="bottles">Bottle</option>
              </select>
            </div>
            <button onClick={() => remove(i)} className="text-navy opacity-30 hover:opacity-60"><Trash2 size={14} /></button>
          </div>
        ))}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Item</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Popular Items</button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // INSTAGRAM FEED EDITOR — curate 3 posts for the gallery page header
  // ───────────────────────────────────────────────────────────────────────────
  const InstagramFeedEditor = () => {
    const manualFeed = siteData.instagramFeed || [];
    const { posts: livePosts, loading: igLoading, lastFetched: igLastFetched, forceRefresh: igForceRefresh, error: igError } = useInstagramFeed(manualFeed, updateData);
    const [igSyncMsg, setIgSyncMsg] = useState(null);

    const [feed, setFeed] = useState(
      manualFeed.length >= 3
        ? [...manualFeed]
        : [
            { id: "ig1", imageUrl: "", postUrl: "", caption: "" },
            { id: "ig2", imageUrl: "", postUrl: "", caption: "" },
            { id: "ig3", imageUrl: "", postUrl: "", caption: "" },
          ]
    );

    const update = (i, field, value) =>
      setFeed(feed.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));

    const save = () => saveWithToast("instagramFeed", feed, "Instagram Feed");

    const handleForceRefresh = async () => {
      setIgSyncMsg(null);
      try {
        await igForceRefresh();
        setIgSyncMsg({ ok: true, text: "Instagram feed refreshed from latest posts." });
      } catch {
        setIgSyncMsg({ ok: false, text: "Failed to refresh. Posts will use manual entries as fallback." });
      }
    };

    return (
      <div>
        <p className="font-body text-sm text-navy opacity-60 mb-4 leading-relaxed">
          The 3 most recent Instagram posts are automatically pulled and shown at the top of
          the Gallery page. They refresh every 12 hours. Use the button below to refresh now,
          or manually set posts as a fallback.
        </p>

        {/* Auto-pull status & force refresh */}
        <div className="bg-cream-warm rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="font-body text-sm text-navy font-semibold">Auto-Pull from Instagram</p>
            <button onClick={handleForceRefresh} disabled={igLoading}
              className="btn-ghost flex items-center gap-2 py-1.5 px-3 text-xs disabled:opacity-50"
              title="Refresh now — pulls the 3 most recent posts from @standardfaresaratoga">
              <RefreshCw size={13} className={igLoading ? "animate-spin" : ""} />
              {igLoading ? "Refreshing…" : "Refresh Now"}
            </button>
          </div>
          {igLastFetched && (
            <p className="font-mono text-[11px] text-navy opacity-40">
              Last refreshed: {new Date(igLastFetched).toLocaleString()}
            </p>
          )}
          {livePosts.length > 0 && (
            <div className="flex gap-2 mt-3">
              {livePosts.slice(0, 3).map((p) => (
                <a key={p.id} href={p.postUrl} target="_blank" rel="noopener noreferrer"
                  className="block w-16 h-16 rounded overflow-hidden bg-navy-light flex-shrink-0">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                </a>
              ))}
            </div>
          )}
          {igSyncMsg && (
            <p className={`font-body text-xs mt-2 ${igSyncMsg.ok ? "text-green-700" : "text-flamingo-dark"}`}>
              {igSyncMsg.text}
            </p>
          )}
          {igError && !igSyncMsg && (
            <p className="font-body text-xs text-flamingo-dark mt-2">
              Auto-pull unavailable: {igError}. Manual entries below will be used.
            </p>
          )}
        </div>

        {/* Manual fallback entries */}
        <p className="font-body text-xs text-navy opacity-40 mb-3 uppercase tracking-wider">
          Manual Fallback (used if auto-pull is unavailable)
        </p>
        {feed.map((post, i) => (
          <CollapsibleItem
            key={post.id}
            label={`Post ${i + 1}`}
            sublabel={post.caption || (post.imageUrl ? "Image set" : "Empty")}
            defaultOpen={!post.imageUrl}
          >
            <ImageUploader
              label="Post Image"
              value={post.imageUrl}
              onChange={(v) => update(i, "imageUrl", v)}
              height="h-32"
            />
            <Field label="Instagram Post URL" value={post.postUrl} onChange={(v) => update(i, "postUrl", v)} placeholder="https://www.instagram.com/p/..." validate={validateUrl} />
            <Field label="Caption (optional)" value={post.caption} onChange={(v) => update(i, "caption", v)} placeholder="Short caption..." />
          </CollapsibleItem>
        ))}
        <button onClick={save} className="btn-primary flex items-center gap-2">
          <Save size={14} />Save Manual Feed
        </button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // BLOG EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const BlogEditor = () => {
    const [posts, setPosts] = useState([...(siteData.blog || [])]);
    const [previewIdx, setPreviewIdx] = useState(null);
    const [blogSearch, setBlogSearch] = useState("");
    const updatePost = (i, field, value) => setPosts(posts.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const add = () => setPosts([...posts, {
      id: Date.now(), title: "", slug: "", date: new Date().toISOString().split("T")[0],
      author: "", authorRole: "", excerpt: "", body: "", imageUrl: "", tags: [], published: true,
    }]);
    const duplicate = (i) => {
      const src = posts[i];
      setPosts([...posts, { ...src, id: Date.now(), title: src.title + " (copy)", slug: autoSlug(src.title + " copy") }]);
    };
    const remove = (i) => { setPosts(posts.filter((_, idx) => idx !== i)); setPreviewIdx(null); };
    const move = (i, dir) => {
      const next = i + dir;
      if (next < 0 || next >= posts.length) return;
      const arr = [...posts];
      [arr[i], arr[next]] = [arr[next], arr[i]];
      setPosts(arr);
    };
    const save = () => saveWithToast("blog", posts, "Blog");

    const wordCount = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;
    const readTime = (text) => { const w = wordCount(text); return w < 200 ? "< 1 min read" : `${Math.ceil(w / 200)} min read`; };

    const formatPreviewDate = (d) => {
      try { return new Date(d + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
      catch { return d; }
    };

    const postCounts = { total: posts.length, published: posts.filter(p => p.published !== false).length, draft: posts.filter(p => p.published === false).length };

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
            Write blog posts that appear on the "From the Kitchen" page. Great for SEO and building a community connection.
          </p>
          <ViewOnSite path="/blog" />
        </div>

        {/* Post stats */}
        {posts.length > 0 && (
          <div className="flex gap-4 mb-5 flex-wrap">
            <span className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40">
              {postCounts.total} post{postCounts.total !== 1 ? "s" : ""}
            </span>
            <span className="font-mono text-[10px] tracking-editorial uppercase text-green-700 opacity-60">
              {postCounts.published} published
            </span>
            {postCounts.draft > 0 && (
              <span className="font-mono text-[10px] tracking-editorial uppercase text-amber-600 opacity-60">
                {postCounts.draft} draft{postCounts.draft !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Search blog posts */}
        {posts.length > 3 && (
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
            <input value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
              placeholder="Search blog posts..." />
            {blogSearch && (
              <button onClick={() => setBlogSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60"><X size={14} /></button>
            )}
          </div>
        )}

        {posts.map((post, i) => ({ ...post, _origIdx: i })).filter(post => !blogSearch || post.title?.toLowerCase().includes(blogSearch.toLowerCase()) || post.body?.toLowerCase().includes(blogSearch.toLowerCase())).map((post) => {
          const i = post._origIdx;
          return (
          <CollapsibleItem key={post.id}
            label={<span className="flex items-center gap-2">
              {post.title || "Untitled Post"}
              {post.published === false && <span className="font-mono text-[9px] tracking-editorial uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Draft</span>}
            </span>}
            sublabel={`${post.date}${post.body ? ` · ${readTime(post.body)}` : ""}`}
            onRemove={() => remove(i)} defaultOpen={!post.title}>

            {/* Published toggle */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-navy border-opacity-10">
              <input type="checkbox" checked={post.published !== false}
                onChange={(e) => updatePost(i, "published", e.target.checked)}
                className="accent-flamingo w-4 h-4" />
              <span className="font-body text-sm text-navy">
                {post.published !== false ? <span className="text-green-700 font-bold">Published</span> : <span className="text-amber-600 font-bold">Draft</span>}
                <span className="opacity-40"> — {post.published !== false ? "visible on blog" : "hidden from visitors"}</span>
              </span>
            </div>

            {/* Title + auto-slug */}
            <Field label="Title" value={post.title} onChange={(v) => { updatePost(i, "title", v); if (!post.slug || post.slug === autoSlug(post.title)) updatePost(i, "slug", autoSlug(v)); }} placeholder="Give your post a compelling title" />

            {/* Slug (editable) */}
            <div className="mb-4">
              <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-navy opacity-30">/blog/</span>
                <input type="text" value={post.slug}
                  onChange={(e) => updatePost(i, "slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""))}
                  className="flex-1 p-2 rounded-lg border border-navy border-opacity-20 font-mono text-sm text-navy" placeholder="auto-generated-from-title" />
              </div>
              <p className="font-body text-[10px] text-navy opacity-25 mt-1">Auto-generated from title. Edit to customize the URL.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Date</label>
                <input type="date" value={post.date}
                  onChange={(e) => updatePost(i, "date", e.target.value)}
                  className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm text-navy" />
              </div>
              <Field label="Author" value={post.author} onChange={(v) => updatePost(i, "author", v)} placeholder="Chef Joe Michaud" />
            </div>
            <Field label="Author Role (shown under photo)" value={post.authorRole || ""} onChange={(v) => updatePost(i, "authorRole", v)} placeholder="Executive Chef" />

            <ImageUploader label="Cover Image" value={post.imageUrl} onChange={(v) => updatePost(i, "imageUrl", v)} height="h-32" />

            <Field label="Excerpt (shown on blog list)" value={post.excerpt} onChange={(v) => updatePost(i, "excerpt", v)} multiline placeholder="A brief 1-2 sentence summary that appears on the blog listing page..." maxLength={200} helpText="Keep it concise — this is the preview shown on the blog listing page." />

            {/* Body editor with formatting toolbar and word count */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[11px] tracking-editorial uppercase text-navy/45 font-medium">Full Post Body</label>
                <span className="font-mono text-[10px] text-navy/30 tabular-nums">
                  {wordCount(post.body)} words · {readTime(post.body)}
                </span>
              </div>
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 p-2 bg-cream-warm rounded-t-lg border border-b-0 border-navy/10">
                {[
                  { label: "H2", title: "Insert heading", insert: "\n## " },
                  { label: "H3", title: "Insert subheading", insert: "\n### " },
                  { label: "B", title: "Bold text", insert: "**bold**", className: "font-bold" },
                  { label: "I", title: "Italic text", insert: "*italic*", className: "italic" },
                  { label: "—", title: "Insert divider", insert: "\n---\n" },
                  { label: "•", title: "Insert bullet point", insert: "\n• " },
                  { label: '"', title: "Insert blockquote", insert: '\n> ' },
                  { label: "🔗", title: "Insert link", insert: "[link text](https://)" },
                ].map((btn) => (
                  <button key={btn.label} type="button" title={btn.title}
                    onClick={() => {
                      const ta = document.getElementById(`blog-body-${post.id}`);
                      if (!ta) return;
                      const start = ta.selectionStart;
                      const end = ta.selectionEnd;
                      const text = post.body || "";
                      const newText = text.substring(0, start) + btn.insert + text.substring(end);
                      updatePost(i, "body", newText);
                      setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + btn.insert.length; }, 0);
                    }}
                    className={`font-mono text-xs text-navy/40 hover:text-flamingo hover:bg-flamingo/5 px-2 py-1 rounded transition-colors ${btn.className || ""}`}>
                    {btn.label}
                  </button>
                ))}
                <span className="flex-1" />
                <span className="font-mono text-[9px] text-navy/20">Markdown supported</span>
              </div>
              <textarea id={`blog-body-${post.id}`} value={post.body} onChange={(e) => updatePost(i, "body", e.target.value)} rows={14}
                className="w-full p-4 rounded-b-lg rounded-t-none border border-navy/15 font-body text-sm text-navy leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-flamingo/20 focus:border-flamingo/30"
                placeholder="Write the full blog post here.&#10;&#10;Use blank lines between paragraphs to create spacing.&#10;&#10;Each paragraph will be displayed as a separate block on the blog." />
              <p className="font-body text-[11px] text-navy/25 mt-1">
                Separate paragraphs with blank lines. Use **bold**, *italic*, ## headings, and [links](url) for formatting.
              </p>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(post.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 font-mono text-[11px] tracking-editorial uppercase bg-flamingo bg-opacity-10 text-flamingo px-3 py-1 rounded-full">
                    {tag}
                    <button type="button" onClick={() => updatePost(i, "tags", post.tags.filter(t => t !== tag))}
                      className="hover:text-red-500 transition-colors ml-0.5">&times;</button>
                  </span>
                ))}
                {(!post.tags || post.tags.length === 0) && (
                  <span className="font-body text-xs text-navy opacity-30 italic">No tags yet — click suggestions below or type your own</span>
                )}
              </div>
              <div className="mb-2">
                <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-1.5">Suggested Tags (click to add)</p>
                <div className="flex flex-wrap gap-1.5">
                  {["kitchen", "technique", "seasonal", "sourcing", "local", "community", "behind-the-scenes", "recipe",
                    "wine", "cocktails", "steak", "brunch", "dinner", "dessert", "chef", "farm-to-table",
                    "events", "holiday", "new-menu", "staff-picks", "sustainability", "tradition", "saratoga",
                    "interview", "announcement", "specials", "pairing", "comfort-food", "ingredients", "story"
                  ].filter(t => !(post.tags || []).includes(t)).map((tag) => (
                    <button key={tag} type="button"
                      onClick={() => updatePost(i, "tags", [...(post.tags || []), tag])}
                      className="font-mono text-[10px] tracking-editorial uppercase bg-navy bg-opacity-5 text-navy opacity-40
                                 hover:bg-flamingo hover:bg-opacity-10 hover:text-flamingo hover:opacity-100
                                 px-2.5 py-1 rounded-full transition-all">
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Type a custom tag and press Enter"
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-mono text-xs text-navy"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "");
                    if (val && !(post.tags || []).includes(val)) {
                      updatePost(i, "tags", [...(post.tags || []), val]);
                      e.target.value = "";
                    }
                  }
                }} />
            </div>

            {/* Post actions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-navy border-opacity-10 flex-wrap">
              <button onClick={() => setPreviewIdx(previewIdx === i ? null : i)}
                className="flex items-center gap-1.5 font-mono text-xs tracking-editorial uppercase text-navy opacity-50 hover:opacity-100 hover:text-flamingo transition-all">
                <Eye size={13} />{previewIdx === i ? "Close Preview" : "Preview"}
              </button>
              <button onClick={() => duplicate(i)}
                className="flex items-center gap-1.5 font-mono text-xs tracking-editorial uppercase text-navy opacity-50 hover:opacity-100 hover:text-flamingo transition-all">
                <Copy size={13} />Duplicate
              </button>
              {i > 0 && (
                <button onClick={() => move(i, -1)}
                  className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 hover:opacity-100 hover:text-flamingo transition-all">
                  Move Up
                </button>
              )}
              {i < posts.length - 1 && (
                <button onClick={() => move(i, 1)}
                  className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 hover:opacity-100 hover:text-flamingo transition-all">
                  Move Down
                </button>
              )}
            </div>

            {/* Inline preview */}
            {previewIdx === i && (
              <div className="mt-4 border border-navy border-opacity-10 rounded-xl overflow-hidden">
                <div className="bg-navy p-6 text-center">
                  <p className="font-mono text-flamingo text-[10px] tracking-editorial uppercase mb-2">Preview — From the Kitchen</p>
                  <h3 className="font-display text-cream text-xl">{post.title || "Untitled"}</h3>
                  <div className="flex items-center justify-center gap-4 mt-3">
                    {post.author && <span className="font-body text-cream text-xs opacity-50">{post.author}</span>}
                    <span className="font-body text-cream text-xs opacity-50">{formatPreviewDate(post.date)}</span>
                  </div>
                </div>
                <div className="bg-cream p-6">
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
                  )}
                  <div className="font-body text-navy text-sm leading-relaxed space-y-3 max-h-64 overflow-y-auto">
                    {(post.body || post.excerpt || "No content yet.").split("\n").filter(Boolean).map((p, pi) => (
                      <p key={pi} className="opacity-80">{p}</p>
                    ))}
                  </div>
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-navy border-opacity-10">
                      {post.tags.map(t => (
                        <span key={t} className="font-mono text-[10px] tracking-editorial uppercase bg-navy bg-opacity-5 text-navy opacity-50 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </CollapsibleItem>
        );
        })}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Post</button>
          <TemplatePicker templates={BLOG_TEMPLATES} label="From Template"
            onSelect={(data) => {
              setPosts([...posts, {
                id: Date.now(), slug: "", date: new Date().toISOString().split("T")[0],
                imageUrl: "", published: false, ...data,
                tags: data.tags || [],
              }]);
              logActivity("created", "blog", `Created post from template "${data.title}"`);
            }} />
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Blog</button>
          {posts.some(p => p.published === false) && (
            <button onClick={() => { setPosts(posts.map(p => ({ ...p, published: true }))); }}
              className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Check size={12} /> Publish All Drafts
            </button>
          )}
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // WEEKLY FEATURES EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const TAG_OPTIONS = ["New", "Fan Favorite", "Seasonal", "Chef's Pick", "Limited"];

  const WeeklyFeaturesEditor = () => {
    const [config, setConfig] = useState({ ...(siteData.weeklyFeatures || { enabled: true, headline: "", subtitle: "", items: [] }) });
    const [items, setItems] = useState((config.items || []).map(it => ({ ...it })));

    const update = (field, value) => setConfig({ ...config, [field]: value });
    const updateItem = (i, field, value) => setItems(items.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
    const addItem = () => setItems([...items, { id: Date.now(), name: "", description: "", price: 0, tag: "New" }]);
    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("weeklyFeatures", { ...config, items }, "Weekly Features");

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Highlight featured dishes on the homepage. Shows after Our Story, before Events.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Weekly Features</span>
        </div>
        <Field label="Headline" value={config.headline || ""} onChange={(v) => update("headline", v)} placeholder="This Week's Features" maxLength={40} />
        <Field label="Subtitle" value={config.subtitle || ""} onChange={(v) => update("subtitle", v)} placeholder="Chef's selections for the week" maxLength={80} />

        {items.map((item, i) => (
          <CollapsibleItem key={item.id} label={item.name || "Untitled Dish"} sublabel={`${item.tag || ""}${item.price ? ` · $${item.price}` : ""}`} thumbnail={item.imageUrl} onRemove={() => removeItem(i)} defaultOpen={!item.name}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Dish Name" value={item.name} onChange={(v) => updateItem(i, "name", v)} placeholder="Pan-Seared Halibut" required />
              <Field label="Price" value={item.price} onChange={(v) => updateItem(i, "price", Number(v))} type="number" placeholder="38" />
            </div>
            <Field label="Description" value={item.description} onChange={(v) => updateItem(i, "description", v)} placeholder="Spring peas, lemon beurre blanc, crispy capers" maxLength={120} />
            <ImageUploader label="Dish Photo (optional)" value={item.imageUrl || ""} onChange={(v) => updateItem(i, "imageUrl", v)} height="h-32" />
            <div className="mb-4">
              <label className="font-mono text-[11px] tracking-editorial uppercase text-navy/45 font-medium block mb-1">Tag</label>
              <select value={item.tag || "New"} onChange={(e) => updateItem(i, "tag", e.target.value)}
                className="form-input text-base">
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={() => setItems([...items, { ...item, id: Date.now(), name: item.name + " (copy)" }])}
              className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Copy size={12} /> Duplicate Dish
            </button>
          </CollapsibleItem>
        ))}

        <div className="flex gap-4 flex-wrap">
          <button onClick={addItem} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Dish</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Weekly Features</button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SEASONAL COUNTDOWN EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const SeasonalCountdownEditor = () => {
    const [config, setConfig] = useState({ ...siteData.seasonalCountdown });
    const update = (field, value) => setConfig({ ...config, [field]: value });
    const save = () => saveWithToast("seasonalCountdown", config, "Seasonal Countdown");

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Show a countdown banner on the homepage for an upcoming seasonal menu launch.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Countdown</span>
        </div>
        <Field label="Menu Name" value={config.title || ""} onChange={(v) => update("title", v)} placeholder="Spring Menu" required />
        <Field label="Launch Date" value={config.launchDate || ""} onChange={(v) => update("launchDate", v)} placeholder="2026-04-15" validate={validateDate} helpText="The date the new menu goes live. Countdown shows days remaining." />
        {config.launchDate && /^\d{4}-\d{2}-\d{2}$/.test(config.launchDate) && (() => {
          const diff = Math.ceil((new Date(config.launchDate + "T00:00:00") - new Date()) / (1000 * 60 * 60 * 24));
          return diff > 0 ? (
            <p className="font-mono text-[11px] text-flamingo opacity-60">{diff} day{diff !== 1 ? "s" : ""} until launch</p>
          ) : diff === 0 ? (
            <p className="font-mono text-[11px] text-green-700 opacity-70 font-bold">Launching today!</p>
          ) : (
            <p className="font-mono text-[11px] text-amber-600 opacity-60">This date has passed ({Math.abs(diff)} day{Math.abs(diff) !== 1 ? "s" : ""} ago)</p>
          );
        })()}
        <Field label="Teaser Text" value={config.teaser || ""} onChange={(v) => update("teaser", v)} placeholder="New seasonal dishes dropping soon..." maxLength={100} />
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Countdown</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // EMAIL MARKETING EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const EmailMarketingEditor = () => {
    const [config, setConfig] = useState({ ...siteData.emailMarketing });
    const update = (field, value) => setConfig({ ...config, [field]: value });
    const save = () => saveWithToast("emailMarketing", config, "Email Marketing");

    // Show stored signups count
    let storedSignups = 0;
    try { storedSignups = JSON.parse(localStorage.getItem("sf_email_signups") || "[]").length; } catch {}

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Email signup form appears on the homepage. Connects to Mailchimp or Klaviyo when configured.
          Until then, signups are stored in the browser.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Email Signup</span>
        </div>
        <Field label="Headline" value={config.headline || ""} onChange={(v) => update("headline", v)} placeholder="Stay in the Loop" maxLength={40} />
        <Field label="Subtext" value={config.subtext || ""} onChange={(v) => update("subtext", v)} placeholder="New menus, events, and exclusive offers." maxLength={80} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">Provider</label>
            <select value={config.provider || ""} onChange={(e) => update("provider", e.target.value)}
              className="w-full p-3 rounded-lg border border-navy border-opacity-20 font-body text-sm text-navy">
              <option value="">None (store locally)</option>
              <option value="mailchimp">Mailchimp</option>
              <option value="klaviyo">Klaviyo</option>
            </select>
          </div>
          <Field label="List ID" value={config.listId || ""} onChange={(v) => update("listId", v)} placeholder="abc123def" />
        </div>
        <p className="font-mono text-[11px] text-navy opacity-40">
          API keys are set as Vercel environment variables (MAILCHIMP_API_KEY or KLAVIYO_API_KEY).
        </p>
        {storedSignups > 0 && (
          <p className="font-body text-sm text-green-700">
            {storedSignups} email signup{storedSignups !== 1 ? "s" : ""} stored locally (waiting for provider setup).
          </p>
        )}
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Email Settings</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STOCK PHOTOS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  // ───────────────────────────────────────────────────────────────────────────
  // FAQ EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const FAQ_CATEGORIES = ["Dining", "Reservations", "Policies", "Events"];
  const FAQEditor = () => {
    const [items, setItems] = useState(JSON.parse(JSON.stringify(siteData.faq || [])));
    const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
    const update = (i, field, value) => setItems(items.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    const add = () => setItems([...items, { id: Date.now(), question: "", answer: "", category: "Dining" }]);
    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => saveWithToast("faq", items, "FAQ");
    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = items.findIndex((it) => it.id === active.id);
        const newIdx = items.findIndex((it) => it.id === over.id);
        setItems(arrayMove(items, oldIdx, newIdx));
      }
    };
    return (
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
            {items.map((item, i) => (
              <SortableItem key={item.id} id={item.id}>
                <CollapsibleItem label={item.question || "New Question"} sublabel={`${item.category} · ${item.answer ? item.answer.substring(0, 40) + "..." : "No answer"}`} defaultOpen={!item.question} onRemove={() => remove(i)}>
                  <Field label="Question" value={item.question} onChange={(v) => update(i, "question", v)} placeholder="e.g. What is the dress code?" required />
                  <Field label="Answer" value={item.answer} onChange={(v) => update(i, "answer", v)} multiline placeholder="Enter the answer..." required maxLength={500} />
                  <div>
                    <label className="block font-body text-navy text-sm font-bold mb-1">Category</label>
                    <select value={item.category} onChange={(e) => update(i, "category", e.target.value)}
                      className="w-full p-3 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white">
                      {FAQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setItems([...items, { ...item, id: Date.now(), question: item.question + " (copy)" }])}
                    className="mt-3 flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
                    <Copy size={12} /> Duplicate Question
                  </button>
                </CollapsibleItem>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
        <div className="flex gap-4 flex-wrap items-center">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Question</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save FAQ</button>
          <button onClick={() => setItems([...items].sort((a, b) => (a.category || "").localeCompare(b.category || "")))}
            className="flex items-center gap-2 font-body text-xs text-navy opacity-40 hover:opacity-70 transition-opacity">
            Group by Category
          </button>
        </div>
      </div>
    );
  };

  const StockPhotosEditor = () => {
    const saved = siteData.stockPhotos?.events || [];
    const [photos, setPhotos] = useState(saved.length > 0 ? [...saved] : [...DEFAULT_EVENT_PHOTOS]);

    const update = (i, url) => { const p = [...photos]; p[i] = url; setPhotos(p); };
    const remove = (i) => setPhotos(photos.filter((_, idx) => idx !== i));
    const add = () => setPhotos([...photos, ""]);
    const reset = () => setPhotos([...DEFAULT_EVENT_PHOTOS]);
    const save = () => saveWithToast("stockPhotos", { ...siteData.stockPhotos, events: photos.filter(Boolean) }, "Stock Photos");

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          These photos are used as fallbacks for events without a custom image.
          Each event automatically gets a unique photo from this pool. Upload your own or paste URLs.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative group">
              {url ? (
                <img src={url} alt={`Stock ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-navy border-opacity-10" />
              ) : (
                <div className="w-full h-24 rounded-lg border-2 border-dashed border-navy border-opacity-20
                  flex items-center justify-center text-navy opacity-30 text-xs">
                  Empty
                </div>
              )}
              <button onClick={() => remove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-flamingo text-white rounded-full
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                ×
              </button>
              <div className="mt-1">
                <ImageUploader
                  value={url}
                  onChange={(v) => update(i, v)}
                  label=""
                  height="h-0 overflow-hidden"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={add}
            className="flex items-center gap-2 bg-navy text-cream font-mono text-xs px-4 py-2 rounded-lg hover:bg-navy-light transition-colors">
            <Plus size={14} /> Add Photo
          </button>
          <button onClick={reset}
            className="flex items-center gap-2 border border-navy border-opacity-20 text-navy font-mono text-xs px-4 py-2 rounded-lg hover:border-flamingo transition-colors">
            <Undo2 size={14} /> Reset to Defaults
          </button>
          <span className="font-mono text-[10px] text-navy opacity-40">{photos.filter(Boolean).length} photos in pool</span>
        </div>

        <button onClick={save}
          className="flex items-center gap-2 bg-flamingo text-white font-mono text-xs tracking-editorial uppercase px-6 py-3 rounded-lg hover:bg-flamingo-dark transition-colors">
          <Save size={14} /> Save Stock Photos
        </button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // PRIVATE EVENTS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const PrivateEventsEditor = () => {
    const [config, setConfig] = useState({ ...siteData.privateEvents });
    const update = (field, value) => setConfig({ ...config, [field]: value });
    const save = () => saveWithToast("privateEvents", config, "Private Events");

    const updateInclude = (i, value) => {
      const updated = [...(config.includes || [])];
      updated[i] = value;
      setConfig({ ...config, includes: updated });
    };
    const addInclude = () => setConfig({ ...config, includes: [...(config.includes || []), ""] });
    const removeInclude = (i) => setConfig({ ...config, includes: (config.includes || []).filter((_, idx) => idx !== i) });

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Configure the private events inquiry page. Inquiries are sent to your events email.
          Guests can request full buyouts, semi-private dining, or custom event packages.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled !== false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Private Events Page</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Max Full Buyout Capacity" value={String(config.maxCapacity || "")} onChange={(v) => update("maxCapacity", parseInt(v) || 0)} placeholder="60" />
          <Field label="Semi-Private Capacity" value={String(config.semiPrivateCapacity || "")} onChange={(v) => update("semiPrivateCapacity", parseInt(v) || 0)} placeholder="24" />
          <Field label="Minimum Spend (optional)" value={config.minimumSpend || ""} onChange={(v) => update("minimumSpend", v)} placeholder="$2,500" helpText="Displayed on inquiry page if set" />
          <Field label="Deposit Required (optional)" value={config.deposit || ""} onChange={(v) => update("deposit", v)} placeholder="25% non-refundable" />
          <Field label="Inquiry Email" value={config.inquiryEmail || ""} onChange={(v) => update("inquiryEmail", v)} placeholder="events@standardfaresaratoga.com" validate={validateEmail} />
          <Field label="Lead Time (days in advance)" value={String(config.leadTime || "")} onChange={(v) => update("leadTime", parseInt(v) || 0)} placeholder="14" helpText="Minimum notice required for private event bookings" />
        </div>
        <div>
          <label className="font-mono text-[11px] tracking-editorial uppercase text-navy/45 font-medium block mb-2">What's Included</label>
          {(config.includes || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-flamingo/10 text-flamingo flex items-center justify-center flex-shrink-0 text-xs font-bold">{i + 1}</span>
              <input value={item} onChange={(e) => updateInclude(i, e.target.value)}
                className="flex-1 form-input py-2 text-sm" placeholder="Dedicated event coordinator" />
              <button onClick={() => removeInclude(i)} className="text-navy/20 hover:text-red-500 transition-colors p-1"><Trash2 size={13} /></button>
            </div>
          ))}
          <button onClick={addInclude} className="flex items-center gap-2 font-body text-xs text-flamingo hover:text-flamingo-dark mt-1 transition-colors"><Plus size={12} />Add Item</button>
        </div>
        <ImageUploader label="Private Events Photo (shown on inquiry page)" value={config.imageUrl || ""} onChange={(v) => update("imageUrl", v)} height="h-40" />
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Private Events</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // GIFT CARDS EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const GiftCardsEditor = () => {
    const [config, setConfig] = useState({ ...siteData.giftCards });
    const update = (field, value) => setConfig({ ...config, [field]: value });
    const save = () => saveWithToast("giftCards", config, "Gift Cards");

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy/50 leading-relaxed">
          Manage the gift card page — balance checking, purchase amounts, and custom messaging.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.balanceCheckEnabled || false} onChange={(e) => update("balanceCheckEnabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Balance Check</span>
        </div>
        <Field label="Gift Card Heading" value={config.heading || ""} onChange={(v) => update("heading", v)} placeholder="The Perfect Gift" />
        <Field label="Gift Card Description" value={config.description || ""} onChange={(v) => update("description", v)} multiline placeholder="Give the gift of Creative American Dining..." maxLength={200} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Suggested Amounts (comma-separated)" value={config.suggestedAmounts || ""} onChange={(v) => update("suggestedAmounts", v)} placeholder="25, 50, 75, 100, 150, 200" helpText="Display these as quick-select buttons on the gift card page" />
          <Field label="Toast Gift Card Purchase URL" value={config.purchaseUrl || ""} onChange={(v) => update("purchaseUrl", v)} placeholder="https://order.toasttab.com/..." validate={validateUrl} />
        </div>
        <ImageUploader label="Gift Card Image (shown on page)" value={config.imageUrl || ""} onChange={(v) => update("imageUrl", v)} height="h-32" />
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Gift Cards</button>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageLayout>
      <div className="admin-hero-gradient pt-32 pb-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3 relative">Owner Portal</p>
        <h1 className="font-display text-cream text-4xl relative">Manage Website</h1>
        <span className="block w-20 h-0.5 bg-gradient-to-r from-transparent via-flamingo to-transparent mx-auto mt-6 relative" />
      </div>

      {/* ── Quick-Jump Sidebar ────────────────────────────────── */}
      <QuickJump
        activeSection={activeSection}
        onJump={handleJump}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="section-padding bg-cream">
        <div className="section-container max-w-4xl px-4 md:px-12 xl:ml-56">

          {/* Draft mode banner */}
          {draftMode && (
            <div className="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
              <p className="font-body text-sm text-amber-800">
                <strong>Draft Mode</strong> — changes are saved locally only. Publish when ready.
              </p>
              <div className="flex gap-2">
                {hasDraft && (
                  <>
                    <button onClick={publishDraft} className="btn-primary py-1.5 px-4 text-xs">
                      Publish All Changes
                    </button>
                    <button onClick={discardDraft}
                      className="font-body text-xs text-amber-800 hover:text-amber-900 underline underline-offset-2">
                      Discard Draft
                    </button>
                  </>
                )}
                <button onClick={() => setDraftMode(false)}
                  className="font-body text-xs text-amber-600 hover:text-amber-800">
                  Exit Draft Mode
                </button>
              </div>
            </div>
          )}

          {/* Top bar — Logout + How It Works */}
          <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/how-it-works"
                className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark
                           border border-flamingo border-opacity-30 hover:border-flamingo rounded-lg px-4 py-2 transition-all"
              >
                📖 How It Works
              </Link>
              <Link
                to="/admin/value"
                className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark
                           border border-flamingo border-opacity-30 hover:border-flamingo rounded-lg px-4 py-2 transition-all"
              >
                💰 How It Brings Value
              </Link>
              {!draftMode && (
                <button
                  onClick={() => setDraftMode(true)}
                  className="inline-flex items-center gap-2 font-body text-sm text-navy opacity-50 hover:opacity-80
                             border border-navy border-opacity-20 hover:border-navy rounded-lg px-4 py-2 transition-all"
                >
                  Draft Mode
                </button>
              )}
              <button
                onClick={toggleAllSections}
                className="inline-flex items-center gap-2 font-body text-sm text-navy opacity-50 hover:opacity-80
                           border border-navy border-opacity-20 hover:border-navy rounded-lg px-4 py-2 transition-all"
              >
                {allCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                {allCollapsed ? "Expand All" : "Collapse All"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* Connection status dot */}
              <span className="flex items-center gap-1" title={dbReady ? "Connected to cloud database" : dbLoading ? "Connecting..." : "Local storage only"}>
                <span className={`w-1.5 h-1.5 rounded-full ${dbReady ? "bg-green-500" : dbLoading ? "bg-amber-400 animate-pulse" : "bg-navy opacity-20"}`} />
                <span className="hidden md:inline font-mono text-[10px] text-navy opacity-20">
                  {dbReady ? "Cloud" : dbLoading ? "Connecting" : "Local"}
                </span>
              </span>
              <span className="hidden md:inline font-mono text-[10px] text-navy opacity-20" title="Keyboard shortcuts: Cmd+K command palette, Cmd+S save, Cmd+Z undo, Cmd+E expand/collapse">
                ⌘K search · ⌘S save · ⌘Z undo
              </span>
              {saveStatus === "saving" && (
                <span className="font-mono text-[10px] text-flamingo opacity-60 animate-pulse">Saving...</span>
              )}
              {saveStatus === "error" && (
                <span className="font-mono text-[10px] text-red-500 flex items-center gap-1">
                  <AlertCircle size={10} /> Save failed
                  <button onClick={retrySupabase} className="underline underline-offset-2 hover:text-red-700">retry</button>
                </span>
              )}
              {lastSavedAt && saveStatus !== "saving" && saveStatus !== "error" && (
                <span className="font-mono text-[10px] text-navy opacity-30" title={lastSavedAt.toLocaleString()}>
                  Saved {(() => {
                    const diff = Math.round((Date.now() - lastSavedAt.getTime()) / 1000);
                    if (diff < 5) return "just now";
                    if (diff < 60) return `${diff}s ago`;
                    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                    return lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                  })()}
                </span>
              )}
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="flex items-center gap-2 font-body text-sm text-navy opacity-50 hover:opacity-80 hover:text-flamingo transition-all"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          </div>

          {/* ── Section summary ─────────────────────────────────────── */}
          <div className="mb-8 p-5 bg-white rounded-2xl border border-navy/[0.06] shadow-admin admin-pattern-bg">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono tracking-editorial uppercase text-navy/35">
              <span>{(siteData.events || []).length} events</span>
              <span>{(siteData.blog || []).length} blog posts</span>
              <span>{(siteData.gallery || []).length} gallery items</span>
              <span>{(siteData.prints || []).length} paintings</span>
              <span>{(siteData.merch || []).length} merch</span>
              <span>{(siteData.bottles || []).length} bottles</span>
              <span>{(siteData.testimonials || []).length} reviews</span>
              <span>{(siteData.press || []).length} press</span>
              <span>{(siteData.faq || []).length} FAQ</span>
              <span>{Object.keys(siteData.menus || {}).length} menus</span>
            </div>
          </div>

          {/* ── DASHBOARD ───────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>📊</span> Dashboard
            </p>
            {/* Notification Center — shows pending actions inline */}
            <div className="mb-6">
              <NotificationCenter siteData={siteData} onJump={handleJump} />
            </div>
            <div className="mt-6"><AdminSection title="Analytics & Content Health" id="analytics" description="Content completeness, stats, and issues to address"><AnalyticsDashboard siteData={siteData} /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Activity Log" id="activitylog" description="Recent admin changes and edits"><ActivityLog /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Content Scheduler" id="schedule" description="Schedule content to publish or unpublish at specific dates"><ContentScheduler /></AdminSection></div>
          </div>

          {/* ── CRM ─────────────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>👥</span> Guest CRM
            </p>
            <div className="mt-6"><AdminSection title="Guest CRM" id="crm" description="Manage guest relationships, dietary preferences, VIPs, and notes"><CRMPanel /></AdminSection></div>
          </div>

          {/* ── CONTENT ─────────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>📝</span> Content
            </p>
            <div className="mb-6"><AdminSection title="Site Settings" defaultOpen={true} id="settings" description="Passwords, preview mode, and visibility toggles"><SiteSettingsEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Hero — Text, Buttons &amp; Slideshow" id="hero" description="Landing page headline, call-to-action buttons, and background slideshow"><HeroSlideshowEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Our Story &amp; Team" id="about" badge={(siteData.about?.team || []).length} description="Restaurant story copy and team member bios"><AboutEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Weekly Features" id="weekly" badge={(siteData.weeklyFeatures?.features || []).length} description="Recurring weekly events like happy hour or brunch"><WeeklyFeaturesEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Menus" id="menus" badge={Object.keys(siteData.menus || {}).length} description="Brunch, dinner, cocktails, wine, and dessert menus"><MenuEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Blog — From the Kitchen" id="blog" badge={(siteData.blog?.posts || []).length} description="Chef notes, sourcing stories, and behind the scenes"><BlogEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="FAQ" id="faq" badge={(siteData.faq || []).length} description="Frequently asked questions displayed on the site"><FAQEditor /></AdminSection></div>
          </div>

          {/* ── OPERATIONS ──────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>🕐</span> Operations
            </p>
            <div className="mt-6"><AdminSection title="Hours" id="hours" description="Regular hours and temporary overrides"><HoursEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Location &amp; Map" id="location" description="Address, phone, and embedded Google Maps"><LocationEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Daily Specials" id="specials" description="Daily food and drink specials by day of week"><SpecialsEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Seasonal Menu Countdown" id="countdown" description="Countdown timer for upcoming seasonal menu launches"><SeasonalCountdownEditor /></AdminSection></div>
          </div>

          {/* ── COMMERCE ────────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>🛒</span> Commerce
            </p>
            <div className="mt-6"><AdminSection title="Events &amp; Tickets" id="events" badge={(siteData.events || []).length} description="Ticketed events, wine dinners, and special nights"><EventsEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Paintings" id="paintings" badge={(siteData.prints || []).length} description="Art for sale — displayed on the paintings page"><PrintsEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Merchandise" id="merch" badge={(siteData.merch || []).length} description="Branded merchandise for sale"><MerchEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Bottle Shop" id="bottles" badge={(siteData.bottles || []).length} description="Wine and spirits available for retail purchase"><BottlesEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Gift Cards" id="giftcards" description="Gift card balance check feature"><GiftCardsEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Private Events" id="privateevents" description="Private event inquiry page and packages"><PrivateEventsEditor /></AdminSection></div>
          </div>

          {/* ── MEDIA ───────────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>📷</span> Media
            </p>
            <div className="mt-6"><AdminSection title="Gallery" id="gallery" badge={(siteData.gallery || []).length} description="Photo gallery displayed on the gallery page"><GalleryEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Instagram Feed" id="instagram" description="Instagram integration and feed settings"><InstagramFeedEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Stock Photos" id="stockphotos" description="Fallback photos for events without custom images"><StockPhotosEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Testimonials" id="testimonials" badge={(siteData.testimonials || []).length} description="Guest reviews and testimonials"><TestimonialsEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Press" id="press" badge={(siteData.press || []).length} description="Press coverage and media mentions"><PressEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Popular Now Badges" id="popular" description="Highlight popular menu items with badges"><PopularNowEditor /></AdminSection></div>
          </div>

          {/* ── MARKETING ───────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>📣</span> Marketing
            </p>
            <div className="mt-6"><AdminSection title="Email Marketing" id="email" description="Email campaign settings and templates"><EmailMarketingEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="SMS Text Club" id="sms" description="Text club sign-up configuration"><SmsClubEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Newsletter" id="newsletter" description="Newsletter popup and sign-up settings"><NewsletterEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="SEO & Social Sharing" id="seo" description="Meta titles, descriptions, and social share previews for every page"><SEOEditor siteData={siteData} updateData={updateData} saveWithToast={saveWithToast} /></AdminSection></div>
          </div>

          {/* ── INTEGRATIONS ─────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>🔌</span> Integrations
            </p>
            <div className="mt-6"><AdminSection title="Resy & Toast" id="integrations" description="Connect Resy reservations and Toast POS for live availability, ordering, and gift cards"><IntegrationsPanel siteData={siteData} updateData={updateData} saveWithToast={saveWithToast} /></AdminSection></div>
          </div>

          {/* ── SETTINGS ────────────────────────────────────────────── */}
          <div className="mb-8">
            <p className="font-mono text-flamingo/70 text-[11px] tracking-editorial uppercase mb-5 flex items-center gap-2 admin-group-label w-fit">
              <span>⚙️</span> Settings
            </p>
            <div className="mt-6"><AdminSection title="External Links" id="links" description="Resy, DoorDash, Toast, Instagram, and other URLs"><LinksEditor /></AdminSection></div>
            <div className="mt-6"><AdminSection title="Contact Emails" id="contact" description="Email addresses for general, press, and event inquiries"><ContactEditor /></AdminSection></div>
          </div>

          {/* Storage status + Reset to Defaults */}
          <div className="mt-12 border border-flamingo/20 rounded-2xl p-7 bg-white shadow-admin">
            <p className="font-mono text-flamingo/60 text-xs tracking-editorial uppercase mb-3">Storage Status</p>
            <p className="font-body text-sm text-navy opacity-60 leading-relaxed mb-2">
              {dbLoading
                ? "⏳ Connecting to Supabase..."
                : dbReady
                  ? "✅ Connected to Supabase — changes save to the cloud database and appear across all devices."
                  : dbError
                    ? `⚠️ Supabase error: ${dbError} — changes are saving to this browser's local storage only.`
                    : "⚠️ Supabase not configured — changes are saving to this browser's local storage only. See README-SUPABASE.md to connect the cloud database."
              }
            </p>
            {!dbReady && !dbLoading && (
              <button
                onClick={retrySupabase}
                className="font-body text-xs text-flamingo hover:text-flamingo-dark transition-colors mb-4 underline underline-offset-2"
              >
                Retry connection
              </button>
            )}
            <div className="mt-4 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => {
                  const json = JSON.stringify(siteData, null, 2);
                  const blob = new Blob([json], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `standard-fare-backup-${new Date().toISOString().split("T")[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setToast({ message: "Backup downloaded!", type: "success" });
                }}
                className="font-body text-xs text-navy opacity-50 hover:opacity-80 transition-all underline underline-offset-2"
              >
                Export Site Data (JSON)
              </button>
              <label className="font-body text-xs text-navy opacity-50 hover:opacity-80 transition-all underline underline-offset-2 cursor-pointer">
                Import Backup
                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    try {
                      const data = JSON.parse(ev.target.result);
                      if (!data || typeof data !== "object") throw new Error("Invalid JSON");
                      if (!window.confirm("This will replace ALL current site data with the imported backup. Are you sure?")) return;
                      Object.entries(data).forEach(([key, value]) => updateData(key, value));
                      setToast({ message: "Backup restored! Refresh to see changes.", type: "success" });
                    } catch (err) {
                      setToast({ message: `Import failed: ${err.message}`, type: "error" });
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }} />
              </label>
              <button
                onClick={() => {
                  if (window.confirm(
                    "This will reset ALL website content to the built-in defaults, overwriting any changes you've saved. Are you sure?"
                  )) {
                    localStorage.removeItem("standard_fare_site_data");
                    window.location.reload();
                  }
                }}
                className="font-body text-xs text-flamingo-dark opacity-60 hover:opacity-100 transition-all underline underline-offset-2"
              >
                Reset all content to defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Command Palette (Cmd+K) ─────────────────────────── */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        sections={ALL_SECTIONS}
        onJump={handleJump}
        actions={{
          toggleDraftMode: () => setDraftMode(prev => !prev),
          exportData: () => {
            const json = JSON.stringify(siteData, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `standard-fare-backup-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setToast({ message: "Backup downloaded!", type: "success" });
          },
          previewSite: () => window.open("/", "_blank"),
          collapseAll: () => { if (!allCollapsed) toggleAllSections(); },
          expandAll: () => { if (allCollapsed) toggleAllSections(); },
          undo: canUndo ? () => { undo(); setToast({ message: "Undone!", type: "success" }); } : null,
        }}
      />

      {/* ── Session Timeout Warning ───────────────────────────── */}
      {showTimeoutWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] bg-amber-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-4 animate-fade-in">
          <Clock size={16} />
          <span className="font-body text-sm">
            Session expires in {timeRemaining}s due to inactivity
          </span>
          <button onClick={extendSession}
            className="font-body text-sm font-bold underline underline-offset-2 hover:text-amber-100">
            Stay Logged In
          </button>
        </div>
      )}

      {/* ── Save Toast ─────────────────────────────────────────── */}
      {toast && <SaveToast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Scroll to Top ──────────────────────────────────────── */}
      <ScrollToTop />

      {/* ── Cmd+K hint ─────────────────────────────────────────── */}
      <button
        onClick={() => setShowCommandPalette(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden xl:flex items-center gap-2
                   bg-navy bg-opacity-80 text-cream text-xs font-mono px-4 py-2 rounded-full shadow-lg
                   hover:bg-flamingo transition-colors opacity-40 hover:opacity-100"
        title="Open command palette"
      >
        <Command size={12} /> ⌘K Quick Actions
      </button>

      {/* Undo toast — appears after any save */}
      {canUndo && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={undo}
            className="flex items-center gap-2 bg-navy/90 backdrop-blur-sm text-cream font-body text-sm px-5 py-3
                       rounded-2xl shadow-admin-lg hover:bg-flamingo hover:scale-105 transition-all duration-200"
          >
            <Undo2 size={16} /> Undo Last Save
          </button>
        </div>
      )}
    </PageLayout>
  );
};

export default AdminPage;
