// ─────────────────────────────────────────────────────────────────────────────
// lib/crmDb.js — CRM database operations via Supabase
// ─────────────────────────────────────────────────────────────────────────────
// Manages customers, reservations, notes, tags, activity log, and scheduled
// content. All data stored in Supabase; falls back to localStorage if offline.
// ─────────────────────────────────────────────────────────────────────────────

import supabase from "./supabase";

const CRM_TABLE = "crm_customers";
const NOTES_TABLE = "crm_notes";
const ACTIVITY_TABLE = "admin_activity_log";
const SCHEDULE_TABLE = "content_schedule";
// const TAGS_TABLE = "crm_tags"; // reserved for future use

// ── localStorage fallback keys ───────────────────────────────────────────────
const LS_CUSTOMERS = "sf_crm_customers";
const LS_NOTES = "sf_crm_notes";
const LS_ACTIVITY = "sf_activity_log";
const LS_SCHEDULE = "sf_content_schedule";

// ── Helpers ──────────────────────────────────────────────────────────────────
const lsGet = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
  catch { return fallback; }
};
const lsSet = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

// ═════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═════════════════════════════════════════════════════════════════════════════

export const getCustomers = async (opts = {}) => {
  const { search, tag, sortBy = "last_visit", sortDir = "desc", limit = 100, offset = 0 } = opts;

  if (!supabase) {
    let customers = lsGet(LS_CUSTOMERS);
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    }
    if (tag) customers = customers.filter(c => (c.tags || []).includes(tag));
    customers.sort((a, b) => {
      const av = a[sortBy] || "";
      const bv = b[sortBy] || "";
      return sortDir === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
    });
    return { data: customers.slice(offset, offset + limit), count: customers.length, error: null };
  }

  try {
    let query = supabase.from(CRM_TABLE).select("*", { count: "exact" });
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    if (tag) query = query.contains("tags", [tag]);
    query = query.order(sortBy, { ascending: sortDir === "asc" }).range(offset, offset + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    // Cache locally
    lsSet(LS_CUSTOMERS, data);
    return { data, count, error: null };
  } catch (e) {
    return { data: lsGet(LS_CUSTOMERS), count: 0, error: e.message };
  }
};

