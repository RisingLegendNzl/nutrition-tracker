// Rotation logic for meal scheduling with deterministic seeded randomness.
// This module selects recipes for a given profile, day index, and slot index
// ensuring no duplicates within a day and encouraging diversity across the week.

import omniRecipes from '../recipes/omni.js';
import vegetarianRecipes from '../recipes/vegetarian.js';
import veganRecipes from '../recipes/vegan.js';
import pescatarianRecipes from '../recipes/pescatarian.js';
import dairyFreeRecipes from '../recipes/dairy_free.js';
import glutenFreeRecipes from '../recipes/gluten_free.js';

// Consolidate all recipes into a single array for filtering.
const ALL_RECIPES = [
  ...omniRecipes,
  ...vegetarianRecipes,
  ...veganRecipes,
  ...pescatarianRecipes,
  ...dairyFreeRecipes,
  ...glutenFreeRecipes,
];

// Compute a simple 32‑bit hash from a string. Produces a non‑negative integer.
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32‑bit integer
  }
  return hash >>> 0;
}

// Determine the week number of the given date (Monday = week start).
function getWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (0=Sun…)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

// Simple linear congruential generator (LCG) for deterministic pseudo‑random numbers.
function createRng(seed) {
  let state = seed >>> 0;
  return function () {
    // Constants from Numerical Recipes
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 0xffffffff;
  };
}

// Extract primary protein tag from recipe tags (e.g., 'protein:chicken').
function getProteinTag(recipe) {
  if (!Array.isArray(recipe.tags)) return undefined;
  const tag = recipe.tags.find((t) => typeof t === 'string' && t.startsWith('protein:'));
  return tag ? tag.split(':')[1] : undefined;
}

// Filter all recipes by profile diet, goal and slot (breakfast, lunch, dinner).
function filterRecipes(profile, slotName) {
  return ALL_RECIPES.filter((r) => {
    return (
      r.slot === slotName &&
      Array.isArray(r.dietCompat) &&
      r.dietCompat.includes(profile.diet) &&
      r.goalFit && r.goalFit[profile.goal]
    );
  });
}

/**
 * Choose a recipe deterministically for a given profile, day and slot.
 * @param {Object} profile User profile (diet & goal used for filtering).
 * @param {number} dayIdx Index 0–6 representing Monday–Sunday.
 * @param {number} slotIdx 0=breakfast, 1=lunch, 2=dinner.
 * @param {Set<string>} usedIdsDay Recipes used within the same day (to avoid duplicates).
 * @param {Set<string>} usedProteinsWeek Proteins used across the week (encourage diversity).
 * @returns {Object} Selected recipe.
 */
export function chooseRecipe(profile, dayIdx, slotIdx, usedIdsDay, usedProteinsWeek) {
  const slots = ['breakfast', 'lunch', 'dinner'];
  const slotName = slots[slotIdx] || 'dinner';
  const candidates = filterRecipes(profile, slotName).filter((r) => !usedIdsDay.has(r.id));
  if (candidates.length === 0) {
    // If no candidates remain (should rarely happen), reset usedIdsDay filter.
    const all = filterRecipes(profile, slotName);
    if (all.length === 0) throw new Error(`No recipes available for slot ${slotName}`);
    candidates.push(...all);
  }
  // Partition candidates by whether their protein has been used this week.
  const preferred = [];
  const fallback = [];
  for (const r of candidates) {
    const protein = getProteinTag(r);
    if (protein && !usedProteinsWeek.has(protein)) {
      preferred.push(r);
    } else {
      fallback.push(r);
    }
  }
  const choicePool = preferred.length > 0 ? preferred : candidates;
  // Compute seed: combine profile hash, week number, day and slot indices.
  const profileHash = stringHash(JSON.stringify(profile));
  const weekNo = getWeekNumber(new Date());
  const seed = profileHash ^ weekNo ^ (dayIdx << 3) ^ slotIdx;
  const rng = createRng(seed);
  const index = Math.floor(rng() * choicePool.length);
  const recipe = choicePool[index];
  usedIdsDay.add(recipe.id);
  const protein = getProteinTag(recipe);
  if (protein) usedProteinsWeek.add(protein);
  return recipe;
}

export default {
  chooseRecipe,
};