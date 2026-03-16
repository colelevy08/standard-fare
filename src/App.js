// ─────────────────────────────────────────────────────────────────────────────
// App.js — Root component: AdminProvider + PreviewGate + React Router routes
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import PreviewGate from "./components/PreviewGate"; // Password gate for owner preview

// Page components
import HomePage       from "./pages/HomePage";
import MenuPage       from "./pages/MenuPage";
import EventsPage     from "./pages/EventsPage";
import GalleryPage    from "./pages/GalleryPage";
import PrintsPage     from "./pages/PrintsPage";
import PressPage      from "./pages/PressPage";
import ContactPage    from "./pages/ContactPage";
import AdminPage      from "./pages/AdminPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import TeamPage        from "./pages/TeamPage";

const App = () => (
  <AdminProvider>
    {/* PreviewGate wraps everything — shows password screen if REACT_APP_PREVIEW_PASSWORD is set.
        Remove that env var (or leave it blank) to disable the gate permanently after owner approval. */}
    <PreviewGate>
      <BrowserRouter>
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/menu"    element={<MenuPage />} />
          <Route path="/events"  element={<EventsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/prints"  element={<PrintsPage />} />
          <Route path="/press"   element={<PressPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/team"    element={<TeamPage />} />
          <Route path="/admin"              element={<AdminPage />} />
          <Route path="/admin/how-it-works" element={<HowItWorksPage />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PreviewGate>
  </AdminProvider>
);

export default App;
