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
  {
    id: "tmpl_lunch_chicken_breast_brownrice_broccoli_oo",
    name: "Chicken Breast + Brown Rice + Broccoli + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "chicken breast", qty: "300 g" },
      { food: "brown rice (cooked)", qty: "300 g" },
      { food: "broccoli", qty: "120 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_dinner_salmon_chickpeas_spinach_oo",
    name: "Canned Salmon + Chickpeas + Spinach + Olive Oil",
    slot: "Dinner",
    items: [
      { food: "salmon (canned, drained)", qty: "200 g" },
      { food: "chickpeas (canned, drained)", qty: "150 g" },
      { food: "spinach", qty: "100 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_lunch_beans_pasta_broccoli_oo",
    name: "Kidney Beans + Wholegrain Pasta + Broccoli + Olive Oil",
    slot: "Lunch",
    items: [
      { food: "kidney beans (canned, drained)", qty: "200 g" },
      { food: "wholegrain pasta (cooked)", qty: "240 g" },
      { food: "broccoli", qty: "120 g" },
      { food: "olive oil", qty: "10 g" }
    ]
  },
  {
    id: "tmpl_breakfast_bread_cottage_pb_banana",
    name: "Wholemeal Toast + Cottage Cheese + Peanut Butter + Banana",
    slot: "Breakfast",
    items: [
      { food: "wholemeal bread", qty: "2 slice" },
      { food: "cottage cheese", qty: "200 g" },
      { food: "peanut butter", qty: "20 g" },
      { food: "banana", qty: "1 medium" }
    ]
  }
];