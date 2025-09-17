// brain/nutritional.info.js
// Adapter: build legacy per-100g nutrition map from the Brain schema.

import foodsCore from './foods/foods.core.js';
import portionMaps from './foods/portion-maps.js';

const portionIndex = new Map(
  (portionMaps || []).map(pm => [pm.food_id, (pm.portions?.[0]?.qty_g) ?? null])
);

const toLegacy = (f) => {
  const n = f.nutrients_per_100g || {};
  const rec = {
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
  const unit = portionIndex.get(f.id);
  if (unit != null) rec.unit_g = unit;
  return rec;
};

// Legacy per-100g map keyed by display name
export const NUTRITION_DB = Object.fromEntries(
  (foodsCore || []).map(f => [f.name, toLegacy(f)])
);

// Fuzzy lookup helper (optional)
function norm(s){ return (s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
export function findFood(name){
  if (!name) return null;
  if (NUTRITION_DB[name]) return { name, data: NUTRITION_DB[name] };
  const n = norm(name);
  const keys = Object.keys(NUTRITION_DB);
  let hit = keys.find(k => norm(k) === n) || keys.find(k => norm(k).startsWith(n)) || keys.find(k => norm(k).includes(n));
  return hit ? { name: hit, data: NUTRITION_DB[hit] } : null;
}

// Back-compat for quick debugging
if (typeof window !== 'undefined') {
  window.NUTRITION_DB = window.NUTRITION_DB || NUTRITION_DB;
}