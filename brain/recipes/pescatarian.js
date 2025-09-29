// Pescatarian recipes.

const pescatarianRecipes = [
  {
    id: "rcp_one_pan_salmon_asparagus_9b7e",
    name: "One-pan Salmon with Roast Asparagus",
    slot: "dinner",
    dietCompat: ["PESCATARIAN", "GLUTEN_FREE"],
    goalFit: { GAIN: true, MAINTAIN: true, CUT: false },
    items: [
      { foodId: "MISSING:salmon_fillet_raw", grams: 160 },
      { foodId: "MISSING:asparagus", grams: 120 },
      { foodId: "MISSING:olive_oil", grams: 12 },
      { foodId: "MISSING:lemon", grams: 30 },
      { foodId: "MISSING:salt", grams: 2 }
    ],
    tags: ["traybake", "omega-3", "cuisine:modern"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/collection/traybake-dinner-recipes",
      site: "BBC Good Food",
      rating: "collection shows 571 ratings on this dish"
    }
  },
  {
    id: "rcp_soy_salmon_broccoli_tray_1d2c",
    name: "Soy Salmon & Broccoli Traybake",
    slot: "lunch",
    dietCompat: ["PESCATARIAN"],
    goalFit: { GAIN: false, MAINTAIN: true, CUT: true },
    items: [
      { foodId: "MISSING:salmon_fillet_raw", grams: 140 },
      { foodId: "MISSING:broccoli_florets", grams: 150 },
      { foodId: "MISSING:soy_sauce", grams: 20 },
      { foodId: "MISSING:orange_or_lemon_juice", grams: 20 }
    ],
    tags: ["low-gi", "sheet-pan", "omega-3"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/collection/low-gi-dinner-recipes",
      site: "BBC Good Food",
      rating: "collection shows 56 ratings for this dish"
    }
  }
];

export default pescatarianRecipes;