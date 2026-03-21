// ─────────────────────────────────────────────────────────────────────────────
// components/admin/ActivityLog.jsx — Admin activity/audit trail viewer
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Trash2, Filter, ChevronDown, RefreshCw } from "lucide-react";
import { getActivityLog, clearActivityLog } from "../../lib/crmDb";

const ACTION_COLORS = {
  created: "text-green-600",
  updated: "text-blue-600",
  deleted: "text-red-500",
  published: "text-emerald-600",
  unpublished: "text-amber-600",
  reordered: "text-purple-600",
  exported: "text-cyan-600",
  imported: "text-indigo-600",
  duplicated: "text-violet-600",
};

const ACTION_LABELS = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  published: "Published",
  unpublished: "Unpublished",
  reordered: "Reordered",
  exported: "Exported",
  imported: "Imported",
  duplicated: "Duplicated",
};

const formatTimeAgo = (iso) => {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

const ActivityLog = ({ maxHeight = "max-h-96" }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const opts = filter !== "all" ? { section: filter } : {};
    const { data, count: c } = await getActivityLog({ ...opts, limit: 100 });
    setEntries(data || []);
    setCount(c || (data || []).length);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleClear = async () => {
    if (!window.confirm("Clear the entire activity log? This cannot be undone.")) return;
    await clearActivityLog();
    setEntries([]);
    setCount(0);
  };

  const sections = [...new Set(entries.map(e => e.section).filter(Boolean))].sort();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-flamingo opacity-60" />
          <span className="font-mono text-xs text-navy opacity-40">{count} entries</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1 font-mono text-[10px] text-navy opacity-40 hover:opacity-70 transition-opacity">
              <Filter size={10} /> {filter === "all" ? "All" : filter}
              <ChevronDown size={10} />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-navy border-opacity-15 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                <button onClick={() => { setFilter("all"); setShowFilter(false); }}
                  className={`w-full text-left px-3 py-1.5 font-body text-xs hover:bg-cream-warm transition-colors ${filter === "all" ? "text-flamingo font-bold" : "text-navy"}`}>
                  All sections
                </button>
                {sections.map(s => (
                  <button key={s} onClick={() => { setFilter(s); setShowFilter(false); }}
                    className={`w-full text-left px-3 py-1.5 font-body text-xs hover:bg-cream-warm transition-colors capitalize ${filter === s ? "text-flamingo font-bold" : "text-navy"}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={load} className="text-navy opacity-30 hover:opacity-60 transition-opacity" title="Refresh">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          {entries.length > 0 && (
            <button onClick={handleClear} className="text-navy opacity-20 hover:opacity-50 transition-opacity" title="Clear log">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Entries */}
      <div className={`${maxHeight} overflow-y-auto space-y-0.5`}>
        {loading ? (
          <p className="text-center font-body text-xs text-navy opacity-30 py-4">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-center font-body text-xs text-navy opacity-30 py-4">No activity recorded yet</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-cream-warm transition-colors group">
              {/* Action badge */}
              <span className={`font-mono text-[9px] tracking-editorial uppercase mt-0.5 flex-shrink-0 font-bold ${ACTION_COLORS[entry.action] || "text-navy opacity-40"}`}>
                {ACTION_LABELS[entry.action] || entry.action}
              </span>
              {/* Detail */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs text-navy truncate">{entry.detail || `${entry.action} in ${entry.section}`}</p>
                <p className="font-mono text-[9px] text-navy opacity-25">{entry.section} · {formatTimeAgo(entry.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
