// filename: js/profile.js
// Profile UI + storage + Generate Plan (uses unsaved form first, then saved).
// Adds: age, activity PAL, goal, bodyfat%, diet, allergies, dislikes, training days.

import { clamp, showSnack } from './utils.js';
import { applyPlanToDiet } from './plan.io.js';
import { generateDayPlan, generateWeekPlan } from '../engine/nutritionEngine.js';
import { foodsBundle } from '../brain/diet.data.js';

const KEY = 'profile_v1';
const listeners = new Set();

let root;
let editBtn;
let state = null;

function nowDate(){ return new Date().toISOString().slice(0,10); }

/* ================= Storage ================= */

export function getProfile(){
  if (state) return state;
  try{
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const migrated = migrate(obj);
    if (isValid(migrated)){ state = migrated; return migrated; }
    return null;
  }catch{ return null; }
}

function saveProfile(p){
  const toSave = { ...p, updated_at: nowDate() };
  localStorage.setItem(KEY, JSON.stringify(toSave));
  state = toSave;
  listeners.forEach(cb => { try{ cb(toSave); }catch{} });
  showSnack('Profile saved.');
}

function migrate(p){
  if (!p) return p;
  // add defaults if missing (non-breaking)
  if (!('weight_unit' in p)) p.weight_unit = 'kg';
  if (!('height_unit' in p)) p.height_unit = 'cm';
  if (!('gender' in p))      p.gender = 'male';

  // new nutrition fields
  if (!('store_preference' in p)) p.store_preference = 'none';
  if (!('age_y' in p))          p.age_y = 23;
  if (!('activity_pal' in p))   p.activity_pal = 1.6;
  if (!('goal' in p))           p.goal = 'maintain';
  if (!('bodyfat_pct' in p))    p.bodyfat_pct = null;
  if (!('diet' in p))           p.diet = 'omnivore';
  if (!('allergies' in p))      p.allergies = [];
  if (!('dislikes' in p))       p.dislikes = [];
  if (!('training_days' in p))  p.training_days = [];
  return p;
}

export function onProfileChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }
export function requireComplete(){ return !!getProfile(); }

/* ================ Validation ================= */

function isValid(p){
  if (!p) return false;
  const w = Number(p.weight_kg);
if (!Number.isFinite(w) || w < 30 || w > 300) return false;
// height is optional in your UI; if provided, validate range
  if (p.height_cm !== '' && p.height_cm != null) {
    const h = Number(p.height_cm);
    if (!Number.isFinite(h) || h < 120 || h > 230) return false;
  }

  // nutrition fields (lenient)
  if (p.age_y != null && (!Number.isFinite(Number(p.age_y)) || p.age_y < 18 || p.age_y > 65)) return false;
  if (p.activity_pal != null && (!Number.isFinite(Number(p.activity_pal)) || p.activity_pal < 1.2 || p.activity_pal > 1.9)) return false;
  if (p.goal && !['cut','maintain','gain'].includes(String(p.goal).toLowerCase())) return false;
  if (p.bodyfat_pct != null && p.bodyfat_pct !== '' && (!Number.isFinite(Number(p.bodyfat_pct)) || p.bodyfat_pct < 5 || p.bodyfat_pct > 50)) return false;
  if (p.diet && !['omnivore','vegetarian','vegan','pescetarian'].includes(String(p.diet))) return false;
  if (p.store_preference && !['none','coles','woolworths'].includes(String(p.store_preference))) return false;

  return true;
}

/* ============ Compute helpers / units ============ */

function computeHydroLitres(weight_kg){
  const ml = weight_kg * 35; // fixed auto baseline
  return Math.round(ml) / 1000;
}
function kgFromLbs(lbs){ return Math.round((Number(lbs)||0) * 0.45359237 * 10) / 10; }
function cmFromFeetIn(feet, inches){
  const f = Number(feet)||0, i = Number(inches)||0;
  return Math.round(((f*12 + i) * 2.54));
}
function lbsFromKg(kg){ return Math.round((Number(kg)||0) / 0.45359237); }
function feetFromCm(cm){
  if (!Number.isFinite(Number(cm))) return ['', ''];
  const totalIn = (Number(cm)||0) / 2.54;
  const f = Math.floor(totalIn / 12);
  const i = Math.round(totalIn - f*12);
  return [f, i];
}

/* ================= UI Rendering ================= */

