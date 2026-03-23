// ─────────────────────────────────────────────────────────────────────────────
// components/admin/EmailHub.jsx — All emails from ALL sources in one place
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, Download, Mail, Copy, Check, Plus, Upload } from "lucide-react";
import { getEmailSignups, addEmailSignup, logActivity } from "../../lib/crmDb";

const SOURCES = [
  { value: "all", label: "All Sources", icon: "All" },
  { value: "website", label: "Website", icon: "W" },
  { value: "contact", label: "Contact Form", icon: "C" },
  { value: "resy", label: "Resy", icon: "R" },
  { value: "toast", label: "Toast", icon: "T" },
  { value: "google", label: "Google", icon: "G" },
  { value: "printify", label: "Printify", icon: "P" },
  { value: "instagram", label: "Instagram", icon: "IG" },
  { value: "event", label: "Event", icon: "E" },
  { value: "import", label: "Import", icon: "+" },
  { value: "manual", label: "Manual", icon: "M" },
];

const SOURCE_COLORS = {
  website: "bg-green-50 text-green-700 border-green-200",
  signup: "bg-green-50 text-green-700 border-green-200",
  contact: "bg-blue-50 text-blue-700 border-blue-200",
  resy: "bg-red-50 text-red-600 border-red-200",
  toast: "bg-orange-50 text-orange-700 border-orange-200",
  google: "bg-sky-50 text-sky-700 border-sky-200",
  printify: "bg-violet-50 text-violet-700 border-violet-200",
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  event: "bg-amber-50 text-amber-700 border-amber-200",
  import: "bg-navy/5 text-navy/50 border-navy/10",
  manual: "bg-cream-warm text-navy/50 border-navy/10",
  crm: "bg-flamingo/10 text-flamingo border-flamingo/20",
};

