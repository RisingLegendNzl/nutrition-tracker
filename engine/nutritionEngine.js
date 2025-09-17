// engine/nutritionEngine.js
import { foodsBundle } from '../brain/diet.data.js';
import mealTemplates from '../brain/recipes/meal-templates.js';

export function generateDayPlan(req) {
  const { profile, constraints } = req;
  const { sex, age_y, height_cm, weight_kg, bodyfat_pct, activity_pal, goal } = profile || {};

  // 1) Validate
  if (!profile || !constraints) return err("MISSING_INPUTS", "profile and constraints are required");
  if (!sex || !age_y || !height_cm || !weight_kg || !activity_pal || !goal) {
    return err("MISSING_INPUTS", "sex, age_y, height_cm, weight_kg, activity_pal, goal are required");
  }
  if (constraints.diet && !["omnivore","vegetarian","vegan","pescetarian"].includes(constraints.diet))
    return err("INVALID_CONSTRAINTS", "diet must be one of {omnivore, vegetarian, vegan, pescetarian}");

  // 2) Targets (BMR → TDEE → goal)
  const bmr = bodyfat_pct != null
    ? 370 + 21.6 * (weight_kg * (1 - bodyfat_pct/100))            // Katch–McArdle
    : (sex === "male"
        ? 10*weight_kg + 6.25*height_cm - 5*age_y + 5
        : 10*weight_kg + 6.25*height_cm - 5*age_y - 161);         // Mifflin–St Jeor
  const tdee = bmr * activity_pal;
  const adj = goal === "cut" ? clamp(-500, -0.2*tdee, -300)
            : goal === "gain" ? clamp(300, 300, Math.min(500, 0.2*tdee))
            : 0;
  let kcal = Math.round(tdee + adj);
  if ((sex === "male" && kcal < 1500) || (sex !== "male" && kcal < 1200))
    return err("SAFETY_LIMIT", "kcal below minimum; consult a professional");

  // 3) Macros
  const protein_per_kg = 1.6; // you can raise to 2.2 later or make it a range with a chosen point
  const protein_g = round1(protein_per_kg * weight_kg);
  const fat_min_g = Math.max(0.6*weight_kg, 0.15*kcal/9);
  const fat_g = round1(Math.max(fat_min_g, 0.25*kcal/9)); // 25% kcal default
  const carbs_g = round1((kcal - (protein_g*4 + fat_g*9)) / 4);
  const fiber_g = sex === "male" ? 30 : 25;

  // 4) Filter templates
  const allowed = filterTemplates(mealTemplates, constraints);

  // 5–7) Select & scale (deterministic)
  const plan = pickAndScale(allowed, {kcal, protein_g, fat_g, carbs_g, fiber_g}, foodsBundle);

  // 8) Build response
  return {
    engine_version: req.engine_version || "v1.0.0",
    data_version: req.data_version || "2025-09-17",
    type: "day_plan",
    inputs_echo: { profile, constraints },
    targets: { kcal, protein_g, fat_g, carbs_g, fiber_g },
    meals: plan.meals,
    day_totals: plan.totals,
    compliance: plan.compliance,
    micros_watchlist: plan.micros,
    cost_estimate_aud: plan.cost_aud ?? null,
    explanations: plan.explain,
    summary: plan.summary,
    disclaimer: "Not medical advice. For healthy adults 18–65."
  };

  // helpers
  function err(code, message) {
    return {
      engine_version: req.engine_version || "v1.0.0",
      data_version: req.data_version || "2025-09-17",
      type: "error", code, message,
      suggestions: []
    };
  }
}
function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
function round1(x){ return Math.round(x*10)/10; }

// ↓ Implement filterTemplates + pickAndScale using foodsBundle.foods & portion_maps
