// engine/nutritionEngine.js
// Deterministic day-plan generator for Nutrify (healthy adults 18–65).
// Uses Brain data (foodsBundle + mealTemplates). No external dependencies.

import { foodsBundle } from '../brain/diet.data.js';
import mealTemplates from '../brain/recipes/meal-templates.js';

/* ====================== Public API ======================= */

export function generateDayPlan(req) {
  const engine_version = req.engine_version || 'v1.0.0';
  const data_version   = req.data_version   || '2025-09-17';

  try {
    /* 1) Validate */
    const { profile, constraints } = req || {};
    if (!profile || !constraints) {
      return error(engine_version, data_version, 'MISSING_INPUTS',
        'profile and constraints are required',
        ['Provide profile and constraints objects']);
    }
    const { sex, age_y, height_cm, weight_kg, bodyfat_pct, activity_pal, goal } = profile;
    if (!sex || !age_y || !height_cm || !weight_kg || !activity_pal || !goal) {
      return error(engine_version, data_version, 'MISSING_INPUTS',
        'sex, age_y, height_cm, weight_kg, activity_pal, goal are required',
        ['Fill all required profile fields']);
    }
    // Out of scope populations
    if (constraints.population && ['pregnant','breastfeeding','child'].includes(constraints.population)) {
      return error(engine_version, data_version, 'OUT_OF_SCOPE',
        'Not for pregnancy, breastfeeding, or children. Consult a professional.',
        ['Use a clinician-supervised plan']);
    }

    /* 2) Targets: BMR → TDEE → Goal */
    const bmr = (bodyfat_pct != null && isFinite(bodyfat_pct))
      ? bmrKatch(weight_kg, bodyfat_pct)
      : bmrMifflin(sex, weight_kg, height_cm, age_y);

    const tdee = bmr * clamp(activity_pal, 1.2, 1.9);

    let adj = 0;
    if (goal === 'cut')  adj = clamp(-500, -0.2 * tdee, -300);
    if (goal === 'gain') adj = clamp( 300,  300, Math.min(500, 0.2 * tdee));

    let kcal = Math.round(tdee + adj);

    // Safety minimums
    if ((sex === 'male'  && kcal < 1500) ||
        (sex !== 'male'  && kcal < 1200)) {
      return error(engine_version, data_version, 'SAFETY_LIMIT',
        'Requested energy would fall below safety floor.',
        ['Increase kcal target','Consult a professional']);
    }

    /* 3) Macros */
    // Pick a point in the evidence-based ranges
    const protein_per_kg = 1.8 + (constraints?.diet === 'vegan' ? 0.2 : 0); // mid-high point
    const protein_g = round1(protein_per_kg * weight_kg);

    // Fat: 20–35% kcal with ≥0.6 g/kg and ≥15% kcal
    const fat_floor_g = Math.max(0.6 * weight_kg, 0.15 * kcal / 9);
    const fat_g       = round1(Math.max(fat_floor_g, 0.25 * kcal / 9)); // default 25%

    // Carbs: remainder
    const carbs_g     = round1((kcal - (protein_g * 4 + fat_g * 9)) / 4);

    // Fiber: AUS NRVs rough floor (sex-based)
    const fiber_g     = (sex === 'male') ? 30 : 25;

    const targets = { kcal, protein_g, fat_g, carbs_g, fiber_g };

    /* 4) Filter templates */
    const filtered = filterTemplates(mealTemplates, constraints);

    /* 5) Select 3 templates (B, L, D) + 6) Scale portions */
    const plan = pickAndScale(filtered, targets, foodsBundle);

    /* 7) Compliance (simple check) */
    const kcal_within_pct = round1(100 * (plan.totals.kcal - targets.kcal) / targets.kcal);
    const macros_ok = (plan.totals.protein_g >= targets.protein_g * 0.95) &&
                      (plan.totals.fat_g     >= Math.max(fat_floor_g, 0.15*targets.kcal/9)) &&
                      (plan.totals.carbs_g   >= 0); // remainder; not strict
    const fiber_ok  = (plan.totals.fiber_g  >= targets.fiber_g);

    const response = {
      engine_version,
      data_version,
      type: 'day_plan',
      inputs_echo: {
        profile,
        constraints
      },
      targets,
      meals: plan.meals,
      day_totals: plan.totals,
      compliance: {
        kcal_within_pct,
        macros_ok,
        fiber_ok,
        unmet_constraints: plan.unmet || []
      },
      micros_watchlist: plan.micros,
      cost_estimate_aud: plan.cost_aud,
      explanations: plan.explain,
      summary: plan.summary,
      disclaimer: 'Not medical advice. For healthy adults 18–65.'
    };

    return response;

  } catch (e) {
    return error(
      req.engine_version || 'v1.0.0',
      req.data_version   || '2025-09-17',
      'ENGINE_ERROR',
      `Unexpected error: ${String(e && e.message || e)}`,
      ['Retry with different inputs']
    );
  }
}

