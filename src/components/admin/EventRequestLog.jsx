// ─────────────────────────────────────────────────────────────────────────────
// components/admin/EventRequestLog.jsx — Private event inquiry log
// ─────────────────────────────────────────────────────────────────────────────
// Chronological log of all private event inquiries. Stored in Supabase
// (crm_notes with type "event-inquiry") and localStorage fallback.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { Calendar, Mail, Phone, Plus, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_OPTIONS = ["New", "Contacted", "Proposal Sent", "Confirmed", "Completed", "Cancelled"];
const STATUS_COLORS = {
  "New": "bg-blue-100 text-blue-700",
  "Contacted": "bg-amber-100 text-amber-700",
  "Proposal Sent": "bg-purple-100 text-purple-700",
  "Confirmed": "bg-green-100 text-green-700",
  "Completed": "bg-navy/10 text-navy/50",
  "Cancelled": "bg-red-100 text-red-500",
};

const LS_KEY = "sf_event_requests";
const getRequests = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } };
const saveRequests = (data) => { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {} };

const EventRequestLog = ({ saveWithToast }) => {
  const [requests, setRequests] = useState(getRequests);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", date: "", guestCount: "", eventType: "Full Buyout",
    notes: "", budget: "", status: "New",
  });

  const save = (updated) => { setRequests(updated); saveRequests(updated); };

  const addRequest = () => {
    if (!form.name) return;
    const req = { ...form, id: `req_${Date.now()}`, createdAt: new Date().toISOString() };
    save([req, ...requests]);
    setForm({ name: "", email: "", phone: "", date: "", guestCount: "", eventType: "Full Buyout", notes: "", budget: "", status: "New" });
    setShowForm(false);
  };

  const updateStatus = (id, status) => {
    save(requests.map(r => r.id === id ? { ...r, status } : r));
  };

  const removeRequest = (id) => {
    if (window.confirm("Delete this event request?")) save(requests.filter(r => r.id !== id));
  };

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  const stats = useMemo(() => ({
    total: requests.length,
    new: requests.filter(r => r.status === "New").length,
    confirmed: requests.filter(r => r.status === "Confirmed").length,
    completed: requests.filter(r => r.status === "Completed").length,
  }), [requests]);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: "Total", value: stats.total },
          { label: "New", value: stats.new },
          { label: "Confirmed", value: stats.confirmed },
          { label: "Completed", value: stats.completed },
        ].map(s => (
          <div key={s.label} className="bg-cream-warm rounded-xl p-3 text-center">
            <p className="font-display text-navy text-xl">{s.value}</p>
            <p className="font-mono text-[7px] tracking-editorial uppercase text-navy/25">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="form-input py-2 text-xs w-auto">
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="flex-1" />
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-flamingo text-white font-body text-xs px-4 py-2 rounded-xl hover:bg-flamingo-dark transition-colors">
          <Plus size={12} /> Log Request
        </button>
      </div>

      {/* New request form */}
      {showForm && (
        <div className="p-5 bg-white rounded-2xl border border-navy/[0.08] shadow-sm mb-4 admin-collapse-enter">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contact Name *" className="form-input py-2 text-sm" />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" type="email" className="form-input py-2 text-sm" />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" type="tel" className="form-input py-2 text-sm" />
            <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} placeholder="Event Date" type="date" className="form-input py-2 text-sm" />
            <input value={form.guestCount} onChange={e => setForm({...form, guestCount: e.target.value})} placeholder="Guest Count" type="number" className="form-input py-2 text-sm" />
            <input value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="Budget" className="form-input py-2 text-sm" />
            <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} className="form-input py-2 text-sm">
              <option>Full Buyout</option>
              <option>Semi-Private</option>
              <option>Custom Package</option>
              <option>Corporate</option>
              <option>Wedding</option>
              <option>Birthday</option>
            </select>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="form-input py-2 text-sm">
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Notes..." rows={2} className="form-input py-2 text-sm w-full mb-3" />
          <div className="flex gap-2">
            <button onClick={addRequest} className="bg-flamingo text-white font-body text-xs px-4 py-2 rounded-xl hover:bg-flamingo-dark transition-colors flex items-center gap-1.5">
              <Save size={12} /> Save Request
            </button>
            <button onClick={() => setShowForm(false)} className="font-body text-xs text-navy/40 px-3 py-2">Cancel</button>
          </div>
        </div>
      )}

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-navy/[0.08] rounded-2xl">
          <Calendar size={24} className="text-navy/15 mx-auto mb-2" />
          <p className="font-body text-sm text-navy/30">No event requests yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-navy/[0.06] overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 p-3.5 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <span className={`font-mono text-[8px] tracking-editorial uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[r.status] || "bg-navy/5 text-navy/40"}`}>
                  {r.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-navy font-semibold truncate">{r.name}</p>
                  <p className="font-mono text-[9px] text-navy/30">{r.eventType} · {r.guestCount ? r.guestCount + " guests" : "TBD"} · {r.date || "No date set"}</p>
                </div>
                <span className="font-mono text-[9px] text-navy/20 flex-shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                {expanded === r.id ? <ChevronUp size={14} className="text-navy/20" /> : <ChevronDown size={14} className="text-navy/20" />}
              </div>
              {expanded === r.id && (
                <div className="px-4 pb-4 border-t border-navy/[0.06] pt-3 admin-collapse-enter">
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-navy/50">
                    {r.email && <span className="flex items-center gap-1"><Mail size={10} />{r.email}</span>}
                    {r.phone && <span className="flex items-center gap-1"><Phone size={10} />{r.phone}</span>}
                    {r.budget && <span className="flex items-center gap-1">Budget: {r.budget}</span>}
                    {r.date && <span className="flex items-center gap-1"><Calendar size={10} />{r.date}</span>}
                  </div>
                  {r.notes && <p className="font-body text-xs text-navy/50 mb-3 bg-cream-warm rounded-lg p-3">{r.notes}</p>}
                  <div className="flex items-center gap-2">
                    <select value={r.status} onChange={e => updateStatus(r.id, e.target.value)} className="form-input py-1.5 text-[10px] w-auto">
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={() => removeRequest(r.id)} className="text-navy/20 hover:text-red-500 transition-colors p-1"><Trash2 size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventRequestLog;
