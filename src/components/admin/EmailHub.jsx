// ─────────────────────────────────────────────────────────────────────────────
// components/admin/EmailHub.jsx — All emails from ALL sources in one place
// ─────────────────────────────────────────────────────────────────────────────
// Combines emails from: website signups, contact forms, Resy, Toast, Google,
// Printify, manual entry, and CSV imports. Deduplicates, searches, exports.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X, Download, Mail, Copy, Check, Plus, Upload } from "lucide-react";
import { getEmailSignups, addEmailSignup } from "../../lib/crmDb";
import { logActivity } from "../../lib/crmDb";

const SOURCES = [
  { value: "all", label: "All Sources" },
  { value: "website", label: "Website Signup" },
  { value: "contact", label: "Contact Form" },
  { value: "resy", label: "Resy" },
  { value: "toast", label: "Toast POS" },
  { value: "google", label: "Google" },
  { value: "printify", label: "Printify" },
  { value: "instagram", label: "Instagram" },
  { value: "event", label: "Event Attendee" },
  { value: "import", label: "CSV Import" },
  { value: "manual", label: "Manual Entry" },
];

const SOURCE_COLORS = {
  website: "bg-green-100 text-green-700",
  signup: "bg-green-100 text-green-700",
  contact: "bg-blue-100 text-blue-700",
  resy: "bg-red-100 text-red-600",
  toast: "bg-orange-100 text-orange-700",
  google: "bg-sky-100 text-sky-700",
  printify: "bg-violet-100 text-violet-700",
  instagram: "bg-pink-100 text-pink-700",
  event: "bg-amber-100 text-amber-700",
  import: "bg-navy/10 text-navy/50",
  manual: "bg-cream-warm text-navy/50",
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

  // Load all emails from all sources
  const loadEmails = useCallback(async () => {
    setLoading(true);
    const result = [];

    // 1. Supabase email_signups table
    const { data: supabaseSignups } = await getEmailSignups();
    (supabaseSignups || []).forEach(s => {
      result.push({ email: s.email, name: "", source: s.source || "website", date: s.signed_up_at || "", type: "signup" });
    });

    // 2. localStorage email signups (fallback)
    try {
      const local = JSON.parse(localStorage.getItem("sf_email_signups") || "[]");
      local.forEach(s => {
        result.push({ email: s.email, name: "", source: s.source || "website", date: s.date || s.signed_up_at || "", type: "signup" });
      });
    } catch {}

    // 3. Contact form submissions
    try {
      const contacts = JSON.parse(localStorage.getItem("sf_contact_submissions") || "[]");
      contacts.forEach(c => {
        result.push({ email: c.email, name: c.name || "", source: "contact", date: c.date || c.timestamp || "", type: "contact", department: c.department, subject: c.subject });
      });
    } catch {}

    // 4. CRM customers with emails
    try {
      const crm = JSON.parse(localStorage.getItem("sf_crm_customers") || "[]");
      crm.forEach(c => {
        if (c.email) result.push({ email: c.email, name: c.name || "", source: c.source || "crm", date: c.created_at || "", type: "crm" });
      });
    } catch {}

    // 5. Imported emails (stored in localStorage)
    try {
      const imported = JSON.parse(localStorage.getItem("sf_imported_emails") || "[]");
      imported.forEach(e => {
        result.push({ email: e.email, name: e.name || "", source: e.source || "import", date: e.date || "", type: "import" });
      });
    } catch {}

    // Deduplicate by email (keep first occurrence — most recent due to ordering)
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

  // Filtered list
  const filtered = useMemo(() => {
    let list = emails;
    if (sourceFilter !== "all") list = list.filter(e => e.source === sourceFilter || e.type === sourceFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.email.toLowerCase().includes(q) || (e.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [emails, sourceFilter, search]);

  // Source counts
  const sourceCounts = useMemo(() => {
    const counts = {};
    emails.forEach(e => { const s = e.source || e.type; counts[s] = (counts[s] || 0) + 1; });
    return counts;
  }, [emails]);

  // Add single email
  const handleAdd = async () => {
    const email = addForm.email.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    await addEmailSignup(email, addForm.source);
    // Also store in imported emails for persistence
    try {
      const imported = JSON.parse(localStorage.getItem("sf_imported_emails") || "[]");
      imported.push({ email, name: addForm.name, source: addForm.source, date: new Date().toISOString() });
      localStorage.setItem("sf_imported_emails", JSON.stringify(imported));
    } catch {}
    setAddForm({ email: "", name: "", source: "manual" });
    setShowAdd(false);
    logActivity("created", "emails", `Added email: ${email} (${addForm.source})`);
    loadEmails();
  };

  // Import CSV
  const handleCSVImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        // Skip header if it contains "email"
        const startIdx = lines[0]?.toLowerCase().includes("email") ? 1 : 0;
        const imported = JSON.parse(localStorage.getItem("sf_imported_emails") || "[]");
        let added = 0;
        const existingEmails = new Set(emails.map(e => e.email.toLowerCase()));

        for (let i = startIdx; i < lines.length; i++) {
          const parts = lines[i].split(",").map(p => p.replace(/"/g, "").trim());
          const email = parts[0]?.toLowerCase();
          if (email && email.includes("@") && !existingEmails.has(email)) {
            const name = parts[1] || "";
            const source = parts[2] || "import";
            imported.push({ email, name, source, date: new Date().toISOString() });
            existingEmails.add(email);
            added++;
          }
        }

        localStorage.setItem("sf_imported_emails", JSON.stringify(imported));
        setImportResult({ ok: true, message: `Imported ${added} new email${added !== 1 ? "s" : ""} (${lines.length - startIdx - added} duplicates skipped)` });
        logActivity("imported", "emails", `CSV import: ${added} new emails`);
        loadEmails();
      } catch (err) {
        setImportResult({ ok: false, message: `Import failed: ${err.message}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Export CSV
  const exportCSV = () => {
    const csv = "Email,Name,Source,Date\n" + filtered.map(e =>
      `"${e.email}","${e.name || ""}","${e.source}","${e.date || ""}"`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `standard-fare-all-emails-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity("exported", "emails", `Exported ${filtered.length} emails`);
  };

  // Copy all
  const copyAll = () => {
    navigator.clipboard?.writeText(filtered.map(e => e.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p className="font-body text-sm text-navy/50 mb-4 leading-relaxed">
        All emails from every platform in one place. Import from Resy, Toast, Google, Printify, or add manually.
      </p>

      {/* Stats by source */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="bg-cream-warm rounded-xl px-4 py-3 text-center min-w-[80px]">
          <p className="font-display text-navy text-xl">{emails.length}</p>
          <p className="font-mono text-[7px] tracking-editorial uppercase text-navy/25">Total</p>
        </div>
        {Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([src, count]) => (
          <div key={src} className="bg-white rounded-xl border border-navy/[0.06] px-3 py-3 text-center min-w-[70px]">
            <p className="font-display text-navy text-lg">{count}</p>
            <p className="font-mono text-[7px] tracking-editorial uppercase text-navy/25">{src}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-navy/10 font-body text-sm placeholder:text-navy/25"
            placeholder="Search emails..." />
          {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy/30"><X size={14} /></button>}
        </div>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="form-input py-2 text-xs w-auto">
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 bg-flamingo text-white font-body text-xs px-3 py-2 rounded-xl hover:bg-flamingo-dark transition-colors">
          <Plus size={12} /> Add
        </button>
        <label className="flex items-center gap-1.5 font-mono text-[10px] text-navy/40 hover:text-flamingo px-3 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 transition-all cursor-pointer">
          <Upload size={12} /> Import CSV
          <input type="file" accept=".csv,.txt" onChange={handleCSVImport} className="hidden" />
        </label>
        <button onClick={copyAll}
          className="flex items-center gap-1.5 font-mono text-[10px] text-navy/40 hover:text-flamingo px-3 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 transition-all">
          {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy All"}
        </button>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 font-mono text-[10px] text-navy/40 hover:text-flamingo px-3 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 transition-all">
          <Download size={12} /> Export
        </button>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`mb-3 p-3 rounded-xl text-xs font-body flex items-center justify-between ${importResult.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {importResult.message}
          <button onClick={() => setImportResult(null)} className="opacity-40 hover:opacity-70"><X size={12} /></button>
        </div>
      )}

      {/* Add email form */}
      {showAdd && (
        <div className="p-4 bg-white rounded-2xl border border-navy/[0.08] shadow-sm mb-4 admin-collapse-enter">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="font-mono text-[9px] tracking-editorial uppercase text-navy/30 block mb-1">Email</label>
              <input value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})}
                placeholder="email@example.com" type="email" className="form-input py-2 text-sm" />
            </div>
            <div className="w-32">
              <label className="font-mono text-[9px] tracking-editorial uppercase text-navy/30 block mb-1">Name</label>
              <input value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})}
                placeholder="Optional" className="form-input py-2 text-sm" />
            </div>
            <div className="w-32">
              <label className="font-mono text-[9px] tracking-editorial uppercase text-navy/30 block mb-1">Source</label>
              <select value={addForm.source} onChange={e => setAddForm({...addForm, source: e.target.value})}
                className="form-input py-2 text-xs">
                {SOURCES.filter(s => s.value !== "all").map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button onClick={handleAdd} className="bg-flamingo text-white font-body text-xs px-4 py-2.5 rounded-xl hover:bg-flamingo-dark transition-colors">Add</button>
            <button onClick={() => setShowAdd(false)} className="font-body text-xs text-navy/30 px-2 py-2">Cancel</button>
          </div>
          <p className="font-body text-[10px] text-navy/25 mt-2">
            CSV format: <code className="bg-navy/5 px-1 rounded text-[9px]">email,name,source</code> — one per line. First row can be a header.
          </p>
        </div>
      )}

      {/* Email list */}
      {loading ? (
        <p className="text-center font-body text-sm text-navy/30 py-8">Loading emails from all sources...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-navy/[0.08] rounded-2xl">
          <Mail size={24} className="text-navy/15 mx-auto mb-2" />
          <p className="font-body text-sm text-navy/30">{search || sourceFilter !== "all" ? "No emails match your filter" : "No emails yet — add manually or import a CSV"}</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
          {filtered.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-navy/[0.06] hover:shadow-sm transition-shadow group">
              <span className={`font-mono text-[7px] tracking-editorial uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${SOURCE_COLORS[e.source] || SOURCE_COLORS[e.type] || "bg-navy/5 text-navy/40"}`}>
                {e.source || e.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-navy truncate">{e.email}</p>
                {e.name && <p className="font-body text-[10px] text-navy/30">{e.name}</p>}
              </div>
              {e.date && <span className="font-mono text-[9px] text-navy/15 flex-shrink-0">{new Date(e.date).toLocaleDateString()}</span>}
              <button onClick={() => { navigator.clipboard?.writeText(e.email); }}
                className="opacity-0 group-hover:opacity-30 hover:!opacity-60 transition-opacity flex-shrink-0" title="Copy email">
                <Copy size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="font-body text-[10px] text-navy/20 mt-3">
        Showing {filtered.length} of {emails.length} emails. Import emails from Resy, Toast, Google Business, or Printify by exporting a CSV from those platforms and importing it here.
      </p>
    </div>
  );
};

export default EmailHub;
