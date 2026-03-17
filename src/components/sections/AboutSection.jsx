// ─────────────────────────────────────────────────────────────────────────────
// components/sections/AboutSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Our Story section. Layout:
//   LEFT column  — story copy, owner signature, Bocage callout, then DIRECTLY
//                  underneath (no divider, no gap) the two founder circles
//   RIGHT column — restaurant photo
//
// Zac's landscape photo uses object-[center_20%] with a larger circle so his
// whole face fits without being cropped.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, X, Mic } from "lucide-react";
import { useSite } from "../../context/AdminContext";

const HARDCODED_TEAM = [
  {
    name: "Clark Gale",
    role: "Co-Founder / Owner",
    photoPosition: "object-top",
    photo: "https://images.getbento.com/accounts/5595621cc83a57ef6a80e10126e2d090/media/images/14520Screen_Shot_2025-08-26_at_4.19.16_PM.png",
    bio: "Clark began his hospitality career as General Manager of NYC's iconic Cafeteria, where he led a major operational turnaround that set the tone for a career defined by growth, innovation, and transformation.\n\nHe has since brought his leadership and operational expertise to a range of high-profile brands, including Brooklyn Winery, Butter by Alex Guarnaschelli, 1 Oak, the Darby, Burger & Lobster, and Chow Down Hospitality Group. With a deep understanding of business mechanics and team development, Clark has helped shape successful ventures across the hospitality spectrum.\n\nAs Director of Operations for Barcade, Clark oversaw locations in seven states, implementing systems for hiring, training, and inventory while leading multiple new openings. His ability to scale operations and streamline complexity has made him a sought-after leader in the industry.\n\nClark's diverse background — spanning nightlife, fine dining, fast casual, and multi-state operations — makes him a recognized expert in hospitality strategy and execution.\n\nHe now owns CCG Hospitality, a consulting firm focused on systems implementation and pre-opening support for independent hospitality businesses. He is also a founding partner of Bocage Champagne Bar in Saratoga Springs and serves on the Board of Directors for Opera Saratoga.",
  },
  {
    name: "Zac Denham",
    role: "Co-Founder / Owner",
    // Landscape photo (1200×754) — zoom out and shift position up so his face
    // isn't cropped. object-[center_20%] combined with scale-75 equivalent via
    // a larger circle keeps his whole face visible.
    photoPosition: "object-[center_20%] scale-75",
    photo: "https://images.getbento.com/accounts/5595621cc83a57ef6a80e10126e2d090/media/images/40350Screen_Shot_2025-08-19_at_12.29.53_PM.png",
    bio: "Zac, a native of Louisiana, moved to New York City in 2009 to pursue a career in acting, performing on stages across NYC and the country. In 2015, he transitioned into the hospitality world, where his flair for storytelling found new expression through restaurant concepting and operations.\n\nZac has been instrumental in opening five acclaimed restaurants in New York City and London, including the flagship U.S. location of the UK-based Burger & Lobster. He worked alongside Michelin-starred chefs Dani García and Shaun Hergatt on high-profile projects such as CASA DANI at Hudson Yards and VESRTY in SoHo.\n\nIn the West Village, Zac led teams for Empellón Taqueria and da Toscano, where he worked under acclaimed chefs Alex Stupak and Michael Toscano. Da Toscano received national accolades from Esquire and Bloomberg for its inventive approach and intimate charm.\n\nAs founding partner of Bocage Champagne Bar in Saratoga Springs, Zac has shaped one of the region's most beloved destinations for sparkling wine and elevated hospitality. Under his creative direction, Bocage earned the New York State Restaurant Association's award for Best Social Media in 2023.\n\nWith Standard Fare, he brings sharp instincts and deep hospitality know-how to a concept that raises the bar — delivering comfort, style, and substance in a setting designed to leave a lasting impression.",
  },
];

