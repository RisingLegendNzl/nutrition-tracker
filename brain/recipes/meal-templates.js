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
  {
    id: "tmpl_breakfast_oats_pb_banana_milk250",
    name: "Protein Oats + PB + Banana + Milk (250ml)",
    slot: "Breakfast",
    items: [
      { food: "rolled oats", qty: "120 g" },
      { food: "full cream milk", qty: "250 ml" },
      { food: "banana", qty: "1 medium" },
      { food: "peanut butter", qty: "40 g" }
    ]
  },

  // Lunches
  {
    id: "tmpl_lunch_beef3_veg_rice_oo",
    name: "Lean Beef + Mixed Veg + Rice + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "beef mince 5★ (lean)", qty: "250 g" },
      { food: "frozen mixed vegetables", qty: "200 g" },
      { food: "rice (cooked)", qty: "300 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_lunch_chickpeas_potato_spinach_oo",
    name: "Chickpeas + Potato + Spinach + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "chickpeas (canned, drained)", qty: "220 g" },
      { food: "potatoes", qty: "320 g" },
      { food: "spinach", qty: "100 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_lunch_lentils_sp_spinach_oo",
    name: "Lentils + Sweet Potato + Spinach + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "250 g" },
      { food: "sweet potato", qty: "280 g" },
      { food: "spinach", qty: "120 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_lunch_beef5_veg_sweetpotato_oo",
    name: "Lean Beef + Veg + Sweet Potato + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "beef mince 5★ (lean)", qty: "250 g" },
      { food: "frozen mixed vegetables", qty: "200 g" },
      { food: "sweet potato", qty: "350 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },

  // Dinners
  {
    id: "tmpl_dinner_chicken_rice_spinach_oo",
    name: "Chicken + Rice + Spinach + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "rice (cooked)", qty: "350 g" },
      { food: "spinach", qty: "100 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_dinner_chicken_potato_carrot_peas_oo",
    name: "Chicken + Potato + Carrots + Peas + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "potatoes", qty: "300 g" },
      { food: "carrots", qty: "120 g" },
      { food: "peas", qty: "120 g" },
      { food: "olive oil", qty: "10 g" }
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
  },
  {
    id: "tmpl_dinner_chicken_rice_spinach_oo_alt",
    name: "Chicken + Rice + Spinach + Olive Oil (Alt)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "450 g" },
      { food: "rice (cooked)", qty: "350 g" },
      { food: "spinach", qty: "150 g" },
      { food: "olive oil", qty: "12 g" }
    ]
  },

// ---- AUTO-GENERATED GOAL×DIET COVERAGE (Phase Templates) ----
  {
    id: "rcp_omnivore_bulk_chicken_rice_spinach",
    name: "Chicken, Rice & Spinach (Bulk)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "286 g" },
      { food: "rice (cooked)", qty: "325 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "rcp_omnivore_maintain_chicken_rice_spinach",
    name: "Chicken, Rice & Spinach (Maintain)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "220 g" },
      { food: "rice (cooked)", qty: "250 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "rcp_omnivore_cut_chicken_rice_spinach",
    name: "Chicken, Rice & Spinach (Cut)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "176 g" },
      { food: "rice (cooked)", qty: "200 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  },
  {
    id: "rcp_vegetarian_bulk_lentil_rice",
    name: "Lentil Curry Bowl (Bulk)",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "325 g" },
      { food: "rice (cooked)", qty: "286 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "rcp_vegetarian_maintain_lentil_rice",
    name: "Lentil Curry Bowl (Maintain)",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "250 g" },
      { food: "rice (cooked)", qty: "220 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "rcp_vegetarian_cut_lentil_rice",
    name: "Lentil Curry Bowl (Cut)",
    slot: "Lunch",
    items: [
      { food: "lentils (canned, drained)", qty: "200 g" },
      { food: "rice (cooked)", qty: "176 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  },
  {
    id: "rcp_vegan_bulk_oats_pb_banana",
    name: "PB Banana Oats (Bulk)",
    slot: "Breakfast",
    items: [
      { food: "rolled oats", qty: "91 g" },
      { food: "banana", qty: "156 g" },
      { food: "peanut butter", qty: "36 g" }
    ]
  },
  {
    id: "rcp_vegan_maintain_oats_pb_banana",
    name: "PB Banana Oats (Maintain)",
    slot: "Breakfast",
    items: [
      { food: "rolled oats", qty: "70 g" },
      { food: "banana", qty: "120 g" },
      { food: "peanut butter", qty: "28 g" }
    ]
  },
  {
    id: "rcp_vegan_cut_oats_pb_banana",
    name: "PB Banana Oats (Cut)",
    slot: "Breakfast",
    items: [
      { food: "rolled oats", qty: "56 g" },
      { food: "banana", qty: "96 g" },
      { food: "peanut butter", qty: "22 g" }
    ]
  },
  {
    id: "rcp_dairy_free_bulk_chicken_sweetpot_spin",
    name: "Chicken, Sweet Potato & Spinach (DF, Bulk)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "286 g" },
      { food: "sweet potato", qty: "390 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "rcp_dairy_free_maintain_chicken_sweetpot_spin",
    name: "Chicken, Sweet Potato & Spinach (DF, Maintain)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "220 g" },
      { food: "sweet potato", qty: "300 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "rcp_dairy_free_cut_chicken_sweetpot_spin",
    name: "Chicken, Sweet Potato & Spinach (DF, Cut)",
    slot: "Dinner",
    items: [
      { food: "chicken thigh fillets", qty: "176 g" },
      { food: "sweet potato", qty: "240 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  },
  {
    id: "rcp_gluten_free_bulk_beef_sweetpot_spin",
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
    id: "rcp_gluten_free_maintain_beef_sweetpot_spin",
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
    id: "rcp_gluten_free_cut_beef_sweetpot_spin",
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
    id: "rcp_pescetarian_bulk_eggs_rice_spin",
    name: "Eggs, Rice & Spinach (Pesc, Bulk)",
    slot: "Dinner",
    items: [
      { food: "egg (whole)", qty: "182 g" },
      { food: "rice (cooked)", qty: "312 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "13 g" }
    ]
  },
  {
    id: "rcp_pescetarian_maintain_eggs_rice_spin",
    name: "Eggs, Rice & Spinach (Pesc, Maintain)",
    slot: "Dinner",
    items: [
      { food: "egg (whole)", qty: "140 g" },
      { food: "rice (cooked)", qty: "240 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "rcp_pescetarian_cut_eggs_rice_spin",
    name: "Eggs, Rice & Spinach (Pesc, Cut)",
    slot: "Dinner",
    items: [
      { food: "egg (whole)", qty: "112 g" },
      { food: "rice (cooked)", qty: "192 g" },
      { food: "spinach", qty: "80 g" },
      { food: "olive oil", qty: "8 g" }
    ]
  }
];