// Portion control logic for meals.

// Portion control logic for meals.
// Scale recipe item quantities based on the user's goal.
// This helper returns a new recipe object with scaled item grams.

const GOAL_FACTORS = {
  GAIN: 1.2,      // +20% portions for gaining weight
  MAINTAIN: 1.0,  // baseline portions
  CUT: 0.8,       // -20% portions for cutting
};

export function calculatePortions(recipe, profile) {
  if (!recipe || !Array.isArray(recipe.items)) return recipe;
  const goal = profile && profile.goal;
  const factor = GOAL_FACTORS[goal] ?? 1.0;
  const scaledItems = recipe.items.map((item) => {
    return {
      foodId: item.foodId,
      grams: Math.round(item.grams * factor),
    };
  });
  // Return a shallow copy with scaled items
  return {
    ...recipe,
    items: scaledItems,
  };
}

export default {
  calculatePortions,
};