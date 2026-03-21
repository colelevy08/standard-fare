// ─────────────────────────────────────────────────────────────────────────────
// components/admin/SEOEditor.jsx — SEO metadata editor for all pages
// ─────────────────────────────────────────────────────────────────────────────
// Edit meta titles, descriptions, OG images, and structured data for each
// page on the site. Preview how pages appear in Google search results and
// social media shares.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Save, Eye, Globe, Search, Share2 } from "lucide-react";

const PAGES = [
  { key: "home", label: "Home", path: "/" },
  { key: "menu", label: "Menu", path: "/menu" },
  { key: "events", label: "Events", path: "/events" },
  { key: "gallery", label: "Gallery", path: "/gallery" },
  { key: "blog", label: "Blog", path: "/blog" },
  { key: "prints", label: "Paintings", path: "/prints" },
  { key: "merch", label: "Merchandise", path: "/merch" },
  { key: "bottles", label: "Bottle Shop", path: "/bottles" },
  { key: "press", label: "Press", path: "/press" },
  { key: "faq", label: "FAQ", path: "/faq" },
  { key: "contact", label: "Contact", path: "/contact" },
  { key: "team", label: "Our Team", path: "/team" },
  { key: "privateEvents", label: "Private Events", path: "/private-events" },
  { key: "giftCards", label: "Gift Cards", path: "/gift-cards" },
];

const DEFAULT_META = {
  title: "Standard Fare — Creative American Dining",
  description: "Creative American dining in Saratoga Springs, NY. Brunch, dinner, and craft cocktails at 21 Phila St.",
  ogImage: "",
  keywords: "restaurant, saratoga springs, dining, brunch, dinner, cocktails, american food",
};

