// Validation functions and JSON "schemas" for core data structures.

// --- Lightweight JSON Schemas (documentation + simple checks) ---

// PROFILE schema (minimal needed for engine to run later):
// {
//   weightKg: number >= 30 and <= 300
//   usesCreatine: boolean
//   goal: one of GOALS
//   diet: one of DIET_FLAGS
// }
export const PROFILE_SCHEMA = Object.freeze({
  type: "object",
  properties: {
    weightKg: { type: "number", minimum: 30, maximum: 300 },
    usesCreatine: { type: "boolean" },
    goal: { type: "string", enum: ["GAIN", "MAINTAIN", "CUT"] },
    diet: {
      type: "string",
      enum: ["OMNI", "VEGETARIAN", "VEGAN", "PESCATARIAN", "DAIRY_FREE", "GLUTEN_FREE"],
    },
  },
  required: ["weightKg", "usesCreatine", "goal", "diet"],
  additionalProperties: true,
});

// PLAN schema (basic/deterministic 7-day plan placeholder):
// {
//   days: array[7] of {
//     date: string (ISO) | null
//     meals: array of { id: string, items: array of { foodId: string, grams: number > 0 } }
//   }
// }
export const PLAN_SCHEMA = Object.freeze({
  type: "object",
  properties: {
    days: {
      type: "array",
      minItems: 7,
      maxItems: 7,
      items: {
        type: "object",
        properties: {
          date: { type: ["string", "null"] },
          meals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      foodId: { type: "string" },
                      grams: { type: "number", exclusiveMinimum: 0 },
                    },
                    required: ["foodId", "grams"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["id", "items"],
              additionalProperties: true,
            },
          },
        },
        required: ["meals"],
        additionalProperties: true,
      },
    },
  },
  required: ["days"],
  additionalProperties: false,
});

// --- Simple validators (no external libs; fast + deterministic) ---

function isNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}
function isBoolean(x) {
  return typeof x === "boolean";
}
function isString(x) {
  return typeof x === "string";
}

export function validateProfile(profile) {
  if (typeof profile !== "object" || !profile) return false;

  if (!isNumber(profile.weightKg)) return false;
  if (profile.weightKg < 30 || profile.weightKg > 300) return false;

  if (!isBoolean(profile.usesCreatine)) return false;

  const goals = PROFILE_SCHEMA.properties.goal.enum;
  if (!isString(profile.goal) || !goals.includes(profile.goal)) return false;

  const diets = PROFILE_SCHEMA.properties.diet.enum;
  if (!isString(profile.diet) || !diets.includes(profile.diet)) return false;

  return true;
}

export function validatePlan(plan) {
  if (typeof plan !== "object" || !plan) return false;
  if (!Array.isArray(plan.days) || plan.days.length !== 7) return false;

  for (const day of plan.days) {
    if (!day || typeof day !== "object") return false;
    if (!Array.isArray(day.meals)) return false;

    for (const meal of day.meals) {
      if (!meal || typeof meal !== "object") return false;
      if (!isString(meal.id)) return false;
      if (!Array.isArray(meal.items)) return false;

      for (const it of meal.items) {
        if (!it || typeof it !== "object") return false;
        if (!isString(it.foodId)) return false;
        if (!isNumber(it.grams) || it.grams <= 0) return false;
      }
    }
  }
  return true;
}

// (kept from Phase 0)
export function validateNutritionInfo(info) {
  // Placeholder: always returns true (detailed checks can be added later).
  return true;
}

export default {
  PROFILE_SCHEMA,
  PLAN_SCHEMA,
  validateProfile,
  validatePlan,
  validateNutritionInfo,
};