const linkifyBocage = (text, bocageUrl) => {
  const PHRASE = "Bocage Champagne Bar";
  const parts = text.split(PHRASE);
  if (parts.length === 1) return [text];
  return parts.reduce((acc, part, i) => {
    acc.push(part);
    if (i < parts.length - 1) {
      acc.push(
        <a key={i} href={bocageUrl} target="_blank" rel="noopener noreferrer"
          className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors inline-flex items-baseline gap-1">
          {PHRASE}<ExternalLink size={11} className="opacity-70 relative top-px" />
        </a>
      );
    }
    return acc;
  }, []);
};

// ── Bio Modal ─────────────────────────────────────────────────────────────
const BioModal = ({ member, onClose }) => {
  if (!member) return null;
  const paragraphs = (member.bio || "").split("\n\n").filter(Boolean);

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-85 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-navy rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 bg-navy border-b border-cream border-opacity-10 flex items-center justify-between px-6 sm:px-8 py-5 z-10">
          <div>
            <h3 className="font-display text-cream text-xl">{member.name}</h3>
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mt-0.5">{member.role}</p>
          </div>
          <button onClick={onClose} className="text-cream opacity-50 hover:opacity-100 transition-opacity p-2">
            <X size={22} />
          </button>
        </div>

        {/* Photo in modal — wide banner so landscape photos show in full */}
        {member.photo && (
          <div className="w-full h-56 sm:h-72 overflow-hidden">
            <img src={member.photo} alt={member.name}
              className={`w-full h-full object-cover object-[center_20%]`} />
          </div>
        )}

        <div className="px-6 sm:px-8 py-6">
          {paragraphs.map((para, i) => (
            <p key={i} className="font-body text-cream opacity-80 text-sm leading-relaxed mb-4 last:mb-0">
              {para}
            </p>
          ))}

          {/* Podcast link — Zac only */}
          {member.name === "Zac Denham" && (
            <div className="mt-6 border-t border-cream border-opacity-10 pt-5">
              <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Listen</p>
              <a href="https://open.spotify.com/show/50jZNqIDQh9BZfRvmkYNwX"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-cream bg-opacity-5 border border-cream border-opacity-15
                  rounded-lg px-4 py-3 group hover:border-flamingo hover:bg-opacity-10 transition-all">
                <Mic size={18} className="text-flamingo flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-cream text-sm group-hover:text-flamingo-light transition-colors">
                    Off Track Saratoga Podcast
                  </p>
                  <p className="font-body text-cream opacity-50 text-xs mt-0.5">
                    Co-hosted with Emmy Award-winning journalist Noel McLaren
                  </p>
                </div>
                <ExternalLink size={13} className="text-flamingo opacity-40 group-hover:opacity-80 transition-opacity flex-shrink-0" />
              </a>
              <div className="flex gap-3 mt-2">
                <a href="https://podcasts.apple.com/us/podcast/off-track-saratoga-podcast/id1880556768"
                  target="_blank" rel="noopener noreferrer"
                  className="font-body text-cream opacity-40 text-xs hover:text-flamingo hover:opacity-100 transition-all">
                  Apple Podcasts
                </a>
                <a href="https://open.spotify.com/show/50jZNqIDQh9BZfRvmkYNwX"
                  target="_blank" rel="noopener noreferrer"
                  className="font-body text-cream opacity-40 text-xs hover:text-flamingo hover:opacity-100 transition-all">
                  Spotify
                </a>
                <a href="https://music.amazon.com/podcasts/bc0c5413-1a50-4e3c-89c7-fa4cf6d165ee"
                  target="_blank" rel="noopener noreferrer"
                  className="font-body text-cream opacity-40 text-xs hover:text-flamingo hover:opacity-100 transition-all">
                  Amazon Music
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── AboutSection ──────────────────────────────────────────────────────────
const AboutSection = () => {
  const { siteData } = useSite();
  const { heading, body, team, bocageUrl } = siteData.about;
  const [activeMember, setActiveMember] = useState(null);

  // Merge context team data with hardcoded fallbacks.
  // Validate photo URLs — bare filenames like "zac.jpg" must be replaced.
  const isValidUrl = (u) =>
    typeof u === "string" &&
    (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:"));

  const teamData =
    team?.length > 0 && team.some((m) => m.photo || m.bio)
      ? team.map((m, i) => {
          const base = HARDCODED_TEAM[i] || {};
          const merged = { ...base, ...m };
          // If the photo from context is a bare filename, use the hardcoded one
          if (!isValidUrl(merged.photo)) merged.photo = base.photo || "";
          return merged;
        })
      : HARDCODED_TEAM;

  return (
    <>
      <BioModal member={activeMember} onClose={() => setActiveMember(null)} />

      <section id="about" className="section-padding bg-navy">
        <div className="section-container max-w-3xl">
          <div className="text-center mb-8">
            <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-3">Our Story</p>
            <h2 className="font-display text-cream text-2xl sm:text-3xl md:text-4xl leading-tight">
              {heading}
            </h2>
            <span className="block w-12 h-px bg-flamingo mx-auto mt-5" />
          </div>

          <div className="text-center">
            {(body || "").split("\n\n").map((para, i) => (
              <p key={i} className="font-body text-cream opacity-80 leading-relaxed mb-4 text-sm sm:text-base">
                {bocageUrl ? linkifyBocage(para, bocageUrl) : para}
              </p>
            ))}
          </div>

          {/* ── Founders ── */}
          <div className="mt-10">
            <Link to="/team"
              className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-6 text-center block hover:text-flamingo-dark transition-colors">
              Meet the Founders &rarr;
            </Link>

            <div className="flex justify-center gap-8">
              {teamData.map((member) => (
                <button
                  key={member.name}
                  onClick={() => setActiveMember(member)}
                  className="flex flex-col items-center text-center group cursor-pointer"
                  aria-label={`View ${member.name}'s bio`}
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden
                                  ring-2 ring-cream ring-opacity-10
                                  group-hover:ring-flamingo group-hover:ring-opacity-60
                                  transition-all duration-300 shadow-lg flex-shrink-0">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className={`w-full h-full object-cover
                          ${member.name === "Zac Denham"
                            ? "object-[center_18%] scale-[1.4] origin-top"
                            : "object-top"
                          }
                          transition-transform duration-500 group-hover:scale-110`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy-light">
                        <span className="font-display text-flamingo text-2xl">
                          {member.name.split(" ").map((w) => w[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-display text-cream text-base leading-tight mt-3 mb-0.5
                                 group-hover:text-flamingo-light transition-colors">
                    {member.name}
                  </h4>
                  <p className="font-mono text-flamingo text-xs tracking-editorial uppercase mb-1">
                    {member.role}
                  </p>
                  <p className="font-body text-cream opacity-30 text-xs group-hover:opacity-60 transition-opacity">
                    Read bio →
                  </p>
                </button>
              ))}
            </div>

            {/* Bocage link */}
            {bocageUrl && (
              <div className="flex justify-center mt-5">
                <a
                  href={bocageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 border border-gold border-opacity-30
                             rounded-lg px-5 py-4 group hover:border-gold hover:bg-gold
                             hover:bg-opacity-5 transition-all duration-300"
                >
                  <span className="text-xl">🥂</span>
                  <div>
                    <p className="font-mono text-gold text-xs tracking-editorial uppercase mb-0.5">
                      Also from our team
                    </p>
                    <p className="font-display text-cream text-sm group-hover:text-gold-light transition-colors">
                      {siteData.about.bocageLabel || "Bocage Champagne Bar"}
                    </p>
                    <p className="font-body text-cream opacity-50 text-xs mt-0.5">
                      {siteData.about.bocageSublabel || "10 Phila St · Saratoga Springs"}
                    </p>
                  </div>
                  <ExternalLink size={13} className="text-gold opacity-40 group-hover:opacity-80 ml-auto transition-opacity" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;
