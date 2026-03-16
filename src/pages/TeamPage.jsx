// ─────────────────────────────────────────────────────────────────────────────
// pages/TeamPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dedicated team/founders page at /team.
// Team data is pulled from siteData.about.team so the admin can edit it,
// but falls back to HARDCODED_TEAM if siteData has no team array yet
// (handles the case where localStorage has stale data without team info).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useSite } from "../context/AdminContext";

// ── HARDCODED FALLBACK — always works regardless of localStorage state ─────
// This is the source of truth shown to visitors. Admin edits override it.
const HARDCODED_TEAM = [
  {
    name: "Clark Gale",
    role: "Co-Founder / Owner",
    photo:
      "https://images.getbento.com/accounts/5595621cc83a57ef6a80e10126e2d090/media/images/14520Screen_Shot_2025-08-26_at_4.19.16_PM.png",
    teaser:
      "Clark began his hospitality career as General Manager of NYC's iconic Cafeteria, where he led a major operational turnaround that set the tone for a career defined by growth, innovation, and transformation.",
    bio: [
      "Clark began his hospitality career as General Manager of NYC's iconic Cafeteria, where he led a major operational turnaround that set the tone for a career defined by growth, innovation, and transformation.",
      "He has since brought his leadership and operational expertise to a range of high-profile brands, including Brooklyn Winery, Butter by Alex Guarnaschelli, 1 Oak, the Darby, Burger & Lobster, and Chow Down Hospitality Group. With a deep understanding of business mechanics and team development, Clark has helped shape successful ventures across the hospitality spectrum.",
      "As Director of Operations for Barcade, Clark oversaw locations in seven states, implementing systems for hiring, training, and inventory while leading multiple new openings. His ability to scale operations and streamline complexity has made him a sought-after leader in the industry.",
      "Clark's diverse background — spanning nightlife, fine dining, fast casual, and multi-state operations — makes him a recognized expert in hospitality strategy and execution.",
      "He now owns CCG Hospitality, a consulting firm focused on systems implementation and pre-opening support for independent hospitality businesses. He is also a founding partner of Bocage Champagne Bar in Saratoga Springs and serves on the Board of Directors for Opera Saratoga.",
    ],
  },
  {
    name: "Zac Denham",
    role: "Co-Founder / Owner",
    photo:
      "https://images.getbento.com/accounts/5595621cc83a57ef6a80e10126e2d090/media/images/40350Screen_Shot_2025-08-19_at_12.29.53_PM.png",
    teaser:
      "Zac, a native of Louisiana, moved to New York City in 2009 to pursue a career in acting, performing on stages across NYC and the country. In 2015, he transitioned into the hospitality world, where his flair for storytelling found new expression through restaurant concepting and operations.",
    bio: [
      "Zac, a native of Louisiana, moved to New York City in 2009 to pursue a career in acting, performing on stages across NYC and the country. In 2015, he transitioned into the hospitality world, where his flair for storytelling found new expression through restaurant concepting and operations.",
      "Zac has been instrumental in opening five acclaimed restaurants in New York City and London, including the flagship U.S. location of the UK-based Burger & Lobster. He worked alongside Michelin-starred chefs Dani García and Shaun Hergatt on high-profile projects such as CASA DANI at Hudson Yards and VESRTY in SoHo.",
      "In the West Village, Zac led teams for Empellón Taqueria and da Toscano, where he worked under acclaimed chefs Alex Stupak and Michael Toscano. Da Toscano received national accolades from Esquire and Bloomberg for its inventive approach and intimate charm.",
      "As founding partner of Bocage Champagne Bar in Saratoga Springs, Zac has shaped one of the region's most beloved destinations for sparkling wine and elevated hospitality. Under his creative direction, Bocage earned the New York State Restaurant Association's award for Best Social Media in 2023.",
      "With Standard Fare, he brings sharp instincts and deep hospitality know-how to a concept that raises the bar — delivering comfort, style, and substance in a setting designed to leave a lasting impression.",
    ],
  },
];

