// ─────────────────────────────────────────────────────────────────────────────
// components/admin/ContentTemplates.jsx — Pre-built content templates
// ─────────────────────────────────────────────────────────────────────────────
// Quick-start templates for events, blog posts, menu items, and more.
// Saves time when creating common types of content.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { FileText, Plus, X } from "lucide-react";

// ── Event Templates ──────────────────────────────────────────────────────
export const EVENT_TEMPLATES = [
  {
    name: "Wine Dinner",
    data: {
      title: "Wine Dinner", time: "6:30 PM – 9:00 PM", price: 125,
      description: "An evening of exquisite pairings featuring a multi-course tasting menu alongside carefully selected wines. Limited to 40 guests for an intimate experience.",
      venue: "standard-fare",
    },
  },
  {
    name: "Cocktail Class",
    data: {
      title: "Cocktail Masterclass", time: "5:00 PM – 7:00 PM", price: 75,
      description: "Learn to craft signature cocktails from our bartenders. Includes all materials, recipe cards, and light bites. Perfect for date night or a fun group outing.",
      venue: "standard-fare",
    },
  },
  {
    name: "Chef's Table",
    data: {
      title: "Chef's Table Experience", time: "7:00 PM – 10:00 PM", price: 175,
      description: "An exclusive multi-course dining experience at the chef's table. Watch Chef Joe craft each course and enjoy personalized pairings.",
      venue: "standard-fare", capacity: 12,
    },
  },
  {
    name: "Live Music",
    data: {
      title: "Live Music Night", time: "7:00 PM – 10:00 PM", price: 0,
      description: "Enjoy live music while you dine. No cover charge — just great food, drinks, and atmosphere.",
      venue: "standard-fare",
    },
  },
  {
    name: "Holiday Brunch",
    data: {
      title: "Holiday Brunch", time: "10:00 AM – 2:00 PM", price: 55,
      description: "Celebrate with our special holiday brunch menu featuring seasonal favorites and bottomless mimosas.",
      venue: "standard-fare",
    },
  },
  {
    name: "Private Tasting",
    data: {
      title: "Private Tasting", time: "6:00 PM – 8:00 PM", price: 95,
      description: "A curated tasting experience for a small group. Perfect for corporate gatherings or special celebrations.",
      venue: "standard-fare", capacity: 24,
    },
  },
  {
    name: "Champagne Night at Bocage",
    data: {
      title: "Champagne & Caviar Night", time: "6:00 PM – 9:00 PM", price: 85,
      description: "An elegant evening at Bocage Champagne Bar featuring premium champagnes paired with fine caviar and small bites.",
      venue: "bocage",
    },
  },
];

// ── Blog Post Templates ──────────────────────────────────────────────────
export const BLOG_TEMPLATES = [
  {
    name: "Behind the Dish",
    data: {
      title: "Behind the Dish: ", author: "Chef Joe Michaud", authorRole: "Executive Chef",
      tags: ["behind-the-scenes", "technique", "chef"],
      body: "Every dish has a story. This one starts with...\n\nThe inspiration came from...\n\nWhat makes this dish special is...\n\nWe source the key ingredients from...\n\nThe technique we use is...",
      excerpt: "The story behind one of our most talked-about dishes.",
    },
  },
  {
    name: "Seasonal Menu Preview",
    data: {
      title: "Introducing Our New Seasonal Menu",
      tags: ["new-menu", "seasonal", "announcement"],
      body: "We're thrilled to announce our new seasonal menu, inspired by...\n\nHighlights include...\n\nOur farmers and suppliers...\n\nAvailable starting...",
      excerpt: "A sneak peek at our latest seasonal offerings.",
    },
  },
  {
    name: "Meet the Team",
    data: {
      title: "Meet Our Team: ", tags: ["interview", "community", "staff-picks"],
      body: "We sat down with one of our team members to learn more about their journey...\n\nQ: How did you get into hospitality?\n\nQ: What's your favorite dish on the menu?\n\nQ: What do you love about working at Standard Fare?",
      excerpt: "Get to know the people behind your dining experience.",
    },
  },
  {
    name: "Farm Spotlight",
    data: {
      title: "Farm Spotlight: ", tags: ["sourcing", "farm-to-table", "local", "sustainability"],
      body: "At Standard Fare, we believe in knowing where our food comes from...\n\nThis week, we're spotlighting...\n\nThey've been supplying us with...\n\nWhat sets them apart is...",
      excerpt: "Highlighting the local farms and producers who supply our kitchen.",
    },
  },
  {
    name: "Recipe Share",
    data: {
      title: "From Our Kitchen: ", tags: ["recipe", "technique", "comfort-food"],
      body: "We're sharing one of our favorite recipes for you to try at home...\n\nIngredients:\n• \n• \n• \n\nInstructions:\n1. \n2. \n3. \n\nChef's Tips:\n• ",
      excerpt: "Try this restaurant-quality recipe at home.",
    },
  },
];

// ── Menu Item Templates ──────────────────────────────────────────────────
export const MENU_ITEM_TEMPLATES = [
  { name: "Appetizer", data: { name: "", description: "", price: "16", gf: false, veg: false } },
  { name: "Entrée", data: { name: "", description: "", price: "34", gf: false, veg: false } },
  { name: "Dessert", data: { name: "", description: "", price: "14", gf: false, veg: false } },
  { name: "Cocktail", data: { name: "", description: "", price: "16", gf: true, veg: true } },
  { name: "Wine by Glass", data: { name: "", description: "", price: "18", gf: true, veg: true } },
  { name: "Non-Alcoholic", data: { name: "", description: "", price: "8", gf: true, veg: true } },
  { name: "Side", data: { name: "", description: "", price: "10", gf: false, veg: false } },
];

// ── Template Picker Dropdown ──────────────────────────────────────────────
const TemplatePicker = ({ templates, onSelect, label = "Use Template" }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 font-mono text-[10px] tracking-editorial uppercase text-navy opacity-40 hover:opacity-70 hover:text-flamingo transition-all px-2 py-1 rounded border border-navy border-opacity-10 hover:border-flamingo hover:border-opacity-30">
        <FileText size={11} /> {label}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white border border-navy border-opacity-15 rounded-lg shadow-xl z-50 py-1 min-w-[200px] max-h-64 overflow-y-auto">
            <p className="px-3 py-1.5 font-mono text-[9px] tracking-editorial uppercase text-navy opacity-25">Templates</p>
            {templates.map((t, i) => (
              <button key={i} onClick={() => { onSelect(t.data); setOpen(false); }}
                className="w-full text-left px-3 py-2 font-body text-xs text-navy hover:bg-cream-warm transition-colors">
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TemplatePicker;
