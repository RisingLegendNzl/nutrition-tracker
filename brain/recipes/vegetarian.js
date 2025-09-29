// Vegetarian recipes.

const vegetarianRecipes = [
  {
    id: "rcp_mushroom_potato_curry_b2a1",
    name: "One-pot Mushroom & Potato Curry",
    slot: "dinner",
    dietCompat: ["VEGETARIAN", "VEGAN"], // vegan if plant curry paste
    goalFit: { GAIN: true, MAINTAIN: true, CUT: false },
    items: [
      { foodId: "MISSING:onion_brown", grams: 80 },
      { foodId: "MISSING:potato", grams: 200 },
      { foodId: "MISSING:aubergine_eggplant", grams: 150 },
      { foodId: "MISSING:button_mushrooms", grams: 150 },
      { foodId: "MISSING:curry_paste", grams: 30 },
      { foodId: "MISSING:veg_stock", grams: 150 },
      { foodId: "MISSING:coconut_milk_light", grams: 200 },
      { foodId: "MISSING:coriander_fresh", grams: 5 }
    ],
    tags: ["cuisine:indian", "one-pot", "comfort"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/one-pot-mushroom-potato-curry",
      site: "BBC Good Food",
      rating: "391 ratings"
    }
  },
  {
    id: "rcp_feta_roasted_tomato_shakshuka_c319",
    name: "Feta & Roasted Tomato Shakshuka",
    slot: "lunch",
    dietCompat: ["VEGETARIAN"],
    goalFit: { GAIN: false, MAINTAIN: true, CUT: true },
    items: [
      { foodId: "MISSING:eggs", grams: 120 },
      { foodId: "MISSING:tomatoes_roasted", grams: 220 },
      { foodId: "MISSING:feta", grams: 40 },
      { foodId: "MISSING:olive_oil", grams: 10 },
      { foodId: "MISSING:bread_rye", grams: 50 }
    ],
    tags: ["cuisine:middle-eastern", "eggs", "pan"],
    source: {
      url: "https://www.bbcgoodfood.com/recipes/collection/shakshuka-recipes",
      site: "BBC Good Food",
      rating: "collection shows rated shakshukas"
    }
  }
];

export default vegetarianRecipes;