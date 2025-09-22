// js/storage.js
// LocalStorage wrapper with namespacing, safe JSON, and legacy migration.

import { LS_KEYS, EVENT_NAMES } from './constants.js';

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function safeSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

// ---- Legacy migration helpers ----
const LEGACY_PLAN_KEY = 'nutrify_mealPlan';

export function migrateLegacyPlanIfNeeded() {
  // If new key missing but legacy exists, move it over.
  const hasNew = !!safeGet(LS_KEYS.PLAN);
  if (hasNew) return;
  try {
    const legacy = safeGet(LEGACY_PLAN_KEY);
    if (legacy && typeof legacy === 'object') {
      safeSet(LS_KEYS.PLAN, legacy);
      // keep legacy for now (no destructive delete) to be safe
      document.dispatchEvent(new CustomEvent(EVENT_NAMES.PLAN_UPDATED));
    }
  } catch {}
}

// ---- Public API ----
export function getPlan() {
  migrateLegacyPlanIfNeeded();
  return safeGet(LS_KEYS.PLAN);
}

export function setPlan(planObj) {
  // Expect plain object { Monday: [...], ... }
  if (!planObj || typeof planObj !== 'object') return false;
  const ok = safeSet(LS_KEYS.PLAN, planObj);
  if (ok) {
    document.dispatchEvent(new CustomEvent(EVENT_NAMES.PLAN_UPDATED));
  }
  return ok;
}