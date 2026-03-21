// ─────────────────────────────────────────────────────────────────────────────
// components/admin/CRMPanel.jsx — Customer Relationship Management panel
// ─────────────────────────────────────────────────────────────────────────────
// Full CRM for managing guests: add/edit customers, tag them, add notes,
// track visits, manage dietary preferences, and export customer data.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, X, Trash2, Save, ChevronDown, ChevronUp,
  Users, Star, Mail, Phone, MessageSquare, Download,
  UserPlus, Edit3, Check, Calendar, MapPin,
} from "lucide-react";
import {
  getCustomers, upsertCustomer, deleteCustomer,
  getCustomerNotes, addNote, deleteNote,
  getCustomerStats, DEFAULT_TAGS, logActivity,
} from "../../lib/crmDb";

// ── Customer Card ──────────────────────────────────────────────────────────
const CustomerCard = ({ customer, onEdit, onDelete, onAddNote }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [loadingNotes, setLoadingNotes] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoadingNotes(true);
    const { data } = await getCustomerNotes(customer.id);
    setNotes(data || []);
    setLoadingNotes(false);
  }, [customer.id]);

  useEffect(() => {
    if (expanded) loadNotes();
  }, [expanded, loadNotes]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addNote(customer.id, noteText.trim(), noteType);
    setNoteText("");
    loadNotes();
    onAddNote?.();
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(noteId);
    loadNotes();
  };

  return (
    <div className={`border rounded-xl mb-2 overflow-hidden transition-colors ${expanded ? "border-flamingo border-opacity-30" : "border-navy border-opacity-10"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cream-warm cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 min-w-0">
          {expanded ? <ChevronUp size={14} className="text-flamingo flex-shrink-0" /> : <ChevronDown size={14} className="text-navy opacity-40 flex-shrink-0" />}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-body text-navy text-sm font-semibold truncate">{customer.name || "Unnamed Guest"}</span>
              {(customer.tags || []).includes("VIP") && (
                <span className="font-mono text-[8px] tracking-editorial uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">VIP</span>
              )}
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] text-navy opacity-35">
              {customer.email && <span className="flex items-center gap-1"><Mail size={9} />{customer.email}</span>}
              {customer.phone && <span className="flex items-center gap-1"><Phone size={9} />{customer.phone}</span>}
              {customer.visit_count > 0 && <span>{customer.visit_count} visit{customer.visit_count !== 1 ? "s" : ""}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
            className="text-navy opacity-30 hover:opacity-60 p-1 transition-opacity" title="Edit">
            <Edit3 size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${customer.name}"?`)) onDelete(customer.id); }}
            className="text-flamingo-dark hover:text-flamingo p-1 transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 py-4 border-t border-navy border-opacity-10 bg-white">
          {/* Tags */}
          <div className="mb-4">
            <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {(customer.tags || []).map(tag => (
                <span key={tag} className="font-mono text-[10px] tracking-editorial bg-flamingo bg-opacity-10 text-flamingo px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
              {(!customer.tags || customer.tags.length === 0) && (
                <span className="font-body text-xs text-navy opacity-25 italic">No tags</span>
              )}
            </div>
          </div>

          {/* Customer details */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            {customer.last_visit && (
              <div className="flex items-center gap-1.5 text-navy opacity-50">
                <Calendar size={11} />
                <span>Last visit: {new Date(customer.last_visit).toLocaleDateString()}</span>
              </div>
            )}
            {customer.preferred_seating && (
              <div className="flex items-center gap-1.5 text-navy opacity-50">
                <MapPin size={11} />
                <span>{customer.preferred_seating}</span>
              </div>
            )}
            {customer.dietary && (
              <div className="col-span-2 text-navy opacity-50">
                <span className="font-bold">Dietary: </span>{customer.dietary}
              </div>
            )}
            {customer.birthday && (
              <div className="text-navy opacity-50">
                <span className="font-bold">Birthday: </span>{customer.birthday}
              </div>
            )}
            {customer.spend_total > 0 && (
              <div className="text-navy opacity-50">
                <span className="font-bold">Total spend: </span>${customer.spend_total?.toFixed(0) || 0}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-2 flex items-center gap-1">
              <MessageSquare size={10} /> Notes ({notes.length})
            </p>

            {/* Add note */}
            <div className="flex gap-2 mb-3">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddNote()}
                className="flex-1 p-2 rounded-lg border border-navy border-opacity-15 font-body text-xs text-navy placeholder:text-navy placeholder:opacity-25"
                placeholder="Add a note..." />
              <select value={noteType} onChange={e => setNoteType(e.target.value)}
                className="p-2 rounded-lg border border-navy border-opacity-15 font-mono text-[10px] text-navy bg-white">
                <option value="general">General</option>
                <option value="dietary">Dietary</option>
                <option value="preference">Preference</option>
                <option value="compliment">Compliment</option>
                <option value="complaint">Complaint</option>
              </select>
              <button onClick={handleAddNote}
                className="bg-flamingo text-white px-3 rounded-lg text-xs font-body hover:bg-flamingo-dark transition-colors">
                Add
              </button>
            </div>

            {/* Notes list */}
            <div className="max-h-40 overflow-y-auto space-y-1.5">
              {loadingNotes ? (
                <p className="font-body text-xs text-navy opacity-25 py-2">Loading notes...</p>
              ) : notes.length === 0 ? (
                <p className="font-body text-xs text-navy opacity-25 py-2 italic">No notes yet</p>
              ) : notes.map(note => (
                <div key={note.id} className="flex items-start gap-2 p-2 bg-cream-warm rounded-lg group">
                  <span className={`font-mono text-[8px] tracking-editorial uppercase mt-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-full ${
                    note.type === "compliment" ? "bg-green-100 text-green-700" :
                    note.type === "complaint" ? "bg-red-100 text-red-600" :
                    note.type === "dietary" ? "bg-amber-100 text-amber-700" :
                    note.type === "preference" ? "bg-blue-100 text-blue-600" :
                    "bg-navy bg-opacity-10 text-navy opacity-50"
                  }`}>
                    {note.type}
                  </span>
                  <p className="font-body text-xs text-navy flex-1">{note.text}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-mono text-[9px] text-navy opacity-20">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    <button onClick={() => handleDeleteNote(note.id)}
                      className="text-navy opacity-0 group-hover:opacity-30 hover:!opacity-60 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Customer Form Modal ────────────────────────────────────────────────────
const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", birthday: "",
    dietary: "", preferred_seating: "", tags: [],
    visit_count: 0, spend_total: 0, source: "walk-in",
    notes_text: "", ...customer,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleTag = (tag) => {
    const tags = form.tags || [];
    update("tags", tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCancel} role="dialog" aria-modal="true" aria-label="Customer form">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-lg w-full sm:mx-4 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-navy text-lg mb-4">{customer?.id ? "Edit Guest" : "Add New Guest"}</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Name *</label>
              <input value={form.name} onChange={e => update("name", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" placeholder="Jane Smith" required />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Phone</label>
              <input value={form.phone} onChange={e => update("phone", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" placeholder="(518) 555-1234" />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Birthday</label>
              <input type="date" value={form.birthday} onChange={e => update("birthday", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" />
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Source</label>
              <select value={form.source} onChange={e => update("source", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm bg-white">
                <option value="walk-in">Walk-in</option>
                <option value="resy">Resy</option>
                <option value="referral">Referral</option>
                <option value="event">Event</option>
                <option value="online">Online</option>
                <option value="private-event">Private Event</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Preferred Seating</label>
              <select value={form.preferred_seating} onChange={e => update("preferred_seating", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm bg-white">
                <option value="">No preference</option>
                <option value="Patio">Patio</option>
                <option value="Bar">Bar</option>
                <option value="Booth">Booth</option>
                <option value="Window">Window</option>
                <option value="Main Dining">Main Dining</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Visit Count</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0" value={form.visit_count} onChange={e => update("visit_count", parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" />
                <button type="button" onClick={() => {
                  update("visit_count", (form.visit_count || 0) + 1);
                  update("last_visit", new Date().toISOString());
                }}
                  className="flex-shrink-0 font-mono text-[9px] text-flamingo/60 hover:text-flamingo px-2 py-1.5 rounded-lg border border-flamingo/20 hover:bg-flamingo/5 transition-all whitespace-nowrap">
                  +1 Visit
                </button>
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Total Spend ($)</label>
              <input type="number" min="0" step="0.01" value={form.spend_total || 0} onChange={e => update("spend_total", parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" />
            </div>
            <div className="col-span-2">
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Dietary Preferences / Allergies</label>
              <input value={form.dietary} onChange={e => update("dietary", e.target.value)}
                className="w-full p-2 rounded-lg border border-navy border-opacity-20 font-body text-sm" placeholder="Gluten-free, nut allergy..." />
              <div className="flex gap-1.5 mt-2">
                {["Gluten-Free", "Vegan", "Vegetarian", "Nut Allergy", "Dairy-Free", "Shellfish Allergy"].map(d => (
                  <button key={d} type="button"
                    onClick={() => {
                      const current = form.dietary || "";
                      if (!current.toLowerCase().includes(d.toLowerCase())) {
                        update("dietary", current ? `${current}, ${d}` : d);
                      }
                    }}
                    className="font-mono text-[8px] tracking-editorial uppercase text-navy/25 hover:text-flamingo hover:bg-flamingo/5 px-1.5 py-0.5 rounded transition-colors">
                    +{d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-2">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TAGS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`font-mono text-[9px] tracking-editorial uppercase px-2 py-1 rounded-full transition-all ${
                    (form.tags || []).includes(tag)
                      ? "bg-flamingo text-white"
                      : "bg-navy bg-opacity-5 text-navy opacity-40 hover:opacity-70"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-navy border-opacity-10">
            <button type="submit" className="bg-flamingo text-white font-body text-sm px-6 py-2.5 rounded-lg hover:bg-flamingo-dark transition-colors flex items-center gap-2">
              <Save size={14} />{customer?.id ? "Update Guest" : "Add Guest"}
            </button>
            <button type="button" onClick={onCancel} className="font-body text-sm text-navy opacity-50 hover:opacity-80 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main CRM Panel ─────────────────────────────────────────────────────────
const CRMPanel = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await getCustomers({ search, tag: tagFilter, sortBy, limit: 200 });
    setCustomers(data || []);
    setTotalCount(count || (data || []).length);
    const s = await getCustomerStats();
    setStats(s);
    setLoading(false);
  }, [search, tagFilter, sortBy]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    const isNew = !form.id;
    await upsertCustomer(form);
    await logActivity(isNew ? "created" : "updated", "crm", `${isNew ? "Added" : "Updated"} guest "${form.name}"`);
    setShowForm(false);
    setEditingCustomer(null);
    load();
  };

  const handleDelete = async (id) => {
    const customer = customers.find(c => c.id === id);
    await deleteCustomer(id);
    await logActivity("deleted", "crm", `Removed guest "${customer?.name || id}"`);
    load();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleExport = () => {
    const csv = ["Name,Email,Phone,Tags,Visits,Last Visit,Dietary,Seating,Source,Birthday"]
      .concat(customers.map(c =>
        `"${c.name || ""}","${c.email || ""}","${c.phone || ""}","${(c.tags || []).join("; ")}",${c.visit_count || 0},"${c.last_visit || ""}","${c.dietary || ""}","${c.preferred_seating || ""}","${c.source || ""}","${c.birthday || ""}"`
      )).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `standard-fare-guests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity("exported", "crm", `Exported ${customers.length} guests`);
  };

  // Unique tags from all customers
  const allTags = useMemo(() => {
    const tags = new Set();
    customers.forEach(c => (c.tags || []).forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [customers]);

  return (
    <div>
      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total Guests", value: stats.total, icon: <Users size={14} /> },
            { label: "VIP", value: stats.vip, icon: <Star size={14} /> },
            { label: "Recent (30d)", value: stats.recentVisitors, icon: <Calendar size={14} /> },
            { label: "With Email", value: stats.withEmail, icon: <Mail size={14} /> },
            { label: "With Phone", value: stats.withPhone, icon: <Phone size={14} /> },
            { label: "Avg Visits", value: stats.avgVisits, icon: <Check size={14} /> },
          ].map(s => (
            <div key={s.label} className="bg-cream-warm rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-flamingo opacity-60 mb-1">{s.icon}</div>
              <p className="font-display text-navy text-xl">{s.value}</p>
              <p className="font-mono text-[8px] tracking-editorial uppercase text-navy opacity-30">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Birthday alerts */}
      {(() => {
        const now = new Date();
        const upcoming = customers.filter(c => {
          if (!c.birthday) return false;
          try {
            const bday = new Date(c.birthday);
            if (isNaN(bday.getTime())) return false;
            const thisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
            const diff = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
            return diff >= 0 && diff <= 14;
          } catch { return false; }
        });
        if (upcoming.length === 0) return null;
        return (
          <div className="mb-4 p-4 bg-amber-50/50 border border-amber-200/30 rounded-2xl">
            <p className="font-mono text-[10px] tracking-editorial uppercase text-amber-700/60 mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> Upcoming Birthdays (next 14 days)
            </p>
            <div className="flex flex-wrap gap-2">
              {upcoming.map(c => {
                const bday = new Date(c.birthday);
                const thisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
                const daysUntil = Math.ceil((thisYear - now) / (1000 * 60 * 60 * 24));
                return (
                  <span key={c.id} className="inline-flex items-center gap-1.5 font-body text-xs text-amber-800 bg-amber-100/60 px-2.5 py-1 rounded-lg">
                    {c.name}
                    <span className="font-mono text-[9px] text-amber-600/60">
                      {daysUntil === 0 ? "today!" : `in ${daysUntil}d`}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy opacity-30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-navy border-opacity-15 font-body text-sm text-navy placeholder:text-navy placeholder:opacity-30"
            placeholder="Search guests..." />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-navy opacity-30 hover:opacity-60">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Tag filter */}
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="p-2 rounded-lg border border-navy border-opacity-15 font-mono text-[10px] text-navy bg-white">
          <option value="">All tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="p-2 rounded-lg border border-navy border-opacity-15 font-mono text-[10px] text-navy bg-white">
          <option value="updated_at">Recently Updated</option>
          <option value="name">Name A-Z</option>
          <option value="visit_count">Most Visits</option>
          <option value="last_visit">Last Visit</option>
          <option value="created_at">Date Added</option>
        </select>

        {/* Actions */}
        <button onClick={() => { setEditingCustomer(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-flamingo text-white font-body text-sm px-4 py-2 rounded-lg hover:bg-flamingo-dark transition-colors">
          <UserPlus size={14} /> Add Guest
        </button>
        {customers.length > 0 && (
          <button onClick={handleExport}
            className="flex items-center gap-1 font-mono text-[10px] text-navy opacity-40 hover:opacity-70 transition-opacity">
            <Download size={12} /> Export CSV
          </button>
        )}
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-navy opacity-30">Loading guests...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-navy border-opacity-10 rounded-xl">
          <Users size={32} className="text-navy opacity-15 mx-auto mb-3" />
          <p className="font-body text-sm text-navy opacity-35 mb-3">
            {search || tagFilter ? "No guests match your filter" : "No guests yet"}
          </p>
          {!search && !tagFilter && (
            <button onClick={() => { setEditingCustomer(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors">
              <UserPlus size={14} /> Add Your First Guest
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="font-mono text-[10px] text-navy opacity-25 mb-2">{totalCount} guest{totalCount !== 1 ? "s" : ""}</p>
          {customers.map(c => (
            <CustomerCard key={c.id} customer={c} onEdit={handleEdit} onDelete={handleDelete} onAddNote={load} />
          ))}
        </div>
      )}

      {/* Customer form modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingCustomer(null); }}
        />
      )}
    </div>
  );
};

export default CRMPanel;
