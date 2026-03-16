// ─────────────────────────────────────────────────────────────────────────────
// pages/ContactPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Contact page with:
//   • General inquiry form (sends an email via mailto — replace with a backend
//     form service like Formspree or EmailJS for production)
//   • Press contact info
//   • Private events contact
//   • Address + hours summary
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

const ContactPage = () => {
  const { siteData } = useSite();
  const { contact, location, links } = siteData;

  // contact is an object with keys pressEmail / privateEventsEmail / generalEmail,
  // or an array of { label, email } if the admin has restructured it.
  // Normalize to a display-friendly array with human-readable labels.
  const LABEL_MAP = {
    pressEmail:          "Press Inquiries",
    privateEventsEmail:  "Private Events",
    generalEmail:        "General Inquiries",
  };
  const contactEntries = Array.isArray(contact)
    ? contact
    : Object.entries(contact || {})
        .map(([key, email]) => ({ label: LABEL_MAP[key] || key, email }))
        .filter(e => e.email);

  // Use the "general" email for the form's mailto, fallback to first entry
  const formEmail =
    (Array.isArray(contact) ? null : contact?.generalEmail) ||
    contactEntries.find(e => e.label.toLowerCase().includes("general"))?.email ||
    contactEntries[0]?.email ||
    "";

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:${formEmail}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.open(mailto, "_blank");
    setSubmitted(true);
  };

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          Get in Touch
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Contact Us</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6" />
      </div>

      <div className="section-padding bg-cream">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* ── Contact Form ─────────────────────────── */}
            <div>
              <h2 className="font-display text-navy text-2xl mb-2">Send Us a Message</h2>
              {/* Private events notice */}
              <p className="font-body text-navy opacity-60 text-sm mb-6 leading-relaxed">
                For general inquiries, fill out the form below. For{" "}
                <span className="text-flamingo font-medium">private events</span>,
                please use the contact form or email us directly — we'd love to host your next celebration.
              </p>

              {submitted ? (
                <div className="bg-navy rounded-lg p-8 text-center">
                  <p className="font-display text-cream text-2xl mb-2">Thank You!</p>
                  <p className="font-body text-cream opacity-70 text-sm">We'll be in touch shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-ghost mt-6 text-xs">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">Name</label>
                      <input type="text" name="name" required value={form.name}
                        onChange={handleChange} className="form-input text-base" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">Email</label>
                      <input type="email" name="email" required value={form.email}
                        onChange={handleChange} className="form-input text-base" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">Subject</label>
                    <input type="text" name="subject" required value={form.subject}
                      onChange={handleChange} className="form-input text-base"
                      placeholder="General inquiry, Private event, Press..." />
                  </div>
                  <div>
                    <label className="font-mono text-xs tracking-editorial uppercase text-navy opacity-50 block mb-2">Message</label>
                    <textarea name="message" required rows={6} value={form.message}
                      onChange={handleChange} className="form-input text-base resize-none"
                      placeholder="How can we help you?" />
                  </div>
                  <button type="submit" className="btn-primary w-full sm:w-auto">Send Message</button>
                </form>
              )}
            </div>

            {/* ── Info Panel ───────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Address */}
              <div className="bg-navy rounded-lg p-8">
                <h3 className="font-display text-cream text-xl mb-5">Find Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-flamingo mt-0.5" />
                    <div className="font-body text-cream opacity-80 text-sm">
                      <p>{location.address}</p>
                      <p>{location.city}</p>
                      {(location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z") && (
                        <a href={location.googleMapsUrl || "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z"} target="_blank" rel="noopener noreferrer"
                          className="text-flamingo hover:text-flamingo-light transition-colors text-xs mt-1 inline-flex items-center gap-1">
                          View on Google Maps →
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-flamingo" />
                    <a href={`tel:${location.phone}`}
                      className="font-body text-cream opacity-80 text-sm hover:text-flamingo transition-colors">
                      {location.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Dynamic contact emails */}
              {contactEntries.length > 0 && (
                <div className="bg-navy rounded-lg p-8">
                  <h3 className="font-display text-cream text-xl mb-5">Direct Contacts</h3>
                  <div className="space-y-5">
                    {contactEntries.map(({ label, email }) => (
                      <div key={label}>
                        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">
                          {label}
                        </p>
                        <a href={`mailto:${email}`}
                          className="font-body text-cream opacity-70 text-sm hover:text-flamingo transition-colors flex items-center gap-2">
                          <Mail size={13} />{email}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reservation CTA */}
              <a href={links.reservations} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-center">
                Reserve a Table on Resy
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};


export default ContactPage;
