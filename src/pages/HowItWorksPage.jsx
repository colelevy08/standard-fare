// ─────────────────────────────────────────────────────────────────────────────
// pages/HowItWorksPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Owner-facing guide explaining how to manage the website.
// Accessible only when logged in as admin: /admin/how-it-works
// Written simply with a light touch of humor.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useSite } from "../context/AdminContext";

// ── Section component ─────────────────────────────────────────────────────
const Section = ({ number, title, description, bullets, tip }) => (
  <div className="border border-navy border-opacity-10 rounded-2xl p-6 sm:p-8 mb-6 bg-white">
    <div className="flex items-start gap-5">
      {/* Number badge */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-flamingo flex items-center justify-center">
        <span className="font-display text-cream text-base font-bold">{number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-navy text-lg sm:text-xl mb-2">{title}</h3>
        <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-4">{description}</p>

        {bullets && (
          <ul className="space-y-2 mb-4">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-flamingo flex-shrink-0 mt-0.5" />
                <span className="font-body text-navy opacity-70 text-sm">{b}</span>
              </li>
            ))}
          </ul>
        )}

        {tip && (
          <div className="bg-flamingo bg-opacity-8 border border-flamingo border-opacity-20 rounded-lg px-4 py-3 mt-2">
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">Pro Tip</p>
            <p className="font-body text-navy text-sm">{tip}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────
const HowItWorksPage = () => {
  const { isAdmin } = useSite();
  const navigate    = useNavigate();

  // Protect the route — redirect non-admins
  useEffect(() => {
    if (!isAdmin) navigate("/");
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-navy pt-16 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/admin"
            className="inline-flex items-center gap-2 font-body text-sm text-cream opacity-50 hover:opacity-100 hover:text-flamingo transition-all mb-8">
            <ArrowLeft size={16} /> Back to Admin Panel
          </Link>
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Owner Guide</p>
          <h1 className="font-display text-cream text-3xl sm:text-4xl mb-3">How Your Website Works</h1>
          <p className="font-body text-cream opacity-60 text-base leading-relaxed max-w-xl">
            Everything you need to know about managing Standard Fare's website —
            no coding required. (We promise. We checked twice.)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Intro card */}
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-10 text-center">
          <p className="font-display text-cream text-xl mb-3">The Big Picture</p>
          <p className="font-body text-cream opacity-70 text-sm leading-relaxed max-w-lg mx-auto">
            Your website stores all its content — menus, photos, hours, events, everything — in a
            database called <span className="text-flamingo">Supabase</span>. When you make a change
            in the admin panel and hit Save, it goes straight to that database. Any device, anywhere,
            sees your updates within seconds. Think of it as Google Docs, but for your restaurant website.
          </p>
        </div>

        <Section
          number="1"
          title="Logging In"
          description="The admin panel is accessed through a hidden button in the footer — small enough that guests won't stumble into it, but always there when you need it."
          bullets={[
            "Scroll to the very bottom of any page",
            "Click the tiny \"Manage\" button in the bottom-right corner",
            'Enter your password: zacnclark4evr<3',
            "You'll be taken straight to the admin dashboard",
          ]}
          tip="Your login stays active for the whole browser session. Close the tab and you'll need to log in again — keeps things secure."
        />

        <Section
          number="2"
          title="The Hero — First Thing Visitors See"
          description="The big full-screen section at the top of your homepage. You control everything about it."
          bullets={[
            "Background Slideshow — upload any photos to cycle through automatically",
            "Main Title — currently \"Standard Fare\" (change it if you ever rebrand, but maybe don't)",
            "Eyebrow Text — the small line above the title (address, tagline, whatever you like)",
            "Tagline — the two lines of description under the title",
            "Button Labels — what the Reserve and Menu buttons actually say",
          ]}
          tip="Slide photos look best when they're landscape (wider than tall) and at least 1800px wide. Your phone camera will do just fine."
        />

        <Section
          number="3"
          title="Our Story & Team"
          description="The about section that tells visitors who you are and why Standard Fare exists. Also where Clark and Zac live."
          bullets={[
            "Section Heading and Body Copy — edit your story anytime",
            "About Photo — the restaurant image on the right side",
            "Bocage Champagne Bar URL — keeps the sister-bar link current",
            "Team Members — edit Clark and Zac's names, roles, headshot photos, and full bios",
            "Clicking a founder's photo opens their full bio modal for visitors",
          ]}
          tip={'Bios support multiple paragraphs — just leave a blank line between them. The word "Bocage Champagne Bar" anywhere in the body text automatically becomes a hyperlink.'}
        />

        <Section
          number="4"
          title="Hours & Location"
          description="Update your hours any time — holidays, seasonal changes, surprise closures for a staff field trip to the track."
          bullets={[
            "Set open/close times for each day of the week",
            "Type \"Closed\" in the Open field to mark a day as closed",
            "Today's day is automatically highlighted in flamingo pink for visitors",
            "Google Maps URL — the link that appears under your address",
            "Map Embed URL — the little preview map on the page",
          ]}
          tip="Hours changes save instantly to Supabase and appear on the live site within seconds."
        />

        <Section
          number="5"
          title="Menus"
          description="Four menus: Brunch, Dinner, Drinks, and Dessert. Each has sections and items you can add, edit, or remove."
          bullets={[
            "Click a menu tab (Brunch / Dinner / Drinks / Dessert) to switch between them",
            "Add items with the + Add Item button inside any section",
            "Each item has a Name, Description, and Price",
            "Menu Note — shown at the top of the menu (e.g. \"Served Saturday & Sunday, 10AM–3PM\")",
            "Hit Save Menus when you're done — one save covers all four menus",
          ]}
          tip="Prices don't need a $ symbol in the field — it's added automatically on the page."
        />

        <Section
          number="6"
          title="Gallery (Photos, GIFs & Videos)"
          description="Your photo gallery supports more than just photos — because static is boring."
          bullets={[
            "Images — drag & drop JPG, PNG, or WebP files directly from your desktop",
            "GIFs — animated GIFs work great for behind-the-scenes moments",
            "Videos — MP4 videos play silently on hover and loop automatically",
            "Instagram Link — paste a post URL so clicking the photo opens that Instagram post",
            "Comment — optional caption shown underneath each photo",
            "\"See on Instagram\" label appears on hover when a post URL is set",
          ]}
          tip="Photos upload directly to your Supabase Storage — they get a permanent URL that never expires, unlike Instagram CDN links."
        />

        <Section
          number="7"
          title="Events & Tickets"
          description="Add ticketed events like the Apollo's Praise wine tasting. Tickets connect to your Toast POS so sales appear alongside your restaurant revenue."
          bullets={[
            "Add an event with title, date, time, description, price, and photo",
            "Ticket Fallback URL — where the Get Tickets button sends people until Toast is connected",
            "Toast Product ID — paste this from your Toast dashboard after creating the event there",
            "See README-TOAST.md in your project folder for the full Toast setup walkthrough",
            "Past events automatically move to a \"Past Events\" section",
          ]}
          tip="Until you paste a Toast Product ID, the Get Tickets button still works — it just goes to your general Toast online ordering page."
        />

        <Section
          number="8"
          title="Paintings (Gallery Shop)"
          description="Daniel Fairley's artwork available for purchase directly on the site. Sales connect to Toast just like events."
          bullets={[
            "Add prints with title, artist, medium, price, photo, and description",
            "Toggle the Available checkbox to mark pieces as sold out",
            "Toast Product ID — connect each print to its Toast product for seamless checkout",
            "Sold out pieces still appear in the shop with a \"Sold Out\" badge",
          ]}
          tip="Artwork sold on the website shows up in your Toast dashboard right next to your burger and salmon sales. Your accountant will love it."
        />

        <Section
          number="9"
          title="Press"
          description="Your media coverage. Add new articles as they come in — this section is your bragging wall."
          bullets={[
            "Outlet name, article headline, and URL for each piece of coverage",
            "Publication logo — upload or paste the outlet's logo image URL",
            "If a logo fails to load, the outlet name displays as text instead",
            "Articles are shown as clickable cards that open in a new tab",
          ]}
          tip="When Times Union or the Gazette writes about you again (and they will), add it here within the hour. Fresh press = social proof."
        />

        <Section
          number="10"
          title="External Links"
          description="All the third-party service URLs in one place. Update these when services change their links."
          bullets={[
            "Resy Reservations URL — the Reserve button destination",
            "DoorDash Order URL — the takeout/delivery link",
            "Toast Gift Cards URL — the gift card purchase page",
            "Instagram URL — your Instagram profile link",
            "Toast Online Order Base URL — used for event ticket and print purchase links",
            "Bocage Champagne Bar URL — the sister-bar link throughout the site",
          ]}
          tip="If Resy changes your venue URL or DoorDash updates their link, this is the only place you need to update it."
        />

        <Section
          number="11"
          title="Contact Emails"
          description="The email addresses shown on the Contact page. Add as many as you need."
          bullets={[
            "Each entry has a Label (e.g. \"Press\") and an Email address",
            "Add entries with + Add Email, remove with the trash icon",
            "The General email is also used as the destination for the contact form",
            "Private Events inquiry notice is shown automatically on the Contact page",
          ]}
          tip={'You can add any label you want — "Catering", "Reservations", "Clark\'s Personal Cell" (maybe don\'t do that last one).'}
        />

        <Section
          number="12"
          title="Site Settings — Passwords & Gate"
          description="The password-protected preview mode that's currently keeping the site private while you review it. You can also change both passwords here without touching any code."
          bullets={[
            "Toggle ON = visitors see a password prompt before accessing the site",
            "Toggle OFF = site is fully public, gate disappears for everyone instantly",
            "Change Preview Password — update what visitors need to enter to preview",
            "Change Admin Password — update your own login password to the admin panel",
            "All password changes save instantly to Supabase — no redeploy needed",
            "Current preview password: standardfare2026 (until you change it)",
          ]}
          tip="When you're ready to go live, come here, flip the toggle to OFF, and save. That's your launch. Congratulations in advance."
        />

        {/* Persistence confirmation */}
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-6">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Where Does Everything Save?</p>
          <p className="font-body text-cream opacity-80 text-sm leading-relaxed mb-4">
            Every change you make is saved in two places simultaneously:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "☁️", label: "Supabase (Primary)", desc: "Your cloud database. Changes appear on every device and browser instantly. This is the real one." },
              { icon: "💾", label: "Browser Cache (Backup)", desc: "A local copy stored in your browser. If Supabase is ever unreachable, the site still loads from this." },
            ].map(item => (
              <div key={item.label} className="bg-navy-light rounded-xl p-4">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-body text-cream text-sm font-bold mb-1">{item.label}</p>
                <p className="font-body text-cream opacity-50 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="font-body text-cream opacity-40 text-xs mt-4">
            The status at the bottom of the admin panel tells you which one is active.
          </p>
        </div>

        {/* Reset note */}
        <div className="border border-flamingo border-opacity-30 rounded-2xl p-6 mb-6">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-2">If Something Looks Wrong</p>
          <p className="font-body text-navy opacity-60 text-sm leading-relaxed">
            If the site is showing outdated content that doesn't match what you saved, scroll to the
            very bottom of the admin panel and click <span className="font-bold">"Reset all content to defaults"</span>.
            This clears the browser cache and reloads the latest data from Supabase.
            It won't delete anything — it just forces a fresh fetch.
          </p>
        </div>

        {/* Back button */}
        <div className="text-center pt-4">
          <Link to="/admin"
            className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