function ensureRoot(){
  if (root) return root;
  root = document.getElementById('profilePage');
  if (!root){
    root = document.createElement('section');
    root.id = 'profilePage';
    root.className = 'page hidden';
    document.getElementById('app')?.appendChild(root);
  }
  root.innerHTML = `
    <section class="card">
      <h2 class="section-title" id="p_title">Your Profile</h2>

      <div class="field">
        <label for="p_name">Name</label>
        <input id="p_name" type="text" placeholder="e.g., Jack"/>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label for="p_gender" style="margin:0">Gender</label>
          <select id="p_gender" style="max-width:160px">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label for="p_age_y" style="margin:0">Age (years)</label>
          <input id="p_age_y" type="number" inputmode="numeric" min="18" max="65" placeholder="e.g., 23" style="max-width:160px"/>
        </div>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label for="p_weight_value" style="margin:0">Weight</label>
          <select id="u_w_unit" style="max-width:120px">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>
        <input id="p_weight_value" type="number" inputmode="decimal" placeholder="kg" min="30" max="300"/>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label style="margin:0">Height</label>
          <select id="u_h_unit" style="max-width:120px">
            <option value="cm">cm</option>
            <option value="ftin">ft/in</option>
          </select>
        </div>
        <div id="h_cm_block">
          <input id="p_height_cm" type="number" inputmode="decimal" placeholder="cm" min="120" max="230"/>
        </div>
        <div id="h_ftin_block" class="hidden">
          <div style="display:flex;gap:8px">
            <input id="p_height_ft" type="number" inputmode="numeric" placeholder="ft" min="4" max="7" style="flex:1"/>
            <input id="p_height_in" type="number" inputmode="numeric" placeholder="in" min="0" max="11" style="flex:1"/>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="p_bodyfat">Bodyfat % (optional)</label>
        <input id="p_bodyfat" type="number" inputmode="decimal" placeholder="%" min="5" max="50" step="0.5"/>
      </div>

      <div class="field">
        <label for="p_activity">Activity (PAL)</label>
        <select id="p_activity">
          <option value="1.2">Sedentary (1.2)</option>
          <option value="1.375">Light (1.375)</option>
          <option value="1.55">Moderate (1.55)</option>
          <option value="1.725">Active (1.725)</option>
          <option value="1.9">Very active (1.9)</option>
        </select>
      </div>

      <div class="field">
        <label for="p_goal">Goal</label>
        <select id="p_goal">
          <option value="cut">Cut</option>
          <option value="maintain" selected>Maintain</option>
          <option value="gain">Gain</option>
        </select>
      </div>

      <div class="field">
        <label for="p_diet">Diet type</label>
      </div>
    </section>
  `;
  return root;
}

