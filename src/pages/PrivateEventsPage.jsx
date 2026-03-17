// ─────────────────────────────────────────────────────────────────────────────
// pages/PrivateEventsPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Private events inquiry form page.
//   • Structured form (event type, date, guest count, budget, contact info)
//   • Info panel with space details, inclusions, and direct contact
//   • Submits to /api/private-events (POST)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Calendar, Users, DollarSign, PartyPopper, CheckCircle, Mail } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

const EVENT_TYPES = [
  "Birthday",
  "Corporate",
  "Rehearsal Dinner",
  "Holiday Party",
  "Wine Tasting",
  "Other",
];

const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
];

const INCLUSIONS = [
  "Dedicated event staff",
  "Custom menu planning with our chef",
  "Full bar service & cocktail pairings",
  "AV setup (microphone, speakers, screen)",
  "Personalized table settings & decor assistance",
  "Complimentary cake cutting service",
];

const INITIAL_FORM = {
  eventType: "",
  preferredDate: "",
  guestCount: "",
  budgetRange: "",
  name: "",
  email: "",
  phone: "",
  details: "",
};

const PrivateEventsPage = () => {
  const { siteData } = useSite();
  const eventsEmail = siteData.contact?.privateEventsEmail || "";

  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/private-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Something went wrong. Please try again.");

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Host With Us
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Private Events</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* ── Left: Inquiry Form ─────────────────────────── */}
            <div>
              <h2 className="font-display text-navy text-2xl mb-2">Plan Your Event</h2>
              <p className="font-body text-navy opacity-60 text-sm mb-6 leading-relaxed">
                Fill out the form below and our events team will get back to you
                within 48 hours to discuss your celebration.
              </p>

              {submitted ? (
                <div className="bg-navy rounded-lg p-8 text-center">
                  <CheckCircle size={36} className="text-flamingo mx-auto mb-4" />
                  <p className="font-display text-cream text-2xl mb-2">Inquiry Received!</p>
                  <p className="font-body text-cream opacity-70 text-sm leading-relaxed">
                    Thank you for your interest in hosting with us. Our events
                    coordinator will be in touch shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-ghost mt-6 text-xs"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Event Type */}
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                      <PartyPopper size={12} className="inline mr-1 -mt-0.5" />
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      required
                      value={form.eventType}
                      onChange={handleChange}
                      className="form-input text-base"
                    >
                      <option value="" disabled>Select event type</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date + Guest Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                        <Calendar size={12} className="inline mr-1 -mt-0.5" />
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        required
                        value={form.preferredDate}
                        onChange={handleChange}
                        className="form-input text-base"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                        <Users size={12} className="inline mr-1 -mt-0.5" />
                        Estimated Guest Count
                      </label>
                      <input
                        type="number"
                        name="guestCount"
                        required
                        min="1"
                        value={form.guestCount}
                        onChange={handleChange}
                        className="form-input text-base"
                        placeholder="e.g. 30"
                      />
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                      <DollarSign size={12} className="inline mr-1 -mt-0.5" />
                      Budget Range
                    </label>
                    <select
                      name="budgetRange"
                      required
                      value={form.budgetRange}
                      onChange={handleChange}
                      className="form-input text-base"
                    >
                      <option value="" disabled>Select budget range</option>
                      {BUDGET_RANGES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={form.name}
                        onChange={handleChange}
                        className="form-input text-base"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="form-input text-base"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="form-input text-base"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">
                      Additional Details
                    </label>
                    <textarea
                      name="details"
                      rows={5}
                      value={form.details}
                      onChange={handleChange}
                      className="form-input text-base resize-none"
                      placeholder="Tell us about your vision — dietary needs, theme, special requests..."
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="font-body text-sm text-red-600">{error}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full sm:w-auto disabled:opacity-50"
                  >
                    {submitting ? "Sending..." : "Submit Inquiry"}
                  </button>
                </form>
              )}
            </div>

            {/* ── Right: Info Panel ──────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Our Space */}
              <div className="bg-navy rounded-lg p-8">
                <h3 className="font-display text-cream text-xl mb-5">Our Space</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users size={15} className="text-flamingo mt-0.5" />
                    <div className="font-body text-cream opacity-80 text-sm">
                      <p className="font-medium opacity-100">Full Buyout</p>
                      <p>Up to 80 seated guests or 120 standing reception</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users size={15} className="text-flamingo mt-0.5" />
                    <div className="font-body text-cream opacity-80 text-sm">
                      <p className="font-medium opacity-100">Semi-Private Dining</p>
                      <p>Our back room seats up to 30 guests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={15} className="text-flamingo mt-0.5" />
                    <div className="font-body text-cream opacity-80 text-sm">
                      <p className="font-medium opacity-100">Availability</p>
                      <p>Sunday through Thursday evenings, weekend afternoons</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-navy rounded-lg p-8">
                <h3 className="font-display text-cream text-xl mb-5">What's Included</h3>
                <ul className="space-y-3">
                  {INCLUSIONS.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle size={14} className="text-flamingo mt-0.5 flex-shrink-0" />
                      <span className="font-body text-cream opacity-80 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Contact */}
              {eventsEmail && (
                <div className="bg-navy rounded-lg p-8">
                  <h3 className="font-display text-cream text-xl mb-3">Prefer Email?</h3>
                  <p className="font-body text-cream opacity-70 text-sm mb-4">
                    Reach our events team directly:
                  </p>
                  <a
                    href={`mailto:${eventsEmail}`}
                    className="font-body text-cream opacity-80 text-sm hover:text-flamingo transition-colors flex items-center gap-2"
                  >
                    <Mail size={14} className="text-flamingo" />
                    {eventsEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PrivateEventsPage;
