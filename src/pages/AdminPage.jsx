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
import { LogOut, Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { useSite } from "../context/AdminContext";
import PageLayout from "../components/layout/PageLayout";
import ImageUploader from "../components/ui/ImageUploader"; // Drag-drop + base64 image uploader

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
          // Allow paste to complete, then fire onChange with the pasted value
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
  const { siteData, updateData, isAdmin, logout, dbReady, dbLoading, dbError, retrySupabase } = useSite();
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
              placeholder="https://www.bocagechampagnebar.com/"
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

    // Update a single day's open or close value
    const setHour = (i, field, value) => {
      const updated = hours.map((h, idx) => idx === i ? { ...h, [field]: value } : h);
      setHours(updated);
    };

    const save = () => updateData("hours", hours);

    return (
      <div>
        {hours.map((h, i) => (
          <CollapsibleItem
            key={h.day}
            label={h.day}
            sublabel={h.open === "Closed" || !h.open ? "Closed" : `${h.open} – ${h.close}`}
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
          <Field
            key={key}
            label={labels[key] || key.replace(/([A-Z])/g, " $1")}
            value={val}
            onChange={(v) => setLoc({ ...loc, [key]: v })}
            multiline={key === "mapEmbedUrl"}
          />
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

        {photos.map((photo, i) => (
          <CollapsibleItem
            key={photo.id}
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
        ))}

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
      price: 0, capacity: null, imageUrl: "", toastProductId: null, ticketUrl: ""
    }]);

    const remove = (i) => setEvents(events.filter((_, idx) => idx !== i));

    const save = () => updateData("events", events);

    return (
      <div>
        {events.map((ev, i) => (
          <div key={ev.id} className="border border-navy border-opacity-10 rounded p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-display text-navy text-base">{ev.title || "New Event"}</h4>
              <button onClick={() => remove(i)} className="text-flamingo-dark hover:text-flamingo"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title" value={ev.title} onChange={(v) => update(i, "title", v)} />
              <Field label="Date (YYYY-MM-DD)" value={ev.date} onChange={(v) => update(i, "date", v)} placeholder="2026-04-12" />
              <Field label="Time" value={ev.time} onChange={(v) => update(i, "time", v)} placeholder="6:30 PM – 9:00 PM" />
              <Field label="Price ($)" value={String(ev.price)} onChange={(v) => update(i, "price", Number(v))} type="number" />
              <Field label="Capacity (leave blank for unlimited)" value={ev.capacity || ""} onChange={(v) => update(i, "capacity", v ? Number(v) : null)} />
              <Field label="Ticket Fallback URL" value={ev.ticketUrl} onChange={(v) => update(i, "ticketUrl", v)} placeholder="https://order.toasttab.com/..." />
              <Field label="Toast Product ID (see README-TOAST.md)" value={ev.toastProductId || ""} onChange={(v) => update(i, "toastProductId", v || null)} placeholder="TOAST-PROD-ID" />
            </div>
            <Field label="Description" value={ev.description} onChange={(v) => update(i, "description", v)} multiline />
            {/* Image uploader for event photo — replaces URL text field */}
            <ImageUploader
              label="Event Photo"
              value={ev.imageUrl}
              onChange={(v) => update(i, "imageUrl", v)}
              height="h-40"
            />
          </div>
        ))}
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

    const update = (i, field, value) => {
      setPrints(prints.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    };

    const add = () => setPrints([...prints, {
      id: Date.now(), title: "", artist: "Daniel Fairley", medium: "", price: 0,
      imageUrl: "", available: true, description: "", toastProductId: null
    }]);

    const remove = (i) => setPrints(prints.filter((_, idx) => idx !== i));

    const save = () => updateData("prints", prints);

    return (
      <div>
        {prints.map((p, i) => (
          <div key={p.id} className="border border-navy border-opacity-10 rounded p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-display text-navy text-base">{p.title || "New Print"}</h4>
              <button onClick={() => remove(i)} className="text-flamingo-dark hover:text-flamingo"><Trash2 size={16} /></button>
            </div>
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
            {/* Image uploader for print photo */}
            <ImageUploader
              label="Print Photo"
              value={p.imageUrl}
              onChange={(v) => update(i, "imageUrl", v)}
              height="h-48"
            />
          </div>
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
  const PressEditor = () => {
    const [press, setPress] = useState(JSON.parse(JSON.stringify(siteData.press)));

    const update = (i, field, value) => {
      setPress(press.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
    };

    const add = () => setPress([...press, { id: Date.now(), outlet: "", headline: "", url: "", logo: "" }]);
    const remove = (i) => setPress(press.filter((_, idx) => idx !== i));
    const save = () => updateData("press", press);

    return (
      <div>
        {press.map((p, i) => (
          <div key={p.id} className="border border-navy border-opacity-10 rounded-lg p-5 mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-flamingo text-xs tracking-editorial uppercase">{p.outlet || "New Article"}</span>
              <button onClick={() => remove(i)} className="text-flamingo-dark hover:text-flamingo flex items-center gap-1 font-body text-xs">
                <Trash2 size={14} /> Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input value={p.outlet} onChange={(e) => update(i, "outlet", e.target.value)}
                className="form-input text-base py-2" placeholder="Outlet name (e.g. Times Union)" />
              <input value={p.url} onChange={(e) => update(i, "url", e.target.value)}
                className="form-input text-base py-2" placeholder="Article URL" />
              <input value={p.headline} onChange={(e) => update(i, "headline", e.target.value)}
                className="form-input text-sm py-2 md:col-span-2" placeholder="Article headline" />
            </div>
            {/* Logo uploader — upload the publication's logo or paste its URL */}
            <ImageUploader
              label="Publication Logo (optional — upload or paste URL)"
              value={p.logo || ""}
              onChange={(v) => update(i, "logo", v)}
              height="h-16"
            />
          </div>
        ))}
        <div className="flex gap-4 flex-wrap mt-2">
          <button onClick={add} className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark"><Plus size={14} />Add Article</button>
          <button onClick={save} className="btn-primary flex items-center gap-2"><Save size={14} />Save Press</button>
        </div>
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
          <Field key={key} label={labels[key] || key} value={val} onChange={(v) => setLinks({ ...links, [key]: v })} />
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
      <div className="space-y-8">

        {/* ── Preview Gate Toggle ─────────────────────────────── */}
        <div>
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-4">
            Password Landing Page
          </p>
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
        </div>

        {/* ── Change Preview Password ─────────────────────────── */}
        <div className="border-t border-navy border-opacity-10 pt-8">
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
        </div>

        {/* ── Change Admin Password ───────────────────────────── */}
        <div className="border-t border-navy border-opacity-10 pt-8">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">
            Admin Password
          </p>
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
        </div>

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

          {/* Top bar — Logout + How It Works */}
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/admin/how-it-works"
              className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark
                         border border-flamingo border-opacity-30 hover:border-flamingo rounded-lg px-4 py-2 transition-all"
            >
              📖 How This Website Works
            </Link>
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
          <div className="mt-6"><AdminSection title="Hours"><HoursEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Location & Map"><LocationEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Menus"><MenuEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Gallery"><GalleryEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Events & Tickets"><EventsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Paintings"><PrintsEditor /></AdminSection></div>
          <div className="mt-6"><AdminSection title="Press"><PressEditor /></AdminSection></div>
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
    </PageLayout>
  );
};

export default AdminPage;
