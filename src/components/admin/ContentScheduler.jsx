// ─────────────────────────────────────────────────────────────────────────────
// components/admin/ContentScheduler.jsx — Schedule content to publish later
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, X, Check, Trash2, Plus } from "lucide-react";
import { getScheduledItems, scheduleContent, cancelScheduledItem, logActivity } from "../../lib/crmDb";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch { return iso; }
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  cancelled: "bg-navy bg-opacity-10 text-navy opacity-40",
};

const ContentScheduler = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ section: "blog", publish_at: "", action: "publish" });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await getScheduledItems();
    setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSchedule = async () => {
    if (!form.publish_at) return;
    await scheduleContent(form);
    await logActivity("created", "schedule", `Scheduled ${form.action} for ${form.section}`);
    setShowForm(false);
    setForm({ section: "blog", publish_at: "", action: "publish" });
    load();
  };

  const handleCancel = async (id) => {
    await cancelScheduledItem(id);
    await logActivity("updated", "schedule", `Cancelled scheduled item`);
    load();
  };

  const pending = items.filter(i => i.status === "pending");
  const past = items.filter(i => i.status !== "pending");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-sm text-navy opacity-60">
          Schedule content to publish or unpublish at a specific date and time.
        </p>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 font-body text-sm text-flamingo hover:text-flamingo-dark transition-colors">
          <Plus size={14} /> Schedule
        </button>
      </div>

      {/* New schedule form */}
      {showForm && (
        <div className="p-4 bg-cream-warm rounded-lg border border-navy border-opacity-10 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Section</label>
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                className="w-full p-2 rounded-lg border border-navy border-opacity-15 font-body text-sm bg-white">
                <option value="blog">Blog Post</option>
                <option value="events">Event</option>
                <option value="specials">Special</option>
                <option value="merch">Merchandise</option>
                <option value="bottles">Bottle</option>
                <option value="weeklyFeatures">Weekly Feature</option>
                <option value="seasonalCountdown">Seasonal Countdown</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Action</label>
              <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}
                className="w-full p-2 rounded-lg border border-navy border-opacity-15 font-body text-sm bg-white">
                <option value="publish">Publish</option>
                <option value="unpublish">Unpublish</option>
                <option value="feature">Feature / Highlight</option>
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1">Date & Time</label>
              <input type="datetime-local" value={form.publish_at} onChange={e => setForm({ ...form, publish_at: e.target.value })}
                className="w-full p-2 rounded-lg border border-navy border-opacity-15 font-body text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSchedule} className="bg-flamingo text-white font-body text-xs px-4 py-2 rounded-lg hover:bg-flamingo-dark transition-colors flex items-center gap-2">
              <Calendar size={12} /> Schedule
            </button>
            <button onClick={() => setShowForm(false)} className="font-body text-xs text-navy opacity-40 hover:opacity-70 px-3 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pending items */}
      {loading ? (
        <p className="font-body text-sm text-navy opacity-30 py-4">Loading schedule...</p>
      ) : pending.length === 0 && past.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-navy border-opacity-10 rounded-xl">
          <Calendar size={24} className="text-navy opacity-15 mx-auto mb-2" />
          <p className="font-body text-sm text-navy opacity-30">No scheduled content yet</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="mb-4">
              <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-30 mb-2">Upcoming ({pending.length})</p>
              {pending.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg mb-1.5 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Clock size={14} className="text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm text-navy">
                        <span className="font-bold capitalize">{item.action}</span> {item.section}
                      </p>
                      <p className="font-mono text-[10px] text-navy opacity-40">{formatDate(item.publish_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleCancel(item.id)}
                    className="text-amber-600 hover:text-red-500 transition-colors p-1" title="Cancel">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div>
              <p className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-20 mb-2">History ({past.length})</p>
              {past.slice(0, 10).map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg mb-1">
                  <span className={`font-mono text-[8px] tracking-editorial uppercase px-1.5 py-0.5 rounded-full ${STATUS_STYLES[item.status] || ""}`}>
                    {item.status}
                  </span>
                  <p className="font-body text-xs text-navy opacity-50 flex-1">
                    {item.action} {item.section} — {formatDate(item.publish_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContentScheduler;
