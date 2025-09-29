// Core nutrition engine responsible for generating meal plans.
// Generates a deterministic 7‑day plan based on the user profile.

import { chooseRecipe } from './rotation.js';
import { calculatePortions } from './portions.js';
import nutritionalInfo from '../brain/nutritional.info.js';

// Helper to compute Monday of the week containing the given date.
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sunday, 1=Monday
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Generate a 7‑day nutrition plan for a given profile.
 * @param {Object} profile The user profile containing goal, diet, etc.
 * @param {Date} date Optional date anchor; defaults to today. Plan starts Monday of week.
 * @returns {Object} Plan with days array, each containing date, meals and totals.
 */
export function generatePlan(profile, date = new Date()) {
  if (!profile || typeof profile !== 'object') {
    throw new Error('generatePlan: invalid profile');
  }
  const monday = getMonday(date);
  const days = [];
  const usedProteinsWeek = new Set();
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const usedIdsDay = new Set();
    const meals = [];
    for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
      const recipe = chooseRecipe(profile, dayIdx, slotIdx, usedIdsDay, usedProteinsWeek);
      const scaled = calculatePortions(recipe, profile);
      meals.push({ id: scaled.id, items: scaled.items });
    }
    // Compute total macros for the day
    const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    meals.forEach((meal) => {
      meal.items.forEach((item) => {
        const info = nutritionalInfo[item.foodId];
        if (!info) return;
        const factor = item.grams / 100;
        totals.kcal += info.kcal * factor;
        totals.protein += info.p * factor;
        totals.carbs += info.c * factor;
        totals.fat += info.f * factor;
      });
    });
    // Round totals to 2 decimals for readability
    for (const key of Object.keys(totals)) {
      totals[key] = Math.round(totals[key] * 100) / 100;
    }
    // Compute ISO date string for this day
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + dayIdx);
    const dateStr = dayDate.toISOString().split('T')[0];
    days.push({ date: dateStr, meals, totals });
  }
  return { days };
}

export default {
  generatePlan,
};