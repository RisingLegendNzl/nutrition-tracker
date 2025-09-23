// brain/recipes/meal-templates.js
// Reusable meal templates derived from your current weekly plan.

export default [
  // Breakfasts
  {
    id: "tmpl_breakfast_oats_pb_banana_milk",
    name: "Protein Oats + PB + Banana + Milk",
    slot: "Breakfast",
    items: [
      { food: "rolled oats", qty: "120 g" },
      { food: "full cream milk", qty: "300 ml" },
      { food: "banana", qty: "1 medium" },
      { food: "peanut butter", qty: "40 g" }
    ]
  },
  {
    id: "tmpl_breakfast_oats_yog_pb_banana_milk250",
    name: "Oats + Yogurt + PB + Banana + Milk",
    slot: "Breakfast",
    items: [
      { food: "rolled oats", qty: "120 g" },
      { food: "full cream milk", qty: "250 ml" },
      { food: "banana", qty: "1 medium" },
      { food: "greek yogurt", qty: "150 g" },
      { food: "peanut butter", qty: "30 g" }
    ]
  },

  // Lunches
  {
    id: "tmpl_lunch_beef5_veg_sweetpotato_oo",
    name: "Lean Beef + Mixed Veg + Sweet Potato + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "beef mince 5★ (lean)", qty: "250 g" },
      { food: "frozen mixed vegetables", qty: "200 g" },
      { food: "sweet potato", qty: "400 g" },
      { food: "olive oil", qty: "15 g" }
    ]
  },
  {
    id: "tmpl_lunch_beef3_veg_rice_oo",
    name: "Regular Beef + Mixed Veg + Rice + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "beef mince 3★ (regular)", qty: "250 g" },
      { food: "frozen mixed vegetables", qty: "200 g" },
      { food: "rice (cooked)", qty: "300 g" },
      { food: "olive oil", qty: "15 g" }
    ]
  },
  {
    id: "tmpl_lunch_tuna_lentils_sp_spinach_oo",
    name: "Tuna + Lentils + Sweet Potato + Spinach + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "tuna (springwater, drained)", qty: "200 g" },
      { food: "lentils (canned, drained)", qty: "150 g" },
      { food: "sweet potato", qty: "350 g" },
      { food: "spinach", qty: "100 g" },
      { food: "olive oil", qty: "15 g" }
    ]
  },

  // Dinners
  {
    id: "tmpl_dinner_chicken_lentils_spinach_avocado_oo",
    name: "Chicken + Lentils + Spinach + Avocado + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "lentils (canned, drained)", qty: "150 g" },
      { food: "spinach", qty: "100 g" },
      { food: "avocado", qty: "1 whole" },
      { food: "olive oil", qty: "15 g" }
    ]
  },
  {
    id: "tmpl_dinner_chicken_potato_carrot_peas_oo",
    name: "Chicken + Potatoes + Carrots + Peas + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "potatoes", qty: "350 g" },
      { food: "carrots", qty: "100 g" },
      { food: "peas", qty: "100 g" },
      { food: "olive oil", qty: "15 g" }
    ]
  },
  {
    id: "tmpl_dinner_chicken_rice_spinach_oo",
    name: "Chicken + Rice + Spinach + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "rice (cooked)", qty: "300 g" },
      { food: "spinach", qty: "100 g" },
      { food: "olive oil", qty: "15 g" }
    ]
  },
  {
    id: "tmpl_dinner_chicken_sweetpotato_carrot_peas_oo",
    name: "Chicken + Sweet Potato + Carrots + Peas + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "sweet potato", qty: "350 g" },
      { food: "carrots", qty: "100 g" },
      { food: "peas", qty: "100 g" },
      { food: "olive oil", qty: "15 g" }
    ]
  }

