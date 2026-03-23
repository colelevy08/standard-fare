// ─────────────────────────────────────────────────────────────────────────────
// components/admin/EmailHub.jsx — All emails in one place
// ─────────────────────────────────────────────────────────────────────────────
// Combines email signups, contact form submissions, and newsletter subscribers
// into a single searchable, exportable view.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Download, Mail, Copy, Check } from "lucide-react";
import { getEmailSignups } from "../../lib/crmDb";

const EmailHub = ({ siteData }) => {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await getEmailSignups();
      // Also pull from localStorage fallback
      let local = [];
      try { local = JSON.parse(localStorage.getItem("sf_email_signups") || "[]"); } catch {}
      // Merge and deduplicate by email
      const all = [...(data || []), ...local];
      const seen = new Set();
      const deduped = all.filter(e => {
        const key = (e.email || "").toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setSignups(deduped);
      setLoading(false);
    })();
  }, []);

  // Contact form submissions from localStorage
  const contactSubmissions = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sf_contact_submissions") || "[]"); } catch { return []; }
  }, []);

  // Combine all emails
  const allEmails = useMemo(() => {
    const emails = [];
    signups.forEach(s => {
      emails.push({
        email: s.email,
        source: s.source || "signup",
        date: s.signed_up_at || s.date || "",
        name: "",
        type: "signup",
      });
    });
    contactSubmissions.forEach(c => {
      emails.push({
        email: c.email,
        source: "contact",
        date: c.date || c.timestamp || "",
        name: c.name || "",
        type: "contact",
        department: c.department || "",
        subject: c.subject || "",
        message: c.message || "",
      });
    });
    // Deduplicate by email
    const seen = new Set();
    return emails.filter(e => {
      const key = e.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [signups, contactSubmissions]);

  // Filtered
  const filtered = useMemo(() => {
    let list = allEmails;
    if (source !== "all") list = list.filter(e => e.type === source);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e => e.email.toLowerCase().includes(q) || (e.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [allEmails, source, search]);

  // Export CSV
  const exportCSV = () => {
    const csv = "Email,Name,Source,Date,Department,Subject\n" + filtered.map(e =>
      `"${e.email}","${e.name}","${e.source}","${e.date}","${e.department || ""}","${e.subject || ""}"`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `standard-fare-emails-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy all emails
  const copyAll = () => {
    const text = filtered.map(e => e.email).join(", ");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sourceColors = {
    signup: "bg-green-100 text-green-700",
    contact: "bg-blue-100 text-blue-700",
    website: "bg-green-100 text-green-700",
    event: "bg-amber-100 text-amber-700",
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-cream-warm rounded-2xl p-4 text-center">
          <p className="font-display text-navy text-2xl">{allEmails.length}</p>
          <p className="font-mono text-[8px] tracking-editorial uppercase text-navy/30">Total Emails</p>
        </div>
        <div className="bg-cream-warm rounded-2xl p-4 text-center">
          <p className="font-display text-navy text-2xl">{allEmails.filter(e => e.type === "signup").length}</p>
          <p className="font-mono text-[8px] tracking-editorial uppercase text-navy/30">Signups</p>
        </div>
        <div className="bg-cream-warm rounded-2xl p-4 text-center">
          <p className="font-display text-navy text-2xl">{contactSubmissions.length}</p>
          <p className="font-mono text-[8px] tracking-editorial uppercase text-navy/30">Contact Forms</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-navy/10 font-body text-sm placeholder:text-navy/25"
            placeholder="Search emails..." />
          {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy/30"><X size={14} /></button>}
        </div>
        <select value={source} onChange={e => setSource(e.target.value)}
          className="form-input py-2 text-xs w-auto">
          <option value="all">All Sources</option>
          <option value="signup">Signups Only</option>
          <option value="contact">Contact Forms</option>
        </select>
        <button onClick={copyAll}
          className="flex items-center gap-1.5 font-mono text-[10px] text-navy/40 hover:text-flamingo px-3 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 transition-all">
          {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy All"}
        </button>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 font-mono text-[10px] text-navy/40 hover:text-flamingo px-3 py-2 rounded-xl border border-navy/10 hover:border-flamingo/30 transition-all">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Email list */}
      {loading ? (
        <p className="text-center font-body text-sm text-navy/30 py-8">Loading emails...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-navy/[0.08] rounded-2xl">
          <Mail size={24} className="text-navy/15 mx-auto mb-2" />
          <p className="font-body text-sm text-navy/30">No emails yet</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {filtered.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-navy/[0.06] hover:shadow-sm transition-shadow">
              <span className={`font-mono text-[8px] tracking-editorial uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${sourceColors[e.source] || sourceColors[e.type] || "bg-navy/5 text-navy/40"}`}>
                {e.type}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-navy truncate">{e.email}</p>
                {e.name && <p className="font-body text-[10px] text-navy/35">{e.name}</p>}
              </div>
              {e.date && <span className="font-mono text-[9px] text-navy/20 flex-shrink-0">{new Date(e.date).toLocaleDateString()}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailHub;
