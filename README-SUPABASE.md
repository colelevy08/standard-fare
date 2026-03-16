# README-SUPABASE.md
# Setting Up Supabase Database for Standard Fare

This replaces localStorage with a real cloud database so admin edits
persist across devices and browsers.

---

## Why Supabase?

- Free tier: 500MB database, unlimited API calls
- Changes made on a phone show up on a desktop immediately
- Industry-standard Postgres database
- No backend server needed — the React app talks directly to Supabase

---

## Step 1 — Create a Supabase Account & Project

1. Go to [supabase.com](https://supabase.com) and click **Start for Free**
2. Sign up with GitHub or email
3. Click **New Project**
4. Fill in:
   - **Project name**: `standard-fare`
   - **Database password**: choose a strong password (save it somewhere safe)
   - **Region**: US East (N. Virginia) — closest to Saratoga
5. Click **Create new project** — takes ~2 minutes to provision

---

## Step 2 — Create the Database Table

1. In your Supabase project, go to **Table Editor** (left sidebar)
2. Click **New Table**
3. Fill in:
   - **Name**: `site_content`
   - **Enable Row Level Security (RLS)**: OFF for now (you can enable later)
4. Add columns:
   | Column | Type | Default |
   |--------|------|---------|
   | id | int8 | — (primary key) |
   | content | jsonb | `{}` |
   | updated_at | timestamptz | `now()` |
5. Click **Save**

### Or run this SQL (faster):

Go to **SQL Editor** → **New Query** → paste and run:

```sql
create table site_content (
  id bigint primary key,
  content jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Insert the initial empty row that the app will upsert into
insert into site_content (id, content) values (1, '{}');
```

---

## Step 3 — Get Your API Keys

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public** key — the long JWT string

---

## Step 4 — Add Keys to Your Project

In the `standard-fare` project root, create a file called `.env`:

```bash
# In Terminal:
cd ~/Desktop/standard-fare
cp .env.example .env
```

Then open `.env` and fill in your values:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Never commit `.env` to Git — it's already in `.gitignore`

---

## Step 5 — Restart the Dev Server

```bash
npm start
```

The app will now load content from Supabase on startup and save all
admin changes to the database automatically.

**To verify it's working:**
1. Log into the admin panel and change something (e.g. edit the About text)
2. Open the site in a different browser or incognito window
3. The change should appear — proving it's coming from the database, not localStorage

---

## Step 6 — Deploy with Database Support

When deploying to Vercel or Netlify, add the environment variables to your
hosting platform instead of the `.env` file:

### Vercel
Project → Settings → **Environment Variables** → Add:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

### Netlify
Site Settings → Build & Deploy → **Environment variables** → Add same two vars.

---

## Fallback Behavior

If Supabase credentials are missing or the database is unreachable, the app
automatically falls back to localStorage. No errors are shown to visitors.
The admin panel still works — changes just save locally instead of to the cloud.

---

## Viewing Your Data

In Supabase → **Table Editor** → `site_content` → you'll see the full JSON
blob of all your website content. You can edit it directly here as a backup.

---

*Last updated: March 2026*
