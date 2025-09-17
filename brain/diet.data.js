// brain/diet.data.js
// Central nutrition data bundle: foods + portions + meal plan built from templates.

import foodsCore from './foods/foods.core.js';
import portionMaps from './foods/portion-maps.js';
import mealTemplates from './recipes/meal-templates.js';

export const ENGINE_VERSION = 'v1.0.0';
export const DATA_VERSION = '2025-09-17';

export const foodsBundle = {
  bundle: 'nutrify_foods',
  engine_version: ENGINE_VERSION,
  data_version: DATA_VERSION,
  foods: foodsCore,
  portion_maps: portionMaps,
  brands: []
};

// Weekly meal plan built from templates
export const mealPlan = (function(){
  const byId = Object.fromEntries(mealTemplates.map(t => [t.id, t]));
  const day = (...ids) => ids.map(id => ({ meal: byId[id].slot, items: byId[id].items }));

  return {
    Monday:    day('tmpl_breakfast_oats_pb_banana_milk','tmpl_lunch_beef5_veg_sweetpotato_oo','tmpl_dinner_chicken_lentils_spinach_avocado_oo'),
    Tuesday:   day('tmpl_breakfast_oats_yog_pb_banana_milk250','tmpl_lunch_beef3_veg_rice_oo','tmpl_dinner_chicken_potato_carrot_peas_oo'),
    Wednesday: day('tmpl_breakfast_oats_pb_banana_milk','tmpl_lunch_tuna_lentils_sp_spinach_oo','tmpl_dinner_chicken_potato_carrot_peas_oo'),
    Thursday:  day('tmpl_breakfast_oats_yog_pb_banana_milk250','tmpl_lunch_beef5_veg_sweetpotato_oo','tmpl_dinner_chicken_rice_spinach_oo'),
    Friday:    day('tmpl_breakfast_oats_pb_banana_milk','tmpl_lunch_tuna_lentils_sp_spinach_oo','tmpl_dinner_chicken_sweetpotato_carrot_peas_oo'),
    Saturday:  day('tmpl_breakfast_oats_yog_pb_banana_milk250','tmpl_lunch_beef3_veg_rice_oo','tmpl_dinner_chicken_potato_carrot_peas_oo'),
    Sunday:    day('tmpl_breakfast_oats_pb_banana_milk','tmpl_lunch_tuna_lentils_sp_spinach_oo','tmpl_dinner_chicken_potato_carrot_peas_oo')
  };
})();

// Back-compat mirrors
if (typeof window !== 'undefined') {
  window.NUTRIFY_FOODS = foodsCore;
  window.PORTION_MAPS = portionMaps;
  window.mealPlan = window.mealPlan || mealPlan;
}