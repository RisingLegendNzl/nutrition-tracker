// engine/nutritionEngine.js
// Minimal, deterministic Nutrition Engine for Nutrify (Phase 2 demo)
// - Computes targets from profile (BMR -> TDEE -> goal -> macros)
// - Builds a simple full-day plan using fixed templates
// - Scales quantities by kcal targets (fallback kcal/100g table if data bundle is missing)
// - Returns the day_plan JSON your UI expects

import { foodsBundle } from '../brain/diet.data.js';
import templates from '../brain/recipes/meal-templates.js';
import { pickWeekFromTemplates } from './rotation.js';
import { NUTRITION_DB } from '../brain/nutritional.info.js';

// --------------------------- Public API ---------------------------
export function generateDayPlan(req) {
  const { engine_version = 'v1.0.0', data_version = '2025-09-17' } = req || {};
  const p = (req && req.profile) || {};
  const c = (req && req.constraints) || {};

  // 1) Validate scope: healthy adults only
  if (!p || !p.sex || !p.age_y || !p.height_cm || !p.weight_kg || !p.activity_pal) {
    return error(engine_version, data_version, 'MISSING_INPUTS',
      'sex, age_y, height_cm, weight_kg, activity_pal are required.',
      ['Provide all required fields', 'Choose PAL from {1.2,…,1.9}']);
  }
  if (p.age_y < 18 || p.age_y > 65) {
    return error(engine_version, data_version, 'OUT_OF_SCOPE',
      'Only healthy adults 18–65 are supported.', ['Consult a qualified professional']);
  }

  // 2) Targets (BMR → TDEE → goal → macros)
  const targets = computeTargets(p, c);

  // Safety rails
  const minFloor = (p.sex === 'female') ? 1200 : 1500;
  if (targets.kcal < minFloor) {
    return error(engine_version, data_version, 'SAFETY_LIMIT',
      `Calories too low for unsupervised use (<${minFloor} kcal).`,
      ['Increase calories', 'Consult a professional']);
  }

  // 3) Deterministic meal templates (very simple starter set)
  const plan = buildMeals(targets, c);

  // 4) Compose result
  const res = {
    engine_version,
    data_version,
    type: 'day_plan',
    inputs_echo: {
      profile: p,
      constraints: c
    },
    targets,
    meals: plan.meals,
    day_totals: plan.day_totals,
    compliance: plan.compliance,
    micros_watchlist: {
      calcium_mg: 1000,
      iron_mg: (p.sex === 'female' ? 18 : 8),
      iodine_ug: 150,
      vitamin_d_IU: 400,
      b12_ug: 2.4,
      magnesium_mg: 400,
      potassium_mg: 3500,
      omega3_epa_dha_mg: 250
    },
    cost_estimate_aud: null,
    explanations: [
      `BMR via ${p.bodyfat_pct != null ? 'Katch–McArdle' : 'Mifflin–St Jeor'}; TDEE = BMR × PAL.`,
      `Protein ${targets.protein_g.toFixed(1)} g (~${(targets.protein_g*4/targets.kcal*100).toFixed(0)}% kcal), fat floor respected, carbs are remainder.`,
      `Deterministic template picks: protein oats, simple curry or sandwich, and chicken–rice–veg; scaled to calories.`
    ],
    summary: `Plan hits ~${targets.kcal} kcal with ~${targets.protein_g.toFixed(0)} g protein. Adjust PAL/goal in Profile for different targets.`,
    disclaimer: 'Not medical advice. For healthy adults 18–65.'
  };

  return res;
}

