// ─────────────────────────────────────────────────────────────────────────────
// components/sections/SmsClubSection.jsx
// SMS text club signup — collects phone numbers for flash deals.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const SmsClubSection = () => {
  const { siteData } = useSite();
  const club = siteData.smsClub || {};
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!club.enabled) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    // If webhook is configured, send to it
    if (club.webhookUrl) {
      try {
        await fetch(club.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone.trim(), source: "website" }),
        });
      } catch (_) { /* silently fail — still show success */ }
    }

    setSubmitted(true);
    setPhone("");
  };

  return (
    <section className="bg-navy py-16">
      <div className="max-w-xl mx-auto px-6 text-center">
        <MessageCircle size={32} className="text-flamingo mx-auto mb-4" />
        <h3 className="font-display text-cream text-2xl md:text-3xl mb-2">
          {club.headline || "Join the Text Club"}
        </h3>
        <p className="font-body text-cream opacity-50 text-sm mb-8">
          {club.subtext || "Get exclusive deals delivered to your phone."}
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-flamingo">
            <Check size={20} />
            <span className="font-body text-sm">You're in! Watch for your first text.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="flex-1 px-4 py-3 rounded bg-white bg-opacity-10 border border-cream border-opacity-20 text-cream font-body text-sm placeholder-cream placeholder-opacity-30 focus:outline-none focus:border-flamingo"
            />
            <button type="submit"
              className="px-6 py-3 bg-flamingo text-white font-body font-bold text-sm tracking-widest uppercase rounded hover:bg-opacity-90 transition-colors">
              Join
            </button>
          </form>
        )}

        {club.keyword && (
          <p className="font-mono text-cream opacity-30 text-xs mt-4">
            Or text {club.keyword} to {club.shortcode}
          </p>
        )}
      </div>
    </section>
  );
};

export default SmsClubSection;