const SEOEditor = ({ siteData, updateData, saveWithToast }) => {
  const [seo, setSeo] = useState(siteData.seo || {});
  const [activePage, setActivePage] = useState("home");
  const [previewMode, setPreviewMode] = useState("google"); // google | social

  const pageMeta = seo[activePage] || { ...DEFAULT_META };
  const updateMeta = (field, value) => {
    setSeo(prev => ({
      ...prev,
      [activePage]: { ...pageMeta, [field]: value },
    }));
  };

  const save = () => saveWithToast("seo", seo, "SEO Settings");

  const titleLength = (pageMeta.title || "").length;
  const descLength = (pageMeta.description || "").length;
  const siteName = "standardfaresaratoga.com";
  const pageInfo = PAGES.find(p => p.key === activePage);

  return (
    <div>
      <p className="font-body text-sm text-navy opacity-60 mb-4 leading-relaxed">
        Optimize how Standard Fare appears in Google search results and social media shares.
        Each page can have its own title, description, and image.
      </p>

      {/* Page selector */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {PAGES.map(p => (
          <button key={p.key} onClick={() => setActivePage(p.key)}
            className={`font-mono text-[10px] tracking-editorial uppercase px-3 py-1.5 rounded-lg transition-all
              ${activePage === p.key ? "bg-navy text-cream" : "bg-navy bg-opacity-5 text-navy opacity-50 hover:opacity-80"}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fields */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50">Page Title</label>
              <span className={`font-mono text-[10px] ${titleLength > 60 ? "text-red-500" : titleLength > 50 ? "text-amber-500" : "text-navy opacity-25"}`}>
                {titleLength}/60
              </span>
            </div>
            <input value={pageMeta.title || ""} onChange={e => updateMeta("title", e.target.value)}
              className="form-input text-base" placeholder="Standard Fare — Creative American Dining" />
            {titleLength > 60 && <p className="font-body text-[10px] text-red-500 mt-1">Google truncates titles longer than 60 characters</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50">Meta Description</label>
              <span className={`font-mono text-[10px] ${descLength > 160 ? "text-red-500" : descLength > 140 ? "text-amber-500" : "text-navy opacity-25"}`}>
                {descLength}/160
              </span>
            </div>
            <textarea value={pageMeta.description || ""} onChange={e => updateMeta("description", e.target.value)}
              className="form-input text-base resize-y" rows={3}
              placeholder="Creative American dining in Saratoga Springs, NY..." />
            {descLength > 160 && <p className="font-body text-[10px] text-red-500 mt-1">Google truncates descriptions longer than 160 characters</p>}
          </div>

          <div>
            <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Keywords</label>
            <input value={pageMeta.keywords || ""} onChange={e => updateMeta("keywords", e.target.value)}
              className="form-input text-base" placeholder="restaurant, saratoga springs, dining..." />
            <p className="font-body text-[10px] text-navy opacity-25 mt-1">Comma-separated. Used for internal SEO scoring only.</p>
          </div>

          <div>
            <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-1">Social Share Image URL</label>
            <input value={pageMeta.ogImage || ""} onChange={e => updateMeta("ogImage", e.target.value)}
              className="form-input text-base" placeholder="https://..." />
            <p className="font-body text-[10px] text-navy opacity-25 mt-1">1200x630px recommended. Shows when shared on Facebook, Twitter, etc.</p>
          </div>

          <button onClick={save} className="btn-primary flex items-center gap-2">
            <Save size={14} /> Save SEO Settings
          </button>
        </div>

        {/* Preview */}
        <div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setPreviewMode("google")}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-editorial uppercase px-3 py-1.5 rounded-lg transition-all
                ${previewMode === "google" ? "bg-navy text-cream" : "text-navy opacity-40 hover:opacity-70"}`}>
              <Search size={11} /> Google
            </button>
            <button onClick={() => setPreviewMode("social")}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-editorial uppercase px-3 py-1.5 rounded-lg transition-all
                ${previewMode === "social" ? "bg-navy text-cream" : "text-navy opacity-40 hover:opacity-70"}`}>
              <Share2 size={11} /> Social
            </button>
          </div>

          {previewMode === "google" ? (
            /* Google search result preview */
            <div className="bg-white rounded-lg border border-navy border-opacity-10 p-5">
              <p className="font-mono text-[9px] text-navy opacity-20 mb-3 uppercase tracking-editorial">Google Search Preview</p>
              <div className="space-y-1">
                <p className="font-body text-xs text-green-700">{siteName}{pageInfo?.path || "/"}</p>
                <p className="font-body text-lg text-blue-700 hover:underline cursor-pointer leading-tight">
                  {(pageMeta.title || DEFAULT_META.title).substring(0, 60)}
                  {(pageMeta.title || "").length > 60 ? "..." : ""}
                </p>
                <p className="font-body text-sm text-navy opacity-70 leading-relaxed">
                  {(pageMeta.description || DEFAULT_META.description).substring(0, 160)}
                  {(pageMeta.description || "").length > 160 ? "..." : ""}
                </p>
              </div>
            </div>
          ) : (
            /* Social share preview */
            <div className="bg-white rounded-lg border border-navy border-opacity-10 overflow-hidden">
              <p className="font-mono text-[9px] text-navy opacity-20 p-3 uppercase tracking-editorial">Social Share Preview</p>
              {pageMeta.ogImage && (
                <img src={pageMeta.ogImage} alt="" className="w-full h-40 object-cover" />
              )}
              {!pageMeta.ogImage && (
                <div className="w-full h-40 bg-navy bg-opacity-5 flex items-center justify-center">
                  <Globe size={32} className="text-navy opacity-15" />
                </div>
              )}
              <div className="p-4 border-t border-navy border-opacity-5">
                <p className="font-mono text-[10px] text-navy opacity-30 uppercase">{siteName}</p>
                <p className="font-body text-navy font-bold mt-1">{pageMeta.title || DEFAULT_META.title}</p>
                <p className="font-body text-sm text-navy opacity-60 mt-1 line-clamp-2">
                  {pageMeta.description || DEFAULT_META.description}
                </p>
              </div>
            </div>
          )}

          {/* SEO Score */}
          <div className="mt-4 p-4 bg-cream-warm rounded-lg border border-navy border-opacity-10">
            <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3">SEO Checklist</p>
            <div className="space-y-1.5">
              {[
                { check: titleLength > 0 && titleLength <= 60, label: "Title is 1-60 characters", warn: titleLength > 60 },
                { check: descLength > 0 && descLength <= 160, label: "Description is 1-160 characters", warn: descLength > 160 },
                { check: !!pageMeta.ogImage, label: "Social share image set" },
                { check: (pageMeta.keywords || "").split(",").filter(Boolean).length >= 3, label: "At least 3 keywords" },
                { check: (pageMeta.title || "").toLowerCase().includes("standard fare"), label: "Brand name in title" },
                { check: (pageMeta.description || "").toLowerCase().includes("saratoga"), label: "Location mentioned in description" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-white text-[8px] ${
                    item.check ? "bg-green-500" : item.warn ? "bg-red-500" : "bg-navy bg-opacity-15"
                  }`}>
                    {item.check ? "✓" : item.warn ? "!" : ""}
                  </span>
                  <span className={`font-body text-xs ${item.check ? "text-green-700" : "text-navy opacity-40"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOEditor;