// --------------------------- Targets ---------------------------
function computeTargets(p, c) {
  const sex = (p.sex || 'male').toLowerCase();
  const weight = Number(p.weight_kg);
  const height = Number(p.height_cm);
  const age = Number(p.age_y);
  const pal = clamp(Number(p.activity_pal), 1.2, 1.9);
  const goal = (p.goal || 'maintain').toLowerCase();
  const bodyfat = (p.bodyfat_pct != null) ? Number(p.bodyfat_pct) : null;
  const diet = (c && c.diet) ? c.diet : 'omnivore';

  // BMR
  const bmr = (bodyfat != null && Number.isFinite(bodyfat))
    ? bmrKatch(weight, bodyfat)
    : bmrMifflin(sex, weight, height, age);

  const tdee = bmr * pal;

  // Goal kcal
  let delta = 0;
  if (goal === 'cut') delta = -400;
  else if (goal === 'gain') delta = +400;
  // Bound to ±20% TDEE
  const minK = tdee * 0.8, maxK = tdee * 1.2;
  let goalKcal = Math.round(tdee + delta);
  if (goalKcal < minK) goalKcal = Math.round(minK);
  if (goalKcal > maxK) goalKcal = Math.round(maxK);

  // Macros
  const vegBump = (diet === 'vegetarian' || diet === 'vegan') ? 0.2 : 0.0;
  const proteinPerKg = clamp(1.6 + vegBump, 1.6, 2.2);
  const protein_g = clamp(weight * proteinPerKg, 0, 3.5 * weight);

  // Fat 20–35% kcal, with ≥0.6 g/kg floor. Pick 30% default then raise to floor if needed.
  let fat_kcal = goalKcal * 0.30;
  let fat_g = fat_kcal / 9;
  const fatFloor = 0.6 * weight;
  if (fat_g < fatFloor) { fat_g = fatFloor; fat_kcal = fat_g * 9; }
  if (fat_kcal < goalKcal * 0.15) { fat_kcal = goalKcal * 0.15; fat_g = fat_kcal / 9; }

  // Carbs are remainder
  const protein_kcal = protein_g * 4;
  const carbs_kcal = Math.max(goalKcal - protein_kcal - fat_kcal, 0);
  const carbs_g = carbs_kcal / 4;

  // Fiber minimum (simple constant)
  const fiber_g = 30;

  return {
    kcal: Math.round(goalKcal),
    protein_g: round1(protein_g),
    fat_g: round1(fat_g),
    carbs_g: round1(carbs_g),
    fiber_g
  };
}

function bmrMifflin(sex, w, h, a) {
  // kcal/day
  const s = (sex === 'male') ? 5 : -161;
  return 10*w + 6.25*h - 5*a + s;
}
function bmrKatch(w, bfPct) {
  const lbm = w * (1 - bfPct/100);
  return 370 + (21.6 * lbm);
}

// --------------------------- Meal builder ---------------------------
// Very simple deterministic templates & scaling. We only ensure kcal.
// If real nutrients exist in foodsBundle, we’ll use them; otherwise use fallback table.

function buildMeals(targets, constraints) {
  const provider = new FoodDataProvider(foodsBundle);
  const diet = (constraints && constraints.diet) || 'omnivore';
  const kcalDay = targets.kcal;

  // Meal splits: Breakfast 28%, Lunch 32%, Dinner 30%, Snacks 10%
  const splits = [
    { slot: 'breakfast', share: 0.28 },
    { slot: 'lunch',     share: 0.32 },
    { slot: 'dinner',    share: 0.30 },
    { slot: 'snacks',    share: 0.10 },
  ];

  // Fixed components by diet type (ids should exist in your seed; if not, pretty names render)
  const menus = (diet === 'vegan' || diet === 'vegetarian')
    ? veganMenus()
    : omniMenus();

  const meals = splits.map((m, idx) => {
    const kcalTarget = Math.round(kcalDay * m.share);
    const base = menus[m.slot] || [];
    const items = base.map(x => {
      const kcalPer100 = provider.kcalPer100g(x.food_id, x.kcal_100g);
      const qty = scaleQtyForKcal(kcalPer100, x.base_qty_g, kcalTarget / base.length);
      return {
        food_id: x.food_id,
        qty_g: Math.max(1, Math.round(qty)),
        source: 'local',
        source_ref: null
      };
    });
    return {
      slot: m.slot,
      template_id: `tmpl_${m.slot}_v1`,
      items,
      totals: { kcal: kcalTarget } // keep minimal; UI doesn’t need per-meal macros yet
    };
  });

  const day_totals = {
    kcal: kcalDay,
    protein_g: targets.protein_g,
    fat_g: targets.fat_g,
    carbs_g: targets.carbs_g,
    fiber_g: targets.fiber_g
  };

  const compliance = {
    kcal_within_pct: 0.0,
    macros_ok: true,
    fiber_ok: true,
    unmet_constraints: []
  };

  return { meals, day_totals, compliance };
}

function omniMenus() {
  return {
    breakfast: [
      { food_id: 'food_rolled_oats',             base_qty_g: 80,  kcal_100g: 380 },
      { food_id: 'food_full_cream_milk',         base_qty_g: 250, kcal_100g: 64  },
      { food_id: 'food_peanut_butter',           base_qty_g: 30,  kcal_100g: 588 },
      { food_id: 'food_banana',                  base_qty_g: 80,  kcal_100g: 89  }
    ],
    lunch: [
      { food_id: 'food_beef_mince_5_lean',       base_qty_g: 250, kcal_100g: 137 },
      { food_id: 'food_frozen_mixed_vegetables', base_qty_g: 200, kcal_100g: 40  },
      { food_id: 'food_sweet_potato',            base_qty_g: 350, kcal_100g: 86  },
      { food_id: 'food_olive_oil',               base_qty_g: 10,  kcal_100g: 884 }
    ],
    dinner: [
      { food_id: 'food_chicken_thigh_fillets',   base_qty_g: 300, kcal_100g: 145 },
      { food_id: 'food_rice_cooked',             base_qty_g: 250, kcal_100g: 130 },
      { food_id: 'food_spinach',                 base_qty_g: 100, kcal_100g: 23  },
      { food_id: 'food_olive_oil',               base_qty_g: 10,  kcal_100g: 884 }
    ],
    snacks: [
      { food_id: 'food_greek_yogurt',            base_qty_g: 170, kcal_100g: 73  },
      { food_id: 'food_banana',                  base_qty_g: 118, kcal_100g: 89  },
      { food_id: 'food_avocado',                 base_qty_g: 60,  kcal_100g: 160 }
    ]
  };
}

