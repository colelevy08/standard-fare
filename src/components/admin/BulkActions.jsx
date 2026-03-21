// ─────────────────────────────────────────────────────────────────────────────
// components/admin/BulkActions.jsx — Bulk selection and actions bar
// ─────────────────────────────────────────────────────────────────────────────
// Add multi-select to any list editor. Provides select all, clear, and
// configurable action buttons (delete, publish, unpublish, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Check, X, Trash2, Eye, EyeOff, Copy, Tag } from "lucide-react";

const BulkActions = ({ selectedCount, totalCount, onSelectAll, onClearSelection, actions = [] }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-30 bg-navy text-cream rounded-lg px-4 py-2.5 mb-3 flex items-center gap-4 flex-wrap shadow-lg animate-fade-in">
      <span className="font-mono text-xs tracking-editorial">
        {selectedCount} of {totalCount} selected
      </span>

      <div className="flex items-center gap-1 ml-auto">
        {selectedCount < totalCount && (
          <button onClick={onSelectAll}
            className="flex items-center gap-1 font-body text-xs text-cream opacity-60 hover:opacity-100 px-2 py-1 rounded transition-opacity">
            <Check size={12} /> Select All
          </button>
        )}
        <button onClick={onClearSelection}
          className="flex items-center gap-1 font-body text-xs text-cream opacity-60 hover:opacity-100 px-2 py-1 rounded transition-opacity">
          <X size={12} /> Clear
        </button>
        <span className="w-px h-4 bg-cream opacity-20 mx-1" />

        {actions.map(action => (
          <button key={action.label} onClick={action.onClick}
            className={`flex items-center gap-1 font-body text-xs px-3 py-1.5 rounded transition-all ${
              action.danger
                ? "text-red-300 hover:bg-red-500 hover:text-white"
                : "text-cream opacity-70 hover:opacity-100 hover:bg-cream hover:bg-opacity-10"
            }`}>
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Hook for managing bulk selection state ─────────────────────────────
export const useBulkSelect = (items) => {
  const [selected, setSelected] = React.useState(new Set());

  const toggle = React.useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = React.useCallback(() => {
    setSelected(new Set(items.map(i => i.id)));
  }, [items]);

  const clearSelection = React.useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = React.useCallback((id) => selected.has(id), [selected]);

  return {
    selected,
    selectedCount: selected.size,
    toggle,
    selectAll,
    clearSelection,
    isSelected,
    selectedIds: [...selected],
  };
};

export default BulkActions;
