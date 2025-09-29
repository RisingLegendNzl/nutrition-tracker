// IO functions for reading and writing nutrition plans.
// This module interacts with localStorage via storage.js and validates
// plans using the brain validators. No direct localStorage access here.

import { getItem, setItem } from './storage.js';
import { LS_KEYS } from './constants.js';
import { validatePlan } from '../brain/validators.js';

/**
 * Load a persisted nutrition plan from storage.
 * Returns the plan object if valid, or null if none/invalid.
 */
export function loadPlan() {
  const stored = getItem(LS_KEYS.PLAN);
  if (!stored) return null;
  // Validate before returning; discard if invalid
  return validatePlan(stored) ? stored : null;
}

/**
 * Persist a nutrition plan to storage. Validates before saving.
 * @param {Object} plan Plan object to save.
 * @returns {boolean} True if saved, false if validation failed.
 */
export function savePlan(plan) {
  if (!validatePlan(plan)) {
    console.error('savePlan: validation failed', plan);
    return false;
  }
  setItem(LS_KEYS.PLAN, plan);
  return true;
}

export default {
  loadPlan,
  savePlan,
};