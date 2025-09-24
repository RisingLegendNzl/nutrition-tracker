// Hydration logic and helpers for the Nutrify application.

export function calculateHydrationGoal(weightKg, usesCreatine = false) {
  // Calculates daily hydration goal: weight * 35 ml, capped at 3500 ml.
  const baseGoal = Math.min(weightKg * 35, 3500);
  return usesCreatine ? baseGoal + 500 : baseGoal;
}

export default {
  calculateHydrationGoal,
};