// ─────────────────────────────────────────────────────────────────────────────
// components/layout/PageLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Wrapper component used by every page route.
// Renders Navbar at the top, the page content (children) in the middle,
// and Footer at the bottom.
//
// Usage:
//   <PageLayout>
//     <HeroSection />
//     <AboutSection />
//   </PageLayout>
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    {/* Fixed navigation bar — always visible at the top */}
    <Navbar />

    {/* Page content — flex-grow pushes the footer to the bottom */}
    <main className="flex-1">
      {children}
    </main>

    {/* Footer at the bottom of every page */}
    <Footer />
  </div>
);

export default PageLayout;
