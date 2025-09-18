// engine/nutritionEngine.js
// Minimal, deterministic Nutrition Engine for Nutrify (Phase 2 demo)
// - Computes targets from profile (BMR -> TDEE -> goal -> macros)
// - Builds a simple full-day plan using fixed templates
// - Scales quantities by kcal targets (fallback kcal/100g table if data bundle is missing)
// - Returns the day_plan JSON your UI expects

import { foodsBundle } from '../brain/diet.data.js';

// --------------------------- Public API ---------------------------
export function generateDayPlan(req) {
  const { engine_version = 'v1.0.0', data_version = '2025-09-17' } = req || {};
  const p = (req && req.profile) || {};
  const c = (req && req.constraints) || {};

  if (!p || !p.sex || !p.age_y || !p.height_cm || !p.weight_kg || !p.activity_pal) {
    return { error: 'invalid_inputs', reason: 'Missing or invalid profile' };
  }

  const targets = computeTargets(p, c);
  const diet = (c && c.diet) || 'omnivore';
  const menus = (diet === 'vegan' || diet === 'vegetarian') ? veganMenus() : omniMenus();
  const kcalDay = targets.kcal;
  const splits = [
    { slot: 'breakfast', share: 0.28 },
    { slot: 'lunch',     share: 0.32 },
    { slot: 'dinner',    share: 0.30 },
    { slot: 'snacks',    share: 0.10 }
  ];

  const provider = new FoodDataProvider(foodsBundle);
  function scaleQtyForKcal(kcalPer100, baseQty, kcalTargetEach){
    const kcalPerGram = Math.max(0.1, kcalPer100 / 100);
    const baseKcal = baseQty * kcalPerGram;
    const factor = Math.max(0.5, Math.min(1.8, kcalTargetEach / Math.max(1, baseKcal)));
    return baseQty * factor;
  }

  const meals = splits.map((m) => {
    const kcalTarget = Math.round(kcalDay * m.share);
    const base = menus[m.slot] || [];
    const N = Math.max(1, base.length);
    const items = base.map(x => {
      const kcalPer100 = provider.kcalPer100g(x.food_id, x.kcal_100g);
      const qty = scaleQtyForKcal(kcalPer100, x.base_qty_g, kcalTarget / N);
      return { food_id: x.food_id, qty_g: Math.max(1, Math.round(qty)) };
    });
    return { slot: m.slot, template_id: `tmpl_${m.slot}_v1`, items, totals: { kcal: kcalTarget } };
  });

  const day_totals = {
    kcal: kcalDay,
    protein_g: targets.protein_g,
    fat_g: targets.fat_g,
    carbs_g: targets.carbs_g,
    fiber_g: targets.fiber_g
  };
  const compliance = { kcal_within_pct: 0.0, protein_within_pct: 0.0 };

  return {
    engine_version, data_version, type: 'day_plan',
    inputs_echo: { profile: p, constraints: c },
    targets, meals, day_totals, compliance,
    micros_watchlist: { calcium_mg: 1000, iron_mg: (p.sex === 'female' ? 18 : 8), iodine_ug: 150, vitamin_d_IU: 400, b12_ug: 2.4, magnesium_mg: 400, potassium_mg: 3500, omega3_epa_dha_mg: 250 },
    cost_estimate_aud: null,
    explanations: [
      `BMR via ${p.bodyfat_pct != null ? 'Katch–McArdle' : 'Mifflin–St Jeor'}; TDEE = BMR × PAL.`,
      `Protein ${targets.protein_g.toFixed(1)} g (~${Math.round(targets.protein_g*4/targets.kcal*100)}% kcal), fat floor respected, carbs are remainder.`,
      `Deterministic template picks scaled to calories.`
    ],
    summary: `Plan hits ~${targets.kcal} kcal with ~${Math.round(targets.protein_g)} g protein.`,
    disclaimer: 'Not medical advice. For healthy adults 18–65.'
  };
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


export function generateWeekPlan(req){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const baseDay = generateDayPlan(req);
  if (!baseDay || !baseDay.meals) return { plan: {} };

  const plan = {};
  const c = (req && req.constraints) || {};
  const diet = (c && c.diet) || 'omnivore';
  const menus = (diet === 'vegan' || diet === 'vegetarian') ? veganMenus() : omniMenus();

  const variants = (diet === 'vegan' || diet === 'vegetarian') ? [
    { lunchSwap: ['food_lentils_canned_drained','food_chickpeas_canned_drained', 220, 119],
      dinnerSwap: ['food_peas','food_broccoli', 120, 34] },
    { lunchSwap: ['food_brown_rice_cooked','food_wholegrain_pasta_cooked', 220, 124],
      dinnerSwap: ['food_spinach','food_broccoli', 100, 34] },
    { lunchSwap: null, dinnerSwap: null }
  ] : [
    { lunchSwap: ['food_beef_mince_5_lean','food_chicken_breast', 250, 165],
      dinnerSwap: ['food_broccoli','food_spinach', 100, 23] },
    { lunchSwap: ['food_sweet_potato','food_brown_rice_cooked', 250, 123],
      dinnerSwap: ['food_brown_rice_cooked','food_wholegrain_pasta_cooked', 240, 124] },
    { lunchSwap: null,
      dinnerSwap: ['food_chicken_thigh_fillets','food_chicken_breast', 300, 165] }
  ];

  const provider = new FoodDataProvider(foodsBundle);
  const targets = baseDay.targets || { kcal: 2500 };

  function kcalOf(menu){
    return (menu||[]).reduce((s,x)=> s + provider.kcalPer100g(x.food_id, x.kcal_100g) * (x.base_qty_g/100), 0);
  }
  function scaleTo(menu, share){
    const need = targets.kcal * share;
    const base = Math.max(1, kcalOf(menu));
    const factor = Math.max(0.6, Math.min(1.6, need / base));
    return menu.map(x => ({ food_id: x.food_id, qty_g: Math.round(x.base_qty_g * factor) }));
  }
  function applySwap(arr, swap){
    if (!swap) return arr.map(x=>({...x}));
    const [fromId, toId, qty, kcal100] = swap;
    return arr.map(x => x.food_id === fromId ? ({ food_id: toId, base_qty_g: qty, kcal_100g: kcal100 }) : ({...x}));
  }

  const splitBase = [0.28, 0.32, 0.30, 0.10];
  days.forEach((d, idx)=>{
    const jitter = [0, +0.02, -0.02, +0.03, -0.03, +0.01, -0.01][idx % 7];
    const splits = {
      breakfast: Math.max(0.22, Math.min(0.34, splitBase[0] + jitter)),
      lunch:     Math.max(0.26, Math.min(0.36, splitBase[1] - jitter/2)),
      dinner:    Math.max(0.24, Math.min(0.36, splitBase[2] - jitter/2)),
      snacks:    splitBase[3]
    };
    const v = variants[idx % variants.length];

    const baseMeals = (baseDay.meals || []);
    const baseB = baseMeals.find(m=>m.slot==='breakfast')?.items || [];
    const baseS = baseMeals.find(m=>m.slot==='snacks')?.items || [];

    const lunchMenu  = applySwap(menus.lunch,  v.lunchSwap);
    const dinnerMenu = applySwap(menus.dinner, v.dinnerSwap);

    const meals = [
      { slot:'breakfast', items: baseB.map(it=>({ food_id: it.food_id, qty_g: it.qty_g })) },
      { slot:'lunch',     items: scaleTo(lunchMenu,  splits.lunch) },
      { slot:'dinner',    items: scaleTo(dinnerMenu, splits.dinner) },
      { slot:'snacks',    items: baseS.map(it=>({ food_id: it.food_id, qty_g: it.qty_g })) }
    ];
    plan[d] = meals;
  });

  return { plan, meta: { type:'week_plan', source:'engine', created_at: new Date().toISOString() } };
}

