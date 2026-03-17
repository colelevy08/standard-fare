// ─────────────────────────────────────────────────────────────────────────────
// App.js — Root component: AdminProvider + PreviewGate + React Router routes
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import { CartProvider } from "./context/CartContext";
import { PickupCartProvider } from "./context/PickupCartContext";
import PreviewGate from "./components/PreviewGate"; // Password gate for owner preview
import CartDrawer from "./components/cart/CartDrawer";

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
import NotFoundPage    from "./pages/NotFoundPage";
import MerchPage       from "./pages/MerchPage";
import BottleShopPage  from "./pages/BottleShopPage";
import CheckoutPage       from "./pages/CheckoutPage";
import ValuePage          from "./pages/ValuePage";
import BlogPage           from "./pages/BlogPage";
import BlogPostPage       from "./pages/BlogPostPage";
import PrivateEventsPage  from "./pages/PrivateEventsPage";
import PressKitPage       from "./pages/PressKitPage";
import GiftCardsPage      from "./pages/GiftCardsPage";
import FAQPage            from "./pages/FAQPage";
import OrderPage          from "./pages/OrderPage";

const App = () => (
  <AdminProvider>
    <CartProvider>
      <PickupCartProvider>
      <PreviewGate>
        <BrowserRouter>
          <CartDrawer />
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
        </BrowserRouter>
      </PreviewGate>
      </PickupCartProvider>
    </CartProvider>
  </AdminProvider>
);

export default App;
