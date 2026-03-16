// ─────────────────────────────────────────────────────────────────────────────
// components/ui/FlamingoIcon.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Flamingo icon used as the clickable home button in the Navbar.
// Uses the native 🦩 flamingo emoji rendered at scale so it always looks
// like a real flamingo on every platform (Apple, Android, Windows).
// The emoji is crisp, universally recognized, and needs no SVG maintenance.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";

const FlamingoIcon = ({ size = 44, className = "" }) => (
  <span
    role="img"
    aria-label="flamingo"
    className={className}
    style={{
      fontSize: size * 0.75,    // Scale emoji to match requested size
      lineHeight: 1,
      display: "inline-block",
      userSelect: "none",       // Prevent text selection on click
      filter: "drop-shadow(0 1px 3px rgba(232,116,138,0.4))", // Subtle pink glow
    }}
  >
    🦩
  </span>
);

export default FlamingoIcon;
