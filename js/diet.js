// Diet module: handles user diet preferences and plan generation UI.
// Phase D: wire up Generate button to produce a 7-day plan and persist it,
// with inline phone-friendly error reporting.

import { loadProfile } from './profile.js';
import { generatePlan } from '../engine/nutritionEngine.js';
import { loadPlan, savePlan } from './plan.io.js';
import { mountPlan } from './plan.mount.js';
import bus, { emit } from './events.js';
import { EVENT_NAMES } from './constants.js';

function makeEl(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  if (props.style) Object.assign(el.style, props.style);
  for (const c of children) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return el;
}

function showStatus(panel, msg, type = 'info') {
  if (!panel) return;
  panel.textContent = msg;
  panel.style.display = 'block';
  panel.style.background = type === 'error' ? '#ffecec' : '#eef9ff';
  panel.style.borderColor = type === 'error' ? '#ff6b6b' : '#1e90ff';
}

function init() {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = '';

  // --- Status / error panel (always visible on phone) ---
  const status = makeEl('div', {
    id: 'status-panel',
    style: {
      display: 'none',
      margin: '12px 16px 0',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
    },
  });

  // --- Generate button (obviously tappable) ---
  const button = makeEl(
    'button',
    {
      id: 'generate-plan',
      type: 'button',
      ariaLabel: 'Generate a 7-day meal plan',
      textContent: 'Generate Plan',
      style: {
        display: 'inline-block',
        margin: '16px',
        padding: '12px 16px',
        border: '1px solid #222',
        borderRadius: '8px',
        background: '#f2f2f7',
        color: '#111',
        fontSize: '16px',
        lineHeight: '20px',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      },
    }
  );

  const planContainer = makeEl('div', {
    id: 'plan-container',
    style: { margin: '8px 16px 24px' },
  });

  root.appendChild(button);
  root.appendChild(status);
  root.appendChild(planContainer);

  // Try to show any existing plan
  try {
    const existing = loadPlan();
    if (existing) {
      showStatus(status, 'Loaded saved plan. You can regenerate anytime.');
      mountPlan(existing, planContainer);
    } else {
      showStatus(status, 'No saved plan yet. Tap “Generate Plan”.');
    }
  } catch (e) {
    showStatus(status, `Error loading saved plan:\n${e?.message || e}`, 'error');
  }

  const generate = () => {
    showStatus(status, 'Generating…');
    const profile = loadProfile();
    try {
      const plan = generatePlan(profile);
      if (!plan || !Array.isArray(plan.days) || plan.days.length !== 7) {
        throw new Error('Engine returned an invalid plan shape.');
      }
      const ok = savePlan(plan);
      if (!ok) throw new Error('Failed to validate/save plan.');

      mountPlan(plan, planContainer);
      emit(EVENT_NAMES.PLAN_UPDATED, { plan });
      showStatus(status, 'Plan generated ✔︎');
    } catch (err) {
      console.error('Error generating plan', err);
      showStatus(
        status,
        `Error generating plan:\n${err?.message || err}\n\n(If this keeps happening, take a screenshot and send it.)`,
        'error'
      );
    }
  };

  button.addEventListener('click', generate);
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      generate();
    }
  });

  // visible press feedback
  const fade = () => (button.style.opacity = '0.7');
  const unfade = () => (button.style.opacity = '1');
  button.addEventListener('touchstart', fade, { passive: true });
  button.addEventListener('touchend', unfade, { passive: true });
  button.addEventListener('touchcancel', unfade, { passive: true });
  button.addEventListener('mousedown', fade);
  button.addEventListener('mouseup', unfade);
  button.addEventListener('mouseleave', unfade);

  // Keep the view in sync if other modules update the plan
  bus.on(EVENT_NAMES.PLAN_UPDATED, (e) => {
    if (e && e.plan) {
      mountPlan(e.plan, planContainer);
      showStatus(status, 'Plan updated.');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default { init };