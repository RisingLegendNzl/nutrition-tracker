// Vegan recipes.

const veganRecipes = [
  {
    id: "rcp_oat_chia_porridge_0e94",
    name: "Oat & Chia Porridge",
    slot: "breakfast",
    dietCompat: ["VEGAN", "VEGETARIAN", "DAIRY_FREE", "GLUTEN_FREE"],
    goalFit: { GAIN: false, MAINTAIN: true, CUT: true },
    items: [
      { foodId: "MISSING:rolled_oats_gluten_free", grams: 50 },
      { foodId: "MISSING:chia_seeds", grams: 12 },
      { foodId: "MISSING:plant_milk_almond_unsweetened", grams: 250 },
      { foodId: "MISSING:banana", grams: 90 },
      { foodId: "MISSING:berries_mixed", grams: 60 }
    ],
    tags: ["breakfast", "high-fibre", "low-gi"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/oat-chia-porridge",
      site: "BBC Good Food",
      rating: "editorial; porridge collection shows ratings"
    }
  },
  {
    id: "rcp_vegan_chickpea_curry_jacket_4f6a",
    name: "Vegan Chickpea Curry Jacket Potato",
    slot: "lunch",
    dietCompat: ["VEGAN", "VEGETARIAN", "DAIRY_FREE", "GLUTEN_FREE"],
    goalFit: { GAIN: true, MAINTAIN: true, CUT: false },
    items: [
      { foodId: "MISSING:potato_baking", grams: 250 },
      { foodId: "MISSING:canned_chickpeas_drained", grams: 120 },
      { foodId: "MISSING:tomato_passata", grams: 120 },
      { foodId: "MISSING:curry_powder", grams: 6 },
      { foodId: "MISSING:spinach", grams: 40 }
    ],
    tags: ["cuisine:british", "one-pan", "budget"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/vegan-chickpea-curry-jacket-potato",
      site: "BBC Good Food",
      rating: "editorial"
    }
  }
];

export default veganRecipes;