// ─────────────────────────────────────────────────────────────────────────────
// components/sections/EmailSignupSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Email newsletter signup — integrates with Mailchimp/Klaviyo when configured.
// Until then, stores signups in localStorage for later import.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const EmailSignupSection = () => {
  const { siteData } = useSite();
  const config = siteData.emailMarketing || {};
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "success" | "error"

  if (!config.enabled) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;

    // If Mailchimp/Klaviyo is configured, submit to API
    if (config.provider && config.listId) {
      try {
        const res = await fetch("/api/email-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, provider: config.provider, listId: config.listId }),
        });
        if (res.ok) {
          setStatus("success");
          setEmail("");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    } else {
      // Store locally until integration is set up (deduplicate)
      try {
        const stored = JSON.parse(localStorage.getItem("sf_email_signups") || "[]");
        if (!stored.some(s => s.email === trimmed)) {
          stored.push({ email: trimmed, date: new Date().toISOString() });
          localStorage.setItem("sf_email_signups", JSON.stringify(stored));
        }
        setStatus("success");
        setEmail("");
      } catch {
        setStatus("error");
      }
    }
  };

  return (
    <section className="bg-navy py-16">
      <div className="section-container text-center">
        <Mail size={28} className="text-flamingo mx-auto mb-4" />
        <h2 className="font-display text-cream text-2xl md:text-3xl mb-2">
          {config.headline || "Stay in the Loop"}
        </h2>
        <p className="font-body text-cream opacity-60 text-sm max-w-md mx-auto mb-8">
          {config.subtext || "New menus, upcoming events, and exclusive offers — delivered to your inbox."}
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-2 text-flamingo">
            <CheckCircle size={20} />
            <span className="font-body text-sm">You're on the list!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded bg-navy-light border border-cream border-opacity-20
                         text-cream font-body text-sm placeholder:text-cream placeholder:opacity-30
                         focus:border-flamingo focus:outline-none transition-colors"
            />
            <button type="submit"
              className="btn-primary py-3 px-6 flex-shrink-0">
              Subscribe
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="font-body text-flamingo text-xs mt-3">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
};

export default EmailSignupSection;
