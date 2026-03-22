// ─────────────────────────────────────────────────────────────────────────────
// data/siteData.js
// ─────────────────────────────────────────────────────────────────────────────
// This file is the SINGLE SOURCE OF TRUTH for all editable website content.
// The AdminContext reads from and writes to localStorage, using this file as
// the initial/default data when no saved data exists yet.
//
// To add a new section: add it here AND update AdminContext + the relevant page.
// ─────────────────────────────────────────────────────────────────────────────

import googleReviews from "./googleReviews";

// SVG initials badge for outlets that share a favicon domain (e.g. Substack pubs)
const pressInitials = (text, bg = "#1B2B4B") => {
  const letters = text.split(/[\s+&]+/).filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="${bg}"/><text x="64" y="64" text-anchor="middle" dominant-baseline="central" font-family="Georgia,serif" font-size="52" font-weight="bold" fill="#E8748A">${letters}</text></svg>`)}`;
};

// Supabase Storage base URLs
const SB = "https://peecuaxyygkvakcnjgoo.supabase.co/storage/v1/object/public/gallery/photos";
const LB = "https://peecuaxyygkvakcnjgoo.supabase.co/storage/v1/object/public/gallery/labels";

const defaultSiteData = {

  // ── HERO SLIDESHOW ─────────────────────────────────────────────────────────
  heroSlides: [
    { id: 1, url: `${SB}/interior-evening-ducks.jpg`, alt: "Standard Fare evening atmosphere with Daniel Fairley duck painting, exposed brick, and guests dining" },
    { id: 2, url: `${SB}/interior-banquettes-fairley.jpg`, alt: "Standard Fare dining room with blue banquettes and Daniel Fairley hamburger spaceship artwork" },
    { id: 3, url: `${SB}/interior-bar-ducks.jpg`, alt: "Standard Fare bar area with walnut bar, white stools, and Daniel Fairley art" },
    { id: 4, url: `${SB}/exterior-night.jpg`, alt: "Standard Fare storefront at night with warm glow" },
  ],

  // ── HERO CONTENT ───────────────────────────────────────────────────────────
  // All text and button labels shown on the hero/landing section.
  // Fully editable from the admin panel under "Hero Slideshow & Content".
  heroContent: {
    eyebrow:       "21 Phila St · Saratoga Springs, NY",
    title:         "Standard Fare",
    tagline:       "Creative American Dining\nBrunch, Dinner & Cocktails",
    ctaPrimaryLabel: "Reserve a Table",
    ctaSecondaryLabel: "View Menu",
  },


  about: {
    heading: "Creative American Dining",
    body: `At Standard Fare, our vision is Creative American Dining rooted in the tastes and traditions that bring us together. Inspired by the spirit of Saratoga Springs, we offer a fresh take on timeless favorites — blending nostalgia with imagination, comfort with craft.\n\nWe create a space where exceptional ingredients, genuine hospitality, and vibrant community come together at one table.\n\nOur mission is simple: honor the classics, elevate the experience, and set a new standard — one unforgettable meal at a time.\n\nThis is Standard Fare. Welcome to the new standard.`,
    owners: "Zac Denham & Clark Gale",
    ownersTitle: "Owners, Standard Fare & Bocage Champagne Bar",
    team: [
      {
        name: "Clark Gale",
        role: "Co-Founder / Owner",
        photo: "https://images.getbento.com/accounts/5595621cc83a57ef6a80e10126e2d090/media/images/14520Screen_Shot_2025-08-26_at_4.19.16_PM.png",
        bio: `Clark began his hospitality career as General Manager of NYC's iconic Cafeteria, where he led a major operational turnaround that set the tone for a career defined by growth, innovation, and transformation.\n\nHe has since brought his leadership and operational expertise to a range of high-profile brands, including Brooklyn Winery, Butter by Alex Guarnaschelli, 1 Oak, the Darby, Burger & Lobster, and Chow Down Hospitality Group. With a deep understanding of business mechanics and team development, Clark has helped shape successful ventures across the hospitality spectrum.\n\nAs Director of Operations for Barcade, Clark oversaw locations in seven states, implementing systems for hiring, training, and inventory while leading multiple new openings. His ability to scale operations and streamline complexity has made him a sought-after leader in the industry.\n\nClark's diverse background — spanning nightlife, fine dining, fast casual, and multi-state operations — makes him a recognized expert in hospitality strategy and execution.\n\nHe now owns CCG Hospitality, a consulting firm focused on systems implementation and pre-opening support for independent hospitality businesses. He is also a founding partner of Bocage Champagne Bar in Saratoga Springs and serves on the Board of Directors for Opera Saratoga.`,
      },
      {
        name: "Zac Denham",
        role: "Co-Founder / Owner",
        photo: "https://images.getbento.com/accounts/5595621cc83a57ef6a80e10126e2d090/media/images/40350Screen_Shot_2025-08-19_at_12.29.53_PM.png",
        bio: `Zac, a native of Louisiana, moved to New York City in 2009 to pursue a career in acting, performing on stages across NYC and the country. In 2015, he transitioned into the hospitality world, where his flair for storytelling found new expression through restaurant concepting and operations.\n\nZac has been instrumental in opening five acclaimed restaurants in New York City and London, including the flagship U.S. location of the UK-based Burger & Lobster. He worked alongside Michelin-starred chefs Dani García and Shaun Hergatt on high-profile projects such as CASA DANI at Hudson Yards and VESRTY in SoHo.\n\nIn the West Village, Zac led teams for Empellón Taqueria and da Toscano, where he worked under acclaimed chefs Alex Stupak and Michael Toscano. Da Toscano received national accolades from Esquire and Bloomberg for its inventive approach and intimate charm.\n\nAs founding partner of Bocage Champagne Bar in Saratoga Springs, Zac has shaped one of the region's most beloved destinations for sparkling wine and elevated hospitality. Under his creative direction, Bocage earned the New York State Restaurant Association's award for Best Social Media in 2023.\n\nWith Standard Fare, he brings sharp instincts and deep hospitality know-how to a concept that raises the bar — delivering comfort, style, and substance in a setting designed to leave a lasting impression.`,
      },
    ],
    imageUrl: `${SB}/owners-sign.jpg`,
    bocageUrl: "https://www.instagram.com/bocagechampagnebar/",
  },

  // ── HOURS & LOCATION ───────────────────────────────────────────────────────
  hours: [
    { day: "Monday",    open: "Gone Fishing",    close: "" },
    { day: "Tuesday",   open: "Gone Fishing",    close: "" },
    { day: "Wednesday", open: "11:30 AM",        close: "9:00 PM" },
    { day: "Thursday",  open: "11:30 AM",        close: "9:00 PM" },
    { day: "Friday",    open: "11:30 AM",        close: "10:00 PM" },
    { day: "Saturday",  open: "10:00 AM",        close: "10:00 PM" },
    { day: "Sunday",    open: "10:00 AM",        close: "9:00 PM" },
  ],
  hoursOverride: {
    enabled: false,
    message: "",        // e.g. "Closed for Private Event" or "Holiday Hours: Open 11AM–6PM"
    dates: "",          // e.g. "March 25" or "Dec 24-25"
  },
  location: {
    address: "21 Phila St",
    city: "Saratoga Springs, NY 12866",
    phone: "(518) 450-0876",
    email: "hello@standardfaresaratoga.com",
    // Google Maps place URL — links to the business listing
    googleMapsUrl: "https://www.google.com/maps/place/Standard+Fare/@43.0805865,-73.7848695,17z",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2918.3497089827!2d-73.78726468443652!3d43.08397567913977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89de0a3aa5dc0b2b%3A0xcb1a8e9c4eb5c68e!2s21%20Phila%20St%2C%20Saratoga%20Springs%2C%20NY%2012866!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus",
  },

  // ── SITE SETTINGS ──────────────────────────────────────────────────────────
  settings: {
    previewMode:      true,   // true = password gate shown to visitors
    showOrderButton:  true,   // true = "Order" button visible in navbar for visitors
    showBottleShop:   true,   // true = "Bottle Shop" page and homepage preview visible
    showPaintings:    true,   // true = "Paintings" section visible; requires unlock password to toggle
    adminPassword:    "zacnclark4evr<3",   // owner login password
    previewPassword:  "sf26",  // visitor preview password
  },

  // ── HAPPY HOUR / DAILY SPECIALS ───────────────────────────────────────────
  specials: [
    {
      id: "sp1", title: "Happy Hour", description: "$8 cocktails, $5 drafts, half-price oysters",
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      startTime: "16:00", endTime: "18:00", active: true,
    },
    {
      id: "sp2", title: "Wine Wednesday", description: "Half-price bottles of wine all evening",
      days: ["wednesday"], startTime: "17:00", endTime: "22:00", active: true,
    },
    {
      id: "sp3", title: "Sunday Brunch", description: "Bottomless mimosas with any brunch entrée — $25",
      days: ["sunday"], startTime: "10:00", endTime: "15:00", active: true,
    },
  ],

  // ── TESTIMONIALS ────────────────────────────────────────────────────────────
  // Real Google reviews (67 five-star) — imported from data/googleReviews.js.
  // Auto-refreshed by /api/google-reviews in production; these are fallback.
  testimonials: googleReviews,

  // ── SMS TEXT CLUB ───────────────────────────────────────────────────────────
  smsClub: {
    enabled: true,
    headline: "Join the Text Club",
    subtext: "Get exclusive deals, event invites, and flash specials delivered straight to your phone.",
    keyword: "STANDARDFARE",
    shortcode: "12345",
    webhookUrl: "", // Twilio/webhook endpoint — set when ready
  },

  // ── NEWSLETTER ──────────────────────────────────────────────────────────────
  newsletter: {
    drafts: [],
    sent: [],
  },

  // ── POPULAR NOW (Toast integration placeholder) ─────────────────────────────
  popularNow: {
    enabled: true,
    // Toast credentials are set as Vercel env vars (TOAST_API_KEY, TOAST_RESTAURANT_ID)
    manualItems: [
      { name: "Beef Short Rib", category: "menu" },
      { name: "Mom's Meatloaf", category: "menu" },
      { name: "Phila Street Low Life", category: "menu" },
      { name: "Slow Burn", category: "menu" },
    ],
  },

  // ── MENUS ──────────────────────────────────────────────────────────────────
  // Each menu has a name and an array of sections, each with items
  // ── MENUS ──────────────────────────────────────────────────────────────────
  // glutenFree: true marks an item with a small GF badge on the menu page.
  // Admin can toggle this per item in Admin → Menus.
  menus: {
    brunch: {
      name: "Brunch",
      note: "Served Saturday & Sunday, 10AM–3PM",
      sections: [
        {
          title: "For the Table",
          items: [
            { name: "Housemade Biscuits", description: "Orange honey butter", price: "15" },
            { name: "Swedish Meatballs", description: "Pork & beef, lingonberry, shroom au poivre", price: "17", gf: true },
            { name: "Disco Fries", description: "Homemade beef chili, pickled red onion, cheddar cheese, chive", price: "17" },
            { name: "Mushroom Duxelles", description: "Parmesan, crunchy garlic baguette, soft herbs", price: "18", veg: true },
          ],
        },
        {
          title: "Get Your Greens On",
          items: [
            { name: "Green Goddess", description: "Heirloom tomato, basil & walnut pesto", price: "14", gf: true, veg: true },
          ],
        },
        {
          title: "The Main Event",
          items: [
            { name: "The Standard Burger", description: "Bacon jam, standard sauce, grilled onion, fries", price: "23" },
            { name: "Whipped Ricotta Toast", description: "Stewed heirlooms, jammy eggs, pickled fresno, simple salad (add bacon jam +$6)", price: "19" },
            { name: "The Ultimate Breakfast Sammie", description: "Bacon jam, fluffy egg, american cheese, simple salad", price: "19" },
            { name: "Creamed Spinach & Eggs Casserole", description: "Parmesan, fontina, shallot, simple salad", price: "18" },
            { name: "Cereal & Milk Parfait", description: "Vanilla greek yogurt, fruity pebbles, fresh fruit", price: "15", veg: true },
            { name: "Meat & Potatoes", description: "6oz steak, red pepper home fries, salsa verde, two eggs, arugula salad", price: "24", gf: true },
            { name: "Homemade Chili & Eggs", description: "Beef chili, cheddar cheese, 2 eggs, scallion", price: "19" },
            { name: "Clark's Hangover Cure", description: "Open faced — smoked bacon, tomato relish, comté, jammy egg, arugula salad", price: "22" },
          ],
        },
        {
          title: "Sides",
          items: [
            { name: "Simple Salade", description: "Lightly dressed mixed greens", price: "9", gf: true },
            { name: "Smoked Bacon", description: "", price: "9", gf: true },
            { name: "Beyond Breakfast Sausage", description: "Plant-based", price: "13", gf: true, veg: true },
            { name: "Parmesan Truffle Fries", description: "Parmesan, truffle oil, chive", price: "15" },
          ],
        },
      ],
    },
    dinner: {
      name: "Dinner",
      note: "Served Tuesday–Sunday from 5PM",
      sections: [
        {
          title: "Starters",
          items: [
            { name: "Swedish Meatballs", description: "Pork & beef, lingonberry, mushroom au poivre", price: "17", gf: true },
            { name: "Charred Artichoke", description: "Tzatziki, pickled chiles, crispy caper", price: "17", gf: true },
            { name: "Broiled Oysters Bienville", description: "Mushroom, andouille, parmesan", price: "26" },
            { name: "Fire Roasted Carrots", description: "Cashew sauce, chili glaze, thyme", price: "16", gf: true, veg: true },
            { name: "Baked Raclette", description: "Fingerling potato, dijon, andouille", price: "19" },
            { name: "Fennel Rubbed Pork Belly", description: "Cannellini beans, shallot, salsa verde", price: "25", gf: true },
            { name: "Mushroom Duxelles", description: "Parmesan, crunchy garlic baguette, soft herbs", price: "18", veg: true },
          ],
        },
        {
          title: "Salads",
          items: [
            { name: "Broccoli & Kale Caesar", description: "Parmesan breadcrumb, lemon zest, 6-minute egg", price: "18" },
            { name: "Winter Citrus Salad", description: "Radicchio, frisée, pear, blood orange vinaigrette", price: "18", gf: true, veg: true },
            { name: "Green Goddess", description: "Local greens, heirloom tomato, basil-walnut pesto", price: "18", gf: true, veg: true },
          ],
        },
        {
          title: "Mains",
          items: [
            { name: "The Standard Burger", description: "Bacon jam, standard sauce, grilled onion, fries", price: "23" },
            { name: "Zac's Spicy Chicken", description: "Fire roasted peppers, wilted greens, parsnip purée", price: "32", gf: true },
            { name: "Mom's Meatloaf", description: "Haricot vert, tomato relish, sour cream mash", price: "26" },
            { name: "Chilean Seabass", description: "Parsnip purée, wilted greens, orange glaze", price: "42", gf: true },
            { name: "Smoked Pork Chop", description: "Apple chutney, potato latke, chive sour cream", price: "38", gf: true },
            { name: "Roasted Cauliflower", description: "Arugula, toasted pine nuts, lemon-basil vinaigrette", price: "29", gf: true, veg: true },
            { name: "Beef Short Rib", description: "Braised red cabbage, sour cream mash", price: "36" },
            { name: "Wild Mushroom Risotto", description: "Saffron, parmesan, thyme", price: "34", gf: true, veg: true },
            { name: "8oz Australian Wagyu Tenderloin", description: "Potato croissant, beech mushroom bordelaise", price: "79" },
          ],
        },
        {
          title: "Sides",
          items: [
            { name: "Green Beans", description: "Haricot vert, garlic, lemon", price: "9", gf: true },
            { name: "Herbed Mash", description: "Butter, chive, cream", price: "9", gf: true },
            { name: "Wilted Greens", description: "Seasonal greens, garlic, olive oil", price: "9", gf: true },
            { name: "Parsnip Purée", description: "Silky roasted parsnip with cream and butter", price: "9", gf: true },
            { name: "Parmesan Truffle Fries", description: "Truffle oil, parmesan, chive", price: "15" },
            { name: "Mac N Cheese", description: "Three-cheese blend, breadcrumb crust", price: "11" },
          ],
        },
      ],
    },
    drinks: {
      name: "Cocktails & Beer",
      sections: [
        {
          title: "House Cocktails",
          items: [
            { name: "Citrus Got Real", description: "Cimarron tequila, blood orange, agave", price: "15" },
            { name: "A Good, Old Fashioned Float", description: "Willett bourbon, Abita root beer syrup, vanilla cold foam", price: "18" },
            { name: "...Baby One More Thyme", description: "Hayman's dry gin, Giffard ginger liqueur, soda", price: "15" },
            { name: "Take Me Back to Manhattan", description: "Witches' Tree rye, fig infused vermouth, black walnut bitters", price: "17" },
            { name: "Slow Burn", description: "Bond Street vodka, smoked blueberry syrup, ginger beer", price: "15" },
            { name: "That's So Cosmo", description: "Bond Street vodka, tart cherry, fresh lime", price: "16" },
            { name: "Hurricane Alice", description: "Wildcat rum, passion fruit, lime, orange juice, cherry", price: "16" },
          ],
        },
        {
          title: "Martinis",
          items: [
            { name: "The Sauvy B", description: "Truman vodka, elderflower, sauvignon blanc, lemon", price: "18" },
            { name: "Black Tie Gibson", description: "Hayman's dry gin, Dolin blanc, shallot vinegar, black pepper", price: "18" },
            { name: "Oceanside Vesper", description: "Gin Eva Mediterranean, Truman vodka, Cocchi Americano", price: "18" },
            { name: "Quick & Dirty", description: "Truman vodka, G.E. Massenez Liqueur de Roquefort", price: "18" },
          ],
        },
        {
          title: "Beer",
          items: [
            { name: "Pabst Blue Ribbon", description: "Classic American lager", price: "6" },
            { name: "Phila Street Low Life", description: "Whitman Brewing Co. collab · Hazy IPA", price: "9" },
            { name: "Guinness Extra Stout", description: "Rich, roasty Irish stout", price: "9" },
            { name: "Abita Seasonal", description: "Rotating seasonal craft", price: "8" },
          ],
        },
      ],
    },
    wine: {
      name: "Wine",
      note: "Wines by the Glass & Bottle",
      sections: [
        {
          title: "Sparkling",
          items: [
            { name: "Bocage Everyday Cuvée", description: "Burgundy, FR · NV · Pinot Noir, Chardonnay, Aligoté · Glass $16", price: "60" },
            { name: "Le Coulture Prosecco Rosé", description: "Veneto, IT · NV · Glera, Pinot Nero · Glass $14", price: "45" },
            { name: "Champagne Emile Paris", description: "Champagne, FR · NV · Pinot Noir, Chardonnay, Pinot Meunier · Glass $19", price: "70" },
          ],
        },
        {
          title: "White",
          items: [
            { name: "Comtesse Marion", description: "Languedoc-Roussillon, FR · 2024 · Sauvignon Blanc · Glass $15", price: "50" },
            { name: "Domaine Chatelain de Oliveira Chablis", description: "Burgundy, FR · 2023 · Chardonnay · Glass $18", price: "65" },
            { name: "Incipio", description: "Loire Valley, FR · 2022 · Carignan Blanc · Glass $16", price: "56" },
            { name: "Lagar de Cervera Pazo de Seoane", description: "Galicia, SP · 2024 · Albariño, Loureira, Treixadura · Glass $16", price: "56" },
          ],
        },
        {
          title: "Rosé & Skin Contact",
          items: [
            { name: "Annesanti Nasciolo Rosato", description: "Umbria, IT · 2024 · Barbera · Glass $14", price: "45" },
            { name: "Chateau de Pampelonne Rosé", description: "Provence, FR · 2024 · Cinsault, Grenache, Mourvèdre, Syrah · Glass $17", price: "64" },
          ],
        },
        {
          title: "Red",
          items: [
            { name: "Marziano Abbona Dogliani 'Papa Celso'", description: "Piedmont, IT · 2024 · Dolcetto · Glass $19", price: "70" },
            { name: "Domaine Damien Martin", description: "Burgundy, FR · 2023 · Pinot Noir · Glass $17", price: "60" },
            { name: "Delta", description: "California, USA · 2024 · Cabernet Sauvignon · Glass $16", price: "56" },
            { name: "Apollo's Praise", description: "New York, USA · 2024 · Cabernet Franc · Glass $17", price: "60" },
            { name: "Bodegas Loli Casado", description: "Rioja, SP · 2021 · Tempranillo, Graciano, Mazuelo · Glass $14", price: "45" },
            { name: "Chateau Laffitte Laujac", description: "Bordeaux, FR · 2019 · Cabernet Sauvignon, Merlot, Petit Verdot · Glass $22", price: "78" },
          ],
        },
      ],
    },
    dessert: {
      name: "Dessert",
      sections: [
        {
          title: "Sweets",
          items: [
            { name: "Crème Brûlée", description: "Classic vanilla, caramelized sugar crust", price: "12", gf: true, veg: true },
            { name: "Chocolate Lava Cake", description: "Warm chocolate center, vanilla bean ice cream", price: "14", veg: true },
            { name: "Seasonal Sorbet", description: "Three scoops, chef's daily selection", price: "10", gf: true, veg: true },
            { name: "Cheese Plate", description: "Three artisan cheeses, honeycomb, fig jam, crackers", price: "18" },
          ],
        },
      ],
    },
  },



  // ── GALLERY ────────────────────────────────────────────────────────────────
  // Replace via Admin panel with real photos from @standardfaresaratoga or
  // upload directly via the admin panel (uploads go to Supabase Storage).
  // `url` = the image, `instagramUrl` = the post link on click/hover.
  gallery: [
    { id: 1,  url: `${SB}/interior-evening-ducks.jpg`, alt: "Standard Fare evening atmosphere with guests, duck painting, exposed brick", comment: "Evening at Standard Fare", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 2,  url: `${SB}/interior-banquettes-fairley.jpg`, alt: "Blue banquettes and Daniel Fairley hamburger spaceship artwork", comment: "Blue banquettes · Daniel Fairley art", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 3,  url: `${SB}/interior-bar-ducks.jpg`, alt: "Bar area with walnut bar, white stools, and duck painting", comment: "The bar at Standard Fare", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 4,  url: `${SB}/interior-booths-art.jpg`, alt: "Rust-colored booths with bird art gallery wall", comment: "Booths · bird prints · terrazzo floor", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 5,  url: `${SB}/beef-short-rib.jpg`, alt: "Beef Short Rib with braised red cabbage and sour cream mash", comment: "Beef Short Rib · braised red cabbage · mash", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 6,  url: `${SB}/moms-meatloaf.jpg`, alt: "Mom's Meatloaf with haricot vert, tomato relish, and mashed potatoes", comment: "Mom's Meatloaf · haricot vert · tomato relish", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 7,  url: `${SB}/standard-burger.jpg`, alt: "The Standard Burger with fries and ketchup", comment: "The Standard Burger · bacon jam · fries", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 8,  url: `${SB}/swedish-meatballs.jpg`, alt: "Swedish Meatballs with mushroom au poivre", comment: "Swedish Meatballs · lingonberry · shroom au poivre", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 9,  url: `${SB}/pork-belly-dish.jpg`, alt: "Fennel-rubbed pork belly with salsa verde", comment: "Pork Belly · cannellini · salsa verde", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 10, url: `${SB}/cocktail-martini.png`, alt: "Martini cocktail with olive garnish at the bar", comment: "Black Tie Gibson", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 11, url: `${SB}/cocktail-citrus.jpg`, alt: "Citrus Got Real cocktail with dried blood orange", comment: "Citrus Got Real · blood orange · agave", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 12, url: `${SB}/cocktail-old-fashioned-float.jpg`, alt: "A Good Old Fashioned Float with vanilla cold foam", comment: "A Good, Old Fashioned Float", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 13, url: `${SB}/milkshake-birthday.jpg`, alt: "Go Shawty birthday milkshake with sprinkles and funfetti cupcake", comment: "Go Shawty, It's Your Birthday", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 14, url: `${SB}/vegetable-napoleon.jpg`, alt: "Layered vegetable napoleon with zucchini, tomato, and mozzarella", comment: "Seasonal vegetable napoleon", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 15, url: `${SB}/pineapple-cake.jpg`, alt: "Pineapple upside down cake with vanilla ice cream", comment: "Pineapple Upside Down Cake · vanilla ice cream", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 16, url: `${SB}/exterior-day-awning.jpg`, alt: "Standard Fare storefront with cream awning on Phila Street", comment: "21 Phila St · Saratoga Springs", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 17, url: `${SB}/exterior-night.jpg`, alt: "Standard Fare at night with warm lighting", comment: "Evening on Phila Street", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 18, url: `${SB}/owners-sign.jpg`, alt: "Clark Gale and Zac Denham at the Standard Fare sign", comment: "Clark & Zac · Co-Founders", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 19, url: `${SB}/daniel-fairley-ducks.jpg`, alt: "Artist Daniel Fairley with his duck painting at Standard Fare", comment: "Daniel Fairley · our resident artist", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 20, url: `${SB}/group-dining-ducks.jpg`, alt: "Group dining in front of Daniel Fairley duck painting", comment: "Private dining at Standard Fare", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 21, url: `${SB}/server-champagne.jpg`, alt: "Chef Joe Michaud presenting champagne tableside", comment: "Chef Joe Michaud · Executive Chef", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 22, url: `${SB}/phila-street-4pack.jpg`, alt: "Phila Street Low Life Hazy IPA 4-pack with poured glass", comment: "Phila Street Low Life · Whitman Brewing Co.", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 23, url: `${SB}/bocage-cuvee-closeup.jpg`, alt: "Bocage Every Day Cuvée Crémant de Bourgogne label", comment: "Bocage Every Day Cuvée", instagramUrl: "https://www.instagram.com/bocagechampagnebar/", mediaType: "image" },
    { id: 24, url: `${SB}/send-fries-branded.jpg`, alt: "Standard Fare branded burger box with Send Fries message", comment: "Send Fries? · Love at First Bite", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 25, url: `${SB}/branded-apron-mugs.jpg`, alt: "Yellow mugs stacked with SF branded apron", comment: "Standard Fare merch", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 26, url: `${SB}/welcome-sign.jpg`, alt: "Welcome Please Wait To Be Seated illuminated sign", comment: "Welcome to Standard Fare", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 27, url: `${SB}/exterior-pink-cart.jpg`, alt: "Standard Fare and Bocage storefronts with pink golf cart", comment: "Standard Fare & Bocage · 21 Phila St", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
    { id: 28, url: `${SB}/storefront-illustration.jpg`, alt: "Watercolor illustration of Standard Fare storefront", comment: "Standard Fare · American Comfort Food", instagramUrl: "https://www.instagram.com/standardfaresaratoga/", mediaType: "image" },
  ],

  // ── PRESS ──────────────────────────────────────────────────────────────────
  // Each press item includes a `logo` field — the publication's logo image URL.
  // Logo URLs use each publication's own CDN / favicon / logo where publicly available.
  press: [
    {
      id: 1,
      outlet: "Saratoga Report",
      headline: "\"Of all the new places, the one that intrigues me the most is Standard Fare.\"",
      url: "https://saratoga-report.com/column/",
      logo: "https://www.google.com/s2/favicons?domain=saratoga-report.com&sz=128",
    },
    {
      id: 2,
      outlet: "Saratoga.com",
      headline: "Standard Fare Brings Elevated Comfort Food to Downtown Saratoga",
      url: "https://www.saratoga.com/whatsnew/",
      logo: "https://www.google.com/s2/favicons?domain=saratoga.com&sz=128",
    },
    {
      id: 3,
      outlet: "Good + Tasty",
      headline: "The Anything But Ordinary Standard Fare Makes a Bow in Saratoga",
      url: "https://kathleenwillcox.substack.com/p/the-anything-but-ordinary-standard",
      logo: pressInitials("Good Tasty"),
    },
    {
      id: 4,
      outlet: "The Dispatch Saratoga Springs",
      headline: "First Look: Standard Fare, Phila Street's Newest Treat",
      url: "https://saratogadispatch.substack.com/p/standard-fare-new-approach-phila-street-saratoga",
      logo: pressInitials("Saratoga Dispatch"),
    },
    {
      id: 5,
      outlet: "The Daily Gazette",
      headline: "Saratoga Springs' Restaurant Standard Fare Sets Opening Day",
      url: "https://www.dailygazette.com/food/bite-sized/saratoga-springs-restaurant-standard-fare-sets-opening-day--bite-sized/article_f4b47b6e-c7d4-4836-8e4b-d576162289ed.html",
      logo: "https://www.google.com/s2/favicons?domain=dailygazette.com&sz=128",
    },
    {
      id: 6,
      outlet: "Times Union",
      headline: "Bocage Boys Branch Out, to Open Standard Fare on Phila Street",
      url: "https://www.timesunion.com/food/article/bocage-boys-saratoga-springs-open-standard-fare-20761008.php",
      logo: "https://www.google.com/s2/favicons?domain=timesunion.com&sz=128",
    },
    {
      id: 7,
      outlet: "Albany Business Review",
      headline: "New Restaurant Standard Fare Prepares to Open in Saratoga",
      url: "https://www.bizjournals.com/albany/news/2025/07/24/standard-fare-saratoga-bocage-owners.html",
      logo: "https://www.google.com/s2/favicons?domain=bizjournals.com&sz=128",
    },
    {
      id: 8,
      outlet: "NEWS10 ABC",
      headline: "New Comfort Food Restaurant Coming to Saratoga Springs",
      url: "https://www.news10.com/news/new-comfort-food-restaurant-coming-to-saratoga-springs/",
      logo: "https://www.google.com/s2/favicons?domain=news10.com&sz=128",
    },
    {
      id: 9,
      outlet: "The Post-Star",
      headline: "New Restaurant Brings Fine Food, Fun Atmosphere to Downtown Saratoga",
      url: "https://poststar.com/news/local/new-restaurant-brings-fine-food-fun-atmosphere-to-downtown-saratoga/",
      logo: "https://www.google.com/s2/favicons?domain=poststar.com&sz=128",
    },
    {
      id: 10,
      outlet: "Saratoga Food Fanatic",
      headline: "New Restaurant, Who Dis? — Standard Fare Opens on Phila Street",
      url: "https://saratogafoodfanatic.com/standard-fare/",
      logo: "https://www.google.com/s2/favicons?domain=saratogafoodfanatic.com&sz=128",
    },
    {
      id: 11,
      outlet: "Saratoga Living",
      headline: "Standard Fare Joins Growing List of New Phila Street Restaurants",
      url: "https://saratogaliving.com/standard-fare-phila-street-saratoga/",
      logo: "https://www.google.com/s2/favicons?domain=saratogaliving.com&sz=128",
    },
  ],

  // ── EVENTS ─────────────────────────────────────────────────────────────────
  // Events connect to Toast for ticket sales. See README-TOAST.md for setup.
  events: [
    // ── UPCOMING ──
    {
      id: 1,
      title: "Apollo's Praise Wine Tasting",
      date: "2026-04-12",
      time: "6:30 PM – 9:00 PM",
      description:
        "Join us for an intimate evening with Apollo's Praise winery. Explore their acclaimed lineup of natural wines paired with bespoke small plates crafted by our kitchen team. Space is extremely limited.",
      price: 95,
      capacity: 24,
      venue: "standard-fare",
      imageUrl: `${SB}/cocktail-purple.webp`,
      toastProductId: null,
      ticketUrl: "https://resy.com/cities/saratoga-springs-ny/venues/standard-fare",
    },
    // ── PAST — Standard Fare ──
    {
      id: 100,
      title: "Next Door Provisions — Filipino Menu Takeover",
      date: "2026-02-23",
      time: "7:00 PM",
      description:
        "A one-night-only Filipino menu takeover featuring guest chef Ruby Felix-Curtis of Next Door Provisions (Jersey City, NJ). Born in the Philippines and trained at the French Culinary Institute, Chef Ruby presented a thoughtfully curated prix-fixe menu designed to immerse guests in Filipino culture and tradition. One seating only.",
      price: 125,
      capacity: null,
      venue: "standard-fare",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 101,
      title: "Sip & Sing with Opera Saratoga",
      date: "2025-09-11",
      time: "4:00 PM – 6:00 PM",
      description:
        "An opera-themed happy hour featuring soprano Christine Taylor Price and pianist Karen Becker. The evening included a cocktail party with mingling, beverages, and snacks, followed by approximately 40 minutes of live vocal performances by Opera Saratoga Festival Artists.",
      price: 50,
      capacity: null,
      venue: "standard-fare",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 102,
      title: "Saratoga Restaurant Week — 20th Annual",
      date: "2025-11-03",
      time: "Dinner Service",
      description:
        "Standard Fare participated as a first-time entrant in Discover Saratoga's 20th Annual Restaurant Week, offering a three-course prix-fixe dinner featuring creative American dishes including our signature zucchini lasagna.",
      price: 35,
      capacity: null,
      venue: "standard-fare",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 103,
      title: "Thanksgiving Meals To-Go",
      date: "2025-11-27",
      time: "Pickup 8:00 AM – 12:00 PM",
      description:
        "A full Thanksgiving dinner package to go, serving 4–6 people, featuring all the holiday essentials and two loaves of egg & onion bread. Orders accepted November 10–23.",
      price: 129,
      capacity: null,
      venue: "standard-fare",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    // ── PAST — Bocage Champagne Bar ──
    {
      id: 200,
      title: "NYE 2026: The Champagne Time Capsule",
      date: "2025-12-31",
      time: "Evening",
      description:
        "An exclusive New Year's Eve experience for wine lovers and collectors. Featuring a 15-liter bottle of Drappier Carte d'Or, rare back-vintage champagne selections, luxury small bites, caviar, curated all-night open bar, and a communal countdown to the new year.",
      price: 0,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 201,
      title: "Seaside Sips — Portuguese Wine Tasting",
      date: "2025-06-29",
      time: "2:00 PM & 5:00 PM Sessions",
      description:
        "A six-wine and food pairing event celebrating the coastal wines of Portugal. Hosted by Eva Wildrick and Beth Antias from Regal Wine Imports for a tasting tour through Portugal's diverse wine regions, from mineral-driven whites to juicy reds.",
      price: 110,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 202,
      title: "National Rosé Day Celebration",
      date: "2025-06-12",
      time: "All Day",
      description:
        "A special sparkling rosé flight for National Rosé Day featuring four distinct rosés. A one-day-only celebration of all things pink and bubbly.",
      price: 45,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 203,
      title: "Graham Beck Cellar Master Tasting",
      date: "2025-06-01",
      time: "Evening",
      description:
        "A special tasting featuring South African Graham Beck wines, including oysters and cheese plates, hosted by Graham Beck Cellar Master Pieter Ferreira.",
      price: 0,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 204,
      title: "Toast to Pride — Pride Month Celebration",
      date: "2024-06-11",
      time: "4:30 PM",
      description:
        "A Saratoga Pride Month celebration and pre-show reception before the Pride Open Mic Night at Caffe Lena. Celebrating community, inclusivity, and great champagne.",
      price: 0,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 205,
      title: "Bocage x Saratoga Arms Wine Dinner",
      date: "2024-05-09",
      time: "6:00 PM",
      description:
        "A pop-up dinner collaboration between Bocage Champagne Bar and Saratoga Arms Hotel. A curated evening of exquisite bubbly and still wine pairings with elegant cuisine.",
      price: 0,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 206,
      title: "NYE 2023 — New Year's Eve Wine Dinner",
      date: "2023-12-31",
      time: "6:00 PM – 9:00 PM",
      description:
        "A five-course chef's tasting menu paired with five premium wines and champagnes. Guests received a complimentary welcome beverage upon arrival.",
      price: 0,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
    {
      id: 207,
      title: "Pet-Nat Palooza",
      date: "2025-11-02",
      time: "All Day",
      description:
        "A one-day outdoor celebration of all things pétillant naturel wine at Farm House Food. Unlimited pours at three pet-nat stations, kegged bubbles, outdoor games, vinyl DJ sets, and farm-fresh food.",
      price: 0,
      capacity: null,
      venue: "bocage",
      imageUrl: "",
      toastProductId: null,
      ticketUrl: "",
    },
  ],

  // ── ARTIST PRINTS ──────────────────────────────────────────────────────────
  // Works by Daniel Fairley (poemdexter). Sold directly on this site with Toast.
  prints: [
    {
      id: 1,
      title: "Print Me Like One of Thad's Picks",
      artist: "Daniel Fairley",
      medium: "Acrylic on Canvas",
      price: 2000,
      imageUrl: "https://assets.bigcartel.com/product_images/415618041/printme.jpeg?auto=format&fit=max&w=800",
      available: true,
      stock: 1, // original painting — only 1 exists
      description: "An irreverent ode to the racing culture that defines Saratoga. Acrylic on canvas, 24×30in.",
      toastProductId: null, // fill in after Toast setup
    },
    {
      id: 2,
      title: "Weird Hand #1",
      artist: "Daniel Fairley",
      medium: "Acrylic on Canvas",
      price: 1200,
      imageUrl: "https://assets.bigcartel.com/product_images/408987936/hand.jpeg?auto=format&fit=max&w=800",
      available: true,
      stock: 1,
      description: "Broadly accessible absurdity. Acrylic on canvas, 18×24in.",
      toastProductId: null,
    },
    {
      id: 3,
      title: "Thad's Pick",
      artist: "Daniel Fairley",
      medium: "Acrylic on Canvas",
      price: 1800,
      imageUrl: "https://assets.bigcartel.com/product_images/408987864/horse.jpg?auto=format&fit=max&w=800",
      available: false,
      stock: 0,
      description: "The iconic horse painting that started it all. Sold out.",
      toastProductId: null,
    },
    {
      id: 4,
      title: "Thad's Pick Again",
      artist: "Daniel Fairley",
      medium: "Acrylic on Canvas",
      price: 1800,
      imageUrl: "https://assets.bigcartel.com/product_images/409387863/9FCB6F3F-A601-4A09-BC4A-ABE1B7864BE4.jpg?auto=format&fit=max&w=800",
      available: false,
      stock: 0,
      description: "The sequel. Same energy, new stride. Sold out.",
      toastProductId: null,
    },
    {
      id: 5,
      title: "Duck, Duck, Goose",
      artist: "Daniel Fairley",
      medium: "Watercolor",
      price: 950,
      imageUrl: "https://assets.bigcartel.com/product_images/408987837/duck.jpg?auto=format&fit=max&w=800",
      available: false,
      stock: 0,
      description: "Playful watercolor study. Sold out.",
      toastProductId: null,
    },
    {
      id: 6,
      title: "Space Pickle",
      artist: "Daniel Fairley",
      medium: "Watercolor",
      price: 750,
      imageUrl: "https://assets.bigcartel.com/product_images/408987945/pickle.jpg?auto=format&fit=max&w=800",
      available: false,
      stock: 0,
      description: "What it says on the label. Sold out.",
      toastProductId: null,
    },
  ],

  // ── BOTTLE SHOP ──────────────────────────────────────────────────────────
  bottles: [
    {
      id: "btl1", name: "Château Margaux 2018", category: "wine",
      varietal: "Cabernet Sauvignon Blend", region: "Bordeaux, France",
      description: "A full-bodied red with layers of dark fruit, cedar, and silky tannins. Pairs beautifully with our dry-aged steak.",
      price: 85, imageUrl: `${LB}/chateau-margaux.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl2", name: "Cloudy Bay Sauvignon Blanc", category: "wine",
      varietal: "Sauvignon Blanc", region: "Marlborough, New Zealand",
      description: "Crisp and refreshing with notes of citrus, passionfruit, and fresh-cut grass.",
      price: 42, imageUrl: `${LB}/cloudy-bay.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl3", name: "Whispering Angel Rosé", category: "wine",
      varietal: "Rosé", region: "Côtes de Provence, France",
      description: "Pale pink with aromas of fresh strawberry and white peach. Light, elegant, and endlessly drinkable.",
      price: 38, imageUrl: `${LB}/whispering-angel.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl4", name: "Veuve Clicquot Brut", category: "wine",
      varietal: "Champagne", region: "Champagne, France",
      description: "Golden yellow with fine bubbles. Notes of toasted brioche, pear, and a long mineral finish.",
      price: 72, imageUrl: `${LB}/veuve-clicquot.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl5", name: "Sloop Brewing Juice Bomb", category: "beer",
      varietal: "IPA", region: "East Fishkill, NY",
      description: "A hazy, juicy IPA bursting with tropical hop flavor. Citrus-forward with a smooth, pillowy mouthfeel.",
      price: 16, imageUrl: `${LB}/sloop-juice-bomb.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl6", name: "Pilsner Urquell", category: "beer",
      varietal: "Pilsner", region: "Plzeň, Czech Republic",
      description: "The original pilsner. Golden, crisp, and balanced with a noble hop bitterness and bready malt character.",
      price: 12, imageUrl: `${LB}/pilsner-urquell.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl7", name: "Guinness Draught Stout", category: "beer",
      varietal: "Stout", region: "Dublin, Ireland",
      description: "Velvety dark with roasted barley, chocolate, and coffee notes. Creamy head, dry finish.",
      price: 14, imageUrl: `${LB}/guinness-stout.svg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl8", name: "Common Roots Brewing American Blonde", category: "beer",
      varietal: "Blonde Ale", region: "South Glens Falls, NY",
      description: "Light, easy-drinking blonde ale with a hint of honey and citrus. A local favorite.",
      price: 14, imageUrl: `${LB}/common-roots.svg`,
      available: false, toastProductId: null,
    },
    {
      id: "btl9", name: "Phila Street Low Life", category: "beer",
      varietal: "Hazy IPA", region: "Whitman Brewing Co. · Saratoga Springs, NY",
      description: "Our collaboration brew with Whitman Brewing Co. A hazy, juicy IPA named after our home on Phila Street. Tropical and citrus-forward.",
      price: 9, imageUrl: `${SB}/phila-street-4pack.jpg`,
      available: true, toastProductId: null,
    },
    {
      id: "btl10", name: "Bocage Every Day Cuvée", category: "wine",
      varietal: "Crémant de Bourgogne", region: "Burgundy, France",
      description: "Our sister bar Bocage Champagne Bar's house sparkling wine. Fine bubbles, crisp apple and brioche notes. Perfect for any occasion.",
      price: 18, imageUrl: `${SB}/bocage-cuvee-bottle.jpg`,
      available: true, toastProductId: null,
    },
  ],

  // ── MERCHANDISE ───────────────────────────────────────────────────────────
  merch: [
    {
      id: "merch1",
      name: "Standard Fare Logo Tee",
      category: "Apparel",
      description: "100% cotton heavyweight tee with our flamingo logo screen-printed on the front. Unisex fit. Available in Navy and Cream.",
      price: 35,
      imageUrl: `${SB}/branded-apron-mugs.jpg`,  // unique: apron + mugs photo
      variants: "S / M / L / XL / XXL",
      available: true,
      toastProductId: null,
    },
    {
      id: "merch2",
      name: "Standard Fare Dad Hat",
      category: "Apparel",
      description: "Embroidered flamingo on a relaxed-fit six-panel cap. Adjustable buckle strap. One size fits all.",
      price: 28,
      imageUrl: `${SB}/open-sign-duck.jpg`,
      variants: "One Size",
      available: true,
      toastProductId: null,
    },
    {
      id: "merch3",
      name: "Flamingo Enamel Pin",
      category: "Accessories",
      description: "Hard enamel pin with our signature flamingo. Gold-plated metal with double rubber clutch backing.",
      price: 12,
      imageUrl: `${SB}/send-fries-branded.jpg`,
      variants: "",
      available: true,
      toastProductId: null,
    },
    {
      id: "merch4",
      name: "Standard Fare Tote Bag",
      category: "Accessories",
      description: "Heavyweight canvas tote with 'Standard Fare · Saratoga Springs' printed in our signature display font. Perfect for the farmers market.",
      price: 22,
      imageUrl: `${SB}/burger-box-closeup.jpg`,
      variants: "",
      available: true,
      toastProductId: null,
    },
    {
      id: "merch5",
      name: "Cocktail Recipe Card Set",
      category: "Home",
      description: "Letterpress-printed recipe cards featuring 6 of our most popular cocktails. Printed on 110lb cotton stock with gold foil accents.",
      price: 18,
      imageUrl: `${SB}/cocktails-shelf.jpg`,
      variants: "",
      available: true,
      toastProductId: null,
    },
    {
      id: "merch6",
      name: "Standard Fare Crewneck",
      category: "Apparel",
      description: "Midweight French terry crewneck sweatshirt. Embroidered flamingo on the chest. Navy with cream stitching.",
      price: 65,
      imageUrl: `${SB}/owners-tv-appearance.jpg`,
      variants: "S / M / L / XL",
      available: false,
      toastProductId: null,
    },
  ],

  // ── INSTAGRAM FEED — 3 curated posts shown at top of gallery ──────────────
  instagramFeed: [
    { id: "ig1", imageUrl: `${SB}/promo-easter-brunch.jpg`, postUrl: "https://www.instagram.com/standardfaresaratoga/", caption: "Easter Brunch at Standard Fare" },
    { id: "ig2", imageUrl: `${SB}/promo-girl-dinner.jpg`, postUrl: "https://www.instagram.com/standardfaresaratoga/", caption: "Girl Dinner · every Wednesday" },
    { id: "ig3", imageUrl: `${SB}/zac-cupcake.jpg`, postUrl: "https://www.instagram.com/standardfaresaratoga/", caption: "Life is what you bake it" },
  ],

  // ── BLOG / "FROM THE KITCHEN" ───────────────────────────────────────────────
  blog: [
    {
      id: 1, title: "Why We Dry-Age Our Own Steaks", slug: "dry-aged-steaks",
      date: "2026-03-10", author: "Cole Levy", authorRole: "General Manager",
      excerpt: "The art and science behind our 45-day dry-aging process — and why it makes all the difference.",
      body: "At Standard Fare, we believe in going the extra mile for flavor. That's why we dry-age our own steaks in-house for a minimum of 45 days.\n\nDry-aging is a time-honored technique where beef is stored in a controlled environment — precise temperature, humidity, and airflow — allowing natural enzymes to break down the muscle tissue. The result? A steak with deeper, more concentrated flavor and a buttery tenderness that wet-aged beef simply can't match.\n\nOur dry-aging room is kept at 34°F with 85% humidity. Each cut loses about 15% of its weight during the process as moisture evaporates, which concentrates the beefy flavor. The outer crust that forms is trimmed away, leaving only the most intensely flavorful meat.\n\nWhen you order our 8oz Australian Wagyu Tenderloin or Dry-Aged NY Strip, you're tasting weeks of patience and precision. It's one of the many ways we set a new standard.",
      imageUrl: `${SB}/pork-belly-dish.jpg`,
      tags: ["kitchen", "technique", "steak"],
    },
    {
      id: 2, title: "Meet Our Local Farmers", slug: "local-farmers",
      date: "2026-02-28", author: "Clark Gale", authorRole: "Co-Owner",
      excerpt: "From field to fork — a look at the family farms that supply Standard Fare with the freshest ingredients.",
      body: "One of the things that makes Standard Fare special is our commitment to sourcing locally whenever possible.\n\nWe work with over a dozen farms within a 50-mile radius of Saratoga Springs. From the heirloom tomatoes in our Green Goddess salad to the free-range eggs in Clark's Hangover Cure, every ingredient has a story.\n\nThis spring, we're excited to partner with Denison Farm in Schaghticoke for our seasonal vegetables, and with Battenkill Valley Creamery for the butter and cream that make our sauces so rich.\n\nWhen you dine with us, you're supporting not just our kitchen — you're supporting an entire community of farmers and producers who share our passion for quality.",
      imageUrl: `${SB}/exterior-day-bench.jpg`,
      tags: ["sourcing", "local", "community"],
    },
  ],

  // ── WEEKLY FEATURES ──────────────────────────────────────────────────────
  weeklyFeatures: {
    enabled: true,
    headline: "This Week's Features",
    subtitle: "Chef's selections for the week",
    items: [
      { id: 1, name: "Pan-Seared Halibut", description: "Spring peas, lemon beurre blanc, crispy capers", price: 38, tag: "New" },
      { id: 2, name: "Wagyu Burger", description: "Aged cheddar, caramelized onion, brioche bun", price: 24, tag: "Fan Favorite" },
      { id: 3, name: "Strawberry Pavlova", description: "Fresh strawberries, Chantilly cream, basil", price: 14, tag: "Seasonal" },
    ],
  },

  // ── SEASONAL MENU COUNTDOWN ───────────────────────────────────────────────
  seasonalCountdown: {
    enabled: false,
    title: "Spring Menu",
    launchDate: "2026-04-15",
    teaser: "New seasonal dishes dropping soon — crafted with the first flavors of spring.",
  },

  // ── EMAIL MARKETING ───────────────────────────────────────────────────────
  emailMarketing: {
    enabled: true,
    provider: "", // "mailchimp" or "klaviyo" — set when ready
    listId: "",   // Mailchimp list ID or Klaviyo list ID
    apiKey: "",   // Set in Vercel env vars, not here
    headline: "Stay in the Loop",
    subtext: "New menus, upcoming events, and exclusive offers — delivered to your inbox.",
  },

  // ── PRIVATE EVENTS ───────────────────────────────────────────────────────
  privateEvents: {
    enabled: true,
    maxCapacity: 60,
    semiPrivateCapacity: 24,
    includes: [
      "Dedicated event coordinator",
      "Custom menu design with our chef",
      "Full bar service with craft cocktails",
      "AV equipment for presentations",
      "Complimentary coat check",
      "Custom floral arrangements available",
    ],
  },

  // ── GIFT CARDS ────────────────────────────────────────────────────────────
  giftCards: {
    balanceCheckEnabled: true,
    // Toast gift card balance check is done via their API
    // Set TOAST_API_KEY in Vercel env vars to enable
  },

  // ── LINKS ──────────────────────────────────────────────────────────────────
  links: {
    reservations:     "https://resy.com/cities/saratoga-springs-ny/venues/standard-fare",
    doordash: "https://www.doordash.com/store/standard-fare-saratoga-springs-36042139/84089149/",
    giftCards: "https://order.toasttab.com/egiftcards/tbd-name-bocage-group-21-phila-street",
    instagram: "https://www.instagram.com/standardfaresaratoga/",
    toastOnlineOrder: "https://order.toasttab.com/online/tbd-name-bocage-group-21-phila-street",
    bocage: "https://www.instagram.com/bocagechampagnebar/",
  },

  // ── STOCK PHOTOS ─────────────────────────────────────────────────────────
  // Admin-managed pool of stock/filler photos used when events lack custom images.
  // Overrides the defaults in data/eventPhotos.js.
  stockPhotos: {
    events: [], // empty = use built-in 50-photo pool from eventPhotos.js
  },

  // ── Google Rating (admin-editable, overrides scraped data) ────────────────
  googleRating: {
    rating: 4.6,
    count: 78,
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faq: [
    { id: 1, question: "What is the dress code?", answer: "We welcome smart casual attire. While there's no strict dress code, we ask that guests refrain from wearing athletic wear, flip-flops, or beach attire.", category: "Dining" },
    { id: 2, question: "Is there parking available?", answer: "Free street parking is available on Phila Street and surrounding blocks. Additional parking is available in the nearby city garage on Woodlawn Avenue, a short walk from the restaurant.", category: "Dining" },
    { id: 3, question: "Do you accommodate dietary restrictions?", answer: "Absolutely. Our kitchen is happy to accommodate allergies, vegetarian, vegan, and gluten-free requests. Please let your server know or note it in your reservation.", category: "Dining" },
    { id: 4, question: "What is your corkage policy?", answer: "We offer a corkage fee of $25 per bottle, limited to two bottles per table. We kindly ask that you don't bring wines already featured on our list.", category: "Policies" },
    { id: 5, question: "What is your large party policy?", answer: "For parties of 8 or more, we recommend booking through our Private Events team. A prix-fixe menu and minimum spend may apply for larger groups.", category: "Events" },
    { id: 6, question: "Do you take walk-ins?", answer: "Yes! While we recommend reservations via Resy, we always welcome walk-ins and will do our best to seat you.", category: "Reservations" },
    { id: 7, question: "Do you offer gift cards?", answer: "Yes — digital gift cards are available for purchase on our website and can be sent directly to the recipient's email.", category: "Policies" },
    { id: 8, question: "Is there a kids' menu?", answer: "While we don't have a dedicated kids' menu, our kitchen is happy to prepare smaller portions or simpler preparations of many dishes. Just ask your server.", category: "Dining" },
  ],

  // ── CONTACT ────────────────────────────────────────────────────────────────
  contact: {
    pressEmail: "Press@SureThingHospitality.com",
    privateEventsEmail: "events@standardfaresaratoga.com",
    generalEmail: "hello@standardfaresaratoga.com",
  },
};

export default defaultSiteData;
