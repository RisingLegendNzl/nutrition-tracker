// Diet module: handles user diet preferences and plan generation UI.
// Phase D: wire up Generate button to produce a 7-day plan and persist it.

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

  // --- Generate button (make it obviously tappable on phones) ---
  const button = document.createElement('button');
  button.id = 'generate-plan';
  button.type = 'button';
  button.setAttribute('aria-label', 'Generate a 7-day meal plan');

  // Text
  button.textContent = 'Generate Plan';

  // Inline styling so it still looks like a button even if CSS resets exist
  button.style.display = 'inline-block';
  button.style.margin = '16px';
  button.style.padding = '12px 16px';
  button.style.border = '1px solid #222';
  button.style.borderRadius = '8px';
  button.style.background = '#f2f2f7';
  button.style.color = '#111';
  button.style.fontSize = '16px';
  button.style.lineHeight = '20px';
  button.style.cursor = 'pointer';
  button.style.userSelect = 'none';
  button.style.webkitTapHighlightColor = 'transparent';

  // Provide visible press feedback
  button.addEventListener('touchstart', () => (button.style.opacity = '0.7'), { passive: true });
  const resetOpacity = () => (button.style.opacity = '1');
  button.addEventListener('touchend', resetOpacity, { passive: true });
  button.addEventListener('touchcancel', resetOpacity, { passive: true });
  button.addEventListener('mousedown', () => (button.style.opacity = '0.7'));
  button.addEventListener('mouseup', resetOpacity);
  button.addEventListener('mouseleave', resetOpacity);

  root.appendChild(button);

  // Where the plan renders
  const planContainer = document.createElement('div');
  planContainer.id = 'plan-container';
  planContainer.style.margin = '8px 16px 24px';
  root.appendChild(planContainer);

  // Load and render existing plan if present
  const existing = loadPlan();
  if (existing) {
    mountPlan(existing, planContainer);
  }

  // Handle Generate button tap/click/keyboard
  const generate = () => {
    const profile = loadProfile();
    try {
      const plan = generatePlan(profile);
      const ok = savePlan(plan);
      if (ok) {
        mountPlan(plan, planContainer);
        emit(EVENT_NAMES.PLAN_UPDATED, { plan });
      } else {
        console.error('Failed to save plan');
      }
    } catch (err) {
      console.error('Error generating plan', err);
    }
  };

  button.addEventListener('click', generate);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      generate();
    }
  });

  // Listen for external plan updates (other modules)
  bus.on(EVENT_NAMES.PLAN_UPDATED, (e) => {
    if (e && e.plan) {
      mountPlan(e.plan, planContainer);
    }
  });
}

// Auto-init on module load (DOM ready or immediately if loaded at end)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default {
  init,
};