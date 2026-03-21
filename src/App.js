// ─────────────────────────────────────────────────────────────────────────────
// App.js — Root component: AdminProvider + PreviewGate + React Router routes
// ─────────────────────────────────────────────────────────────────────────────
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import { CartProvider } from "./context/CartContext";
import { PickupCartProvider } from "./context/PickupCartContext";
import PreviewGate from "./components/PreviewGate"; // Password gate for owner preview
import CartDrawer from "./components/cart/CartDrawer";
import ScrollToTop from "./components/ScrollToTop";

// Critical page — loaded eagerly for fast first paint
import HomePage from "./pages/HomePage";

// All other pages lazy-loaded — only fetched when the user navigates to them.
// This dramatically reduces the initial JS bundle size.
const MenuPage          = lazy(() => import("./pages/MenuPage"));
const EventsPage        = lazy(() => import("./pages/EventsPage"));
const GalleryPage       = lazy(() => import("./pages/GalleryPage"));
const PrintsPage        = lazy(() => import("./pages/PrintsPage"));
const PressPage         = lazy(() => import("./pages/PressPage"));
const ContactPage       = lazy(() => import("./pages/ContactPage"));
const AdminPage         = lazy(() => import("./pages/AdminPage"));
const HowItWorksPage    = lazy(() => import("./pages/HowItWorksPage"));
const TeamPage          = lazy(() => import("./pages/TeamPage"));
const NotFoundPage      = lazy(() => import("./pages/NotFoundPage"));
const MerchPage         = lazy(() => import("./pages/MerchPage"));
const BottleShopPage    = lazy(() => import("./pages/BottleShopPage"));
const CheckoutPage      = lazy(() => import("./pages/CheckoutPage"));
const ValuePage         = lazy(() => import("./pages/ValuePage"));
const BlogPage          = lazy(() => import("./pages/BlogPage"));
const BlogPostPage      = lazy(() => import("./pages/BlogPostPage"));
const PrivateEventsPage = lazy(() => import("./pages/PrivateEventsPage"));
const PressKitPage      = lazy(() => import("./pages/PressKitPage"));
const GiftCardsPage     = lazy(() => import("./pages/GiftCardsPage"));
const FAQPage           = lazy(() => import("./pages/FAQPage"));
const OrderPage         = lazy(() => import("./pages/OrderPage"));

// Minimal loading fallback — matches site background so transition is seamless
const PageLoader = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="animate-pulse font-display text-navy text-lg opacity-40">Loading…</div>
  </div>
);

const App = () => (
  <AdminProvider>
    <CartProvider>
      <PickupCartProvider>
      <PreviewGate>
        <BrowserRouter>
          <ScrollToTop />
          <CartDrawer />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"        element={<HomePage />} />
              <Route path="/menu"    element={<MenuPage />} />
              <Route path="/events"  element={<EventsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/prints"  element={<PrintsPage />} />
              <Route path="/press"   element={<PressPage />} />
              <Route path="/merch"   element={<MerchPage />} />
              <Route path="/bottles" element={<BottleShopPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog"        element={<BlogPage />} />
              <Route path="/blog/:slug"  element={<BlogPostPage />} />
              <Route path="/private-events" element={<PrivateEventsPage />} />
              <Route path="/press-kit"   element={<PressKitPage />} />
              <Route path="/gift-cards"  element={<GiftCardsPage />} />
              <Route path="/order"       element={<OrderPage />} />
              <Route path="/faq"         element={<FAQPage />} />
              <Route path="/team"    element={<TeamPage />} />
              <Route path="/admin"              element={<AdminPage />} />
              <Route path="/admin/how-it-works" element={<HowItWorksPage />} />
              <Route path="/admin/value"        element={<ValuePage />} />
              <Route path="*"        element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PreviewGate>
      </PickupCartProvider>
    </CartProvider>
  </AdminProvider>
);

export default App;
