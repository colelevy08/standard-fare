# Standard Fare

**Creative American Dining** | 21 Phila St, Saratoga Springs, NY

A modern, fully-editable restaurant website built with React, Tailwind CSS, and Supabase. Features a live admin panel, password-protected preview mode, and cloud-synced content management.

---

## Features

- **Hero Slideshow** — Full-screen rotating hero with editable text and CTA buttons
- **Dynamic Menus** — Brunch, dinner, cocktails, wine, and dessert with GF/veg badges
- **Gallery** — Instagram-linked photo grid with Supabase Storage uploads
- **Events & Ticketing** — Upcoming events with ticket links (Resy/Toast ready)
- **Press Coverage** — Publication logos, headlines, and external article links
- **Artist Prints** — In-house gallery shop for original artwork
- **Team Bios** — Founder profiles with modal bios and portrait circles
- **Hours & Location** — Live hours table with "Today" highlight and embedded Google Map
- **Admin Panel** — Full CMS at `/admin` to edit every section, upload images, and manage content
- **Preview Gate** — Password-protected preview mode for pre-launch sharing
- **Dual Persistence** — Supabase cloud DB + localStorage fallback with automatic sync
- **URL Sanitization** — Defense-in-depth validation prevents broken image URLs from corrupting the site

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 7 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The site runs at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the project root:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_PREVIEW_PASSWORD=your_preview_password
```

## Admin Panel

Navigate to `/admin` and log in to manage all site content:

| Section | What You Can Edit |
|---------|------------------|
| Hero | Slideshow images, eyebrow text, title, tagline, CTA labels |
| About | Heading, body text, team bios, photos |
| Menus | Items, sections, pricing, GF/veg badges across all menus |
| Gallery | Photos with captions and Instagram links |
| Events | Ticketed events with dates, pricing, and ticket URLs |
| Prints | Artist works with pricing and availability |
| Press | Publication logos, headlines, article links |
| Hours | Open/close times per day |
| Location | Address, phone, email, Google Maps embed |
| Links | Resy, DoorDash, Toast, Instagram URLs |
| Contact | Press, events, and general inquiry emails |
| Settings | Admin and preview passwords |

## Event Tickets & Print Sales via Toast

See **[README-TOAST.md](./README-TOAST.md)** for the complete integration guide.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Set environment variables (see above)
4. **Build Command:** `npm run build`
5. **Output Directory:** `build`
6. **Framework Preset:** Create React App

**Connect your domain:**
- In Vercel → Settings → Domains → Add `standardfaresaratoga.com`
- Update DNS: `A` record `@` → `76.76.21.21`, `CNAME` `www` → `cname.vercel-dns.com`

## Supabase Setup

1. Create a Supabase project
2. Create a `site_content` table: `id` (int, primary key), `content` (jsonb)
3. Create a `gallery` storage bucket (public, 50MB limit, image/video MIME types)
4. Add your project URL and anon key to `.env`

The app automatically initializes the database row on first load.

## Project Structure

```
standard-fare/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── AdminContext.js          ← State management + Supabase sync + admin auth
│   ├── data/
│   │   └── siteData.js              ← Default content (single source of truth)
│   ├── lib/
│   │   ├── supabase.js              ← Supabase client
│   │   └── supabaseStorage.js       ← Image upload to Supabase Storage
│   ├── components/
│   │   ├── layout/                  ← Navbar, Footer, PageLayout
│   │   ├── sections/                ← HeroSection, AboutSection, HoursSection
│   │   └── ui/                      ← FlamingoIcon, PreviewGate
│   ├── pages/
│   │   ├── HomePage.jsx             ← All homepage sections
│   │   ├── MenuPage.jsx             ← Tabbed menus
│   │   ├── GalleryPage.jsx          ← Photo grid + lightbox
│   │   ├── EventsPage.jsx           ← Ticketed events
│   │   ├── PrintsPage.jsx           ← Artist prints shop
│   │   ├── PressPage.jsx            ← Press coverage
│   │   ├── TeamPage.jsx             ← Full team page
│   │   ├── ContactPage.jsx          ← Contact form + info
│   │   └── AdminPage.jsx            ← Full CMS dashboard
│   ├── App.js                       ← Route definitions
│   └── index.css                    ← Tailwind + custom styles + fonts
├── tailwind.config.js               ← Brand colors, fonts, animations
└── README-TOAST.md                  ← Toast POS integration guide
```

## Brand

| Color | Hex | Usage |
|-------|-----|-------|
| Navy | `#1B2B4B` | Backgrounds, text |
| Cream | `#F5F0E8` | Light backgrounds, text on dark |
| Flamingo Pink | `#E8748A` | Accents, CTAs, highlights |

**Typography:** Playfair Display (headings) · Lato (body) · Courier Prime (labels)

---

**Built by [Cole Levy](https://www.linkedin.com/in/colelevy/)**