export function mountProfile(){
  const u = ui();

  // unit switchers
  u.heightUnit.addEventListener('change', ()=>{
    if (u.heightUnit.value === 'cm'){
      u.hcmBlock.classList.remove('hidden');
      u.hftinBlock.classList.add('hidden');
      u.hft.value = ''; u.hin.value = '';
    } else {
      u.hcmBlock.classList.add('hidden');
      u.hftinBlock.classList.remove('hidden');
      u.hcm.value = '';
    }
  });
// Save
  u.save.addEventListener('click', ()=>{
    const r = readFromUI(u);
    if (!r.ok){
      u.error.style.display = 'block';
      u.error.textContent = 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';

    // Normalize optional fields
    const cleaned = { ...r.data };
    if (cleaned.age_y === null) cleaned.age_y = 23; // default
    saveProfile(cleaned);
  });

  // Reset
  u.reset.addEventListener('click', ()=>{
    const d = defaults();
    writeToUI(u, d);
  });

  // Cancel (hide)
  u.cancel.addEventListener('click', ()=>{
    u.page.classList.add('hidden');
  });

  // Generate Plan button
  injectGenerateButton(u);

  // ---- JS enhancer for chips (fallback for browsers without :has) ----
  u.trainingWrap.querySelectorAll('label.chip').forEach(lbl => {
    const cb = lbl.querySelector('input[type="checkbox"]');
    const sync = () => lbl.classList.toggle('is-checked', cb.checked);
    cb.addEventListener('change', sync);
    cb.addEventListener('blur', sync);
    sync();
  });
}

export { ensureRoot as renderProfile, ensureRoot as initProfile };

/* =============== Generate Plan wiring =============== */


function injectGenerateButton(u){
  let btn = document.getElementById('p_gen');
  if (!btn){
    btn = document.createElement('button');
    btn.id = 'p_gen';
    btn.className = 'primary';
    btn.textContent = 'Generate Meal Plan';
    u.cancel.parentElement.appendChild(btn);
  }
  btn.onclick = () => {
    // Read current form values and validate
    const r = readFromUI(u);
    const missing = (typeof missingRequired === 'function') ? missingRequired(u) : [];
    if (!r.ok || missing.length) {
      u.error.style.display = 'block';
      u.error.textContent = missing.length ? `Please complete: ${missing.join(', ')}` : 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';

    // Determine if creatine supplement is enabled (affects hydration only)
    const _supps = JSON.parse(localStorage.getItem('supps_v1') || '[]');
    const _creatineOn = !!(_supps || []).find(s => String(s.name || '').toLowerCase().includes('creatine'));

    // Compose engine profile using fallbacks similar to onGenerateFromProfile
    const saved = getProfile() || defaults();
    const sex = (r.data.gender || saved.gender || 'male').toLowerCase();
    const height_cm = (r.data.height_cm === '' || r.data.height_cm == null)
      ? (Number(saved.height_cm) || 175)
      : Number(r.data.height_cm);
    const weight_kg = Number(r.data.weight_kg || saved.weight_kg || 71);
    // Age: use user input if provided, else saved/default
    let age_y = r.data.age_y;
    if (age_y == null || age_y === '') {
      age_y = saved.age_y != null ? saved.age_y : 23;
    }
    age_y = Number(age_y);
    const bodyfat_pct = (r.data.bodyfat_pct != null ? Number(r.data.bodyfat_pct)
                        : (saved.bodyfat_pct != null ? Number(saved.bodyfat_pct) : null));
    const activity_pal = Number(r.data.activity_pal ?? saved.activity_pal ?? 1.6);
    const goal = String(r.data.goal || saved.goal || 'maintain').toLowerCase();
    const engineProfile = { sex, age_y, height_cm, weight_kg, bodyfat_pct, activity_pal, goal };

    // Compose constraints, falling back to saved preferences
    const constraints = {
      diet: r.data.diet || saved.diet || 'omnivore',
      allergies: (r.data.allergies && r.data.allergies.length) ? r.data.allergies : (saved.allergies || []),
      dislikes: (r.data.dislikes && r.data.dislikes.length) ? r.data.dislikes : (saved.dislikes || []),
      creatineOn: _creatineOn
    };

    // First, generate a day plan to compute targets and handle errors
    try {
      const reqDay = {
        engine_version: 'v1.0.0',
        data_version: '2025-09-17',
        profile: engineProfile,
        constraints,
        features: { ai_swaps: false, live_prices: false }
      };
      const dayRes = generateDayPlan(reqDay);
      if (dayRes?.type === 'error') {
        showSnack(dayRes.message || 'Generation error');
        return;
      }
      // Persist targets for diet bars
      try {
        const goalStore = {
          engine_version: dayRes.engine_version,
          data_version: dayRes.data_version,
          targets: dayRes.targets
        };
        localStorage.setItem('nutrify_targets', JSON.stringify(goalStore));
        const g = dayRes.targets || {};
        const legacy = {
          kcal: g.kcal,
          protein: g.protein_g,
          fibre: g.fiber_g,
          iron: 8,
          zinc: 14
        };
        // Current bars key
        localStorage.setItem('diet_goals_v1', JSON.stringify(legacy));
        // Back-compat for older Diet bars
        localStorage.setItem('diet_goal', JSON.stringify(legacy));
      } catch {}

      // Now generate a full week plan using rotation
      const reqWeek = {
        profile: engineProfile,
        constraints
      };
      const out = generateWeekPlan(reqWeek);
      if (out && out.plan) {
        // Apply via plan.io; this persists plan and emits events
        applyPlanToDiet({ plan: out.plan, meta: out.meta || {} });
        showSnack(dayRes.summary || 'Plan generated');
      }
    } catch (e) {
      console.warn('Generation failed', e);
      alert('Could not generate a plan.');
    }
  };
}

function onGenerateFromProfile(u){
  // Prefer UNSAVED form values first
  const r = readFromUI(u);
  const saved = getProfile() || defaults();

  // Compose engine profile with fallback for optional fields
  const sex = (r.data.gender || saved.gender || 'male').toLowerCase();
  const height_cm = (r.data.height_cm === '' || r.data.height_cm == null)
      ? (Number(saved.height_cm) || 175)
      : Number(r.data.height_cm);
  const weight_kg = Number(r.data.weight_kg || saved.weight_kg || 71);
  const age_y = Number((r.data.age_y ?? saved.age_y ?? 23) || 23);
  const bodyfat_pct = (r.data.bodyfat_pct != null ? Number(r.data.bodyfat_pct)
                      : (saved.bodyfat_pct != null ? Number(saved.bodyfat_pct) : null));
  const activity_pal = Number(r.data.activity_pal ?? saved.activity_pal ?? 1.6);
  const goal = String(r.data.goal || saved.goal || 'maintain').toLowerCase();

  const engineProfile = { sex, age_y, height_cm, weight_kg, bodyfat_pct, activity_pal, goal };
  const constraints = {
    diet: r.data.diet || saved.diet || 'omnivore',
    allergies: r.data.allergies?.length ? r.data.allergies : (saved.allergies || []),
    dislikes: r.data.dislikes?.length ? r.data.dislikes : (saved.dislikes || []),
    budget_mode: false,
    time_per_meal: '<=20min',
    training_days: r.data.training_days?.length ? r.data.training_days : (saved.training_days || [])
  };

  const req = {
    engine_version: 'v1.0.0',
    data_version: '2025-09-17',
    profile: engineProfile,
    constraints,
    features: { ai_swaps: false, live_prices: false }
  };

  const result = generateDayPlan(req);
  if (result?.type === 'error'){
    showSnack(result.message || 'Generation error');
    return;
  }


  // ---- Phase 1: Save engine targets for Diet bars (future-proof) ----
  try {
    const goalStore = {
      engine_version: result.engine_version,
      data_version: result.data_version,
      targets: result.targets
    };
    localStorage.setItem('nutrify_targets', JSON.stringify(goalStore));
  } catch {}

  // Back-compat for legacy Diet bars that read GOAL_KEY ('diet_goal')
  try {
    const g = result.targets || {};
    const legacy = {
      kcal: g.kcal,
      protein: g.protein_g,
      fibre: g.fiber_g,
      iron: 8,
      zinc: 14
    };
    localStorage.setItem('diet_goal', JSON.stringify(legacy));
  } catch {}
  // -------------------------------------------------------------------
  // Convert engine JSON → legacy weekly plan and APPLY DIRECTLY
  const weeklyPlan = planFromEngine(result);

  // -------------- APPLY VIA plan.io (preferred) --------------
  try {
    applyPlanToDiet(result); // persists to NUTRIFY__PLAN and legacy key, emits PLAN_UPDATED
  } catch (e) {
    // Fallback to legacy apply for safety
    const weeklyPlan = planFromEngine(result || {});
    window.mealPlan = weeklyPlan;
    try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(weeklyPlan)); } catch {}
    if (typeof window.renderDiet === 'function') { try { window.renderDiet(); } catch {} }
  }
  // -----------------------------------------------------
showSnack(result.summary || 'Plan generated');
}

