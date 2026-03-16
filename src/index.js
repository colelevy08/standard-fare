// ─────────────────────────────────────────────────────────────────────────────
// index.js — Entry point: mounts the React app onto the #root DOM element
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Global styles + Tailwind directives
import App from "./App";

// Find the <div id="root"> in public/index.html and mount the React app there
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
