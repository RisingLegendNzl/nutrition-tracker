// Centralized constants for the Nutrify application.
// This module defines enums and keys used across the app. Keeping these
// in one place helps avoid magic strings and ensures consistency.

// Goals we support across the app.
export const GOALS = Object.freeze({
  GAIN: 'GAIN',
  MAINTAIN: 'MAINTAIN',
  CUT: 'CUT',
});

// Diet flags used by recipes and profile.
export const DIET_FLAGS = Object.freeze({
  OMNI: 'OMNI',
  VEGETARIAN: 'VEGETARIAN',
  VEGAN: 'VEGAN',
  PESCATARIAN: 'PESCATARIAN',
  DAIRY_FREE: 'DAIRY_FREE',
  GLUTEN_FREE: 'GLUTEN_FREE',
});

// Event names used with the pub/sub bus.
export const EVENT_NAMES = Object.freeze({
  PROFILE_SAVED: 'PROFILE_SAVED',
  PLAN_UPDATED: 'PLAN_UPDATED',
});

// LocalStorage keys (single source of truth).
export const LS_KEYS = Object.freeze({
  PROFILE: 'NUTRIFY__PROFILE',
  PLAN: 'NUTRIFY__PLAN',
  VERSION: 'NUTRIFY__VERSION',
});

// Optional convenience: collect all constants into a default export.
const constants = {
  GOALS,
  DIET_FLAGS,
  EVENT_NAMES,
  LS_KEYS,
};

export default constants;