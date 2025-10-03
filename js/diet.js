// Diet module: Profile mini-UI + Generate plan.
// Phone-first, no external CSS. Uses profile.js for load/save and events.

import { loadProfile, saveProfile } from './profile.js';
import { generatePlan } from '../engine/nutritionEngine.js';
import { loadPlan, savePlan } from './plan.io.js';
import { mountPlan } from './plan.mount.js';
import bus, { emit } from './events.js';
import { EVENT_NAMES, GOALS, DIET_FLAGS } from './constants.js';

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

function labelWrap(labelText, control) {
  const wrap = makeEl('label', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '10px',
      fontSize: '15px',
    },
  }, [labelText, control]);
  return wrap;
}

function buildProfileCard(onSave) {
  const card = makeEl('div', {
    id: 'profile-card',
    style: {
      margin: '12px 16px 8px',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      background: '#fafafa',
    },
  });

  const title = makeEl('div', {
    textContent: 'Profile',
    style: { fontWeight: '600', marginBottom: '8px', fontSize: '16px' },
  });

  // controls
  const p = loadProfile();

  const weight = makeEl('input', {
    type: 'number',
    inputMode: 'decimal',
    min: '30',
    max: '300',
    step: '1',
    value: String(p.weightKg ?? 70),
    style: { flex: '1', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' },
  });

  const goal = makeEl('select', {
    style: { flex: '1', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' },
  });
  [GOALS.GAIN, GOALS.MAINTAIN, GOALS.CUT].forEach((g) => {
    const opt = makeEl('option', { value: g, textContent: g });
    if (p.goal === g) opt.selected = true;
    goal.appendChild(opt);
  });

  const diet = makeEl('select', {
    style: { flex: '1', padding: '8px', border: '1px solid #ccc', borderRadius: '6px' },
  });
  [
    DIET_FLAGS.OMNI,
    DIET_FLAGS.VEGETARIAN,
    DIET_FLAGS.VEGAN,
    DIET_FLAGS.PESCATARIAN,
    DIET_FLAGS.DAIRY_FREE,
    DIET_FLAGS.GLUTEN_FREE,
  ].forEach((d) => {
    const opt = makeEl('option', { value: d, textContent: d });
    if (p.diet === d) opt.selected = true;
    diet.appendChild(opt);
  });

  const creatine = makeEl('input', {
    type: 'checkbox',
    checked: !!p.usesCreatine,
    style: { width: '20px', height: '20px' },
  });

  card.appendChild(title);
  card.appendChild(labelWrap('Weight (kg)', weight));
  card.appendChild(labelWrap('Goal', goal));
  card.appendChild(labelWrap('Diet', diet));
  card.appendChild(labelWrap('Creatine', creatine));

  const saveHint = makeEl('div', {
    textContent: 'Changes save instantly.',
    style: { fontSize: '12px', color: '#666' },
  });
  card.appendChild(saveHint);

  // live-save on change
  const doSave = () => {
    const data = {
      weightKg: Math.round(Number(weight.value) || 70),
      goal: goal.value,
      diet: diet.value,
      usesCreatine: !!creatine.checked,
    };
    const ok = saveProfile(data);
    if (onSave) onSave(ok, data);
  };

  [weight, goal, diet, creatine].forEach((el) => {
    el.addEventListener('change', doSave);
    el.addEventListener('blur', doSave);
    // ensure mobile keyboard enter also saves
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doSave(); }
    });
  });

  return card;
}

function init() {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = '';

  // Status / error panel
  const status = makeEl('div', {
    id: 'status-panel',
    style: {
      display: 'none',
      margin: '8px 16px 0',
      padding: '10px 12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
    },
  });

  // Profile mini-UI
  const profileCard = buildProfileCard((ok) => {
    showStatus(status, ok ? 'Profile saved.' : 'Profile failed validation.', ok ? 'info' : 'error');
  });

  // Generate button
  const button = makeEl('button', {
    id: 'generate-plan',
    type: 'button',
    textContent: 'Generate Plan',
    style: {
      display: 'inline-block',
      margin: '12px 16px',
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
  });

  const planContainer = makeEl('div', {
    id: 'plan-container',
    style: { margin: '8px 16px 24px' },
  });

  root.appendChild(profileCard);
  root.appendChild(button);
  root.appendChild(status);
  root.appendChild(planContainer);

  // Existing plan
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

  // Generate handler
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
      showStatus(status, `Error generating plan:\n${err?.message || err}`, 'error');
    }
  };

  button.addEventListener('click', generate);
  // visible press feedback
  const fade = () => (button.style.opacity = '0.7');
  const unfade = () => (button.style.opacity = '1');
  button.addEventListener('touchstart', fade, { passive: true });
  button.addEventListener('touchend', unfade, { passive: true });
  button.addEventListener('touchcancel', unfade, { passive: true });
  button.addEventListener('mousedown', fade);
  button.addEventListener('mouseup', unfade);
  button.addEventListener('mouseleave', unfade);

  // Sync view on external updates
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