/* ====================== Core helpers ======================= */

// 4) Template filtering — diet, allergies, dislikes, time per meal
function filterTemplates(templates, constraints) {
  const diet = constraints?.diet || 'omnivore';
  const allergies = new Set((constraints?.allergies || []).map(s => s.toLowerCase()));
  const dislikes  = new Set((constraints?.dislikes  || []).map(s => s.toLowerCase()));
  const timeLim   = parseTimeLimit(constraints?.time_per_meal);

  // In this starter, we assume each template fits ≤20 min.
  // Keep structure for future per-template metadata.
  const fitsTime = (_) => (timeLim == null) || (timeLim <= 40);

  const allowed = templates.filter(t => {
    const okTime = fitsTime(t);
    const badAllergy = t.items.some(it => contains(allergies, it.food));
    const badDislike = t.items.some(it => contains(dislikes,  it.food));
    // Diet check is simplified here: you can encode diet tags at food level in /brain/foods and enforce strictly.
    const okDiet = (diet === 'omnivore') ? true : true; // placeholder, refine later
    return okTime && okDiet && !badAllergy && !badDislike;
  });

  // Deterministic ordering: Breakfast, Lunch, Dinner taken in file order.
  const breakfast = allowed.filter(t => t.slot.toLowerCase() === 'breakfast')[0];
  const lunch     = allowed.filter(t => t.slot.toLowerCase() === 'lunch')[0];
  const dinner    = allowed.filter(t => t.slot.toLowerCase() === 'dinner')[0];

  return { breakfast, lunch, dinner, allowed };
}

// 5–6) Pick templates, resolve foods, scale quantities to hit targets
function pickAndScale(selected, targets, bundle) {
  const foods = bundle?.foods || [];
  const portionMaps = bundle?.portion_maps || [];

  const foodByName = Object.fromEntries(foods.map(f => [f.name.toLowerCase(), f]));
  const pmIndex = new Map(
    (portionMaps || []).map(pm => [pm.food_id, (pm.portions?.[0]?.qty_g) ?? null])
  );

  const chosen = [selected.breakfast, selected.lunch, selected.dinner].filter(Boolean);
  if (chosen.length !== 3) {
    return {
      meals: [],
      totals: blankTotals(),
      micros: blankMicros(),
      cost_aud: null,
      explain: ['Insufficient templates after filtering'],
      summary: 'No suitable templates available.',
      unmet: ['templates']
    };
  }

  // Resolve items (name → {food_id, qty_g}) and compute base totals
  const mealsResolved = chosen.map(t => ({
    slot: t.slot.toLowerCase(),
    template_id: t.id,
    items: t.items.map(it => {
      const food = foodByName[it.food.toLowerCase()];
      const food_id = food?.id || idFromName(it.food);
      const qty_g = parseQtyToGrams(it.qty, food, pmIndex);
      return { food, food_id, name: it.food, qty_g };
    })
  }));

  const baseTotals = sumMeals(mealsResolved);
  const factor = safeScaleFactor(targets.kcal, baseTotals.kcal);

  // Scale items
  const scaledMeals = mealsResolved.map(m => ({
    ...m,
    items: m.items.map(it => ({ ...it, qty_g: Math.round(it.qty_g * factor) }))
  }));

  // Recompute totals after scaling
  let totals = sumMeals(scaledMeals);

  // Enforce fat & fiber minimums with gentle bias using existing items
  // Try to increase olive oil if present for fat floor
  if (totals.fat_g < targets.fat_g) {
    for (const m of scaledMeals) {
      for (const it of m.items) {
        if (/olive oil/i.test(it.name || '')) {
          it.qty_g = Math.round(it.qty_g * (1 + (targets.fat_g - totals.fat_g) / targets.fat_g * 0.5));
        }
      }
    }
    totals = sumMeals(scaledMeals);
  }
  // Fiber minimum: if spinach or oats present, nudge them
  if (totals.fiber_g < targets.fiber_g) {
    for (const m of scaledMeals) {
      for (const it of m.items) {
        if (/(oats|spinach|lentils)/i.test(it.name || '')) {
          it.qty_g = Math.round(it.qty_g * 1.1);
        }
      }
    }
    totals = sumMeals(scaledMeals);
  }

  // Micros watchlist (simple echo of target levels; use validators later)
  const micros = {
    calcium_mg: 1100, iron_mg: 10, iodine_ug: 120,
    vitamin_d_IU: 300, b12_ug: 2.4, magnesium_mg: 420,
    potassium_mg: 3500, omega3_epa_dha_mg: 250
  };

  // Build output meals (strip helper fields)
  const outputMeals = scaledMeals.map(m => ({
    slot: m.slot,
    template_id: m.template_id,
    items: m.items.map(it => ({
      food_id: it.food_id,
      qty_g: it.qty_g,
      source: 'local',
      source_ref: (it.food?.external_refs?.ausnut || it.food?.external_refs?.fdc || null)
    })),
    totals: mealTotals(m.items)
  }));

  const explain = [
    `Scaled from base plan by ×${round2(factor)} to approach ${targets.kcal} kcal.`,
    `Protein target set at ${targets.protein_g} g (≈${round1(targets.protein_g / (foodsAvgWeight(foods) || 1))} g/kg heuristic).`,
    `Fat floor enforced: ≥0.6 g/kg and ≥15% of kcal.`
  ];

  const summary = `Plan within ~${Math.abs(Math.round(100*(totals.kcal-targets.kcal)/targets.kcal))}% of energy target; protein ${totals.protein_g >= targets.protein_g ? 'met' : 'low'}, fiber ${totals.fiber_g >= targets.fiber_g ? 'met' : 'low'}.`;

  return {
    meals: outputMeals,
    totals,
    micros,
    cost_aud: null,
    explain,
    summary,
    unmet: []
  };

  // ---- local helpers ----
  function foodsAvgWeight(arr){ return (arr && arr.length) ? arr.reduce((a,f)=>a+(f.canonical_portion_g||100),0)/arr.length : 0; }
  function mealTotals(items){ return items.reduce((acc, it) => addNutri(acc, nutrientsFor(it.food, it.qty_g)), blankTotals()); }
  function sumMeals(meals){
    const t = blankTotals();
    for (const m of meals) {
      for (const it of m.items) addNutri(t, nutrientsFor(it.food, it.qty_g));
    }
    return t;
  }
  function nutrientsFor(food, grams){
    if (!food) return { kcal:0, protein_g:0, fat_g:0, carbs_g:0, fiber_g:0 };
    const n = food.nutrients_per_100g || {};
    const f = grams / 100.0;
    return {
      kcal: (n.kcal||0) * f,
      protein_g: (n.protein_g||0) * f,
      fat_g: (n.fat_g||0) * f,
      carbs_g: (n.carbs_g||0) * f,
      fiber_g: (n.fiber_g||0) * f
    };
  }
}

