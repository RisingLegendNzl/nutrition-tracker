// Shared helpers & keys
export const AEST_DATE = () =>
  new Date().toLocaleString("en-CA", { timeZone: "Australia/Brisbane" }).slice(0,10);
export const clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
export const toLitres = ml => (ml/1000).toFixed(2).replace(/\.00$/,'');
export const fromLitres = l => Math.round(parseFloat(l)*1000)||0;

// Keys
export const DEFAULTS_KEY = "supps_defaults_v1";
export const SUPPS_KEY = "supps_v1";
export const TAKEN_PREFIX = "supps_taken_"; // + date
export const LAST_DATE_KEY = "last_seen_date_aest";

export const WATER_TARGET_KEY = "water_target_ml_v1";
export const WATER_AUTO_KEY   = "water_auto_goal_v1";
export const WATER_PREFIX     = "water_"; // + date

// Snackbar
export function showSnack(msg){
  const snack = document.getElementById("snackbar");
  const msgEl = document.getElementById("snackMsg");
  if (!snack || !msgEl) return;
  msgEl.textContent = msg;
  snack.classList.remove("hidden");
  const undoBtn = document.getElementById("undoBtn");
  let to = setTimeout(()=> snack.classList.add("hidden"), 6000);
  if (undoBtn) undoBtn.onclick = ()=> {
    snack.classList.add("hidden");
    clearTimeout(to);
    // Undo is handled in supps.js where deletions happen
  };
}

// Daily reset notifier (Sup-Stack & Hydration share it)
export function ensureToday(){
  const today = AEST_DATE();
  const last = localStorage.getItem(LAST_DATE_KEY);
  if (last !== today){
    localStorage.setItem(LAST_DATE_KEY, today);
    showSnack("New day detected — Sup-Stack and Hydration reset.");
  }
}