export const upsertCustomer = async (customer) => {
  const record = {
    ...customer,
    id: customer.id || `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    updated_at: new Date().toISOString(),
    created_at: customer.created_at || new Date().toISOString(),
  };

  if (!supabase) {
    const customers = lsGet(LS_CUSTOMERS);
    const idx = customers.findIndex(c => c.id === record.id);
    if (idx >= 0) customers[idx] = record;
    else customers.unshift(record);
    lsSet(LS_CUSTOMERS, customers);
    return { data: record, error: null };
  }

  try {
    const { data, error } = await supabase.from(CRM_TABLE).upsert(record, { onConflict: "id" }).select().single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    // Fallback to local
    const customers = lsGet(LS_CUSTOMERS);
    const idx = customers.findIndex(c => c.id === record.id);
    if (idx >= 0) customers[idx] = record;
    else customers.unshift(record);
    lsSet(LS_CUSTOMERS, customers);
    return { data: record, error: e.message };
  }
};

export const deleteCustomer = async (id) => {
  if (!supabase) {
    const customers = lsGet(LS_CUSTOMERS).filter(c => c.id !== id);
    lsSet(LS_CUSTOMERS, customers);
    return { error: null };
  }
  try {
    const { error } = await supabase.from(CRM_TABLE).delete().eq("id", id);
    if (error) throw error;
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
};

export const getCustomerStats = async () => {
  const { data: customers } = await getCustomers({ limit: 10000 });
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const total = customers.length;
  const vip = customers.filter(c => (c.tags || []).includes("VIP")).length;
  const recentVisitors = customers.filter(c => c.last_visit >= thirtyDaysAgo).length;
  const withEmail = customers.filter(c => c.email).length;
  const withPhone = customers.filter(c => c.phone).length;
  const avgVisits = total > 0 ? (customers.reduce((sum, c) => sum + (c.visit_count || 0), 0) / total).toFixed(1) : 0;
  const topTags = {};
  customers.forEach(c => (c.tags || []).forEach(t => { topTags[t] = (topTags[t] || 0) + 1; }));
  return { total, vip, recentVisitors, withEmail, withPhone, avgVisits, topTags };
};

// ═════════════════════════════════════════════════════════════════════════════
// CUSTOMER NOTES
// ═════════════════════════════════════════════════════════════════════════════

export const getCustomerNotes = async (customerId) => {
  if (!supabase) {
    return { data: lsGet(LS_NOTES).filter(n => n.customer_id === customerId), error: null };
  }
  try {
    const { data, error } = await supabase.from(NOTES_TABLE)
      .select("*").eq("customer_id", customerId).order("created_at", { ascending: false });
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    return { data: [], error: e.message };
  }
};

export const addNote = async (customerId, text, type = "general") => {
  const note = {
    id: `note_${Date.now()}`,
    customer_id: customerId,
    text,
    type, // general, dietary, preference, complaint, compliment
    created_at: new Date().toISOString(),
  };

  if (!supabase) {
    const notes = lsGet(LS_NOTES);
    notes.unshift(note);
    lsSet(LS_NOTES, notes);
    return { data: note, error: null };
  }

  try {
    const { data, error } = await supabase.from(NOTES_TABLE).insert(note).select().single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    return { data: note, error: e.message };
  }
};

export const deleteNote = async (noteId) => {
  if (!supabase) {
    lsSet(LS_NOTES, lsGet(LS_NOTES).filter(n => n.id !== noteId));
    return { error: null };
  }
  try {
    const { error } = await supabase.from(NOTES_TABLE).delete().eq("id", noteId);
    if (error) throw error;
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVITY LOG
// ═════════════════════════════════════════════════════════════════════════════

export const logActivity = async (action, section, detail = "") => {
  const entry = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action, // created, updated, deleted, published, unpublished, reordered, exported, imported
    section, // events, menus, gallery, blog, merch, bottles, etc.
    detail, // "Added event 'Wine Dinner'" or "Changed hours for Monday"
    timestamp: new Date().toISOString(),
  };

  if (!supabase) {
    const log = lsGet(LS_ACTIVITY);
    log.unshift(entry);
    if (log.length > 500) log.length = 500; // cap local log
    lsSet(LS_ACTIVITY, log);
    return;
  }

  try {
    await supabase.from(ACTIVITY_TABLE).insert(entry);
  } catch {
    // Silent fail — log to local as backup
    const log = lsGet(LS_ACTIVITY);
    log.unshift(entry);
    if (log.length > 500) log.length = 500;
    lsSet(LS_ACTIVITY, log);
  }
};

export const getActivityLog = async (opts = {}) => {
  const { section, limit = 50, offset = 0 } = opts;

  if (!supabase) {
    let log = lsGet(LS_ACTIVITY);
    if (section) log = log.filter(e => e.section === section);
    return { data: log.slice(offset, offset + limit), count: log.length, error: null };
  }

  try {
    let query = supabase.from(ACTIVITY_TABLE).select("*", { count: "exact" });
    if (section) query = query.eq("section", section);
    query = query.order("timestamp", { ascending: false }).range(offset, offset + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data, count, error: null };
  } catch (e) {
    return { data: lsGet(LS_ACTIVITY), count: 0, error: e.message };
  }
};

export const clearActivityLog = async () => {
  lsSet(LS_ACTIVITY, []);
  if (supabase) {
    try { await supabase.from(ACTIVITY_TABLE).delete().neq("id", ""); } catch {}
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// CONTENT SCHEDULING
// ═════════════════════════════════════════════════════════════════════════════

export const getScheduledItems = async () => {
  if (!supabase) return { data: lsGet(LS_SCHEDULE), error: null };
  try {
    const { data, error } = await supabase.from(SCHEDULE_TABLE)
      .select("*").order("publish_at", { ascending: true });
    if (error) throw error;
    lsSet(LS_SCHEDULE, data);
    return { data, error: null };
  } catch (e) {
    return { data: lsGet(LS_SCHEDULE), error: e.message };
  }
};

export const scheduleContent = async (item) => {
  const record = {
    id: item.id || `sched_${Date.now()}`,
    section: item.section, // blog, events, specials, etc.
    item_id: item.item_id, // ID of the item to publish
    publish_at: item.publish_at, // ISO date string
    action: item.action || "publish", // publish, unpublish, feature
    status: "pending", // pending, published, cancelled
    created_at: new Date().toISOString(),
    data_snapshot: item.data_snapshot || null, // optional: full item data to restore
  };

  if (!supabase) {
    const schedule = lsGet(LS_SCHEDULE);
    schedule.push(record);
    lsSet(LS_SCHEDULE, schedule);
    return { data: record, error: null };
  }

  try {
    const { data, error } = await supabase.from(SCHEDULE_TABLE).upsert(record, { onConflict: "id" }).select().single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    return { data: record, error: e.message };
  }
};

export const cancelScheduledItem = async (id) => {
  if (!supabase) {
    const schedule = lsGet(LS_SCHEDULE).map(s => s.id === id ? { ...s, status: "cancelled" } : s);
    lsSet(LS_SCHEDULE, schedule);
    return { error: null };
  }
  try {
    const { error } = await supabase.from(SCHEDULE_TABLE).update({ status: "cancelled" }).eq("id", id);
    if (error) throw error;
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// EMAIL SIGNUPS (stored locally, synced to Supabase when available)
// ═════════════════════════════════════════════════════════════════════════════

const LS_SIGNUPS = "sf_email_signups";

export const getEmailSignups = () => lsGet(LS_SIGNUPS);

export const getEmailSignupCount = () => lsGet(LS_SIGNUPS).length;

export const exportEmailSignups = () => {
  const signups = lsGet(LS_SIGNUPS);
  const csv = "Email,Signed Up At\n" + signups.map(s => `${s.email},${s.signedUpAt}`).join("\n");
  return csv;
};

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT CRM TAGS
// ═════════════════════════════════════════════════════════════════════════════

export const DEFAULT_TAGS = [
  "VIP", "Regular", "First-Timer", "Wine Club", "Private Events",
  "Birthday", "Anniversary", "Corporate", "Influencer", "Press",
  "Dietary: GF", "Dietary: Vegan", "Dietary: Vegetarian", "Dietary: Allergy",
  "Prefers Patio", "Prefers Bar", "Prefers Booth", "Large Party",
  "Email Subscriber", "SMS Subscriber", "Reviewer", "Local Business",
];
