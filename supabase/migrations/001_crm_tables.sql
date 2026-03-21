-- ═══════════════════════════════════════════════════════════════════════════
-- Standard Fare — CRM & Admin Infrastructure Tables
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- These tables power the Guest CRM, Activity Log, and Content Scheduler.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── CRM Customers ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  birthday TEXT DEFAULT '',
  dietary TEXT DEFAULT '',
  preferred_seating TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  visit_count INTEGER DEFAULT 0,
  spend_total NUMERIC(10,2) DEFAULT 0,
  last_visit TIMESTAMPTZ,
  source TEXT DEFAULT 'walk-in',
  notes_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for searching customers
CREATE INDEX IF NOT EXISTS idx_crm_customers_name ON crm_customers (name);
CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers (email);
CREATE INDEX IF NOT EXISTS idx_crm_customers_tags ON crm_customers USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_crm_customers_last_visit ON crm_customers (last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_crm_customers_updated ON crm_customers (updated_at DESC);

-- ── CRM Notes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_notes (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES crm_customers(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'general', -- general, dietary, preference, complaint, compliment
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_notes_customer ON crm_notes (customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_notes_created ON crm_notes (created_at DESC);

-- ── Admin Activity Log ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL, -- created, updated, deleted, published, unpublished, reordered, exported, imported
  section TEXT NOT NULL, -- events, menus, gallery, blog, merch, bottles, crm, etc.
  detail TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_section ON admin_activity_log (section);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON admin_activity_log (timestamp DESC);

-- ── Content Schedule ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_schedule (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL, -- blog, events, specials, merch, bottles, etc.
  item_id TEXT DEFAULT '',
  publish_at TIMESTAMPTZ NOT NULL,
  action TEXT DEFAULT 'publish', -- publish, unpublish, feature
  status TEXT DEFAULT 'pending', -- pending, published, cancelled
  data_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_status ON content_schedule (status);
CREATE INDEX IF NOT EXISTS idx_schedule_publish_at ON content_schedule (publish_at);

-- ── Email Signups ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_signups (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website', -- website, event, sms, import
  signed_up_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signups_email ON email_signups (email);

-- ── SEO Metadata ──────────────────────────────────────────────────────────
-- Stored per-page so it persists independently of siteData
CREATE TABLE IF NOT EXISTS seo_metadata (
  page_key TEXT PRIMARY KEY, -- home, menu, events, gallery, blog, etc.
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────
-- Allow full access via anon key (admin panel handles auth via password)
ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations for anon (our app handles auth separately)
CREATE POLICY "Allow all for anon" ON crm_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON crm_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON admin_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON content_schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON email_signups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON seo_metadata FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! All CRM and admin tables are ready.
-- ═══════════════════════════════════════════════════════════════════════════
