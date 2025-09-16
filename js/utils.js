// js/utils.js

// Date helpers
export const AEST_DATE = () =>
  new Date().toLocaleString('en-CA', { timeZone: 'Australia/Brisbane' }).slice(0, 10);

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const toLitres = ml => (ml / 1000).toFixed(2).replace(/\.00$/, '');
export const fromLitres = l => Math.round(parseFloat(l) * 1000) || 0;

// ---------- Keys shared across modules ----------
export const DEFAULTS_KEY   = 'supps_defaults_v1';
export const SUPPS_KEY      = 'supps_v1';
export const TAKEN_PREFIX   = 'supps_taken_'; // + date
export const LAST_DATE_KEY  = 'last_seen_date_aest';

export const WATER_TARGET_KEY = 'water_target_ml_v1';
export const WATER_AUTO_KEY   = 'water_auto_goal_v1';
export const WATER_PREFIX     = 'water_'; // + date

// Diet goal key + tiny state helpers (needed by diet.js)
export const GOAL_KEY = 'diet_goals_v1';
export function loadState(key){ try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
export function saveState(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

// Snackbar
export function showSnack(msg, onUndo){
  const snack = document.getElementById('snackbar');
  const msgEl = document.getElementById('snackMsg');
  const undoBtn = document.getElementById('undoBtn');
  if (!snack || !msgEl) return;
  msgEl.textContent = msg;
  snack.classList.remove('hidden');
  let to = setTimeout(() => snack.classList.add('hidden'), 6000);
  if (undoBtn){
    if (typeof onUndo === 'function'){
      undoBtn.style.display = '';
      undoBtn.onclick = () => {
        try{ onUndo(); } finally { snack.classList.add('hidden'); clearTimeout(to); }
      };
    } else {
      undoBtn.style.display = 'none';
      undoBtn.onclick = null;
    }
  }
}

// Daily reset notifier (Sup-Stack & Hydration share it)
export function ensureToday(){
  const today = AEST_DATE();
  const last = localStorage.getItem(LAST_DATE_KEY);
  if (last !== today){
    localStorage.setItem(LAST_DATE_KEY, today);
    showSnack('New day detected — Sup-Stack and Hydration reset.');
  }
}