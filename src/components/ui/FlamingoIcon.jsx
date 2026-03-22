// ─────────────────────────────────────────────────────────────────────────────
// components/ui/FlamingoIcon.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Standard Fare cursive "sf" logo used as the home button in the Navbar.
// Uses the real brand logo stored in Supabase Storage.
// Falls back to the flamingo emoji if the image fails to load.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";

const LOGO_URL = "https://peecuaxyygkvakcnjgoo.supabase.co/storage/v1/object/public/gallery/photos/sf-logo-full.png";

const FlamingoIcon = ({ size = 44, className = "" }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span role="img" aria-label="Standard Fare" className={className}
        style={{ fontSize: size * 0.75, lineHeight: 1, display: "inline-block", userSelect: "none" }}>
        🦩
      </span>
    );
  }

  return (
    <img
      src={LOGO_URL}
      alt="Standard Fare"
      className={className}
      style={{ height: size, width: "auto", display: "inline-block", objectFit: "contain" }}
      onError={() => setFailed(true)}
      loading="eager"
    />
  );
};

export default FlamingoIcon;