/* Map engine result to legacy mealPlan (same plan to all days) */

function planFromEngine(engineRes){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  // CASE A: New week-plan { plan: { Monday:{breakfast:{},lunch:{},dinner:{},snacks:{}}, ... } }
  if (engineRes && engineRes.plan && typeof engineRes.plan === 'object' && Object.keys(engineRes.plan).length){
    const plan = {};
    for (const d of days){
      const dayObj = engineRes.plan[d] || {};
      const mealsArr = [];
      if (dayObj.breakfast) mealsArr.push({ meal:'Breakfast', items: (dayObj.breakfast.items||[])});
      if (dayObj.lunch)     mealsArr.push({ meal:'Lunch',     items: (dayObj.lunch.items||[])});
      if (dayObj.dinner)    mealsArr.push({ meal:'Dinner',    items: (dayObj.dinner.items||[])});
      if (dayObj.snacks)    mealsArr.push({ meal:'Snacks',    items: (dayObj.snacks.items||[])});
      plan[d] = mealsArr;
    }
    return plan;
  }

  // CASE B: Day-plan { meals: [...] } → replicate into a week (legacy behavior)
  const legacyMeals = (engineRes.meals || []).map(m => ({
    meal: (m.slot || 'meal').replace(/^\w/, c => c.toUpperCase()),
    items: (m.items || []).map(it => ({
      food: it.food || it.food_name || String(it.food_id||'').replace(/^food_/,'').replace(/_/g,' '),
      qty: (typeof it.qty === 'string' && it.qty) ? it.qty : `${Math.round(Number(it.qty_g||0))} g`
    }))
  }));
  const plan = {};
  for (const d of days) plan[d] = legacyMeals;
  return plan;
}