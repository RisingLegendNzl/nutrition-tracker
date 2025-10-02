// Portion control logic for meals.
// Scale recipe item quantities based on the user's goal.
// Pure module: no DOM, no storage.

const GOAL_FACTORS = {
  GAIN: 1.2,      // +20%
  MAINTAIN: 1.0,  // baseline
  CUT: 0.8,       // -20%
};

export function calculatePortions(recipe, profile) {
  if (!recipe || !Array.isArray(recipe.items)) return recipe;
  const goal = profile && profile.goal;
  const factor = GOAL_FACTORS[goal] ?? 1.0;

  const items = recipe.items.map((it) => ({
    foodId: it.foodId,
    grams: Math.round(it.grams * factor),
  }));

  return { ...recipe, items };
}

export default { calculatePortions };