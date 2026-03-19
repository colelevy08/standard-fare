// ─────────────────────────────────────────────────────────────────────────────
// pages/ContactPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sleek single-column contact page:
//   • Centered form with inline name/email row
//   • Contact cards row (email categories + phone + address)
//   • Embedded Google Map
//   • Private events CTA + gift card checker
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { MapPin, Calendar, Send, ExternalLink, X, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";
import GiftCardChecker from "../components/sections/GiftCardChecker";

const ContactPage = () => {
  const { siteData } = useSite();
  const { contact, location, links } = siteData;

  const LABEL_MAP = {
    pressEmail:         "Press",
    privateEventsEmail: "Private Events",
    generalEmail:       "General",
  };
  const contactEntries = Array.isArray(contact)
    ? contact
    : Object.entries(contact || {})
        .map(([key, email]) => ({ label: LABEL_MAP[key] || key, email }))
        .filter(e => e.email);

  // Build department options for the form selector
  const generalEmail = contactEntries.find(d => d.label.toLowerCase().includes("general"))?.email || contactEntries[0]?.email || "";
  const baseDepartments = contactEntries.length > 0
    ? contactEntries
    : [{ label: "General", email: "" }];
  const departments = [...baseDepartments, { label: "Careers", email: generalEmail }];

  const [form, setForm] = useState({ name: "", email: "", department: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailModal, setEmailModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyEmail = (em) => {
    navigator.clipboard.writeText(em);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const toEmail = departments.find(d => d.label === form.department)?.email || departments[0]?.email || "";

    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, toEmail }),
      });
      if (!res.ok) throw new Error("Send failed");
      setSubmitted(true);
    } catch {
      // Fallback to mailto if API fails
      const mailto = `mailto:${toEmail}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nDepartment: ${form.department}\n\n${form.message}`)}`;
      window.open(mailto, "_blank");
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  const mapsUrl = location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z";

  return (
    <PageLayout>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-navy pt-32 pb-20 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Get in Touch</p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Contact Us</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-6" />
        <p className="font-body text-cream opacity-50 text-sm max-w-md mx-auto">
          Questions, reservations, or just want to say hello — we'd love to hear from you.
        </p>
      </div>

      {/* ── Contact Emails ─────────────────────────────────── */}
      <div className="bg-cream pt-10 pb-0">
        <div className="section-container">
          {/* Email Modal */}
          {emailModal && (
            <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4"
              onClick={() => { setEmailModal(null); setCopied(false); }}>
              <div className="bg-cream rounded-xl p-8 max-w-sm w-full text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <button onClick={() => { setEmailModal(null); setCopied(false); }}
                  className="absolute top-4 right-4 text-navy opacity-30 hover:opacity-70">
                  <X size={18} />
                </button>
                <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">{emailModal.label}</p>
                <p className="font-body text-navy text-lg mb-5 select-all">{emailModal.email}</p>
                <div className="flex justify-center">
                  <button onClick={() => copyEmail(emailModal.email)}
                    className="btn-primary flex items-center gap-2 text-sm">
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Email</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {contactEntries.map((entry) => (
              <button key={entry.label} onClick={() => setEmailModal(entry)}
                className="bg-navy text-cream font-mono text-xs tracking-editorial uppercase
                  px-6 py-3 rounded-full hover:bg-flamingo transition-colors">
                {entry.label}
              </button>
            ))}
          </div>

          {/* ── Private Events CTA ─────────────────────────── */}
          <Link to="/private-events"
            className="bg-navy rounded-xl p-6 flex items-center gap-4
              hover:bg-navy-light transition-colors group">
            <Calendar size={20} className="text-flamingo flex-shrink-0" />
            <div>
              <p className="font-display text-cream text-base group-hover:text-flamingo-light transition-colors">
                Private Events
              </p>
              <p className="font-body text-cream opacity-40 text-xs">
                Host your next celebration with us →
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Form + Map Row ──────────────────────────────────── */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* Form — 3 cols */}
            <div className="lg:col-span-3">
              <h2 className="font-display text-navy text-2xl mb-6">Send a Message</h2>

              {submitted ? (
                <div className="bg-navy rounded-xl p-10 text-center">
                  <p className="font-display text-cream text-2xl mb-2">Thank You!</p>
                  <p className="font-body text-cream opacity-60 text-sm">We'll be in touch shortly.</p>
                  <button onClick={() => setSubmitted(false)}
                    className="font-mono text-flamingo text-xs tracking-editorial uppercase mt-6 hover:text-flamingo-light transition-colors">
                    Send Another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Name</label>
                      <input type="text" name="name" required value={form.name}
                        onChange={handleChange} className="form-input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Email</label>
                      <input type="email" name="email" required value={form.email}
                        onChange={handleChange} className="form-input" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Department</label>
                      <select name="department" required value={form.department}
                        onChange={handleChange} className="form-input">
                        <option value="" disabled>Select a department...</option>
                        {departments.map(d => (
                          <option key={d.label} value={d.label}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Subject</label>
                      <input type="text" name="subject" required value={form.subject}
                        onChange={handleChange} className="form-input" placeholder="What's this about?" />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 block mb-1.5">Message</label>
                    <textarea name="message" required rows={5} value={form.message}
                      onChange={handleChange} className="form-input resize-none"
                      placeholder="How can we help you?" />
                  </div>
                  <button type="submit" disabled={sending}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send size={14} />{sending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Map + Location — 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-navy rounded-xl p-6 flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin size={16} className="text-flamingo mt-0.5 flex-shrink-0" />
                  <div className="font-body text-cream opacity-80 text-sm">
                    <p className="font-display text-cream opacity-100 text-base mb-1">Standard Fare</p>
                    <a href={`tel:${location.phone}`}
                      className="text-cream opacity-80 hover:text-flamingo transition-colors block mb-1">
                      {location.phone}
                    </a>
                    <p>{location.address}</p>
                    <p>{location.city}</p>
                  </div>
                </div>

                {/* Map */}
                {location.mapEmbedUrl && (
                  <div className="rounded-lg overflow-hidden h-48 mb-4">
                    <iframe title="Standard Fare Location"
                      src={location.mapEmbedUrl} width="100%" height="100%"
                      style={{ border: 0 }} allowFullScreen="" loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}

                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-flamingo text-xs tracking-editorial uppercase
                    hover:text-flamingo-light transition-colors inline-flex items-center gap-1.5">
                  Get Directions <ExternalLink size={11} />
                </a>
              </div>

              {/* Reserve */}
              <a href={links.reservations} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-center flex items-center justify-center gap-2">
                Reserve a Table
              </a>
            </div>
          </div>

          {/* Gift Card */}
          <div className="mt-14 max-w-md mx-auto">
            <GiftCardChecker />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
