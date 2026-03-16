// ─────────────────────────────────────────────────────────────────────────────
// lib/supabase.js — Supabase client
// ─────────────────────────────────────────────────────────────────────────────
// Supports both Supabase key formats:
//   New (2025+):  REACT_APP_SUPABASE_ANON_KEY = sb_publishable_xxxx
//   Legacy:       REACT_APP_SUPABASE_ANON_KEY = eyJhbGci... (JWT)
//
// If env vars are missing, exports null — AdminContext falls back to localStorage.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession:   false, // No user auth — we handle admin ourselves
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

export default supabase;