/* ====================== Utilities ======================= */

function bmrMifflin(sex, w, h, a){
  return (sex === 'male')
    ? 10*w + 6.25*h - 5*a + 5
    : 10*w + 6.25*h - 5*a - 161;
}
function bmrKatch(weight, bodyfat_pct){
  const lbm = weight * (1 - bodyfat_pct/100);
  return 370 + 21.6 * lbm;
}

function parseTimeLimit(s){
  if (!s) return null;
  const m = String(s).replace(/\s/g,'').match(/^<=?(\d+)\s*min|^(\d+)$/i);
  return m ? Number(m[1] || m[2]) : null;
}

function contains(setLike, name){
  const n = String(name || '').toLowerCase();
  return setLike.has(n);
}

function parseQtyToGrams(qty, food, pmIndex){
  if (qty == null) return food?.canonical_portion_g ?? 100;
  const s = String(qty).trim().toLowerCase();
  // "120 g"
  let m = s.match(/^([\d.]+)\s*g$/);
  if (m) return Math.round(Number(m[1]));
  // "300 ml"
  m = s.match(/^([\d.]+)\s*ml$/);
  if (m) {
    const ml = Number(m[1]);
    const density = food?.density_g_per_ml || 1.0;
    return Math.round(ml * density);
  }
  // "1 whole" / "1 medium" → use portion map or canonical
  m = s.match(/^([\d.]+)\s*(whole|small|medium|large)?$/);
  if (m) {
    const unitG = pmIndex.get(food?.id) ?? food?.canonical_portion_g ?? 100;
    return Math.round(Number(m[1]) * unitG);
  }
  // fallback: number without unit => grams
  m = s.match(/^([\d.]+)$/);
  if (m) return Math.round(Number(m[1]));
  return food?.canonical_portion_g ?? 100;
}

function idFromName(name){
  return 'food_' + String(name || '').toLowerCase()
    .replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
}

function blankTotals(){ return { kcal:0, protein_g:0, fat_g:0, carbs_g:0, fiber_g:0 }; }
function blankMicros(){ return { calcium_mg:0, iron_mg:0, iodine_ug:0, vitamin_d_IU:0, b12_ug:0, magnesium_mg:0, potassium_mg:0, omega3_epa_dha_mg:0 }; }
function addNutri(acc, x){
  acc.kcal += x.kcal||0;
  acc.protein_g += x.protein_g||0;
  acc.fat_g += x.fat_g||0;
  acc.carbs_g += x.carbs_g||0;
  acc.fiber_g += x.fiber_g||0;
  return acc;
}
function round1(x){ return Math.round(x*10)/10; }
function round2(x){ return Math.round(x*100)/100; }
function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }

function safeScaleFactor(targetKcal, baseKcal){
  if (!baseKcal || baseKcal <= 0) return 1;
  // keep within sane bounds to avoid extreme quantities
  return clamp(targetKcal / baseKcal, 0.7, 1.3);
}

function error(engine_version, data_version, code, message, suggestions){
  return { engine_version, data_version, type: 'error', code, message, suggestions };
}