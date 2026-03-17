// ─────────────────────────────────────────────────────────────────────────────
// data/pressOutlets.js
// ─────────────────────────────────────────────────────────────────────────────
// Registry of press outlets likely to cover Standard Fare / Bocage.
// Used in the admin panel as a searchable dropdown for quick selection.
// All logos use Google's favicon service for reliable, consistent loading.
// ─────────────────────────────────────────────────────────────────────────────

const fav = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

// SVG initials badge for outlets that share a favicon domain (e.g. Substack pubs)
const initials = (text, bg = "#1B2B4B") => {
  const letters = text.split(/[\s+&]+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="${bg}"/><text x="64" y="64" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="bold" fill="#E8748A">${letters}</text></svg>`)}`;
};

const PRESS_OUTLETS = [
  // ── Local / Saratoga Springs & Capital Region ──
  { name: "Saratoga Living",      logo: fav("saratogaliving.com"),      category: "Local" },
  { name: "Saratoga TODAY",       logo: fav("saratogatodaynewspaper.com"), category: "Local" },
  { name: "The Daily Gazette",    logo: fav("dailygazette.com"),        category: "Local" },
  { name: "Times Union",          logo: fav("timesunion.com"),          category: "Local" },
  { name: "The Saratogian",       logo: fav("saratogian.com"),          category: "Local" },
  { name: "Saratoga Dispatch",    logo: initials("Saratoga Dispatch"),  category: "Local" },
  { name: "Saratoga Report",      logo: fav("saratoga-report.com"),     category: "Local" },
  { name: "Saratoga.com",         logo: fav("saratoga.com"),            category: "Local" },
  { name: "Albany Business Review",logo: fav("bizjournals.com"),        category: "Local" },
  { name: "NEWS10 ABC",           logo: fav("news10.com"),              category: "Local" },
  { name: "The Post-Star",        logo: fav("poststar.com"),            category: "Local" },
  { name: "Saratoga Food Fanatic",logo: fav("saratogafoodfanatic.com"), category: "Local" },
  { name: "Discover Saratoga",    logo: fav("discoversaratoga.org"),    category: "Local" },
  { name: "Good + Tasty",         logo: initials("Good Tasty"),         category: "Local" },

  // ── Regional NY ──
  { name: "Hudson Valley Magazine",logo: fav("hvmag.com"),              category: "Regional" },
  { name: "New York Post",        logo: fav("nypost.com"),              category: "Regional" },
  { name: "Opulist",              logo: fav("opulist.co"),              category: "Regional" },

  // ── National Food / Restaurant ──
  { name: "Eater",                logo: fav("eater.com"),               category: "National" },
  { name: "The Infatuation",      logo: fav("theinfatuation.com"),      category: "National" },
  { name: "New York Times",       logo: fav("nytimes.com"),             category: "National" },
  { name: "Food & Wine",          logo: fav("foodandwine.com"),         category: "National" },
  { name: "Bon Appetit",          logo: fav("bonappetit.com"),          category: "National" },
  { name: "James Beard Foundation",logo: fav("jamesbeard.org"),         category: "National" },
  { name: "Conde Nast Traveler",  logo: fav("cntraveler.com"),          category: "National" },
  { name: "Travel + Leisure",     logo: fav("travelandleisure.com"),    category: "National" },
  { name: "Forbes",               logo: fav("forbes.com"),              category: "National" },
  { name: "Thrillist",            logo: fav("thrillist.com"),           category: "National" },
  { name: "Tasting Table",        logo: fav("tastingtable.com"),        category: "National" },
  { name: "Wine Enthusiast",      logo: fav("wineenthusiast.com"),      category: "National" },
  { name: "Esquire",              logo: fav("esquire.com"),             category: "National" },
  { name: "Bloomberg",            logo: fav("bloomberg.com"),           category: "National" },

  // ── Review Platforms ──
  { name: "Google",               logo: fav("google.com"),              category: "Platform" },
  { name: "Yelp",                 logo: fav("yelp.com"),                category: "Platform" },
  { name: "TripAdvisor",          logo: fav("tripadvisor.com"),         category: "Platform" },
  { name: "OpenTable",            logo: fav("opentable.com"),           category: "Platform" },
  { name: "Resy",                 logo: fav("resy.com"),                category: "Platform" },
];

export default PRESS_OUTLETS;
