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
export function showSnack(msg){
  const snack = document.getElementById('snackbar');
  const msgEl = document.getElementById('snackMsg');
  if (!snack || !msgEl) return;
  msgEl.textContent = msg;
  snack.classList.remove('hidden');
  const undoBtn = document.getElementById('undoBtn');
  let to = setTimeout(() => snack.classList.add('hidden'), 6000);
  if (undoBtn) undoBtn.onclick = () => {
    snack.classList.add('hidden'); clearTimeout(to);
  };
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

// ---------- Profile (v1) ----------
export const PROFILE_KEY = 'profile_v1';

export function getProfile(){
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; } catch { return null; }
}
export function saveProfile(profile){
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
export function deriveAgeFromDob(dob){
  if (!dob) return null;
  const d = new Date(dob + 'T00:00:00');
  if (isNaN(d)) return null;
  const today = new Date(new Date().toLocaleString('en-US',{ timeZone:'Australia/Brisbane' }));
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

// Activity factors
const ACTIVITY_FACTOR = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9
};
// Goal multipliers on TDEE
const GOAL_MULT = {
  maintain: 1.0,
  recomp: 1.0,
  lean_bulk: 1.12,
  fat_loss: 0.82
};
// Protein g/kg defaults by goal
const PROTEIN_G_PER_KG = {
  maintain: 1.8,
  recomp: 2.0,
  lean_bulk: 2.0,
  fat_loss: 2.0
};

// Compute default targets if missing
export function computeTargets(profile){
  const sex = profile.sex || 'NA';
  const age = profile.age || deriveAgeFromDob(profile.dob) || 25;
  const h = profile.height_cm || 175;
  const w = profile.weight_kg || 70;
  const act = ACTIVITY_FACTOR[profile.activity || 'moderate'] || 1.55;
  const goal = GOAL_MULT[profile.goal || 'maintain'] || 1.0;

  // Mifflin-St Jeor
  const bmr = sex === 'F'
    ? (10*w + 6.25*h - 5*age - 161)
    : (10*w + 6.25*h - 5*age + 5);
  const tdee = bmr * act * goal;

  const kcal = Math.round(tdee / 10) * 10;

  const protein_g = Math.round((PROTEIN_G_PER_KG[profile.goal || 'maintain'] || 1.8) * w);
  const fibre_g = sex === 'F' ? 25 : (sex === 'M' ? 30 : 28);
  const iron_mg = sex === 'F' ? 18 : 8;    // adult AU NRVs
  const zinc_mg = sex === 'F' ? 8 : 14;    // adult AU NRVs
  const water_L = Math.round((w * 35) / 100)/10; // 35 ml/kg -> round to 0.1 L

  // Apply overrides if supplied (keep falsy checks strict)
  const t = profile.targets || {};
  return {
    calories: (t.calories>0 ? t.calories : kcal),
    protein_g: (t.protein_g>0 ? t.protein_g : protein_g),
    fibre_g:  (t.fibre_g>0 ? t.fibre_g : fibre_g),
    iron_mg:  (t.iron_mg>0 ? t.iron_mg : iron_mg),
    zinc_mg:  (t.zinc_mg>0 ? t.zinc_mg : zinc_mg),
    water_L:  (t.water_L>0 ? t.water_L : water_L)
  };
}

export function applyDietGoalsFrom(profile){
  const t = computeTargets(profile);
  saveState(GOAL_KEY, { kcal: t.calories, protein: t.protein_g, fibre: t.fibre_g, iron: t.iron_mg, zinc: t.zinc_mg });
}

export function getWeightKg(){
  const p = getProfile();
  return (p && p.weight_kg) ? p.weight_kg : 71;
}