// engine/nutritionEngine.js
// Deterministic week-plan generator using templates + portions + rotation.
// Pure: no DOM, no localStorage.

import mealTemplates from '../brain/recipes/meal-templates.js';
import foodsCore from '../brain/foods/foods.core.js';
import { findFood as findNutrition } from '../brain/nutritional.info.js';
import { seededRng, rotateUniqueByProtein, rotateSimple } from './rotation.js';
import { foodForName, qtyToGrams } from './portions.js';

// ---------- helpers ----------
function weekNumberFor(date = new Date()){
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNum;
}
function hash32(str){
  let h = 0;
  for (let i=0;i<str.length;i++){
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

function canonicalProfile(p){
  return {
    sex: (p.sex||'male').toLowerCase(),
    age_y: Number(p.age_y||23),
    height_cm: Number(p.height_cm||175),
    weight_kg: Number(p.weight_kg||71),
    bodyfat_pct: p.bodyfat_pct != null ? Number(p.bodyfat_pct) : null,
    activity_pal: Number(p.activity_pal||1.6),
    goal: (p.goal||'maintain').toLowerCase(),
    diet: (p.diet||'omnivore').toLowerCase(),
    allergies: Array.isArray(p.allergies) ? p.allergies : [],
    dislikes: Array.isArray(p.dislikes) ? p.dislikes : [],
    training_days: Array.isArray(p.training_days) ? p.training_days : []
  };
}

function hydrationGoalMl(profile, creatineEnabled){
  const base = Math.min(Math.round((Number(profile.weight_kg)||0) * 35), 3500);
  return base + (creatineEnabled ? 500 : 0);
}

function mealToItems(template){
  // returns [{food_id, qty_g}]
  const items = [];
  for (const it of (template.items||[])){
    const food = foodForName(it.food);
    if (!food) continue;
    const grams = qtyToGrams(food, it.qty);
    items.push({ food_id: food.id, qty_g: grams });
  }
  return items;
}

function nutritionTotals(items){
  // items: {food_id, qty_g}; nutrition DB provides per-100g by *name*
  let k=0,p=0,c=0,f=0,fib=0;
  for (const it of items){
    const food = foodsCore.find(f => f.id === it.food_id);
    if (!food) continue;
    const hit = findNutrition(food.name);
    if (!hit || !hit.data) continue;
    const per = hit.data;
    const factor = (it.qty_g || 0) / 100;
    k   += (per.k   || 0) * factor;
    p   += (per.p   || 0) * factor;
    c   += (per.c   || 0) * factor;
    f   += (per.f   || 0) * factor;
    fib += (per.fib || 0) * factor;
  }
  const r = x => Math.round(x);
  return { kcal: r(k), protein_g: r(p), carbs_g: r(c), fat_g: r(f), fiber_g: r(fib) };
}

// ---------- main ----------
export function generateWeekPlan(req={}){
  const p = canonicalProfile(req.profile||{});
  const constraints = req.constraints || {};
  const weekNum = weekNumberFor(new Date());
  const seedStr = JSON.stringify(p) + '|' + weekNum;
  const rng = seededRng(String(hash32(seedStr)));

  // Pools
  const breakfasts = mealTemplates.filter(t => t.slot === 'Breakfast');
  const lunches    = mealTemplates.filter(t => t.slot === 'Lunch');
  const dinners    = mealTemplates.filter(t => t.slot === 'Dinner');

  // 7-day rotation
  const bSeq = rotateSimple(breakfasts, 7, rng);
  const lSeq = rotateUniqueByProtein(lunches, 7, rng);
  const dSeq = rotateUniqueByProtein(dinners, 7, rng);

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const plan = {};

  for (let i=0;i<7;i++){
    const dayMeals = [];
    const slots = [bSeq[i], lSeq[i], dSeq[i]].filter(Boolean);
    for (const tmpl of slots){
      const items = mealToItems(tmpl);
      dayMeals.push({ slot: tmpl.slot || 'Meal', items });
    }
    plan[days[i]] = dayMeals;
  }

  // Compute totals per day (optional meta)
  const totals = {};
  for (const d of days){
    const t = { kcal:0, protein_g:0, carbs_g:0, fat_g:0, fiber_g:0 };
    for (const m of plan[d]){
      const mt = nutritionTotals(m.items);
      t.kcal += mt.kcal; t.protein_g += mt.protein_g; t.carbs_g += mt.carbs_g; t.fat_g += mt.fat_g; t.fiber_g += mt.fiber_g;
    }
    totals[d] = t;
  }

  // hydration meta (creatine flag may be in constraints or profile supps elsewhere; default false)
  const hydro_goal_ml = hydrationGoalMl(p, Boolean(constraints.creatine_enabled));

  return {
    plan,
    meta: {
      type:'week_plan',
      created_at: new Date().toISOString(),
      seed_week: weekNum,
      profile_hash: hash32(JSON.stringify(p)),
      hydration_goal_ml: hydro_goal_ml,
      notes: 'Deterministic rotation with breakfast pool + unique protein lunches/dinners'
    },
    totals
  };
}