const EmailHub = ({ siteData }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", name: "", source: "manual" });
  const [importResult, setImportResult] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [syncStatus, setSyncStatus] = useState(null);

  const loadEmails = useCallback(async () => {
    setLoading(true);
    const result = [];
    let syncedSources = [];

    // 1. Auto-pull from connected platforms (Resy, Toast, etc.)
    try {
      const syncRes = await fetch("/api/sync-emails");
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        (syncData.emails || []).forEach(e => result.push(e));
        syncedSources = syncData.sources || [];
        setSyncStatus({ sources: syncedSources, count: syncData.count || 0, syncedAt: syncData.syncedAt });
      }
    } catch {}

    // 2. Supabase email signups
    const { data: supabaseSignups } = await getEmailSignups();
    (supabaseSignups || []).forEach(s => {
      result.push({ email: s.email, name: "", source: s.source || "website", date: s.signed_up_at || "" });
    });

    // 3. localStorage sources
    try {
      JSON.parse(localStorage.getItem("sf_email_signups") || "[]").forEach(s => {
        result.push({ email: s.email, name: "", source: s.source || "website", date: s.date || s.signed_up_at || "" });
      });
    } catch {}
    try {
      JSON.parse(localStorage.getItem("sf_contact_submissions") || "[]").forEach(c => {
        result.push({ email: c.email, name: c.name || "", source: "contact", date: c.date || c.timestamp || "", department: c.department, subject: c.subject });
      });
    } catch {}
    try {
      JSON.parse(localStorage.getItem("sf_crm_customers") || "[]").forEach(c => {
        if (c.email) result.push({ email: c.email, name: c.name || "", source: c.source || "crm", date: c.created_at || "" });
      });
    } catch {}
    try {
      JSON.parse(localStorage.getItem("sf_imported_emails") || "[]").forEach(e => {
        result.push({ email: e.email, name: e.name || "", source: e.source || "import", date: e.date || "" });
      });
    } catch {}

    const seen = new Set();
    const deduped = result.filter(e => {
      const key = (e.email || "").toLowerCase().trim();
      if (!key || !key.includes("@") || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setEmails(deduped);
    setLoading(false);
  }, []);

  useEffect(() => { loadEmails(); }, [loadEmails]);

  const filtered = useMemo(() => {
    let list = emails;
    if (sourceFilter !== "all") list = list.filter(e => e.source === sourceFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.email.toLowerCase().includes(q) || (e.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [emails, sourceFilter, search]);

  const sourceCounts = useMemo(() => {
    const counts = {};
    emails.forEach(e => { counts[e.source] = (counts[e.source] || 0) + 1; });
    return counts;
  }, [emails]);

  const handleAdd = async () => {
    const email = addForm.email.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    await addEmailSignup(email, addForm.source);
    try {
      const imported = JSON.parse(localStorage.getItem("sf_imported_emails") || "[]");
      imported.push({ email, name: addForm.name, source: addForm.source, date: new Date().toISOString() });
      localStorage.setItem("sf_imported_emails", JSON.stringify(imported));
    } catch {}
    setAddForm({ email: "", name: "", source: "manual" });
    setShowAdd(false);
    logActivity("created", "emails", `Added email: ${email}`);
    loadEmails();
  };

  const handleCSVImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const lines = ev.target.result.split("\n").map(l => l.trim()).filter(Boolean);
        const startIdx = lines[0]?.toLowerCase().includes("email") ? 1 : 0;
        const imported = JSON.parse(localStorage.getItem("sf_imported_emails") || "[]");
        let added = 0;
        const existing = new Set(emails.map(e => e.email.toLowerCase()));
        for (let i = startIdx; i < lines.length; i++) {
          const parts = lines[i].split(",").map(p => p.replace(/"/g, "").trim());
          const email = parts[0]?.toLowerCase();
          if (email && email.includes("@") && !existing.has(email)) {
            imported.push({ email, name: parts[1] || "", source: parts[2] || "import", date: new Date().toISOString() });
            existing.add(email);
            added++;
          }
        }
        localStorage.setItem("sf_imported_emails", JSON.stringify(imported));
        setImportResult({ ok: true, message: `${added} new email${added !== 1 ? "s" : ""} imported` });
        logActivity("imported", "emails", `CSV: ${added} emails`);
        loadEmails();
      } catch (err) {
        setImportResult({ ok: false, message: `Failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportCSV = () => {
    const list = selectedEmails.size > 0 ? filtered.filter(e => selectedEmails.has(e.email)) : filtered;
    const csv = "Email,Name,Source,Date\n" + list.map(e => `"${e.email}","${e.name || ""}","${e.source}","${e.date || ""}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `sf-emails-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    const list = selectedEmails.size > 0 ? filtered.filter(e => selectedEmails.has(e.email)) : filtered;
    navigator.clipboard?.writeText(list.map(e => e.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSelect = (email) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedEmails.size === filtered.length) setSelectedEmails(new Set());
    else setSelectedEmails(new Set(filtered.map(e => e.email)));
  };

  return (
    <div>
      {/* Hero stats */}
      <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-6 mb-6 text-center">
        <p className="font-display text-cream text-4xl mb-1">{emails.length}</p>
        <p className="font-mono text-cream/40 text-[10px] tracking-editorial uppercase">Total Emails Collected</p>
        <div className="flex justify-center gap-4 mt-4">
          {Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([src, count]) => (
            <div key={src} className="text-center">
              <p className="font-display text-cream text-lg">{count}</p>
              <p className="font-mono text-cream/25 text-[8px] tracking-editorial uppercase">{src}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-sync status */}
      {syncStatus && syncStatus.sources.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <p className="font-body text-xs text-green-700 flex-1">
            Auto-synced {syncStatus.count} email{syncStatus.count !== 1 ? "s" : ""} from {syncStatus.sources.join(", ")}
          </p>
          <span className="font-mono text-[9px] text-green-600/50">{new Date(syncStatus.syncedAt).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Quick actions bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 bg-flamingo text-white font-body text-xs px-4 py-2.5 rounded-xl hover:bg-flamingo-dark transition-colors shadow-sm">
          <Plus size={13} /> Add Email
        </button>
        <label className="flex items-center gap-1.5 font-body text-xs text-navy bg-white px-4 py-2.5 rounded-xl border border-navy/10 hover:border-flamingo/30 hover:text-flamingo transition-all cursor-pointer shadow-sm">
          <Upload size={13} /> Import CSV
          <input type="file" accept=".csv,.txt" onChange={handleCSVImport} className="hidden" />
        </label>
        <button onClick={copyAll}
          className="flex items-center gap-1.5 font-body text-xs text-navy bg-white px-4 py-2.5 rounded-xl border border-navy/10 hover:border-flamingo/30 hover:text-flamingo transition-all shadow-sm">
          {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
          {copied ? "Copied!" : selectedEmails.size > 0 ? `Copy ${selectedEmails.size}` : "Copy All"}
        </button>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 font-body text-xs text-navy bg-white px-4 py-2.5 rounded-xl border border-navy/10 hover:border-flamingo/30 hover:text-flamingo transition-all shadow-sm">
          <Download size={13} /> {selectedEmails.size > 0 ? `Export ${selectedEmails.size}` : "Export All"}
        </button>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`mb-4 p-3.5 rounded-xl text-sm font-body flex items-center justify-between ${importResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {importResult.message}
          <button onClick={() => setImportResult(null)} className="opacity-40 hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      {/* Add email form */}
      {showAdd && (
        <div className="p-5 bg-white rounded-2xl border border-flamingo/20 shadow-admin mb-5 admin-collapse-enter">
          <p className="font-mono text-[10px] tracking-editorial uppercase text-flamingo/50 mb-3">Add New Email</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <input value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})}
                placeholder="email@example.com" type="email" className="form-input py-2.5 text-sm w-full"
                onKeyDown={e => e.key === "Enter" && handleAdd()} autoFocus />
            </div>
            <div className="w-36">
              <input value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})}
                placeholder="Name (optional)" className="form-input py-2.5 text-sm w-full" />
            </div>
            <div className="w-36">
              <select value={addForm.source} onChange={e => setAddForm({...addForm, source: e.target.value})}
                className="form-input py-2.5 text-sm w-full">
                {SOURCES.filter(s => s.value !== "all").map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} className="bg-flamingo text-white font-body text-sm px-5 py-2.5 rounded-xl hover:bg-flamingo-dark transition-colors">
              Add
            </button>
          </div>
          <p className="font-body text-[10px] text-navy/25 mt-3">
            CSV format: <code className="bg-navy/5 px-1.5 py-0.5 rounded text-[9px]">email, name, source</code> — one per line
          </p>
        </div>
      )}

      {/* Source filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SOURCES.filter(s => s.value === "all" || sourceCounts[s.value]).map(s => (
          <button key={s.value} onClick={() => setSourceFilter(s.value)}
            className={`font-mono text-[9px] tracking-editorial uppercase px-3 py-1.5 rounded-lg transition-all ${
              sourceFilter === s.value
                ? "bg-navy text-cream shadow-sm"
                : "bg-white text-navy/40 border border-navy/[0.06] hover:border-navy/15 hover:text-navy/60"
            }`}>
            {s.label} {s.value !== "all" && sourceCounts[s.value] ? `(${sourceCounts[s.value]})` : ""}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/25" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-navy/10 font-body text-sm placeholder:text-navy/25 focus:border-flamingo/30 focus:ring-2 focus:ring-flamingo/10 focus:outline-none transition-all"
          placeholder="Search by email or name..." />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy/60"><X size={14} /></button>}
      </div>

      {/* Email list */}
      {loading ? (
        <div className="text-center py-12">
          <Mail size={24} className="text-navy/15 mx-auto mb-2 animate-pulse" />
          <p className="font-body text-sm text-navy/30">Loading emails from all sources...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-navy/[0.08] rounded-2xl">
          <Mail size={28} className="text-navy/10 mx-auto mb-3" />
          <p className="font-body text-sm text-navy/30 mb-1">{search || sourceFilter !== "all" ? "No emails match" : "No emails yet"}</p>
          <p className="font-body text-xs text-navy/20">Add manually, import a CSV, or wait for website signups</p>
        </div>
      ) : (
        <>
          {/* Select all / count bar */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={selectAll} className="font-mono text-[9px] text-navy/30 hover:text-flamingo transition-colors">
              {selectedEmails.size === filtered.length ? "Deselect all" : "Select all"} ({filtered.length})
            </button>
            {selectedEmails.size > 0 && (
              <span className="font-mono text-[9px] text-flamingo">{selectedEmails.size} selected</span>
            )}
          </div>

          <div className="space-y-1 max-h-[450px] overflow-y-auto rounded-xl">
            {filtered.map((e, i) => (
              <div key={i}
                onClick={() => toggleSelect(e.email)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedEmails.has(e.email)
                    ? "bg-flamingo/5 border border-flamingo/20"
                    : "bg-white border border-navy/[0.04] hover:border-navy/10 hover:shadow-sm"
                }`}>
                {/* Checkbox */}
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedEmails.has(e.email) ? "bg-flamingo border-flamingo" : "border-navy/15"
                }`}>
                  {selectedEmails.has(e.email) && <Check size={10} className="text-white" />}
                </div>
                {/* Source badge */}
                <span className={`font-mono text-[7px] tracking-editorial uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${SOURCE_COLORS[e.source] || "bg-navy/5 text-navy/40 border-navy/10"}`}>
                  {e.source}
                </span>
                {/* Email + name */}
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-navy truncate">{e.email}</p>
                  {e.name && <p className="font-body text-[10px] text-navy/30">{e.name}</p>}
                </div>
                {/* Date */}
                {e.date && <span className="font-mono text-[9px] text-navy/15 flex-shrink-0 hidden sm:block">{new Date(e.date).toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Help text */}
      <div className="mt-5 p-4 bg-navy/[0.02] rounded-2xl border border-navy/[0.04]">
        <p className="font-mono text-[9px] tracking-editorial uppercase text-navy/25 mb-2">How email sync works</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-body text-navy/40">
          <p><strong className="text-green-600">Resy:</strong> {syncStatus?.sources?.includes("resy") ? "Auto-syncing reservation guests" : "Set RESY_API_KEY in Vercel to auto-sync"}</p>
          <p><strong className="text-orange-600">Toast:</strong> {syncStatus?.sources?.includes("toast") ? "Auto-syncing order customers" : "Set TOAST_API_KEY in Vercel to auto-sync"}</p>
          <p><strong className="text-navy/50">Website:</strong> Signups + contact forms sync automatically</p>
          <p><strong className="text-navy/50">CRM:</strong> Guest emails sync automatically</p>
        </div>
        <p className="font-body text-[10px] text-navy/25 mt-2">
          Emails are auto-pulled every time you open this page. You can also manually add or import CSV.
        </p>
      </div>
    </div>
  );
};

export default EmailHub;