,
// ---- AUTO-GENERATED COVERAGE TEMPLATES (Phase 1.x) ----
  {
    id: "tmpl_auto_omni_bulk",
    name: "Chicken, Rice & Spinach (Bulk)",
    slot: "Breakfast",
    items: [
      { food: "chicken thigh fillets", qty: "286 g" },
      { food: "rice (cooked)", qty: "325 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "tmpl_auto_vegetarian_bulk",
    name: "Lentil, Rice & Spinach + Egg (Bulk)",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "325 g" },
      { food: "rice (cooked)", qty: "286 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" },
      { food: "egg (whole)", qty: "78 g" }
    ]
  },
  {
    id: "tmpl_auto_vegan_bulk",
    name: "PB Banana Oats (Bulk)",
    slot: "Dinner",
    items: [
      { food: "rolled oats", qty: "117 g" },
      { food: "banana", qty: "156 g" },
      { food: "peanut butter", qty: "36 g" }
    ]
  },
  {
    id: "tmpl_auto_dairy_free_bulk",
    name: "Chicken, Sweet Potato & Spinach (DF, Bulk)",
    slot: "Breakfast",
    items: [
      { food: "chicken thigh fillets", qty: "286 g" },
      { food: "sweet potato", qty: "390 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "tmpl_auto_gluten_free_bulk",
    name: "Lean Beef, Sweet Potato & Spinach (GF, Bulk)",
    slot: "Lunch",
    items: [
      { food: "beef mince 5★ (lean)", qty: "286 g" },
      { food: "sweet potato", qty: "364 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "tmpl_auto_pescatarian_bulk",
    name: "Eggs, Rice & Spinach (Pesc, Bulk)",
    slot: "Dinner",
    items: [
      { food: "egg (whole)", qty: "234 g" },
      { food: "rice (cooked)", qty: "312 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "tmpl_auto_omni_maintain",
    name: "Chicken, Rice & Spinach (Maintain)",
    slot: "Breakfast",
    items: [
      { food: "chicken thigh fillets", qty: "220 g" },
      { food: "rice (cooked)", qty: "250 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_auto_vegetarian_maintain",
    name: "Lentil, Rice & Spinach + Egg (Maintain)",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "250 g" },
      { food: "rice (cooked)", qty: "220 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" },
      { food: "egg (whole)", qty: "60 g" }
    ]
  },
  {
    id: "tmpl_auto_vegan_maintain",
    name: "PB Banana Oats (Maintain)",
    slot: "Dinner",
    items: [
      { food: "rolled oats", qty: "90 g" },
      { food: "banana", qty: "120 g" },
      { food: "peanut butter", qty: "28 g" }
    ]
  },
  {
    id: "tmpl_auto_dairy_free_maintain",
    name: "Chicken, Sweet Potato & Spinach (DF, Maintain)",
    slot: "Breakfast",
    items: [
      { food: "chicken thigh fillets", qty: "220 g" },
      { food: "sweet potato", qty: "300 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_auto_gluten_free_maintain",
    name: "Lean Beef, Sweet Potato & Spinach (GF, Maintain)",
    slot: "Lunch",
    items: [
      { food: "beef mince 5★ (lean)", qty: "220 g" },
      { food: "sweet potato", qty: "280 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_auto_pescatarian_maintain",
    name: "Eggs, Rice & Spinach (Pesc, Maintain)",
    slot: "Dinner",
    items: [
      { food: "egg (whole)", qty: "180 g" },
      { food: "rice (cooked)", qty: "240 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_auto_omni_cut",
    name: "Chicken, Rice & Spinach (Cut)",
    slot: "Breakfast",
    items: [
      { food: "chicken thigh fillets", qty: "176 g" },
      { food: "rice (cooked)", qty: "200 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  },
  {
    id: "tmpl_auto_vegetarian_cut",
    name: "Lentil, Rice & Spinach + Egg (Cut)",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "200 g" },
      { food: "rice (cooked)", qty: "176 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" },
      { food: "egg (whole)", qty: "48 g" }
    ]
  },
  {
    id: "tmpl_auto_vegan_cut",
    name: "PB Banana Oats (Cut)",
    slot: "Dinner",
    items: [
      { food: "rolled oats", qty: "72 g" },
      { food: "banana", qty: "96 g" },
      { food: "peanut butter", qty: "22 g" }
    ]
  },
  {
    id: "tmpl_auto_dairy_free_cut",
    name: "Chicken, Sweet Potato & Spinach (DF, Cut)",
    slot: "Breakfast",
    items: [
      { food: "chicken thigh fillets", qty: "176 g" },
      { food: "sweet potato", qty: "240 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  },
  {
    id: "tmpl_auto_gluten_free_cut",
    name: "Lean Beef, Sweet Potato & Spinach (GF, Cut)",
    slot: "Lunch",
    items: [
      { food: "beef mince 5★ (lean)", qty: "176 g" },
      { food: "sweet potato", qty: "224 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  },
  {
    id: "tmpl_auto_pescatarian_cut",
    name: "Eggs, Rice & Spinach (Pesc, Cut)",
    slot: "Dinner",
    items: [
      { food: "egg (whole)", qty: "144 g" },
      { food: "rice (cooked)", qty: "192 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  }
];