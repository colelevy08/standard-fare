// ─────────────────────────────────────────────────────────────────────────────
// data/siteData.js
// ─────────────────────────────────────────────────────────────────────────────
// This file is the SINGLE SOURCE OF TRUTH for all editable website content.
// The AdminContext reads from and writes to localStorage, using this file as
// the initial/default data when no saved data exists yet.
//
// To add a new section: add it here AND update AdminContext + the relevant page.
// ─────────────────────────────────────────────────────────────────────────────

const defaultSiteData = {

  // ── HERO SLIDESHOW ─────────────────────────────────────────────────────────
  heroSlides: [
    { id: 1, url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&q=85", alt: "Standard Fare dining room" },
    { id: 2, url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1800&q=85", alt: "Beautiful dish at Standard Fare" },
    { id: 3, url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1800&q=85", alt: "Craft cocktails at Standard Fare" },
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
    imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
    bocageUrl: "https://www.bocagechampagnebar.com/",
  },

  // ── HOURS & LOCATION ───────────────────────────────────────────────────────
  hours: [
    { day: "Monday",    open: "Closed",          close: "" },
    { day: "Tuesday",   open: "11:30 AM",        close: "9:00 PM" },
    { day: "Wednesday", open: "11:30 AM",        close: "9:00 PM" },
    { day: "Thursday",  open: "11:30 AM",        close: "9:00 PM" },
    { day: "Friday",    open: "11:30 AM",        close: "10:00 PM" },
    { day: "Saturday",  open: "10:00 AM",        close: "10:00 PM" },
    { day: "Sunday",    open: "10:00 AM",        close: "9:00 PM" },
  ],
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
    previewMode:     true,   // true = password gate shown to visitors
    adminPassword:   "zacnclark4evr<3",   // owner login password
    previewPassword: "standardfare2026",  // visitor preview password
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
            { name: "Pabst Blue Ribbon", description: "", price: "6" },
            { name: "Phila Street Low Life", description: "", price: "9" },
            { name: "Guinness Extra Stout", description: "", price: "9" },
            { name: "Abita Seasonal", description: "", price: "8" },
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
    { id: 1,  url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80", alt: "Fennel-rubbed pork belly, cannellini beans, salsa verde", comment: "Pork belly · cannellini ragu · salsa verde", instagramUrl: "https://www.instagram.com/p/DVwVBuUEmM3/", mediaType: "image" },
    { id: 2,  url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80", alt: "Apollo's Praise wine tasting event", comment: "Apollo's Praise wine tasting — April 12", instagramUrl: "https://www.instagram.com/p/DVy51SIkqVz/", mediaType: "image" },
    { id: 3,  url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", alt: "Standard Fare bar interior", comment: "Standard Fare, Saratoga Springs", instagramUrl: "https://www.instagram.com/p/DV6hQvokskw/", mediaType: "image" },
    { id: 4,  url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", alt: "Broiled oysters Bienville with mushroom and andouille", comment: "Broiled Oysters Bienville · mushroom · andouille · parmesan", instagramUrl: "https://www.instagram.com/p/DVtdNeCknLC/", mediaType: "image" },
    { id: 5,  url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80", alt: "8oz Australian Wagyu tenderloin with bordelaise", comment: "8oz Australian Wagyu · beech mushroom bordelaise", instagramUrl: "https://www.instagram.com/p/DVlfcR1Ds7b/", mediaType: "image" },
    { id: 6,  url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80", alt: "Wild mushroom risotto with saffron and parmesan", comment: "Wild Mushroom Risotto · saffron · parmesan · thyme", instagramUrl: "https://www.instagram.com/p/DVg_BzwE0Ns/", mediaType: "image" },
    { id: 7,  url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80", alt: "Signature cocktails at the Standard Fare bar", comment: "Slow Burn · smoked blueberry · ginger beer", instagramUrl: "https://www.instagram.com/p/DVPEWKYk5Uu/", mediaType: "image" },
    { id: 8,  url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", alt: "Creative American dining at Standard Fare", comment: "Creative American dining — 21 Phila St", instagramUrl: "https://www.instagram.com/p/DVJ_5feki_N/", mediaType: "image" },
    { id: 9,  url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", alt: "Every plate tells a story", comment: "Every plate tells a story", instagramUrl: "https://www.instagram.com/p/DVHZeSREkpy/", mediaType: "image" },
    { id: 10, url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80", alt: "Brunch spread at Standard Fare", comment: "Brunch — Sat & Sun, 10AM–3PM", instagramUrl: "https://www.instagram.com/p/DU1i4tTEcNg/", mediaType: "image" },
    { id: 11, url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80", alt: "Housemade cocktail craft", comment: "Crafted with care, every time", instagramUrl: "https://www.instagram.com/p/DUdXPJxEVq7/", mediaType: "image" },
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
      logo: "https://saratoga-report.com/wp-content/uploads/2020/01/saratoga-report-logo.png",
    },
    {
      id: 2,
      outlet: "Saratoga.com",
      headline: "Standard Fare Brings Elevated Comfort Food to Downtown Saratoga",
      url: "https://www.saratoga.com/whatsnew/",
      logo: "https://www.saratoga.com/images/saratoga-logo.png",
    },
    {
      id: 3,
      outlet: "Good + Tasty",
      headline: "The Anything But Ordinary Standard Fare Makes a Bow in Saratoga",
      url: "https://kathleenwillcox.substack.com/p/the-anything-but-ordinary-standard",
      logo: "https://substackcdn.com/image/fetch/w_96,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F31ca6f1f-6ad4-4d62-8a95-2c0f4a5c2e2e_1080x1080.png",
    },
    {
      id: 4,
      outlet: "The Dispatch Saratoga Springs",
      headline: "First Look: Standard Fare, Phila Street's Newest Treat",
      url: "https://saratogadispatch.substack.com/p/standard-fare-new-approach-phila-street-saratoga",
      logo: "https://substackcdn.com/image/fetch/w_96,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd0e5ecc8-f2f1-4f7c-a6cc-2bd7ba3c3b87_512x512.png",
    },
    {
      id: 5,
      outlet: "The Daily Gazette",
      headline: "Saratoga Springs' Restaurant Standard Fare Sets Opening Day",
      url: "https://www.dailygazette.com/food/bite-sized/saratoga-springs-restaurant-standard-fare-sets-opening-day--bite-sized/article_f4b47b6e-c7d4-4836-8e4b-d576162289ed.html",
      logo: "https://www.dailygazette.com/wp-content/uploads/2022/01/DG-Logo-Header.png",
    },
    {
      id: 6,
      outlet: "Times Union",
      headline: "Bocage Boys Branch Out, to Open Standard Fare on Phila Street",
      url: "https://www.timesunion.com/food/article/bocage-boys-saratoga-springs-open-standard-fare-20761008.php",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Times_Union_logo.svg/320px-Times_Union_logo.svg.png",
    },
    {
      id: 7,
      outlet: "Albany Business Review",
      headline: "New Restaurant Standard Fare Prepares to Open in Saratoga",
      url: "https://www.bizjournals.com/albany/news/2025/07/24/standard-fare-saratoga-bocage-owners.html",
      logo: "https://media.bizj.us/view/img/11939381/abr-logo.png",
    },
  ],

  // ── EVENTS ─────────────────────────────────────────────────────────────────
  // Events connect to Toast for ticket sales. See README-TOAST.md for setup.
  events: [
    {
      id: 1,
      title: "Apollo's Praise Wine Tasting",
      date: "2026-04-12",
      time: "6:30 PM – 9:00 PM",
      description:
        "Join us for an intimate evening with Apollo's Praise winery. Explore their acclaimed lineup of natural wines paired with bespoke small plates crafted by our kitchen team. Space is extremely limited.",
      price: 95,
      capacity: 24,
      imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
      // toastProductId: "REPLACE_WITH_TOAST_PRODUCT_ID"  ← fill in after Toast setup
      toastProductId: null,
      ticketUrl: "https://resy.com/cities/saratoga-springs-ny/venues/standard-fare", // fallback — update with Toast product URL once Toast is configured
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
      description: "What it says on the label. Sold out.",
      toastProductId: null,
    },
  ],

  // ── LINKS ──────────────────────────────────────────────────────────────────
  links: {
    reservations:     "https://resy.com/cities/saratoga-springs-ny/venues/standard-fare",
    doordash: "https://www.doordash.com/store/standard-fare-saratoga-springs-36042139/84089149/",
    giftCards: "https://order.toasttab.com/egiftcards/tbd-name-bocage-group-21-phila-street",
    instagram: "https://www.instagram.com/standardfaresaratoga/",
    toastOnlineOrder: "https://order.toasttab.com/online/tbd-name-bocage-group-21-phila-street",
    bocage: "https://www.bocagechampagnebar.com/",
  },

  // ── CONTACT ────────────────────────────────────────────────────────────────
  contact: {
    pressEmail: "Press@SureThingHospitality.com",
    privateEventsEmail: "events@standardfaresaratoga.com",
    generalEmail: "hello@standardfaresaratoga.com",
  },
};

export default defaultSiteData;
