// js/profile.js — unified Generate -> applyPlanToDiet with week mapping

import { applyPlanToDiet } from './plan.io.js';
import { generateDayPlan, generateWeekPlan } from '../engine/nutritionEngine.js';
import { foodsBundle } from '../brain/diet.data.js';
import { showSnack } from './utils.js';

/* ================= Profile helpers ================= */
export function getProfile() {
  try {
    const raw = localStorage.getItem('nutrify_profile_v1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function defaults() {
  return {
    gender: 'male',
    age_y: 23,
    height_cm: 175,
    weight_kg: 70,
    bodyfat_pct: null,
    activity_pal: 1.6,
    goal: 'maintain',
    diet: 'omnivore',
    allergies: [],
    dislikes: [],
    training_days: [],
    store_preference: 'none'
  };
}

function readFromUI(u) {
  const get = (name, def='') => (u[name]?.value ?? u.querySelector?.(`[name="${name}"]`)?.value ?? def);
  const split = (name) => (get(name,'').split(',').map(x=>x.trim()).filter(Boolean));
  const data = {};
  data.gender = get('gender','male');
  data.age_y = get('age_y','');
  data.height_cm = get('height_cm','');
  data.weight_kg = get('weight_kg','');
  data.bodyfat_pct = get('bodyfat_pct','');
  data.activity_pal = get('activity_pal','1.6');
  data.goal = get('goal','maintain');
  data.diet = get('diet','omnivore');
  data.allergies = split('allergies');
  data.dislikes = split('dislikes');
  data.training_days = split('training_days');
  data.store_preference = get('store_preference','none');
  return { data };
}

/* ============= Generate Meal from Profile ============= */
function onGenerateFromProfile(u){
  const r = readFromUI(u);
  const saved = getProfile() || defaults();

  // Compose engine profile
  const sex = (r.data.gender || saved.gender || 'male').toLowerCase();
  const height_cm = (r.data.height_cm === '' || r.data.height_cm == null)
      ? (Number(saved.height_cm) || 175)
      : Number(r.data.height_cm);
  const weight_kg = Number(r.data.weight_kg || saved.weight_kg || 71);
  const age_y = Number((r.data.age_y ?? saved.age_y ?? 23) || 23);
  const bodyfat_pct = (r.data.bodyfat_pct != null && r.data.bodyfat_pct !== '' ? Number(r.data.bodyfat_pct)
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

  // Day plan (for targets + summary)
  const result = generateDayPlan(req);
  if (result?.type === 'error'){
    showSnack(result.message || 'Generation error');
    return;
  }

  // Save targets for bars
  try {
    localStorage.setItem('nutrify_targets', JSON.stringify({
      engine_version: result.engine_version,
      data_version: result.data_version,
      targets: result.targets
    }));
  } catch {}

  // Legacy bars
  try {
    const g = result.targets || {};
    localStorage.setItem('diet_goal', JSON.stringify({
      kcal: g.kcal, protein: g.protein_g, fibre: g.fiber_g, iron: 8, zinc: 14
    }));
  } catch {}

  // True week plan + mapping for Diet
  const weekOut = generateWeekPlan({ ...req });
  const weeklyPlan = planWeekFromEngine(weekOut && weekOut.plan ? weekOut.plan : {});

  // Apply via IO layer
  try {
    applyPlanToDiet({
      plan: weeklyPlan,
      meta: { type:'week_plan', source:'profile', created_at: new Date().toISOString() }
    });
  } catch (e) {
    try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(weeklyPlan)); } catch {}
    try { window.renderDiet && window.renderDiet(); } catch {}
  }

  showSnack(result.summary || 'Plan generated');
}

/* Map engine week result -> Diet UI weekly plan */
function planWeekFromEngine(weekPlan){
  const idToName = Object.fromEntries((foodsBundle?.foods || []).map(f => [f.id, f.name]));
  const mapMeals = (meals) => (meals || []).map(m => ({
    meal: (m.slot || 'meal').replace(/^[a-z]/, c => c.toUpperCase()),
    items: (m.items || []).map(it => ({
      food_id: it.food_id,
      food: idToName[it.food_id] || String(it.food_id||'').replace(/^food_/,'').replace(/_/g,' '),
      qty: `${Math.round(Number(it.qty_g||0))} g`
    }))
  }));
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const out = {};
  for (const d of days) out[d] = mapMeals((weekPlan && weekPlan[d]) || []);
  return out;
}

/* ============= Mount Profile ============= */
export function mountProfile(){
  const u = {};
  document.querySelectorAll('#profilePage [name]').forEach(el => u[el.name] = el);

  // Prefill from saved profile if present
  const saved = getProfile() || defaults();
  Object.keys(saved).forEach(k => { if (u[k]) u[k].value = saved[k] ?? ''; });

  const saveBtn = document.getElementById('profileSave');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const r = readFromUI(u);
      try { localStorage.setItem('nutrify_profile_v1', JSON.stringify(r.data)); } catch {}
      showSnack('Profile saved');
    };
  }

  const genBtn = document.getElementById('profileGenerate');
  if (genBtn) genBtn.onclick = () => onGenerateFromProfile(u);
}

export { onGenerateFromProfile };