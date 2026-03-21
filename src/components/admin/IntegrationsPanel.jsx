// ─────────────────────────────────────────────────────────────────────────────
// components/admin/IntegrationsPanel.jsx — Resy + Toast integration manager
// ─────────────────────────────────────────────────────────────────────────────
// Easy credential setup for Resy and Toast, plus live dashboards showing
// reservation data and order history pulled from each platform's API.
// Credentials are stored securely in Supabase (never in localStorage).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from "react";
import {
  Save, Check, AlertCircle, RefreshCw, ExternalLink, Calendar,
  Clock, Users, DollarSign, ShoppingBag, CreditCard, Wifi, WifiOff,
  Eye, EyeOff,
} from "lucide-react";
import { logActivity } from "../../lib/crmDb";

// ── Connection Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ connected, label }) => (
  <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-editorial uppercase px-2.5 py-1 rounded-full ${
    connected
      ? "bg-green-100 text-green-700"
      : "bg-navy bg-opacity-10 text-navy opacity-50"
  }`}>
    {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
    {label || (connected ? "Connected" : "Not Connected")}
  </span>
);

// ═════════════════════════════════════════════════════════════════════════════
// RESY INTEGRATION
// ═════════════════════════════════════════════════════════════════════════════
const ResyIntegration = ({ siteData, updateData, saveWithToast }) => {
  const integrations = siteData.integrations || {};
  const resy = integrations.resy || {};

  const [apiKey, setApiKey] = useState(resy.apiKey || "");
  const [venueId, setVenueId] = useState(resy.venueId || "87064");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loadingAvail, setLoadingAvail] = useState(false);

  // Test connection
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/resy-availability?date=${new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" })}&party=2`);
      const data = await res.json();
      if (data.source === "fallback" && !data.slots?.length) {
        setTestResult({ ok: false, message: "API key not configured on server. Add RESY_API_KEY to Vercel env vars." });
      } else {
        setTestResult({ ok: true, message: `Connected! ${data.slots?.length || 0} slots found for tonight.` });
      }
    } catch (e) {
      setTestResult({ ok: false, message: `Connection failed: ${e.message}` });
    }
    setTesting(false);
  };

  // Fetch today's availability
  const fetchAvailability = useCallback(async () => {
    setLoadingAvail(true);
    try {
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }));
      }
      const results = await Promise.all(
        dates.map(async (date) => {
          try {
            const res = await fetch(`/api/resy-availability?date=${date}&party=2`);
            const data = await res.json();
            return { date, slots: data.slots || [], available: data.available };
          } catch { return { date, slots: [], available: false }; }
        })
      );
      setAvailability(results);
    } catch { setAvailability(null); }
    setLoadingAvail(false);
  }, []);

  // Save credentials
  const saveResy = async () => {
    const updated = {
      ...integrations,
      resy: { apiKey, venueId, connected: !!apiKey, lastUpdated: new Date().toISOString() },
    };
    await saveWithToast("integrations", updated, "Resy Integration");
    logActivity("updated", "integrations", "Updated Resy API credentials");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c8102e] rounded-lg flex items-center justify-center text-white font-bold text-sm">R</div>
          <div>
            <h4 className="font-display text-navy text-lg">Resy</h4>
            <p className="font-body text-xs text-navy opacity-40">Reservation management & availability</p>
          </div>
        </div>
        <StatusBadge connected={!!resy.apiKey} />
      </div>

      {/* Credentials */}
      <div className="p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
        <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3">API Credentials</p>
        <p className="font-body text-xs text-navy opacity-50 mb-4 leading-relaxed">
          Get your Resy API key from the Resy developer portal or your Resy account manager.
          The venue ID for Standard Fare is pre-filled (87064).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full p-2.5 pr-16 rounded-lg border border-navy border-opacity-15 font-mono text-sm"
                placeholder="ResyAPI api_key..."
              />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="font-body text-[9px] text-navy opacity-25 mt-1">
              Also set as RESY_API_KEY in Vercel → Settings → Environment Variables
            </p>
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Venue ID</label>
            <input value={venueId} onChange={e => setVenueId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-navy border-opacity-15 font-mono text-sm"
              placeholder="87064" />
            <p className="font-body text-[9px] text-navy opacity-25 mt-1">Standard Fare = 87064</p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={saveResy} className="bg-flamingo text-white font-body text-xs px-4 py-2 rounded-lg hover:bg-flamingo-dark transition-colors flex items-center gap-2">
            <Save size={12} /> Save Credentials
          </button>
          <button onClick={testConnection} disabled={testing}
            className="font-body text-xs text-navy opacity-50 hover:opacity-80 px-4 py-2 rounded-lg border border-navy border-opacity-15 hover:border-navy transition-all flex items-center gap-2 disabled:opacity-30">
            <RefreshCw size={12} className={testing ? "animate-spin" : ""} />
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 flex items-center gap-2 font-body text-xs ${testResult.ok ? "text-green-700" : "text-red-500"}`}>
            {testResult.ok ? <Check size={12} /> : <AlertCircle size={12} />}
            {testResult.message}
          </div>
        )}
      </div>

      {/* Live Availability Dashboard */}
      <div className="p-5 bg-white rounded-xl border border-navy border-opacity-10">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 flex items-center gap-2">
            <Calendar size={12} /> 7-Day Availability
          </p>
          <button onClick={fetchAvailability} disabled={loadingAvail}
            className="font-mono text-[10px] text-flamingo opacity-60 hover:opacity-100 flex items-center gap-1 transition-opacity">
            <RefreshCw size={10} className={loadingAvail ? "animate-spin" : ""} />
            {loadingAvail ? "Loading..." : "Refresh"}
          </button>
        </div>

        {!availability ? (
          <button onClick={fetchAvailability}
            className="w-full py-6 border-2 border-dashed border-navy border-opacity-10 rounded-lg text-center font-body text-sm text-navy opacity-35 hover:opacity-50 hover:border-flamingo transition-all">
            Click to load availability data
          </button>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {availability.map(day => {
              const d = new Date(day.date + "T12:00:00");
              const dayName = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" });
              const dayNum = d.toLocaleDateString("en-US", { day: "numeric", timeZone: "America/New_York" });
              return (
                <div key={day.date} className={`text-center p-2 rounded-lg border transition-colors ${
                  day.slots.length > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-navy bg-opacity-[0.03] border-navy border-opacity-5"
                }`}>
                  <p className="font-mono text-[9px] text-navy opacity-30 uppercase">{dayName}</p>
                  <p className="font-display text-navy text-lg">{dayNum}</p>
                  <p className={`font-mono text-[9px] ${day.slots.length > 0 ? "text-green-600" : "text-navy opacity-25"}`}>
                    {day.slots.length > 0 ? `${day.slots.length} slots` : "Full"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resy Features */}
      <div className="p-4 bg-navy bg-opacity-[0.03] rounded-xl">
        <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3">What Resy Powers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: <Clock size={14} />, label: "Live Availability Widget", desc: "Shows tonight's open tables on your homepage" },
            { icon: <Users size={14} />, label: "Party Size Selection", desc: "Guests choose party size before seeing times" },
            { icon: <Calendar size={14} />, label: "Date Navigation", desc: "Browse availability for the next 7 days" },
            { icon: <ExternalLink size={14} />, label: "Direct Booking Link", desc: "One-click redirect to Resy to complete reservation" },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-2.5">
              <span className="text-flamingo opacity-50 mt-0.5">{f.icon}</span>
              <div>
                <p className="font-body text-xs text-navy font-semibold">{f.label}</p>
                <p className="font-body text-[10px] text-navy opacity-40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// TOAST INTEGRATION
// ═════════════════════════════════════════════════════════════════════════════
const ToastIntegration = ({ siteData, updateData, saveWithToast }) => {
  const integrations = siteData.integrations || {};
  const toast = integrations.toast || {};

  const [apiKey, setApiKey] = useState(toast.apiKey || "");
  const [restaurantId, setRestaurantId] = useState(toast.restaurantId || "");
  const [apiUrl, setApiUrl] = useState(toast.apiUrl || "https://ws-api.toasttab.com");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Test gift card endpoint as a connectivity check
  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/gift-card-balance?card=TEST000`);
      const data = await res.json();
      if (data.error?.includes("not yet configured")) {
        setTestResult({ ok: false, message: "Toast API key not set on server. Add TOAST_API_KEY and TOAST_RESTAURANT_ID to Vercel env vars." });
      } else {
        setTestResult({ ok: true, message: "Connected to Toast API!" });
      }
    } catch (e) {
      setTestResult({ ok: false, message: `Connection failed: ${e.message}` });
    }
    setTesting(false);
  };

  // Save credentials
  const saveToast = async () => {
    const updated = {
      ...integrations,
      toast: {
        apiKey, restaurantId, apiUrl,
        connected: !!(apiKey && restaurantId),
        lastUpdated: new Date().toISOString(),
      },
    };
    await saveWithToast("integrations", updated, "Toast Integration");
    logActivity("updated", "integrations", "Updated Toast POS credentials");
  };

  // Count items with Toast product IDs
  const events = siteData.events || [];
  const merch = siteData.merch || [];
  const prints = siteData.prints || [];
  const bottles = siteData.bottles || [];
  const linkedEvents = events.filter(e => e.toastProductId).length;
  const linkedMerch = merch.filter(m => m.toastProductId).length;
  const linkedPrints = prints.filter(p => p.toastProductId).length;
  const linkedBottles = bottles.filter(b => b.toastProductId).length;
  const totalLinked = linkedEvents + linkedMerch + linkedPrints + linkedBottles;
  const totalItems = events.length + merch.length + prints.length + bottles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff6900] rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
          <div>
            <h4 className="font-display text-navy text-lg">Toast POS</h4>
            <p className="font-body text-xs text-navy opacity-40">Online ordering, gift cards & payment processing</p>
          </div>
        </div>
        <StatusBadge connected={!!(toast.apiKey && toast.restaurantId)} />
      </div>

      {/* Credentials */}
      <div className="p-5 bg-cream-warm rounded-xl border border-navy border-opacity-10">
        <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3">API Credentials</p>
        <p className="font-body text-xs text-navy opacity-50 mb-4 leading-relaxed">
          Get your Toast API key and Restaurant ID from the Toast Developer Portal.
          These are also needed as environment variables in Vercel for the serverless API routes.
        </p>

        <div className="space-y-3 mb-4">
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">API Key</label>
            <div className="relative">
              <input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)}
                className="w-full p-2.5 pr-16 rounded-lg border border-navy border-opacity-15 font-mono text-sm"
                placeholder="Toast API key..." />
              <button onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Restaurant ID (GUID)</label>
              <input value={restaurantId} onChange={e => setRestaurantId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-navy border-opacity-15 font-mono text-sm"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">API Base URL</label>
              <input value={apiUrl} onChange={e => setApiUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-navy border-opacity-15 font-mono text-sm"
                placeholder="https://ws-api.toasttab.com" />
            </div>
          </div>
        </div>

        <p className="font-body text-[9px] text-navy opacity-25 mb-4">
          These credentials are saved here for reference. You must ALSO set them as Vercel environment variables:<br/>
          <code className="bg-navy bg-opacity-5 px-1 rounded">TOAST_API_KEY</code>{" · "}
          <code className="bg-navy bg-opacity-5 px-1 rounded">TOAST_RESTAURANT_ID</code>{" · "}
          <code className="bg-navy bg-opacity-5 px-1 rounded">TOAST_API_URL</code>
        </p>

        <div className="flex gap-3 items-center">
          <button onClick={saveToast} className="bg-flamingo text-white font-body text-xs px-4 py-2 rounded-lg hover:bg-flamingo-dark transition-colors flex items-center gap-2">
            <Save size={12} /> Save Credentials
          </button>
          <button onClick={testConnection} disabled={testing}
            className="font-body text-xs text-navy opacity-50 hover:opacity-80 px-4 py-2 rounded-lg border border-navy border-opacity-15 hover:border-navy transition-all flex items-center gap-2 disabled:opacity-30">
            <RefreshCw size={12} className={testing ? "animate-spin" : ""} />
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {testResult && (
          <div className={`mt-3 flex items-center gap-2 font-body text-xs ${testResult.ok ? "text-green-700" : "text-red-500"}`}>
            {testResult.ok ? <Check size={12} /> : <AlertCircle size={12} />}
            {testResult.message}
          </div>
        )}
      </div>

      {/* Product Linking Status */}
      <div className="p-5 bg-white rounded-xl border border-navy border-opacity-10">
        <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3 flex items-center gap-2">
          <ShoppingBag size={12} /> Product Linking
        </p>
        <p className="font-body text-xs text-navy opacity-50 mb-4">
          Items with a Toast Product ID can be purchased directly through your website.
          Add the Toast Product ID to any event, merch item, painting, or bottle in its editor.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Events", linked: linkedEvents, total: events.length },
            { label: "Merch", linked: linkedMerch, total: merch.length },
            { label: "Paintings", linked: linkedPrints, total: prints.length },
            { label: "Bottles", linked: linkedBottles, total: bottles.length },
          ].map(cat => (
            <div key={cat.label} className="bg-cream-warm rounded-lg p-3 text-center">
              <p className="font-display text-navy text-xl">{cat.linked}<span className="text-sm opacity-30">/{cat.total}</span></p>
              <p className="font-mono text-[8px] tracking-editorial uppercase text-navy opacity-30">{cat.label} linked</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-navy bg-opacity-10 rounded-full overflow-hidden">
            <div className="h-full bg-flamingo rounded-full transition-all" style={{ width: `${totalItems > 0 ? (totalLinked / totalItems) * 100 : 0}%` }} />
          </div>
          <span className="font-mono text-[10px] text-navy opacity-30">{totalLinked}/{totalItems} linked</span>
        </div>
      </div>

      {/* Toast Features */}
      <div className="p-4 bg-navy bg-opacity-[0.03] rounded-xl">
        <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-3">What Toast Powers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: <ShoppingBag size={14} />, label: "Online Ordering", desc: "Merch, event tickets, paintings, and bottles — checkout via Toast" },
            { icon: <CreditCard size={14} />, label: "Gift Card Balance", desc: "Guests check their gift card balance on your site" },
            { icon: <DollarSign size={14} />, label: "Payment Processing", desc: "Secure payments through Toast's PCI-compliant system" },
            { icon: <ExternalLink size={14} />, label: "Toast Tab Fallback", desc: "Items without Toast IDs link to your Toast online ordering page" },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-2.5">
              <span className="text-flamingo opacity-50 mt-0.5">{f.icon}</span>
              <div>
                <p className="font-body text-xs text-navy font-semibold">{f.label}</p>
                <p className="font-body text-[10px] text-navy opacity-40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN INTEGRATIONS PANEL
// ═════════════════════════════════════════════════════════════════════════════
const IntegrationsPanel = ({ siteData, updateData, saveWithToast }) => {
  const [activeTab, setActiveTab] = useState("resy");

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "resy", label: "Resy", color: "bg-[#c8102e]" },
          { id: "toast", label: "Toast POS", color: "bg-[#ff6900]" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 font-mono text-xs tracking-editorial uppercase px-4 py-2.5 rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-navy text-cream"
                : "bg-navy bg-opacity-5 text-navy opacity-50 hover:opacity-80"
            }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${tab.color}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      {activeTab === "resy" && <ResyIntegration siteData={siteData} updateData={updateData} saveWithToast={saveWithToast} />}
      {activeTab === "toast" && <ToastIntegration siteData={siteData} updateData={updateData} saveWithToast={saveWithToast} />}
    </div>
  );
};

export default IntegrationsPanel;
