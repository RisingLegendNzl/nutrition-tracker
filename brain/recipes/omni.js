// Omnivore recipes.

const omniRecipes = [
  {
    id: "rcp_chicken_veg_stirfry_8a3d",
    name: "Easy Chicken & Vegetable Stir-Fry",
    slot: "dinner",
    dietCompat: ["OMNI"],
    goalFit: { GAIN: false, MAINTAIN: true, CUT: true },
    items: [
      { foodId: "MISSING:chicken_breast_raw", grams: 150 },
      { foodId: "MISSING:broccoli_florets", grams: 120 },
      { foodId: "MISSING:carrot", grams: 80 },
      { foodId: "MISSING:capsicum_red", grams: 80 },
      { foodId: "MISSING:soy_sauce", grams: 20 },
      { foodId: "MISSING:garlic", grams: 6 },
      { foodId: "MISSING:ginger", grams: 6 },
      { foodId: "MISSING:canola_or_rice_bran_oil", grams: 10 },
      { foodId: "MISSING:rice_cooked", grams: 150 }
    ],
    tags: ["cuisine:asian", "protein:chicken", "method:stirfry"],
    source: {
      url: "https://www.taste.com.au/recipes/basic-chicken-vegetable-stir-fry/014fd009-6e08-4296-b155-f0b22fdc857a",
      site: "taste.com.au",
      rating: "editorial (healthy 8.4 noted)"
    }
  },
  {
    id: "rcp_full_english_shakshuka_2f7c",
    name: "Full English Shakshuka",
    slot: "breakfast",
    dietCompat: ["OMNI"],
    goalFit: { GAIN: true, MAINTAIN: true, CUT: false },
    items: [
      { foodId: "MISSING:eggs", grams: 120 },       // ~2 large
      { foodId: "MISSING:bacon_rashers", grams: 60 },
      { foodId: "MISSING:canned_tomatoes", grams: 200 },
      { foodId: "MISSING:baked_beans", grams: 150 },
      { foodId: "MISSING:olive_oil", grams: 10 },
      { foodId: "MISSING:chilli_flakes", grams: 1 },
      { foodId: "MISSING:bread_sourdough", grams: 60 }
    ],
    tags: ["cuisine:middle-eastern", "style:brunch", "eggs"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/full-english-shakshuka",
      site: "BBC Good Food",
      rating: "editorial; collection page shows rated shakshuka variants"
    }
  }
];

export default omniRecipes;