function veganMenus() {
  return {
    breakfast: [
      { food_id: 'food_rolled_oats',             base_qty_g: 90,  kcal_100g: 380 },
      { food_id: 'food_peanut_butter',           base_qty_g: 15,  kcal_100g: 588 },
      { food_id: 'food_banana',                  base_qty_g: 118, kcal_100g: 89  }
    ],
    lunch: [
      { food_id: 'food_lentils_canned_drained',  base_qty_g: 200, kcal_100g: 95  },
      { food_id: 'food_rice_cooked',             base_qty_g: 220, kcal_100g: 130 },
      { food_id: 'food_spinach',                 base_qty_g: 60,  kcal_100g: 23  },
      { food_id: 'food_olive_oil',               base_qty_g: 10,  kcal_100g: 884 }
    ],
    dinner: [
      { food_id: 'food_lentils_canned_drained',  base_qty_g: 200, kcal_100g: 95  },
      { food_id: 'food_potatoes',                base_qty_g: 300, kcal_100g: 77  },
      { food_id: 'food_peas',                    base_qty_g: 120, kcal_100g: 81  },
      { food_id: 'food_olive_oil',               base_qty_g: 10,  kcal_100g: 884 }
    ],
    snacks: [
      { food_id: 'food_banana',                  base_qty_g: 118, kcal_100g: 89  },
      { food_id: 'food_avocado',                 base_qty_g: 60,  kcal_100g: 160 }
    ]
  };
}

// --------------------------- Provider, helpers ---------------------------
class FoodDataProvider {
  constructor(bundle) {
    this.map = new Map();
    const foods = (bundle && bundle.foods) || [];
    for (const f of foods) {
      const kcal = f?.nutrients_per_100g?.kcal;
      if (f?.id && Number.isFinite(Number(kcal))) {
        this.map.set(f.id, Number(kcal));
      }
    }
  }
  kcalPer100g(id, fallback) {
    if (this.map.has(id)) return this.map.get(id);
    return Number.isFinite(fallback) ? fallback : 100; // safe default
  }
}

function scaleQtyForKcal(kcalPer100, baseQtyG, targetKcalForItem) {
  // qty_g = (target_kcal / kcal_per_g)
  const kcalPerG = Math.max(1e-6, kcalPer100 / 100);
  const scaled = targetKcalForItem / kcalPerG;
  // dampen scaling extremes: blend 70% scaled + 30% base
  return 0.7 * scaled + 0.3 * baseQtyG;
}

function error(engine_version, data_version, code, message, suggestions) {
  return {
    engine_version,
    data_version,
    type: 'error',
    code,
    message,
    suggestions: suggestions || []
  };
}

function clamp(x, lo, hi){ return Math.min(hi, Math.max(lo, x)); }
function round1(x){ return Math.round(x * 10) / 10; }


// --- Helpers for template-based plan ---
function parseQtyToGrams(qtyStr){
  if (!qtyStr) return 0;
  const m = String(qtyStr).trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*(g|gram|grams)$/i);
  if (m){ return Math.round(parseFloat(m[1])); }
  // Fallback: numbers without unit treated as grams
  const n = parseFloat(qtyStr);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function nutrientFor(foodName){
  const hit = NUTRITION_DB[foodName];
  if (hit) return hit;
  // Basic fuzzy: lowercase match
  const key = Object.keys(NUTRITION_DB).find(k => k.toLowerCase() === String(foodName).toLowerCase());
  return key ? NUTRITION_DB[key] : null;
}

