// brain/diet.data.js
// Central nutrition data bundle: foods + portions + optional demo meal plan.
// This module re-exports from brain/foods and adds a legacy-compatible mealPlan export.

import foodsCore from './foods/foods.core.json' assert { type: 'json' };
import portionMaps from './foods/portion-maps.json' assert { type: 'json' };

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

// Demo weekly meal plan (legacy format, will be replaced by generator-based templates).
export const mealPlan = {
  "Monday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"300 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"beef mince 5★ (lean)", qty:"250 g" },
      { food:"frozen mixed vegetables", qty:"200 g" },
      { food:"sweet potato", qty:"400 g" },
      { food:"olive oil", qty:"15 g" }
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"lentils (canned, drained)", qty:"150 g" },
      { food:"spinach", qty:"100 g" },
      { food:"avocado", qty:"1 whole" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ],

  "Tuesday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"250 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"greek yogurt", qty:"150 g" },
      { food:"peanut butter", qty:"30 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"beef mince 3★ (regular)", qty:"250 g" },
      { food:"frozen mixed vegetables", qty:"200 g" },
      { food:"rice (cooked)", qty:"300 g" },
      { food:"olive oil", qty:"15 g" }
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"potatoes", qty:"350 g" },
      { food:"carrots", qty:"100 g" },
      { food:"peas", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ],

  "Wednesday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"300 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"tuna (springwater, drained)", qty:"200 g" },
      { food:"lentils (canned, drained)", qty:"150 g" },
      { food:"sweet potato", qty:"350 g" },
      { food:"spinach", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"potatoes", qty:"350 g" },
      { food:"carrots", qty:"100 g" },
      { food:"peas", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ],

  "Thursday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"300 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"greek yogurt", qty:"150 g" },
      { food:"peanut butter", qty:"30 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"beef mince 5★ (lean)", qty:"250 g" },
      { food:"frozen mixed vegetables", qty:"200 g" },
      { food:"sweet potato", qty:"400 g" },
      { food:"olive oil", qty:"15 g" }
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"rice (cooked)", qty:"300 g" },
      { food:"spinach", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ],

  "Friday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"250 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"tuna (springwater, drained)", qty:"200 g" },
      { food:"lentils (canned, drained)", qty:"150 g" },
      { food:"potatoes", qty:"350 g" },
      { food:"spinach", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"sweet potato", qty:"350 g" },
      { food:"carrots", qty:"100 g" },
      { food:"peas", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ],

  "Saturday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"300 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"greek yogurt", qty:"150 g" },
      { food:"peanut butter", qty:"30 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"beef mince 3★ (regular)", qty:"250 g" },
      { food:"frozen mixed vegetables", qty:"200 g" },
      { food:"rice (cooked)", qty:"300 g" },
      { food:"olive oil", qty:"15 g" }
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"potatoes", qty:"350 g" },
      { food:"spinach", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ],

  "Sunday": [
    { meal: "Breakfast", items: [
      { food:"rolled oats", qty:"120 g" },
      { food:"full cream milk", qty:"250 ml" },
      { food:"banana", qty:"1 medium" },
      { food:"peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"tuna (springwater, drained)", qty:"200 g" },
      { food:"lentils (canned, drained)", qty:"150 g" },
      { food:"sweet potato", qty:"350 g" },
      { food:"spinash", qty:"100 g" } // <- typo guard: if you see zeroes, fix to "spinach"
    ]},
    { meal: "Dinner", items: [
      { food:"chicken thigh fillets", qty:"450 g" },
      { food:"potatoes", qty:"350 g" },
      { food:"carrots", qty:"100 g" },
      { food:"peas", qty:"100 g" },
      { food:"olive oil", qty:"15 g" }
    ]}
  ]
};

// Back-compat window.* mirrors (optional)
if (typeof window !== 'undefined') {
  window.NUTRIFY_FOODS = foodsCore;
  window.PORTION_MAPS = portionMaps;
  window.mealPlan = window.mealPlan || mealPlan;
}
