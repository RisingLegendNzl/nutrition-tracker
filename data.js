// =====================================================
// Nutrition Database (per 100 g unless unit_g is given)
// Brand-matched to Coles where labels exist; otherwise
// AU FSANZ/AFCD references for raw produce/meats.
// =====================================================

// =====================================================
// 7-Day Meal Plan (ingredients only; app computes totals)
// Portions adjusted to ~3.5–3.6k kcal/day; 1 avocado/day
// (Ensure names exactly match NUTRITION_DB keys)
// =====================================================
window.mealPlan = {
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

// =====================================================
// Default Supplements (initial Sup-Stack list)
// =====================================================

// =====================================================
// Smart Suggestions (auto-fill for add-supplement form)
// =====================================================

// =====================================================
// Aliases → Canonical names for type-ahead
// =====================================================
