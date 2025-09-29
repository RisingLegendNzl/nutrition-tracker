// Dairy-free recipes.

const dairyFreeRecipes = [
  {
    id: "rcp_gluten_dairy_free_pancakes_7a6f",
    name: "Gluten & Dairy-Free Pancakes (DF)",
    slot: "breakfast",
    dietCompat: ["DAIRY_FREE", "GLUTEN_FREE", "VEGAN"],
    goalFit: { GAIN: true, MAINTAIN: true, CUT: false },
    items: [
      { foodId: "MISSING:gf_plain_flour", grams: 120 },
      { foodId: "MISSING:plant_milk", grams: 220 },
      { foodId: "MISSING:egg_or_substitute", grams: 50 },   // vegan swap later
      { foodId: "MISSING:maple_syrup", grams: 20 },
      { foodId: "MISSING:blueberries", grams: 60 }
    ],
    tags: ["breakfast", "pancakes", "family"],
    source: {
      url: "https://www.taste.com.au/recipes/gluten-dairy-free-pancakes/3236c9f0-e040-4b5b-9129-545418220fac",
      site: "taste.com.au",
      rating: "editorial"
    }
  },
  {
    id: "rcp_df_sweet_sour_veg_stirfry_b846",
    name: "Sweet & Sour Vegetable Stir-Fry (DF)",
    slot: "dinner",
    dietCompat: ["DAIRY_FREE", "VEGAN", "VEGETARIAN"],
    goalFit: { GAIN: false, MAINTAIN: true, CUT: true },
    items: [
      { foodId: "MISSING:broccoli_florets", grams: 120 },
      { foodId: "MISSING:capsicum_red", grams: 80 },
      { foodId: "MISSING:carrot", grams: 80 },
      { foodId: "MISSING:snow_peas", grams: 80 },
      { foodId: "MISSING:sweet_sour_sauce", grams: 40 },
      { foodId: "MISSING:rice_cooked", grams: 150 }
    ],
    tags: ["cuisine:asian", "stirfry", "budget"],
    source: {
      url: "https://www.taste.com.au/recipes/sweet-sour-vegetable-stir-fry/8fBHZCZv",
      site: "taste.com.au",
      rating: "editorial"
    }
  }
];

export default dairyFreeRecipes;