// ── Bio Modal ─────────────────────────────────────────────────────────────
// Full-screen overlay showing the complete founder bio
const BioModal = ({ member, onClose }) => {
  if (!member) return null;
  // bio can be array (hardcoded) or \n\n string (from admin editor)
  const paragraphs = Array.isArray(member.bio)
    ? member.bio
    : (member.bio || "").split("\n\n").filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black bg-opacity-85 flex items-end sm:items-center
                 justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-navy rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh]
                   overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 bg-navy border-b border-cream border-opacity-10
                     flex items-center justify-between px-6 sm:px-8 py-5 z-10"
        >
          <div>
            <h3 className="font-display text-cream text-xl">{member.name}</h3>
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mt-0.5">
              {member.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cream opacity-50 hover:opacity-100 transition-opacity p-2 -mr-2"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-8 py-6 flex flex-col sm:flex-row gap-8">
          {member.photo && (
            <div className="flex-shrink-0">
              <img
                src={member.photo}
                alt={member.name}
                className="w-full sm:w-48 h-60 sm:h-60 object-cover object-top rounded-lg shadow-xl"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="font-body text-cream opacity-80 text-sm leading-relaxed mb-4 last:mb-0"
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Team Member Card ──────────────────────────────────────────────────────
const TeamCard = ({ member, onReadMore }) => (
  <div className="bg-navy-light rounded-2xl overflow-hidden shadow-xl flex flex-col group">
    {/* Photo */}
    <div className="relative h-72 sm:h-80 overflow-hidden">
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-700
                     group-hover:scale-105"
        />
      ) : (
        // Monogram fallback
        <div className="w-full h-full flex items-center justify-center bg-navy">
          <span className="font-display text-flamingo text-5xl">
            {member.name.split(" ").map((w) => w[0]).join("")}
          </span>
        </div>
      )}
      {/* Gradient fade at bottom of photo */}
      <div className="absolute bottom-0 left-0 right-0 h-24
                      bg-gradient-to-t from-navy-light to-transparent" />
    </div>

    {/* Card body */}
    <div className="px-7 pt-2 pb-7 flex flex-col flex-1">
      {/* Name + role */}
      <h3 className="font-display text-cream text-2xl mb-1">{member.name}</h3>
      <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-5">
        {member.role}
      </p>

      {/* Teaser text */}
      <p className="font-body text-cream opacity-70 text-sm leading-relaxed mb-6 flex-1">
        {member.teaser ||
          (Array.isArray(member.bio)
            ? member.bio[0]
            : (member.bio || "").split("\n\n")[0])}
      </p>

      {/* Read Full Bio CTA */}
      <button
        onClick={() => onReadMore(member)}
        className="self-start font-mono text-xs tracking-editorial uppercase text-flamingo
                   hover:text-flamingo-light transition-colors flex items-center gap-2 group/btn"
      >
        Read Full Bio
        <span className="transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
      </button>
    </div>
  </div>
);

// ── Team Page ─────────────────────────────────────────────────────────────
const TeamPage = () => {
  const { siteData } = useSite();
  const [activeMember, setActiveMember] = useState(null);

  // Use admin-edited team data if it exists and has photos/bios, else hardcoded
  const teamData =
    siteData?.about?.team?.length > 0 &&
    siteData.about.team.some((m) => m.photo || m.bio)
      ? siteData.about.team
      : HARDCODED_TEAM;

  return (
    <PageLayout>
      {/* Bio modal */}
      <BioModal member={activeMember} onClose={() => setActiveMember(null)} />

      {/* Page header */}
      <div className="bg-navy pt-32 pb-16 text-center">
        <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">
          The People Behind the Food
        </p>
        <h1 className="font-display text-cream text-4xl md:text-5xl">Our Team</h1>
        <span className="block w-16 h-px bg-flamingo mx-auto mt-6 mb-6" />
        <p className="font-body text-cream opacity-60 text-base max-w-lg mx-auto px-6 leading-relaxed">
          Standard Fare was built by two hospitality veterans with decades of experience
          across New York City and beyond — and a shared vision for what dining in
          Saratoga Springs could be.
        </p>
      </div>

      {/* Team cards */}
      <div className="section-padding bg-cream">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamData.map((member) => (
              <TeamCard
                key={member.name}
                member={member}
                onReadMore={setActiveMember}
              />
            ))}
          </div>

          {/* Bocage connection */}
          <div className="mt-16 text-center">
            <p className="font-body text-navy opacity-60 text-sm mb-4">
              Clark and Zac are also the founding partners of
            </p>
            <a
              href="https://www.bocagechampagnebar.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-navy border-opacity-20
                         rounded-lg px-6 py-4 group hover:border-flamingo hover:shadow-md
                         transition-all duration-300"
            >
              <span className="text-2xl">🥂</span>
              <div className="text-left">
                <p className="font-display text-navy text-base group-hover:text-flamingo transition-colors">
                  Bocage Champagne Bar
                </p>
                <p className="font-body text-navy opacity-50 text-xs">
                  10 Phila St · Saratoga Springs
                </p>
              </div>
              <ExternalLink size={14} className="text-navy opacity-30 group-hover:opacity-60 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TeamPage;
