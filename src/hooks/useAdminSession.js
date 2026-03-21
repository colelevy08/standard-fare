// ─────────────────────────────────────────────────────────────────────────────
// hooks/useAdminSession.js — Session management and security for admin panel
// ─────────────────────────────────────────────────────────────────────────────
// Features:
//   - Auto-logout after inactivity timeout (configurable, default 30 min)
//   - Login attempt rate limiting (max 5 attempts per 5 minutes)
//   - Session activity tracking
//   - Warning before timeout
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000; // Warn 2 minutes before
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5-minute lockout
const LS_ATTEMPTS_KEY = "sf_admin_login_attempts";

const useAdminSession = (isAdmin, logout) => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const warningRef = useRef(null);

  // Reset activity timer on any user interaction
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowTimeoutWarning(false);
  }, []);

  // Activity listeners
  useEffect(() => {
    if (!isAdmin) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));

    // Check every 30 seconds
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        logout();
        setShowTimeoutWarning(false);
      } else if (remaining <= WARNING_BEFORE_MS) {
        setShowTimeoutWarning(true);
        setTimeRemaining(Math.ceil(remaining / 1000));
      }
    }, 30000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      if (timerRef.current) clearInterval(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [isAdmin, logout, resetActivity]);

  // Extend session explicitly
  const extendSession = useCallback(() => {
    resetActivity();
    setShowTimeoutWarning(false);
  }, [resetActivity]);

  return {
    showTimeoutWarning,
    timeRemaining,
    extendSession,
    resetActivity,
  };
};

// ── Login rate limiting ──────────────────────────────────────────────────────

export const checkLoginAttempts = () => {
  try {
    const raw = localStorage.getItem(LS_ATTEMPTS_KEY);
    if (!raw) return { allowed: true, remaining: MAX_ATTEMPTS, lockoutEnds: null };

    const { attempts, lockoutUntil } = JSON.parse(raw);

    if (lockoutUntil && Date.now() < lockoutUntil) {
      return {
        allowed: false,
        remaining: 0,
        lockoutEnds: new Date(lockoutUntil),
        lockoutSeconds: Math.ceil((lockoutUntil - Date.now()) / 1000),
      };
    }

    // Reset if lockout expired
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      localStorage.removeItem(LS_ATTEMPTS_KEY);
      return { allowed: true, remaining: MAX_ATTEMPTS, lockoutEnds: null };
    }

    // Filter attempts within the last 5 minutes
    const recentAttempts = (attempts || []).filter(t => Date.now() - t < LOCKOUT_MS);
    const remaining = MAX_ATTEMPTS - recentAttempts.length;

    return { allowed: remaining > 0, remaining: Math.max(0, remaining), lockoutEnds: null };
  } catch {
    return { allowed: true, remaining: MAX_ATTEMPTS, lockoutEnds: null };
  }
};

export const recordLoginAttempt = (success) => {
  if (success) {
    localStorage.removeItem(LS_ATTEMPTS_KEY);
    return;
  }

  try {
    const raw = localStorage.getItem(LS_ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : { attempts: [] };
    data.attempts = [...(data.attempts || []).filter(t => Date.now() - t < LOCKOUT_MS), Date.now()];

    if (data.attempts.length >= MAX_ATTEMPTS) {
      data.lockoutUntil = Date.now() + LOCKOUT_MS;
    }

    localStorage.setItem(LS_ATTEMPTS_KEY, JSON.stringify(data));
  } catch {}
};

export default useAdminSession;
