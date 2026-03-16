// ─────────────────────────────────────────────────────────────────────────────
// components/PreviewGate.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Preview password gate shown before the site is public.
//
// Password source (in priority order):
//   1. siteData.settings.previewPassword — set by admin, persists to Supabase
//   2. REACT_APP_PREVIEW_PASSWORD env var — initial/fallback
//
// Admin can also toggle the gate ON/OFF and change the password from
// Admin Panel → Site Settings without redeploying.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import FlamingoIcon from "./ui/FlamingoIcon";
import { useSite } from "../context/AdminContext";

const SESSION_KEY = "sf_preview_unlocked";
const ENV_PASSWORD = process.env.REACT_APP_PREVIEW_PASSWORD || "";

const PreviewGate = ({ children }) => {
  const { siteData, previewPassword } = useSite();

  // Effective password: siteData wins over env var
  const effectivePassword = previewPassword || ENV_PASSWORD;

  // Gate is active when: password exists AND previewMode is not explicitly false
  const gateActive = effectivePassword && siteData?.settings?.previewMode !== false;

  const [unlocked, setUnlocked] = useState(
    () => !gateActive || sessionStorage.getItem(SESSION_KEY) === "true"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (!gateActive || unlocked) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === effectivePassword) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <FlamingoIcon size={64} />
        </div>
        <h1 className="font-display text-cream text-3xl mb-1">Standard Fare</h1>
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">Saratoga Springs, NY</p>
        <span className="block w-12 h-px bg-flamingo mx-auto mb-8" />
        <p className="font-body text-cream opacity-60 text-sm leading-relaxed mb-8">
          Our new website is being crafted with care.<br />
          Enter the preview password to take a look.
        </p>

        <form onSubmit={handleSubmit} style={shake ? { animation: "shake 0.5s ease" } : {}}
          className="flex flex-col gap-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Enter preview password"
            autoFocus
            className={`w-full px-5 py-3 bg-navy-light border text-cream font-body text-center
              placeholder-cream placeholder-opacity-30 focus:outline-none focus:ring-2
              focus:ring-flamingo transition-all rounded
              ${error ? "border-flamingo-dark ring-1 ring-flamingo-dark" : "border-cream border-opacity-20"}`}
          />
          {error && <p className="font-body text-flamingo text-sm">Incorrect password — try again.</p>}
          <button type="submit" className="btn-primary w-full">Preview Site</button>
        </form>

        <p className="font-body text-xs text-cream opacity-20 mt-12">
          Website created by{" "}
          <a href="https://www.linkedin.com/in/colelevy/" target="_blank" rel="noopener noreferrer"
            className="underline hover:opacity-50 transition-opacity">Cole Levy</a>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}
          45%{transform:translateX(-6px)}60%{transform:translateX(6px)}75%{transform:translateX(-3px)}90%{transform:translateX(3px)}
        }
      `}</style>
    </div>
  );
};

export default PreviewGate;
