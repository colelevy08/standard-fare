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

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Plus, Trash2, Save, ChevronDown, ChevronUp, Undo2, GripVertical, RefreshCw, Eye, Copy } from "lucide-react";
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

// ── Small utility components ───────────────────────────────────────────────

// Section accordion header — click to expand/collapse an admin section
const AdminSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-card border border-navy border-opacity-10">
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="font-display text-navy text-lg">{title}</h3>
        {open ? <ChevronUp size={18} className="text-flamingo" /> : <ChevronDown size={18} className="text-navy opacity-40" />}
      </button>
      {/* Collapsible content */}
      {open && <div className="mt-6 border-t border-navy border-opacity-10 pt-6">{children}</div>}
    </div>
  );
};

// ── CollapsibleItem — wraps any card in a list editor with expand/collapse ──
// Used in: Paintings, Gallery, Events, Press, Team, Hero Slides, etc.
// defaultOpen=true for newly added items so the form is ready to fill in.
const CollapsibleItem = ({ label, sublabel, defaultOpen = false, onRemove, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-navy border-opacity-10 rounded-xl mb-3 overflow-hidden">
      {/* Header row — always visible */}
      <div className="flex items-center justify-between px-4 py-3 bg-cream-warm cursor-pointer select-none"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3 min-w-0">
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
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="text-flamingo-dark hover:text-flamingo transition-colors flex-shrink-0 ml-3 p-1"
            title="Remove"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {/* Expandable detail area */}
      {open && (
        <div className="px-5 py-5 border-t border-navy border-opacity-10 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};


const Field = ({ label, value, onChange, type = "text", multiline = false, placeholder = "" }) => (
  <div className="mb-4">
    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          setTimeout(() => onChange(e.target.value), 0);
        }}
        rows={4}
        className="form-input text-base resize-y"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={(e) => {
          setTimeout(() => onChange(e.target.value), 0);
        }}
        className="form-input text-base"
        placeholder={placeholder}
      />
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const AdminPage = () => {
  const { siteData, updateData, isAdmin, logout, dbReady, dbLoading, dbError, retrySupabase, canUndo, undo, draftMode, setDraftMode, hasDraft, publishDraft, discardDraft } = useSite();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );
  const navigate = useNavigate();

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
    const save = () => updateData("about", { ...draft, team });

    const updateMember = (i, field, value) =>
      setTeam(team.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
    const addMember    = () => setTeam([...team, { name: "", role: "", photo: "", bio: "" }]);
    const removeMember = (i) => setTeam(team.filter((_, idx) => idx !== i));

    return (
      <div>
        {/* ── OUR STORY ──────────────────────────────────────────── */}
        <div className="mb-8 pb-8 border-b border-navy border-opacity-10">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-5">
            Our Story
          </p>

          <Field
            label="Section Heading"
            value={draft.heading || ""}
            onChange={(v) => setDraft({ ...draft, heading: v })}
            placeholder="Creative American Dining"
          />
          <Field
            label="Body Copy — type 'Bocage Champagne Bar' to auto-hyperlink it"
            value={draft.body || ""}
            onChange={(v) => setDraft({ ...draft, body: v })}
            multiline
          />

          <div className="border border-flamingo border-opacity-20 rounded-xl p-5 bg-flamingo bg-opacity-5 mb-4">
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
              Also From Our Team — Bocage Champagne Bar
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
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">
            Our Team
          </p>
          <p className="font-body text-sm text-navy opacity-50 mb-5">
            Each founder card appears as a clickable circle in the Our Story section.
            Clicking opens their full bio modal.
          </p>

          {team.map((member, i) => (
            <CollapsibleItem
              key={i}
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

    const save = () => updateData("hours", hours);
    const saveOverride = () => updateData("hoursOverride", override);

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

        {hours.map((h, i) => (
          <CollapsibleItem
            key={h.day}
            label={h.day}
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
          </CollapsibleItem>
        ))}
        <button onClick={save} className="btn-primary flex items-center gap-2 mt-4"><Save size={14} />Save Hours</button>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LOCATION EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const LocationEditor = () => {
    const [loc, setLoc] = useState({ ...siteData.location });
    const save = () => updateData("location", loc);

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

    const save = () => updateData("menus", menus);

    return (
      <div>
        {/* Menu tab selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.keys(menus).map((key) => (
            <button
              key={key}
              onClick={() => setActiveMenu(key)}
              className={`font-mono text-xs tracking-editorial uppercase px-4 py-2 border transition-all
                ${activeMenu === key ? "bg-navy text-cream border-navy" : "border-navy border-opacity-30 text-navy hover:border-navy"}`}
            >
              {menus[key].name}
            </button>
          ))}
        </div>

        {/* Menu note */}
        <Field
          label="Menu Note (serving times etc.)"
          value={menus[activeMenu].note || ""}
          onChange={updateNote}
          placeholder="Served Saturday & Sunday..."
        />

        {/* Sections and items */}
        {menus[activeMenu].sections.map((section, si) => (
          <div key={si} className="mb-8 border border-navy border-opacity-10 rounded p-5">
            <h4 className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-4">{section.title}</h4>

            {section.items.map((item, ii) => (
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
              </CollapsibleItem>
            ))}

            {/* Add new item to this section */}
            <button onClick={() => addItem(si)} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors mt-2">
              <Plus size={14} /> Add Item
            </button>
          </div>
        ))}

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

    const update = (i, field, value) => {
      const updated = photos.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
      setPhotos(updated);
    };

    const add = () => setPhotos([...photos, {
      id: Date.now(), url: "", alt: "", comment: "", instagramUrl: "", mediaType: "image"
    }]);

    const remove = (i) => setPhotos(photos.filter((_, idx) => idx !== i));
    const save   = () => updateData("gallery", photos);

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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={photos.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {photos.map((photo, i) => (
          <SortableItem key={photo.id} id={photo.id}>
          <CollapsibleItem
            label={photo.alt || photo.caption || `Gallery Item ${i + 1}`}
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
          </CollapsibleItem>
          </SortableItem>
        ))}
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

    const update = (i, field, value) => {
      setEvents(events.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
    };

    const add = () => setEvents([...events, {
      id: Date.now(), title: "", date: "", time: "", description: "",
      price: 0, capacity: null, venue: "standard-fare", imageUrl: "", toastProductId: null, ticketUrl: ""
    }]);

    const remove = (i) => setEvents(events.filter((_, idx) => idx !== i));

    const save = () => updateData("events", events);

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = events.findIndex((e) => e.id === active.id);
        const newIdx = events.findIndex((e) => e.id === over.id);
        setEvents(arrayMove(events, oldIdx, newIdx));
      }
    };

    return (
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={events.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        {events.map((ev, i) => (
          <SortableItem key={ev.id} id={ev.id}>
          <CollapsibleItem
            label={ev.title || "New Event"}
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
              <Field label="Title" value={ev.title} onChange={(v) => update(i, "title", v)} />
              <div className="mb-4">
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Venue</label>
                <select value={ev.venue || "standard-fare"} onChange={(e) => update(i, "venue", e.target.value)}
                  className="form-input text-base">
                  <option value="standard-fare">Standard Fare</option>
                  <option value="bocage">Bocage Champagne Bar</option>
                </select>
              </div>
              <Field label="Date (YYYY-MM-DD)" value={ev.date} onChange={(v) => update(i, "date", v)} placeholder="2026-04-12" />
              <Field label="Time" value={ev.time} onChange={(v) => update(i, "time", v)} placeholder="6:30 PM – 9:00 PM" />
              <Field label="Price ($)" value={String(ev.price)} onChange={(v) => update(i, "price", Number(v))} type="number" />
              <Field label="Capacity (leave blank for unlimited)" value={ev.capacity || ""} onChange={(v) => update(i, "capacity", v ? Number(v) : null)} />
              <Field label="Ticket Fallback URL" value={ev.ticketUrl} onChange={(v) => update(i, "ticketUrl", v)} placeholder="https://order.toasttab.com/..." />
              <Field label="Toast Product ID (see README-TOAST.md)" value={ev.toastProductId || ""} onChange={(v) => update(i, "toastProductId", v || null)} placeholder="TOAST-PROD-ID" />
            </div>
            <Field label="Description" value={ev.description} onChange={(v) => update(i, "description", v)} multiline />
            <ImageUploader
              label="Event Photo"
              value={ev.imageUrl}
              onChange={(v) => update(i, "imageUrl", v)}
              height="h-40"
            />
          </CollapsibleItem>
          </SortableItem>
        ))}
        </SortableContext>
        </DndContext>
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Event</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Events</button>
        </div>
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

    const update = (i, field, value) => {
      setPrints(prints.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    };

    const add = () => setPrints([...prints, {
      id: Date.now(), title: "", artist: "Daniel Fairley", medium: "", price: 0,
      imageUrl: "", available: true, description: "", toastProductId: null
    }]);

    const remove = (i) => setPrints(prints.filter((_, idx) => idx !== i));

    const save = () => updateData("prints", prints);

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
        <div className="mb-4 bg-cream-warm border border-navy border-opacity-10 rounded-lg p-4">
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

        {prints.map((p, i) => (
          <CollapsibleItem
            key={p.id}
            label={p.title || "New Print"}
            sublabel={`${p.artist || "No artist"}${p.price ? ` · $${p.price}` : ""}${p.available ? "" : " · SOLD OUT"}`}
            defaultOpen={!p.title}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={p.title} onChange={(v) => update(i, "title", v)} />
              <Field label="Artist" value={p.artist} onChange={(v) => update(i, "artist", v)} />
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
          </CollapsibleItem>
        ))}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Print</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Prints</button>
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
    const save = () => updateData("press", press);

    return (
      <div>
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
              <Field label="Article URL" value={p.url} onChange={(v) => update(i, "url", v)} placeholder="https://..." />
              <div className="md:col-span-2">
                <Field label="Article Headline" value={p.headline} onChange={(v) => update(i, "headline", v)} placeholder="Article headline or pull quote" />
              </div>
            </div>
            <ImageUploader
              label="Custom Logo (overrides preset — optional)"
              value={p.logo || ""}
              onChange={(v) => update(i, "logo", v)}
              height="h-16"
            />
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
    const save = () => updateData("links", links);
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
            <Field label={labels[key] || key} value={val} onChange={(v) => setLinks({ ...links, [key]: v })} />
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
    const save   = () => updateData("contact", toObject(entries));

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
              <div>
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-40 block mb-1">Email Address</label>
                <input value={entry.email} onChange={(e) => update(i, "email", e.target.value)}
                  onPaste={(e) => setTimeout(() => update(i, "email", e.target.value.trim()), 0)}
                  className="form-input text-base py-2" placeholder="email@example.com" type="email" />
              </div>
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

    const update = (i, field, value) =>
      setItems(items.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

    const add = () => setItems([...items, {
      id: Date.now(), name: "", category: "", description: "",
      price: 0, imageUrl: "", variants: "", available: true, draft: true, toastProductId: null,
    }]);

    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => updateData("merch", items);

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = items.findIndex((m) => m.id === active.id);
        const newIdx = items.findIndex((m) => m.id === over.id);
        setItems(arrayMove(items, oldIdx, newIdx));
      }
    };

    return (
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableItem key={item.id} id={item.id}>
          <CollapsibleItem
            label={item.name || "New Item"}
            sublabel={`${item.draft ? "DRAFT · " : ""}${item.category || "No category"}${item.price ? ` · $${item.price}` : ""}${item.available ? "" : " · SOLD OUT"}`}
            defaultOpen={!item.name}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Item Name" value={item.name} onChange={(v) => update(i, "name", v)} placeholder="Logo Tee" />
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
          </CollapsibleItem>
          </SortableItem>
        ))}
        </SortableContext>
        </DndContext>
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Item</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Merchandise</button>
        </div>
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // BOTTLES EDITOR
  // ───────────────────────────────────────────────────────────────────────────
  const BottlesEditor = () => {
    const [items, setItems] = useState(JSON.parse(JSON.stringify(siteData.bottles || [])));

    const update = (i, field, value) =>
      setItems(items.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));

    const add = () => setItems([...items, {
      id: Date.now(), name: "", category: "wine", varietal: "", region: "",
      description: "", price: 0, imageUrl: "", available: true, draft: true, toastProductId: null,
    }]);

    const remove = (i) => setItems(items.filter((_, idx) => idx !== i));
    const save = () => updateData("bottles", items);

    const handleDragEnd = (event) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIdx = items.findIndex((b) => b.id === active.id);
        const newIdx = items.findIndex((b) => b.id === over.id);
        setItems(arrayMove(items, oldIdx, newIdx));
      }
    };

    return (
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        {items.map((bottle, i) => (
          <SortableItem key={bottle.id} id={bottle.id}>
          <CollapsibleItem
            label={bottle.name || "New Bottle"}
            sublabel={`${bottle.draft ? "DRAFT · " : ""}${bottle.category === "wine" ? "Wine" : "Beer"} · ${bottle.varietal || "No varietal"}${bottle.price ? ` · $${bottle.price}` : ""}${bottle.available ? "" : " · SOLD OUT"}`}
            defaultOpen={!bottle.name}
            onRemove={() => remove(i)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Bottle Name" value={bottle.name} onChange={(v) => update(i, "name", v)} placeholder="Château Margaux 2018" />
              <div>
                <label className="block font-body text-navy text-sm font-bold mb-1">Category</label>
                <select value={bottle.category} onChange={(e) => update(i, "category", e.target.value)}
                  className="w-full p-3 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white">
                  <option value="wine">Wine</option>
                  <option value="beer">Beer</option>
                </select>
              </div>
              <Field label="Varietal / Style" value={bottle.varietal} onChange={(v) => update(i, "varietal", v)} placeholder="Cabernet Sauvignon" />
              <Field label="Region / Brewery" value={bottle.region} onChange={(v) => update(i, "region", v)} placeholder="Bordeaux, France" />
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
          </CollapsibleItem>
          </SortableItem>
        ))}
        </SortableContext>
        </DndContext>
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Bottle</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Bottles</button>
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
    const save = () => updateData("specials", items);
    const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    return (
      <div>
        {items.map((s, i) => (
          <CollapsibleItem key={s.id} label={s.title || "New Special"} sublabel={s.active ? "Active" : "Inactive"} defaultOpen={!s.title} onRemove={() => remove(i)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={s.title} onChange={(v) => update(i, "title", v)} placeholder="Happy Hour" />
              <Field label="Description" value={s.description} onChange={(v) => update(i, "description", v)} placeholder="$8 cocktails, $5 drafts" />
              <Field label="Start Time" value={s.startTime} onChange={(v) => update(i, "startTime", v)} type="time" />
              <Field label="End Time" value={s.endTime} onChange={(v) => update(i, "endTime", v)} type="time" />
            </div>
            <div className="mt-3">
              <label className="block font-body text-navy text-sm font-bold mb-2">Active Days</label>
              <div className="flex flex-wrap gap-2">
                {allDays.map((day) => (
                  <button key={day} onClick={() => toggleDay(i, day)} type="button"
                    className={`px-3 py-1 rounded-full text-xs font-mono uppercase ${s.days.includes(day) ? "bg-flamingo text-white" : "bg-navy bg-opacity-10 text-navy opacity-50"}`}>
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <input type="checkbox" checked={s.active} onChange={(e) => update(i, "active", e.target.checked)} className="accent-flamingo w-4 h-4" />
              <span className="font-body text-sm text-navy">Active</span>
            </div>
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
    const saveRating = () => updateData("googleRating", { rating: parseFloat(gRating) || 0, count: parseInt(gCount, 10) || 0 });
    return (
      <div className="mb-4 bg-cream-warm border border-navy border-opacity-10 rounded-lg p-4">
        <p className="font-body text-sm text-navy font-bold mb-1">Google Aggregate Rating</p>
        <p className="font-body text-xs text-navy opacity-50 mb-3">
          Shown above the reviews section. Update when your Google rating changes.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2">
            <span className="font-body text-xs text-navy">Rating</span>
            <input type="number" step="0.1" min="1" max="5" value={gRating} onChange={(e) => setGRating(e.target.value)}
              className="input-field w-20 text-center" />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-body text-xs text-navy">Total reviews</span>
            <input type="number" min="0" value={gCount} onChange={(e) => setGCount(e.target.value)}
              className="input-field w-24 text-center" />
          </label>
          <button onClick={saveRating} className="btn-primary py-2 px-4 text-xs">Save Rating</button>
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
    const save = () => updateData("testimonials", items);

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
        setSyncMsg(`Pulled ${googleReviews.length} reviews from Google (${data.rating?.toFixed(1)} stars, ${data.totalReviews} total). Click Save to keep.`);
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
        <div className="mb-4 bg-cream-warm border border-navy border-opacity-10 rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-body text-sm text-navy font-bold">Auto-Import Google Reviews</p>
              <p className="font-body text-xs text-navy opacity-50">
                Reviews are pulled from Google automatically once per day. No API key needed.
              </p>
            </div>
            <button onClick={syncGoogle} disabled={syncing}
              className="btn-ghost py-2 px-4 text-xs flex items-center gap-2 disabled:opacity-40">
              {syncing ? "Syncing..." : "Pull from Google"}
            </button>
          </div>
          {syncMsg && (
            <p className={`font-mono text-xs mt-2 ${syncMsg.includes("failed") ? "text-red-500" : "text-green-600"}`}>
              {syncMsg}
            </p>
          )}
        </div>

        {items.map((r, i) => (
          <CollapsibleItem key={r.id} label={r.name || "New Review"} sublabel={`${r.source} · ${"★".repeat(r.rating)}`} defaultOpen={!r.name} onRemove={() => remove(i)}>
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
            <Field label="Review URL" value={r.reviewUrl || ""} onChange={(v) => update(i, "reviewUrl", v)} placeholder="https://g.co/kgs/... or https://www.yelp.com/..." />
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
          <Field label="Subject Line" value={subject} onChange={setSubject} placeholder="This Week at Standard Fare" />
          <Field label="Email Body" value={body} onChange={setBody} multiline />
          <div className="flex gap-3 mt-3">
            <button onClick={() => setPreview(!preview)} className="btn-ghost flex items-center gap-2 text-sm">
              {preview ? "Hide Preview" : "Preview"}
            </button>
            <button onClick={saveDraft} className="btn-primary flex items-center gap-2"><Save size={14} />Save Draft</button>
          </div>
          {preview && (
            <div className="mt-4 border border-navy border-opacity-10 rounded-xl p-6 bg-white">
              <p className="font-body text-navy font-bold text-lg mb-1">{subject || "(No subject)"}</p>
              <hr className="my-3 border-navy border-opacity-10" />
              <div className="font-body text-navy text-sm opacity-70 whitespace-pre-wrap">{body || "(No content)"}</div>
              <hr className="my-3 border-navy border-opacity-10" />
              <p className="font-mono text-xs text-navy opacity-30">Standard Fare · 21 Phila St · Saratoga Springs, NY</p>
            </div>
          )}
        </CollapsibleItem>

        {drafts.length > 0 && (
          <CollapsibleItem label="Saved Drafts" sublabel={`${drafts.length} draft${drafts.length !== 1 ? "s" : ""}`} defaultOpen={false}>
            {drafts.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-cream-warm rounded mb-2">
                <div>
                  <p className="font-body text-navy text-sm font-bold">{d.subject}</p>
                  <p className="font-mono text-xs text-navy opacity-40">{new Date(d.savedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => loadDraft(d)} className="text-flamingo text-xs font-body hover:underline">Load</button>
                  <button onClick={() => removeDraft(d.id)} className="text-navy opacity-30 hover:opacity-60 text-xs font-body">Delete</button>
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
    const save = () => updateData("smsClub", club);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={club.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable SMS Text Club</span>
        </div>
        <Field label="Headline" value={club.headline || ""} onChange={(v) => update("headline", v)} placeholder="Join the Text Club" />
        <Field label="Subtext" value={club.subtext || ""} onChange={(v) => update("subtext", v)} placeholder="Get exclusive deals delivered to your phone." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Keyword" value={club.keyword || ""} onChange={(v) => update("keyword", v)} placeholder="FARE" />
          <Field label="Shortcode" value={club.shortcode || ""} onChange={(v) => update("shortcode", v)} placeholder="12345" />
        </div>
        <Field label="Webhook URL (optional)" value={club.webhookUrl || ""} onChange={(v) => update("webhookUrl", v)} placeholder="https://hooks.zapier.com/..." />
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
    const save = () => updateData("popularNow", popular);

    return (
      <div>
        <p className="font-body text-sm text-navy opacity-60 mb-4 leading-relaxed">
          Mark items as "Popular Now" — they'll get a badge on the menu and bottle shop pages.
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

    const save = () => updateData("instagramFeed", feed);

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
            <Field label="Instagram Post URL" value={post.postUrl} onChange={(v) => update(i, "postUrl", v)} placeholder="https://www.instagram.com/p/..." />
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
    const save = () => updateData("blog", posts);

    const wordCount = (text) => (text || "").trim().split(/\s+/).filter(Boolean).length;
    const readTime = (text) => { const w = wordCount(text); return w < 200 ? "< 1 min read" : `${Math.ceil(w / 200)} min read`; };

    const formatPreviewDate = (d) => {
      try { return new Date(d + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
      catch { return d; }
    };

    const postCounts = { total: posts.length, published: posts.filter(p => p.published !== false).length, draft: posts.filter(p => p.published === false).length };

    return (
      <div>
        <p className="font-body text-sm text-navy opacity-60 mb-4 leading-relaxed">
          Write blog posts that appear on the "From the Kitchen" page. Great for SEO and building a community connection.
        </p>

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

        {posts.map((post, i) => (
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

            <Field label="Excerpt (shown on blog list)" value={post.excerpt} onChange={(v) => updatePost(i, "excerpt", v)} multiline placeholder="A brief 1-2 sentence summary that appears on the blog listing page..." />

            {/* Body editor with formatting help and word count */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50">Full Post Body</label>
                <span className="font-mono text-[10px] text-navy opacity-30">
                  {wordCount(post.body)} words · {readTime(post.body)}
                </span>
              </div>
              <textarea value={post.body} onChange={(e) => updatePost(i, "body", e.target.value)} rows={14}
                className="w-full p-4 rounded-lg border border-navy border-opacity-20 font-body text-sm text-navy leading-relaxed resize-y"
                placeholder="Write the full blog post here.&#10;&#10;Use blank lines between paragraphs to create spacing.&#10;&#10;Each paragraph will be displayed as a separate block on the blog." />
              <p className="font-body text-[11px] text-navy opacity-30 mt-1">
                Separate paragraphs with blank lines. Each line break creates a new paragraph on the blog.
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
        ))}
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Post</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Blog</button>
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
    const save = () => updateData("weeklyFeatures", { ...config, items });

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Highlight featured dishes on the homepage. Shows after Our Story, before Events.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Weekly Features</span>
        </div>
        <Field label="Headline" value={config.headline || ""} onChange={(v) => update("headline", v)} placeholder="This Week's Features" />
        <Field label="Subtitle" value={config.subtitle || ""} onChange={(v) => update("subtitle", v)} placeholder="Chef's selections for the week" />

        {items.map((item, i) => (
          <CollapsibleItem key={item.id} label={item.name || "Untitled Dish"} sublabel={item.tag || ""} onRemove={() => removeItem(i)} defaultOpen={!item.name}>
            <Field label="Dish Name" value={item.name} onChange={(v) => updateItem(i, "name", v)} placeholder="Pan-Seared Halibut" />
            <Field label="Description" value={item.description} onChange={(v) => updateItem(i, "description", v)} placeholder="Spring peas, lemon beurre blanc, crispy capers" />
            <Field label="Price" value={item.price} onChange={(v) => updateItem(i, "price", Number(v))} type="number" placeholder="38" />
            <div className="mb-4">
              <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Tag</label>
              <select value={item.tag || "New"} onChange={(e) => updateItem(i, "tag", e.target.value)}
                className="form-input text-base">
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
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
    const save = () => updateData("seasonalCountdown", config);

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Show a countdown banner on the homepage for an upcoming seasonal menu launch.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled || false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Countdown</span>
        </div>
        <Field label="Menu Name" value={config.title || ""} onChange={(v) => update("title", v)} placeholder="Spring Menu" />
        <Field label="Launch Date" value={config.launchDate || ""} onChange={(v) => update("launchDate", v)} placeholder="2026-04-15" />
        <Field label="Teaser Text" value={config.teaser || ""} onChange={(v) => update("teaser", v)} placeholder="New seasonal dishes dropping soon..." />
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
    const save = () => updateData("emailMarketing", config);

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
        <Field label="Headline" value={config.headline || ""} onChange={(v) => update("headline", v)} placeholder="Stay in the Loop" />
        <Field label="Subtext" value={config.subtext || ""} onChange={(v) => update("subtext", v)} placeholder="New menus, events, and exclusive offers." />
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
    const save = () => updateData("faq", items);
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
                <CollapsibleItem label={item.question || "New Question"} sublabel={item.category} defaultOpen={!item.question} onRemove={() => remove(i)}>
                  <Field label="Question" value={item.question} onChange={(v) => update(i, "question", v)} placeholder="e.g. What is the dress code?" />
                  <Field label="Answer" value={item.answer} onChange={(v) => update(i, "answer", v)} multiline placeholder="Enter the answer..." />
                  <div>
                    <label className="block font-body text-navy text-sm font-bold mb-1">Category</label>
                    <select value={item.category} onChange={(e) => update(i, "category", e.target.value)}
                      className="w-full p-3 rounded border border-navy border-opacity-20 font-body text-sm text-navy bg-white">
                      {FAQ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </CollapsibleItem>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
        <div className="flex gap-4 flex-wrap">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo"><Plus size={14} />Add Question</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save FAQ</button>
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
    const save = () => updateData("stockPhotos", { ...siteData.stockPhotos, events: photos.filter(Boolean) });

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
    const save = () => updateData("privateEvents", config);

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
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.enabled !== false} onChange={(e) => update("enabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Private Events Page</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Max Full Buyout Capacity" value={String(config.maxCapacity || "")} onChange={(v) => update("maxCapacity", parseInt(v) || 0)} placeholder="60" />
          <Field label="Semi-Private Capacity" value={String(config.semiPrivateCapacity || "")} onChange={(v) => update("semiPrivateCapacity", parseInt(v) || 0)} placeholder="24" />
        </div>
        <div>
          <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">What's Included</label>
          {(config.includes || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input value={item} onChange={(e) => updateInclude(i, e.target.value)}
                className="flex-1 p-2 rounded border border-navy border-opacity-20 font-body text-sm text-navy" placeholder="Dedicated event coordinator" />
              <button onClick={() => removeInclude(i)} className="text-navy opacity-30 hover:opacity-60"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addInclude} className="flex items-center gap-2 font-body text-xs text-flamingo mt-1"><Plus size={12} />Add Item</button>
        </div>
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
    const save = () => updateData("giftCards", config);

    return (
      <div className="space-y-4">
        <p className="font-body text-sm text-navy opacity-60 leading-relaxed">
          Enable or disable the gift card balance check feature on the site.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <input type="checkbox" checked={config.balanceCheckEnabled || false} onChange={(e) => update("balanceCheckEnabled", e.target.checked)} className="accent-flamingo w-4 h-4" />
          <span className="font-body text-sm text-navy font-bold">Enable Balance Check</span>
        </div>
        <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Gift Cards</button>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageLayout>
      <div className="bg-navy pt-32 pb-12 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Owner Portal</p>
        <h1 className="font-display text-cream text-4xl">Manage Website</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container max-w-4xl px-4 md:px-12">

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
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-2 font-body text-sm text-navy opacity-50 hover:opacity-80 hover:text-flamingo transition-all"
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>

          {/* Admin sections — each is an accordion panel */}
          <div className="mb-6"><AdminSection title="Site Settings" defaultOpen={true}><SiteSettingsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Hero — Text, Buttons &amp; Slideshow"><HeroSlideshowEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Our Story &amp; Team"><AboutEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Weekly Features"><WeeklyFeaturesEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Hours"><HoursEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Location & Map"><LocationEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Menus"><MenuEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Gallery"><GalleryEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Instagram Feed"><InstagramFeedEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Events & Tickets"><EventsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Paintings"><PrintsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Merchandise"><MerchEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Bottle Shop"><BottlesEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Daily Specials"><SpecialsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Testimonials"><TestimonialsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Popular Now Badges"><PopularNowEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Blog — From the Kitchen"><BlogEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Seasonal Menu Countdown"><SeasonalCountdownEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Email Marketing"><EmailMarketingEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Private Events"><PrivateEventsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Gift Cards"><GiftCardsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="SMS Text Club"><SmsClubEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Newsletter"><NewsletterEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="FAQ"><FAQEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Press"><PressEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Stock Photos"><StockPhotosEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="External Links"><LinksEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Contact Emails"><ContactEditor /></AdminSection></div>

          {/* Storage status + Reset to Defaults */}
          <div className="mt-12 border border-flamingo border-opacity-30 rounded-lg p-6">
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">Storage Status</p>
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
            <div className="mt-4">
              <button
                onClick={() => {
                  if (window.confirm(
                    "This will reset ALL website content to the built-in defaults, overwriting any changes you've saved. Are you sure?"
                  )) {
                    localStorage.removeItem("standard_fare_site_data");
                    window.location.reload();
                  }
                }}
                className="font-body text-xs text-navy opacity-40 hover:opacity-80 hover:text-flamingo-dark transition-all underline underline-offset-2"
              >
                Reset all content to defaults
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Undo toast — appears after any save */}
      {canUndo && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={undo}
            className="flex items-center gap-2 bg-navy text-cream font-body text-sm px-5 py-3
                       rounded-lg shadow-xl hover:bg-flamingo transition-colors"
          >
            <Undo2 size={16} /> Undo Last Save
          </button>
        </div>
      )}
    </PageLayout>
  );
};

export default AdminPage;
