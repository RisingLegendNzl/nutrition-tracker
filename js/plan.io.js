import { foodsBundle } from '../brain/diet.data.js';
import { getPlan, setPlan } from './storage.js';
import { EVENT_NAMES } from './constants.js';
// js/plan.io.js
// Plan export/import + local library + Library UI for Nutrify
/* Normalize incoming plan shapes (engine → diet UI) */
function adaptPlanIfNeeded(planObject){
  try{
    if (!planObject || typeof planObject !== 'object') return { plan: {}, meta: { reason:'invalid' } };
    const inPlan = planObject.plan || planObject;
    // Detect if already in Diet shape: Monday exists and items have 'food' + 'qty'
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const looksDiet = days.every(d => inPlan && inPlan[d] && Array.isArray(inPlan[d]) && inPlan[d].every(m => Array.isArray(m.items) && m.items.every(it => 'food' in it && 'qty' in it)));
    if (looksDiet) return { plan: inPlan, meta: { type:'diet_shape', passthrough:true } };

    // Otherwise, expect engine-like: { Monday:[{slot,items:[{food_id, qty_g}]}], ... } or flat meals array
    const idToName = Object.fromEntries(((foodsBundle && foodsBundle.foods) ? foodsBundle.foods : []).map(f => [f.id, f.name]));
    const toDietItems = (items=[]) => items.map(it => ({
      food_id: it.food_id,
      food: idToName[it.food_id] || String(it.food_id||'').replace(/^food_/,'').replace(/_/g,' '),
      qty: `${Math.round(Number(it.qty_g||0))} g`
    }));
    const adaptedPlan = {};
    for (const d of days) {
      const dayMeals = inPlan[d] || [];
      adaptedPlan[d] = dayMeals.map(m => ({
        meal: (m.slot || 'Meal').replace(/^[a-z]/, c => c.toUpperCase()),
        items: toDietItems(m.items || [])
      }));
    }
    return { plan: adaptedPlan, meta: { type: 'engine_shape', passthrough: false } };
  }catch(e){
    console.error('Plan adapter failed:', e);
    return { plan: {}, meta: { reason:'error', error:e.message } };
  }
}
function applyPlanToDiet(planObj) {
  const result = adaptPlanIfNeeded(planObj);
  setPlan(result.plan); // Use setPlan to handle persistence & eventing
}


/* -------------------- Library UI -------------------- */
// (unchanged)