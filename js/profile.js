// Handles the user profile within the Nutrify application.
// Phase C: storage + validation + event emission only (no UI rendering).

import { getItem, setItem } from "./storage.js";
import { LS_KEYS, GOALS, DIET_FLAGS, EVENT_NAMES } from "./constants.js";
import bus, { emit } from "./events.js";
import { validateProfile as validateProfileData } from "../brain/validators.js";

// Sensible defaults so Generate can run even if user hasn't set anything.
export const DEFAULT_PROFILE = Object.freeze({
  weightKg: 70,
  usesCreatine: false,
  goal: GOALS.MAINTAIN,
  diet: DIET_FLAGS.OMNI,
});

// Merge helper (shallow)
function withDefaults(profile) {
  return {
    ...DEFAULT_PROFILE,
    ...(profile && typeof profile === "object" ? profile : {}),
  };
}

export function loadProfile() {
  const raw = getItem(LS_KEYS.PROFILE);
  const merged = withDefaults(raw);
  // If stored profile is invalid, fall back to defaults
  return validateProfileData(merged) ? merged : { ...DEFAULT_PROFILE };
}

export function saveProfile(inputProfile) {
  const toSave = withDefaults(inputProfile);
  if (!validateProfileData(toSave)) {
    // Keep it defensive: refuse to write invalid data
    console.error("saveProfile: validation failed", toSave);
    return false;
  }
  setItem(LS_KEYS.PROFILE, toSave);
  // emit event for other modules to respond (e.g., enabling Generate later)
  emit(EVENT_NAMES.PROFILE_SAVED, { profile: toSave });
  return true;
}

// Optional convenience: subscribe to profile saved events (no-op export if needed)
export function onProfileSaved(handler) {
  return bus.on(EVENT_NAMES.PROFILE_SAVED, handler);
}

export default {
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  onProfileSaved,
};