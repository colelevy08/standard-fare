// ─────────────────────────────────────────────────────────────────────────────
// components/admin/SectionColorPicker.jsx — Homepage section color editor
// ─────────────────────────────────────────────────────────────────────────────
// Let owners change the background color of each homepage section.
// Options are always navy, cream, and flamingo (the brand palette).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Save, RotateCcw } from "lucide-react";

const SECTIONS = [
  { key: "hero", label: "Hero Banner" },
  { key: "about", label: "Our Story" },
  { key: "weeklyFeatures", label: "Weekly Features" },
  { key: "events", label: "Events Preview" },
  { key: "menu", label: "Menu Preview" },
  { key: "gallery", label: "Gallery" },
  { key: "testimonials", label: "Reviews" },
  { key: "bottles", label: "Bottle Shop" },
  { key: "paintings", label: "Paintings" },
  { key: "email", label: "Email Signup" },
  { key: "sms", label: "SMS Club" },
  { key: "hours", label: "Hours & Location" },
  { key: "reserve", label: "Reserve CTA" },
];

const COLOR_OPTIONS = [
  { value: "navy", label: "Navy", bg: "#1B2B4B", text: "white" },
  { value: "cream", label: "Cream", bg: "#F5F0E8", text: "#1B2B4B" },
  { value: "cream-warm", label: "Warm Cream", bg: "#EDE5D0", text: "#1B2B4B" },
  { value: "flamingo", label: "Flamingo", bg: "#E8748A", text: "white" },
  { value: "navy-light", label: "Navy Light", bg: "#2D4170", text: "white" },
  { value: "white", label: "White", bg: "#FFFFFF", text: "#1B2B4B" },
];

const DEFAULT_COLORS = {
  hero: "navy", about: "cream", weeklyFeatures: "cream", events: "navy",
  menu: "cream", gallery: "navy", testimonials: "cream", bottles: "navy",
  paintings: "cream", email: "navy", sms: "navy", hours: "cream", reserve: "flamingo",
};

const SectionColorPicker = ({ siteData, saveWithToast }) => {
  const [colors, setColors] = useState(siteData.sectionColors || { ...DEFAULT_COLORS });

  const update = (key, value) => setColors(prev => ({ ...prev, [key]: value }));
  const save = () => saveWithToast("sectionColors", colors, "Section Colors");
  const reset = () => { setColors({ ...DEFAULT_COLORS }); };

  return (
    <div>
      <p className="font-body text-sm text-navy/50 mb-5 leading-relaxed">
        Customize the background color of each section on the homepage.
        Changes apply to new visitors immediately after saving.
      </p>

      <div className="space-y-3">
        {SECTIONS.map(section => {
          const current = colors[section.key] || DEFAULT_COLORS[section.key] || "cream";
          const colorInfo = COLOR_OPTIONS.find(c => c.value === current) || COLOR_OPTIONS[0];
          return (
            <div key={section.key}
              className="flex items-center gap-4 p-3.5 bg-white rounded-xl border border-navy/[0.06] hover:shadow-sm transition-shadow">
              {/* Preview swatch */}
              <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-navy/10 flex items-center justify-center"
                style={{ backgroundColor: colorInfo.bg }}>
                <span className="font-mono text-[8px] font-bold" style={{ color: colorInfo.text }}>
                  {section.label.substring(0, 2).toUpperCase()}
                </span>
              </div>
              {/* Section name */}
              <p className="font-body text-sm text-navy flex-1">{section.label}</p>
              {/* Color selector */}
              <div className="flex gap-1.5">
                {COLOR_OPTIONS.map(color => (
                  <button key={color.value} onClick={() => update(section.key, color.value)}
                    title={color.label}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      current === color.value
                        ? "border-flamingo scale-110 shadow-sm"
                        : "border-transparent hover:border-navy/20"
                    }`}
                    style={{ backgroundColor: color.bg }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-5">
        <button onClick={save}
          className="flex items-center gap-2 bg-flamingo text-white font-body text-sm px-5 py-2.5 rounded-xl hover:bg-flamingo-dark transition-colors">
          <Save size={14} /> Save Colors
        </button>
        <button onClick={reset}
          className="flex items-center gap-2 font-body text-sm text-navy/40 px-4 py-2.5 rounded-xl border border-navy/10 hover:border-navy/30 transition-all">
          <RotateCcw size={14} /> Reset to Default
        </button>
      </div>
    </div>
  );
};

export default SectionColorPicker;
