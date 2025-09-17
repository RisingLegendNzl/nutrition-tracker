// Nutrify data entrypoint — versioned, swappable.
// NOTE: no business logic here; just data + tiny lookup helpers.

import foodsCore from './foods/foods.core.json' assert { type: 'json' };
import portionMaps from './foods/portion-maps.json' assert { type: 'json' };
import brands from './foods/brands.json' assert { type: 'json' };
import recipesCore from './recipes/recipes.core.json' assert { type: 'json' };
import mealTemplates from './recipes/meal-templates.json' assert { type: 'json' };

export const ENGINE_VERSION = 'v1.0.0';     // bump when equations/logic change
export const DATA_VERSION = '2025-09-17';   // bump when data tables change

export const nutrifyData = {
  engine_version: ENGINE_VERSION,
  data_version: DATA_VERSION,
  bundles: {
    nutrify_foods: {
      bundle: 'nutrify_foods',
      engine_version: ENGINE_VERSION,
      data_version: DATA_VERSION,
      foods: foodsCore,
      brands,
      portion_maps: portionMaps
    },
    nutrify_recipes: {
      bundle: 'nutrify_recipes',
      engine_version: ENGINE_VERSION,
      data_version: DATA_VERSION,
      recipes: recipesCore,
      meal_templates: mealTemplates
    }
  }
};

// Lookup helpers (read-only)
export function getFoodById(id) {
  return nutrifyData.bundles.nutrify_foods.foods.find(f => f.id === id) || null;
}
export function getRecipeById(id) {
  return nutrifyData.bundles.nutrify_recipes.recipes.find(r => r.id === id) || null;
}
export function getPortionsFor(foodId) {
  const m = nutrifyData.bundles.nutrify_foods.portion_maps.find(p => p.food_id === foodId);
  return m ? m.portions : [];
}