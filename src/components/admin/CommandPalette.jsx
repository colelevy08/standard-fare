// ─────────────────────────────────────────────────────────────────────────────
// components/admin/CommandPalette.jsx — Cmd+K command palette for admin
// ─────────────────────────────────────────────────────────────────────────────
// Quick-access command palette for navigating sections, creating content,
// toggling settings, and running common admin actions.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronRight, Plus, Settings, Eye, Undo2, Download } from "lucide-react";

const CommandPalette = ({ isOpen, onClose, sections, onJump, actions }) => {
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Build command list from sections + actions
  const commands = useMemo(() => {
    const cmds = [];

    // Navigation commands
    sections.forEach(s => {
      cmds.push({
        id: `nav-${s.id}`,
        type: "navigate",
        label: s.title,
        group: "Navigate to Section",
        icon: <ChevronRight size={14} />,
        action: () => { onJump(s.id); onClose(); },
      });
    });

    // Content creation commands
    const createActions = [
      { label: "New Event", section: "events" },
      { label: "New Blog Post", section: "blog" },
      { label: "New Menu Item", section: "menus" },
      { label: "New Gallery Item", section: "gallery" },
      { label: "New Merch Item", section: "merch" },
      { label: "New Bottle", section: "bottles" },
      { label: "New FAQ", section: "faq" },
      { label: "New Press Article", section: "press" },
      { label: "New Special", section: "specials" },
      { label: "New Team Member", section: "about" },
    ];
    createActions.forEach(a => {
      cmds.push({
        id: `create-${a.section}`,
        type: "create",
        label: a.label,
        group: "Create New",
        icon: <Plus size={14} />,
        action: () => { onJump(a.section); onClose(); },
      });
    });

    // Settings actions
    if (actions) {
      if (actions.toggleDraftMode) cmds.push({
        id: "toggle-draft", type: "action", label: "Toggle Draft Mode",
        group: "Actions", icon: <Settings size={14} />, action: () => { actions.toggleDraftMode(); onClose(); },
      });
      if (actions.exportData) cmds.push({
        id: "export-data", type: "action", label: "Export Site Data (JSON Backup)",
        group: "Actions", icon: <Download size={14} />, action: () => { actions.exportData(); onClose(); },
      });
      if (actions.previewSite) cmds.push({
        id: "preview-site", type: "action", label: "Preview Site (Open in New Tab)",
        group: "Actions", icon: <Eye size={14} />, action: () => { actions.previewSite(); onClose(); },
      });
      if (actions.collapseAll) cmds.push({
        id: "collapse-all", type: "action", label: "Collapse All Sections",
        group: "Actions", icon: <Settings size={14} />, action: () => { actions.collapseAll(); onClose(); },
      });
      if (actions.expandAll) cmds.push({
        id: "expand-all", type: "action", label: "Expand All Sections",
        group: "Actions", icon: <Settings size={14} />, action: () => { actions.expandAll(); onClose(); },
      });
      if (actions.undo) cmds.push({
        id: "undo", type: "action", label: "Undo Last Change",
        group: "Actions", icon: <Undo2 size={14} />, action: () => { actions.undo(); onClose(); },
      });
    }

    return cmds;
  }, [sections, actions, onJump, onClose]);

  // Filter commands by query
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [commands, query]);

  // Group filtered commands
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(c => {
      if (!groups[c.group]) groups[c.group] = [];
      groups[c.group].push(c);
    });
    return groups;
  }, [filtered]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && filtered[selectedIdx]) { filtered[selectedIdx].action(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, filtered, selectedIdx, onClose]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

  // Reset selection when query changes
  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!isOpen) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[10vh] sm:pt-[15vh] bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Palette">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-navy border-opacity-10">
          <Search size={16} className="text-navy opacity-30 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 font-body text-sm text-navy bg-transparent outline-none placeholder:text-navy placeholder:opacity-30"
            placeholder="Type a command or search..."
          />
          <kbd className="hidden sm:inline font-mono text-[10px] text-navy opacity-20 bg-cream-warm px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center font-body text-sm text-navy opacity-35 py-8">No commands match "{query}"</p>
          ) : (
            Object.entries(grouped).map(([group, cmds]) => (
              <div key={group}>
                <p className="font-mono text-[9px] tracking-editorial uppercase text-navy opacity-25 px-4 pt-3 pb-1">{group}</p>
                {cmds.map(cmd => {
                  flatIdx++;
                  const idx = flatIdx;
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${idx === selectedIdx ? "bg-flamingo bg-opacity-10 text-flamingo" : "text-navy hover:bg-cream-warm"}`}
                    >
                      <span className={`flex-shrink-0 ${idx === selectedIdx ? "text-flamingo" : "text-navy opacity-30"}`}>{cmd.icon}</span>
                      <span className="font-body text-sm flex-1 truncate">{cmd.label}</span>
                      {idx === selectedIdx && (
                        <kbd className="font-mono text-[9px] text-flamingo opacity-40 bg-flamingo bg-opacity-10 px-1.5 py-0.5 rounded">↵</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-navy border-opacity-5 flex items-center gap-4">
          <span className="font-mono text-[9px] text-navy opacity-20">↑↓ navigate</span>
          <span className="font-mono text-[9px] text-navy opacity-20">↵ select</span>
          <span className="font-mono text-[9px] text-navy opacity-20">esc close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
