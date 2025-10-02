// Rotation logic for meal scheduling with deterministic seeded randomness.
// Adjusted imports to match deployed structure (recipes are under brain/recipes).

import omniRecipes from '../brain/recipes/omni.js';
import vegetarianRecipes from '../brain/recipes/vegetarian.js';
import veganRecipes from '../brain/recipes/vegan.js';
import pescatarianRecipes from '../brain/recipes/pescatarian.js';
import dairyFreeRecipes from '../brain/recipes/dairy_free.js';
import glutenFreeRecipes from '../brain/recipes/gluten_free.js';

// Consolidate all recipes into a single array for filtering.
const ALL_RECIPES = [
  ...omniRecipes,
  ...vegetarianRecipes,
  ...veganRecipes,
  ...pescatarianRecipes,
  ...dairyFreeRecipes,
  ...glutenFreeRecipes,
];

// Compute a simple 32-bit hash from a string. Produces a non-negative integer.
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32-bit int
  }
  return hash >>> 0;
}

// Determine the week number (ISO-ish; Monday start).
function getWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Small LCG for deterministic pseudo-random numbers.
function createRng(seed) {
  let state = seed >>> 0;
  return function () {
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

// Filter recipes by profile diet, goal and slot.
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
 * - no duplicate recipe IDs within a day
 * - prefer protein diversity across the week
 */
export function chooseRecipe(profile, dayIdx, slotIdx, usedIdsDay, usedProteinsWeek) {
  const slots = ['breakfast', 'lunch', 'dinner'];
  const slotName = slots[slotIdx] || 'dinner';
  const candidates = filterRecipes(profile, slotName).filter((r) => !usedIdsDay.has(r.id));
  const pool = candidates.length ? candidates : filterRecipes(profile, slotName);
  if (!pool.length) throw new Error(`No recipes available for slot ${slotName}`);

  // Diversity: split by whether protein already used this week
  const preferred = [];
  const fallback = [];
  for (const r of pool) {
    const protein = getProteinTag(r);
    (protein && !usedProteinsWeek.has(protein) ? preferred : fallback).push(r);
  }
  const choicePool = preferred.length ? preferred : pool;

  // Seed from profile, week number, day and slot
  const profileHash = stringHash(JSON.stringify(profile));
  const weekNo = getWeekNumber(new Date());
  const seed = profileHash ^ weekNo ^ (dayIdx << 3) ^ slotIdx;
  const rng = createRng(seed);
  const index = Math.floor(rng() * choicePool.length);
  const recipe = choicePool[index];

  usedIdsDay.add(recipe.id);
  const p = getProteinTag(recipe);
  if (p) usedProteinsWeek.add(p);
  return recipe;
}

export default { chooseRecipe };