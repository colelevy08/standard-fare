// ─────────────────────────────────────────────────────────────────────────────
// pages/ValuePage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Owner-facing page explaining the business value of each website feature.
// Accessible only when logged in as admin: /admin/value
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, DollarSign, Users, Clock, Shield, BarChart3, Star, Zap } from "lucide-react";
import { useSite } from "../context/AdminContext";

const ValueCard = ({ icon: Icon, title, description, metrics }) => (
  <div className="border border-navy border-opacity-10 rounded-2xl p-6 sm:p-8 mb-6 bg-white">
    <div className="flex items-start gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-flamingo bg-opacity-10 flex items-center justify-center">
        <Icon size={22} className="text-flamingo" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-navy text-lg sm:text-xl mb-2">{title}</h3>
        <p className="font-body text-navy opacity-70 text-sm leading-relaxed mb-4">{description}</p>
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metrics.map((m, i) => (
              <div key={i} className="bg-cream rounded-lg px-4 py-3">
                <p className="font-display text-flamingo text-lg font-bold">{m.stat}</p>
                <p className="font-body text-navy opacity-60 text-xs">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ValuePage = () => {
  const { isAdmin } = useSite();
  const navigate = useNavigate();

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
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Business Impact</p>
          <h1 className="font-display text-cream text-3xl sm:text-4xl mb-3">How Your Website Brings Value</h1>
          <p className="font-body text-cream opacity-60 text-base leading-relaxed max-w-xl">
            Every feature on your website was designed to drive revenue, save time,
            or strengthen your brand. Here's how each one earns its keep.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Revenue intro */}
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-10 text-center">
          <p className="font-display text-cream text-xl mb-3">Your Website Is a Revenue Engine</p>
          <p className="font-body text-cream opacity-70 text-sm leading-relaxed max-w-lg mx-auto">
            This isn't just a digital menu on a screen. It's a 24/7 sales tool that converts
            visitors into diners, event attendees, merchandise buyers, and art collectors —
            all while building a brand people remember.
          </p>
        </div>

        <ValueCard
          icon={DollarSign}
          title="Direct Revenue: Events & Tickets"
          description="Ticketed events (wine tastings, dinners, private experiences) are sold directly through your website via Toast integration. Every ticket sold flows into the same POS system as your restaurant sales — one dashboard, one revenue stream."
          metrics={[
            { stat: "$95+", label: "Average ticket price per guest" },
            { stat: "24 seats", label: "Per event — high margin, low overhead" },
          ]}
        />

        <ValueCard
          icon={Star}
          title="Direct Revenue: Art & Merchandise"
          description="The paintings gallery and merchandise store turn your restaurant into a retail destination. Every sale processes through Toast — no separate payment system, no extra accounting. Guests buy a $2,000 painting and a $35 tee shirt alongside their dinner tab."
          metrics={[
            { stat: "$12–$2,000", label: "Revenue per item — wide price range" },
            { stat: "100%", label: "Margin on branded merchandise" },
          ]}
        />

        <ValueCard
          icon={Users}
          title="Reservation Conversion"
          description="The Reserve button is on every page — hero, navbar, footer. One click takes guests directly to Resy. The easier you make it to book, the more tables you fill. Your website removes every barrier between 'I want to go there' and 'I have a reservation.'"
          metrics={[
            { stat: "3 clicks", label: "From Google search to confirmed reservation" },
            { stat: "Every page", label: "Has a path to Reserve" },
          ]}
        />

        <ValueCard
          icon={TrendingUp}
          title="Brand Authority: Press & Social Proof"
          description="When Times Union or the Gazette writes about you, that article lives on your press page forever. Visitors see real media coverage, not just your own marketing. This is third-party validation — the most persuasive kind of advertising there is."
          metrics={[
            { stat: "Trust", label: "Media logos build instant credibility" },
            { stat: "SEO", label: "Press links improve search ranking" },
          ]}
        />

        <ValueCard
          icon={Star}
          title="Google Reviews: Automated Social Proof"
          description="Real 5-star Google reviews are pulled automatically and displayed on your homepage — refreshed every 12 hours with zero effort. Visitors see authentic guest feedback, not copy you wrote. Reviews mentioning your staff are prioritized, subtly showcasing the personal touch that sets you apart."
          metrics={[
            { stat: "5-star only", label: "Only your best reviews are shown" },
            { stat: "Auto-refresh", label: "New reviews appear within 12 hours" },
          ]}
        />

        <ValueCard
          icon={Zap}
          title="Instagram Feed: Always Fresh Content"
          description="Your 3 most recent Instagram posts are automatically displayed at the top of your Gallery page. Every time you post on Instagram, your website updates itself within 12 hours. No copy-pasting URLs, no manual uploads — just post and go."
          metrics={[
            { stat: "0 effort", label: "Post on Instagram, website updates itself" },
            { stat: "12-hour refresh", label: "Always showing your latest content" },
          ]}
        />

        <ValueCard
          icon={Zap}
          title="Operational Savings: Real-Time Content Control"
          description="Change your hours, update a menu price, add a new event — it takes seconds, not days. No waiting for a web developer, no monthly retainer, no back-and-forth emails. You're fully in control, and changes go live instantly across all devices."
          metrics={[
            { stat: "$0", label: "Monthly developer costs for content changes" },
            { stat: "< 30 sec", label: "Time to update any piece of content" },
          ]}
        />

        <ValueCard
          icon={Shield}
          title="Ownership & Independence"
          description="You own this website. It's not locked into a platform like Squarespace or Wix that can raise prices or change features. Your data lives in Supabase (which you own), your code lives in GitHub (which you own), and your hosting is on Vercel's generous free tier."
          metrics={[
            { stat: "$0/mo", label: "Hosting cost on Vercel free tier" },
            { stat: "Yours", label: "Full ownership of code, data, and domain" },
          ]}
        />

        <ValueCard
          icon={BarChart3}
          title="Analytics & Insights (Coming Soon)"
          description="Google Analytics integration will show you exactly how visitors find your site, which pages they visit, how long they stay, and what they click. Use this data to understand what's working and double down on it."
          metrics={[
            { stat: "Traffic", label: "See where visitors come from" },
            { stat: "Behavior", label: "Know which pages drive action" },
          ]}
        />

        <ValueCard
          icon={Clock}
          title="24/7 Availability"
          description="Your website works when you don't. At 2 AM on a Tuesday, someone in Boston is planning a Saratoga weekend, Googling restaurants, and finding your site. They browse the menu, check the gallery, see a wine tasting event, and book a reservation — all while you sleep."
          metrics={[
            { stat: "Always on", label: "Your best salesperson never clocks out" },
            { stat: "Mobile-first", label: "70% of restaurant searches are on phones" },
          ]}
        />

        {/* ROI summary */}
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-6">
          <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">The Bottom Line</p>
          <div className="space-y-4">
            <p className="font-body text-cream opacity-80 text-sm leading-relaxed">
              A single wine tasting event at $95/person with 24 guests generates <span className="text-flamingo font-bold">$2,280</span> in
              direct ticket revenue. One art sale can bring in <span className="text-flamingo font-bold">$2,000</span>. A steady stream
              of merch moves at <span className="text-flamingo font-bold">$20–65 per item</span>. Daniel Fairley's paintings drive
              an estimated <span className="text-flamingo font-bold">$25K–100K/year</span> in art revenue.
            </p>
            <p className="font-body text-cream opacity-80 text-sm leading-relaxed">
              The multi-item cart lets guests buy a bottle of wine, a painting, and event tickets in a
              single checkout — all processed through your existing Toast POS. No separate payment system,
              no separate accounting, no extra steps.
            </p>
            <p className="font-body text-cream opacity-80 text-sm leading-relaxed">
              Meanwhile, your Instagram feed, Google reviews, and paintings catalog update themselves
              automatically. Zero manual work, maximum freshness.
            </p>
            <p className="font-body text-cream opacity-60 text-sm leading-relaxed">
              The website doesn't just represent your restaurant. It <span className="text-flamingo italic">is</span> your
              restaurant's most scalable employee.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link to="/admin/how-it-works"
            className="btn-primary inline-flex items-center justify-center gap-2">
            How It Works
          </Link>
          <Link to="/admin"
            className="inline-flex items-center justify-center gap-2 font-body text-sm text-navy border border-navy border-opacity-20 rounded-lg px-6 py-3 hover:border-flamingo hover:text-flamingo transition-all">
            <ArrowLeft size={16} /> Back to Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ValuePage;
