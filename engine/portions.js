// engine/portions.js
// Portion helpers: parse human qty -> grams using foods, density, and portion maps.

import foodsCore from '../brain/foods/foods.core.js';
import portionMaps from '../brain/foods/portion-maps.js';

const NAME_TO_FOOD = Object.fromEntries((foodsCore||[]).map(f => [String(f.name).toLowerCase(), f]));
const PM_INDEX = Object.fromEntries((portionMaps||[]).map(pm => [pm.food_id, pm.portions && pm.portions[0] ? pm.portions[0].qty_g : null]));

function parseNumber(s){
  const m = String(s||'').match(/[-+]?[0-9]*\.?[0-9]+/);
  return m ? parseFloat(m[0]) : NaN;
}

export function foodForName(name){
  return NAME_TO_FOOD[String(name||'').toLowerCase()] || null;
}

export function qtyToGrams(food, qty){
  if (!food) return 0;
  const txt = String(qty||'').trim().toLowerCase();

  // explicit grams
  if (/(^|\s)g$/.test(txt) || txt.endsWith(' g')){
    const n = parseNumber(txt);
    return isFinite(n) ? Math.round(n) : 0;
  }

  // ml → grams using density if available
  if (txt.endsWith(' ml')){
    const ml = parseNumber(txt);
    const dens = food.density_g_per_ml;
    if (isFinite(ml)) {
      if (dens && isFinite(dens)) return Math.round(ml * dens);
      return Math.round(ml); // fallback 1:1
    }
    return 0;
  }

  // "1 medium" / "1 whole egg" → portion maps
  if (/^\d+(?:\.\d+)?\s+/.test(txt)){
    const pmg = PM_INDEX[food.id];
    if (pmg && isFinite(pmg)){
      const count = parseNumber(txt);
      return Math.round(count * pmg);
    }
  }

  // fallback: canonical portion
  const cg = food.canonical_portion_g;
  return isFinite(cg) ? Math.round(cg) : 0;
}
