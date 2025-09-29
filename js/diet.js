// Diet module: handles user diet preferences and plan generation UI.
// Phase D: wire up Generate button to produce a 7‑day plan and persist it.

import { loadProfile } from './profile.js';
import { generatePlan } from '../engine/nutritionEngine.js';
import { loadPlan, savePlan } from './plan.io.js';
import { mountPlan } from './plan.mount.js';
import bus, { emit } from './events.js';
import { EVENT_NAMES } from './constants.js';

/**
 * Initialize the diet UI: create a Generate button, load any existing plan,
 * and set up event listeners. This function runs automatically on module load.
 */
function init() {
  const root = document.getElementById('app');
  if (!root) return;
  // Clear root and build basic UI
  root.innerHTML = '';
  const button = document.createElement('button');
  button.id = 'generate-plan';
  button.textContent = 'Generate Plan';
  button.style.display = 'block';
  button.style.margin = '1rem 0';
  root.appendChild(button);
  const planContainer = document.createElement('div');
  planContainer.id = 'plan-container';
  root.appendChild(planContainer);

  // Load and render existing plan if present
  const existing = loadPlan();
  if (existing) {
    mountPlan(existing, planContainer);
  }

  // Handle Generate button click
  button.addEventListener('click', () => {
    const profile = loadProfile();
    try {
      const plan = generatePlan(profile);
      // Save plan; validation occurs inside savePlan
      const ok = savePlan(plan);
      if (ok) {
        // Render plan and emit event
        mountPlan(plan, planContainer);
        emit(EVENT_NAMES.PLAN_UPDATED, { plan });
      } else {
        console.error('Failed to save plan');
      }
    } catch (err) {
      console.error('Error generating plan', err);
    }
  });

  // Listen for external plan updates
  bus.on(EVENT_NAMES.PLAN_UPDATED, (e) => {
    if (e && e.plan) {
      mountPlan(e.plan, planContainer);
    }
  });
}

// Auto‑init on module load (DOM ready or immediately if loaded at end)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default {
  init,
};