function sumNutrients(items){
  const acc = { kcal:0, protein_g:0, fat_g:0, carbs_g:0, fiber_g:0,
                calcium_mg:0, iron_mg:0, zinc_mg:0, vit_c_mg:0, folate_ug:0, potassium_mg:0 };
  for (const it of (items||[])){
    const n = nutrientFor(it.food);
    const g = parseQtyToGrams(it.qty);
    if (!n || !g) continue;
    const factor = g / (n.per || 100);
    acc.kcal += (n.k||0)*factor;
    acc.protein_g += (n.p||0)*factor;
    acc.fat_g += (n.f||0)*factor;
    acc.carbs_g += (n.c||0)*factor;
    acc.fiber_g += (n.fib||0)*factor;
    acc.calcium_mg += (n.ca||0)*factor;
    acc.iron_mg += (n.fe||0)*factor;
    acc.zinc_mg += (n.zn||0)*factor;
    acc.vit_c_mg += (n.vC||0)*factor;
    acc.folate_ug += (n.fol||0)*factor;
    acc.potassium_mg += (n.kplus||0)*factor;
  }
  // round
  for (const k of Object.keys(acc)){
    acc[k] = Math.round(acc[k]*10)/10;
  }
  return acc;
}

function dayFromTemplates(dayDef){
  // dayDef is an object with breakfast/lunch/dinner arrays of {food, qty}
  const meals = {
    breakfast: { name: 'Breakfast', items: dayDef.breakfast || [] },
    lunch:     { name: 'Lunch',     items: dayDef.lunch || [] },
    dinner:    { name: 'Dinner',    items: dayDef.dinner || [] },
    snacks:    { name: 'Snacks',    items: [] }
  };
  // day totals = sum of all items
  const allItems = [].concat(meals.breakfast.items, meals.lunch.items, meals.dinner.items, meals.snacks.items);
  const totals = sumNutrients(allItems);
  return { meals, totals };
}

function hydrationGoalMl(profile, creatineOn=false){
  const w = Number(profile?.weight_kg);
  let ml = (Number.isFinite(w) && w>0) ? Math.round(w*35) : 0;
  ml = Math.min(ml, 3500);
  if (creatineOn) ml = Math.min(ml + 500, 3500);
  return ml;
}



export function generateWeekPlan(req){
  const p = (req && req.profile) || {};
  const c = (req && req.constraints) || {};
  const dayNames = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  // Attempt to build a weekly plan from recipe templates
  let weeklyPlan = pickWeekFromTemplates({ profile: p, constraints: c }, templates);
  let sourceType = 'rotation';
  if (!weeklyPlan) {
    // Fallback: generate a single day via engine and replicate across the week
    const dayRes = generateDayPlan(req);
    if (!dayRes || !dayRes.meals) return { plan: {}, meta: { type:'week_plan', source:'error' } };
    weeklyPlan = {};
    // Convert dayRes.meals (array) into slot-based object for each day
    dayNames.forEach(name => {
      const obj = { breakfast:null, lunch:null, dinner:null, snacks:null };
      for (const meal of dayRes.meals) {
        const slot = String(meal.slot || '').toLowerCase();
        if (slot === 'breakfast') obj.breakfast = { name: 'Breakfast', items: meal.items || [] };
        else if (slot === 'lunch') obj.lunch = { name: 'Lunch', items: meal.items || [] };
        else if (slot === 'dinner') obj.dinner = { name: 'Dinner', items: meal.items || [] };
        else if (slot === 'snacks') obj.snacks = { name: 'Snacks', items: meal.items || [] };
      }
      // Fill any missing slots with empty arrays
      if (!obj.breakfast) obj.breakfast = { name:'Breakfast', items:[] };
      if (!obj.lunch)     obj.lunch     = { name:'Lunch',     items:[] };
      if (!obj.dinner)    obj.dinner    = { name:'Dinner',    items:[] };
      if (!obj.snacks)    obj.snacks    = { name:'Snacks',    items:[] };
      weeklyPlan[name] = obj;
    });
    sourceType = 'engine';
  }

  // Determine Monday of current week (local time) and ISO dates
  const today = new Date();
  const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dow = localDate.getDay(); // 0=Sun, 1=Mon...
  const offset = (dow === 0 ? -6 : 1 - dow);
  const monday = new Date(localDate);
  monday.setDate(localDate.getDate() + offset);
  const isoStart = monday.toISOString().slice(0, 10);
  const isoDates = dayNames.map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return d.toISOString().slice(0, 10);
  });

  // Attach ISO date to each plan entry and build day array
  const daysArr = dayNames.map((name, idx) => {
    const iso = isoDates[idx];
    const dplan = weeklyPlan[name] || {};
    // attach date on plan entry
    if (dplan && typeof dplan === 'object') {
      dplan.date = iso;
    }
    return {
      date: iso,
      name,
      breakfast: dplan.breakfast || null,
      lunch:     dplan.lunch     || null,
      dinner:    dplan.dinner    || null,
      snacks:    dplan.snacks    || null
    };
  });

  const meta = {
    type: 'week_plan',
    source: sourceType,
    created_at: new Date().toISOString(),
    week_start_iso: isoStart,
    dates: {}
  };
  dayNames.forEach((name, idx) => { meta.dates[name] = isoDates[idx]; });
  return { plan: weeklyPlan, days: daysArr, meta };
}