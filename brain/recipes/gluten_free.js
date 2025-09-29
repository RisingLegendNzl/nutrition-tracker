// Gluten-free recipes.

const glutenFreeRecipes = [
  {
    id: "rcp_gluten_free_pancakes_b3d1",
    name: "Gluten-Free Pancakes",
    slot: "breakfast",
    dietCompat: ["GLUTEN_FREE"],
    goalFit: { GAIN: true, MAINTAIN: true, CUT: false },
    items: [
      { foodId: "MISSING:gf_pancake_mix", grams: 120 },
      { foodId: "MISSING:eggs", grams: 100 },
      { foodId: "MISSING:milk_or_df_milk", grams: 200 },
      { foodId: "MISSING:blueberries", grams: 60 }
    ],
    tags: ["breakfast", "pancakes"],
    source: {
      url: "https://www.taste.com.au/recipes/gluten-free-pancakes/8724aa38-5889-432c-b917-73a31ad09a76",
      site: "taste.com.au",
      rating: "editorial"
    }
  },
  {
    id: "rcp_protein_overnight_oats_gf_4e2a",
    name: "Protein Overnight Oats (GF oats)",
    slot: "breakfast",
    dietCompat: ["GLUTEN_FREE", "VEGETARIAN"],
    goalFit: { GAIN: false, MAINTAIN: true, CUT: true },
    items: [
      { foodId: "MISSING:rolled_oats_gluten_free", grams: 50 },
      { foodId: "MISSING:protein_powder_vanilla", grams: 30 },
      { foodId: "MISSING:milk_or_df_milk", grams: 250 },
      { foodId: "MISSING:berries_mixed", grams: 75 },
      { foodId: "MISSING:chia_seeds", grams: 12 },
      { foodId: "MISSING:peanut_butter", grams: 16 }
    ],
    tags: ["breakfast", "make-ahead", "high-protein"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/protein-overnight-oats",
      site: "BBC Good Food",
      rating: "editorial; rated on page"
    }
  }
];

export default glutenFreeRecipes;