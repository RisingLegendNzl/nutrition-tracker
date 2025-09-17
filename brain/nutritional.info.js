// brain/nutritional.info.js
// Adapter: build legacy per-100g nutrition map from the Brain schema.

import foodsCore from './foods/foods.core.js';
import portionMaps from './foods/portion-maps.js';

const portionIndex = new Map(
  portionMaps.map(pm => [pm.food_id, (pm.portions?.[0]?.qty_g) ?? null])
);

const idFromName = name =>
  'food_' + name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

const per100From = f => {
  const n = f.nutrients_per_100g || {};
  const legacy = {
    per: 100,
    k: n.kcal ?? 0,
    p: n.protein_g ?? 0,
    c: n.carbs_g ?? 0,
    f: n.fat_g ?? 0,
    fib: n.fiber_g ?? 0,
    fe: n.iron_mg ?? 0,
    zn: 0,
    ca: n.calcium_mg ?? 0,
    vC: 0,
    fol: 0,
    kplus: n.potassium_mg ?? 0
  };
  const unit = portionIndex.get(f.id) ?? null;
  if (unit != null) legacy.unit_g = unit;
  return legacy;
};

// Build legacy map keyed by display name
export const NUTRITION_DB = Object.fromEntries(
  foodsCore.map(f => [f.name, per100From(f)])
);

// Small fuzzy matcher for user-facing names
function normalize(s){ return (s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }

export function findFood(name){
  if (!name) return null;
  const exact = NUTRITION_DB[name];
  if (exact) return { name, data: exact };
  // try normalized startsWith / includes
  const n = normalize(name);
  let hitKey = Object.keys(NUTRITION_DB).find(k => normalize(k) === n)
           || Object.keys(NUTRITION_DB).find(k => normalize(k).startsWith(n))
           || Object.keys(NUTRITION_DB).find(k => normalize(k).includes(n));
  return hitKey ? { name: hitKey, data: NUTRITION_DB[hitKey] } : null;
}

// Back-compat (optional)
if (typeof window !== 'undefined') {
  window.NUTRITION_DB = window.NUTRITION_DB || NUTRITION_DB;
}