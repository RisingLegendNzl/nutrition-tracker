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

function defaults(){
  return {
    gender:'male',
    height_cm:175,
    weight_kg:70,
    age_y:23,
    bodyfat_pct:null,
    activity_pal:1.6,
    goal:'maintain',
    diet:'omnivore',
    allergies:[],
    dislikes:[],
    training_days:[],
    store_preference:'none'
  };
}

export function getProfile(){
  try{
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{
    return null;
  }
}

export function saveProfile(p){
  try{ localStorage.setItem(KEY, JSON.stringify(p)); }catch{}
  listeners.forEach(fn => { try{ fn(p); }catch{} });
}

function readFromUI(u){
  const pick = n => (u.querySelector?.(`[name="${n}"]`)?.value ?? u[n]?.value ?? '');
  const arr = n => (pick(n) ? pick(n).split(',').map(x=>x.trim()).filter(Boolean) : []);
  const p = {};
  p.gender = pick('gender') || 'male';
  p.height_cm = Number(pick('height_cm') || 175);
  p.weight_kg = Number(pick('weight_kg') || 70);
  p.age_y = Number(pick('age_y') || 23);
  p.bodyfat_pct = pick('bodyfat_pct') === '' ? null : Number(pick('bodyfat_pct'));
  p.activity_pal = Number(pick('activity_pal') || 1.6);
  p.goal = (pick('goal') || 'maintain').toLowerCase();
  p.diet = (pick('diet') || 'omnivore').toLowerCase();
  p.allergies = arr('allergies');
  p.dislikes = arr('dislikes');
  p.training_days = arr('training_days');
  p.store_preference = pick('store_preference') || 'none';
  return { data: p };
}

/* =============== Render / Mount =============== */
function ensureRoot(){
  if (root) return root;
  root = document.getElementById('profilePage');
  return root;
}

export function onProfileChange(cb){ listeners.add(cb); return () => listeners.delete(cb); }

export { ensureRoot as renderProfile, ensureRoot as initProfile };

/* =============== Generate Plan wiring =============== */

function injectGenerateButton(u){
  let btn = document.getElementById('p_gen');
  if (!btn){
    btn = document.createElement('button');
    btn.id = 'p_gen';
    btn.className = 'primary';
    btn.textContent = 'Generate Meal';
    const host = document.querySelector('#profilePage .card') || document.getElementById('profilePage');
    if (host) host.appendChild(btn);
  }
  btn.onclick = () => onGenerateFromProfile(u);
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

  // Save engine targets for Diet bars (future-proof)
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

  // Map engine JSON → legacy weekly plan (same plan to all days)
  const weeklyPlan = planFromEngine(result);

  // -------------- APPLY VIA IO LAYER --------------
  try {
    applyPlanToDiet({ 
      plan: weeklyPlan, 
      meta: { type:'week_plan', source:'profile', created_at: new Date().toISOString() } 
    });
  } catch (e) {
    console.warn('applyPlanToDiet failed, falling back', e);
    try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(weeklyPlan)); } catch {}
    try { window.renderDiet && window.renderDiet(); } catch {}
  }
  // -----------------------------------------------------

  showSnack(result.summary || 'Plan generated');
}

/* Map engine result to legacy mealPlan (same plan to all days) */
function planFromEngine(engineRes){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const idToName = Object.fromEntries((foodsBundle?.foods || []).map(f => [f.id, f.name]));
  const legacyMeals = (engineRes.meals || []).map(m => ({
    meal: (m.slot || 'meal').replace(/^\w/, c => c.toUpperCase()),
    items: (m.items || []).map(it => ({
      food_id: it.food_id,
      food: idToName[it.food_id] || (String(it.food_id||'').replace(/^food_/,'').replace(/_/g,' ')),
      qty: `${Math.round(Number(it.qty_g||0))} g`
    }))
  }));
  const plan = {};
  for (const d of days) plan[d] = legacyMeals;
  return plan;
}

/* ============= Utilities ============= */
function syncUI(u, p){
  if (!u) return;
  const set = (name, val) => {
    const el = u.querySelector?.(`[name="${name}"]`) || u[name];
    if (el) el.value = (val ?? '');
  };
  set('gender', p.gender);
  set('height_cm', p.height_cm);
  set('weight_kg', p.weight_kg);
  set('age_y', p.age_y);
  set('bodyfat_pct', p.bodyfat_pct ?? '');
  set('activity_pal', p.activity_pal);
  set('goal', p.goal);
  set('diet', p.diet);
  set('allergies', (p.allergies||[]).join(', '));
  set('dislikes', (p.dislikes||[]).join(', '));
  set('training_days', (p.training_days||[]).join(', '));
  set('store_preference', p.store_preference || 'none');
}

export function mountProfile(){
  const el = ensureRoot();
  if (!el) return;
  // gather a lightweight field map
  const u = new Proxy(el, {
    get(target, prop){ return target.querySelector?.(`[name="${String(prop)}"]`); }
  });

  const saved = getProfile() || defaults();
  syncUI(el, saved);

  // Save hook
  const saveBtn = el.querySelector('#profileSave') || document.getElementById('profileSave');
  if (saveBtn){
    saveBtn.onclick = () => {
      const r = readFromUI(u);
      saveProfile({ ...saved, ...r.data });
      showSnack('Profile saved');
    };
  }

  // Generate hook
  const genBtn = el.querySelector('#profileGenerate') || document.getElementById('profileGenerate');
  if (genBtn) genBtn.onclick = () => onGenerateFromProfile(u);

  // Also ensure a fallback inline button exists
  injectGenerateButton(u);
}
