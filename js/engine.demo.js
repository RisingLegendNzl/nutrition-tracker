// js/engine.demo.js
// Nutrition Engine demo launcher with "Use Today" + "Use All Week" actions.
// - Reads profile from localStorage or Profile DOM fields
// - Calls generateDayPlan()
// - Overlay shows JSON + buttons to apply plan to Diet tab

import { generateDayPlan } from '../engine/nutritionEngine.js';
import { foodsBundle } from '../brain/diet.data.js';

const ID_BTN = 'genPlanBtn';
const ID_OVL = 'genPlanOverlay';

function ensureButton() {
  if (document.getElementById(ID_BTN)) return;

  const btn = document.createElement('button');
  btn.id = ID_BTN;
  btn.textContent = 'Generate Plan';
  Object.assign(btn.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: 10000,
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '10px',
    border: 'none',
    background: '#0e7fff',
    color: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer'
  });
  btn.addEventListener('click', onGenerateClick);
  document.body.appendChild(btn);
}

function onGenerateClick() {
  const profile = readProfile();
  const req = {
    engine_version: 'v1.0.0',
    data_version: '2025-09-17',
    profile,
    constraints: {
      diet: profile.diet || 'omnivore',
      allergies: profile.allergies || [],
      dislikes: profile.dislikes || [],
      budget_mode: false,
      time_per_meal: '<=20min',
      training_days: profile.training_days || []
    },
    features: { ai_swaps: false, live_prices: false }
  };

  const result = generateDayPlan(req);
  showResultOverlay(result);
}

function readProfile() {
  // 1) Try saved profile (preferred)
  try {
    const saved = JSON.parse(localStorage.getItem('nutrify_profile') || 'null');
    if (saved) {
      const sex = (saved.gender || saved.sex || 'male').toLowerCase();
      const weight_kg = Number(saved.weight_kg ?? saved.weight ?? 71);
      const height_cm = Number(saved.height_cm ?? saved.height ?? 175);
      const age_y = Number(saved.age_y ?? saved.age ?? 23);
      const activity_pal = Number(saved.activity_pal ?? 1.6);
      const goal = (saved.goal || 'maintain').toLowerCase();
      const bodyfat_pct = saved.bodyfat_pct != null ? Number(saved.bodyfat_pct) : null;
      return { sex, age_y, height_cm, weight_kg, bodyfat_pct, activity_pal, goal,
               diet: saved.diet, allergies: saved.allergies, dislikes: saved.dislikes,
               training_days: saved.training_days };
    }
  } catch {}

  // 2) Try DOM fields if on profile page
  const gSel = (id) => document.getElementById(id);
  const genderEl = gSel('p_gender');
  const weightEl = gSel('p_weight_value');
  const heightEl = gSel('p_height_cm');

  const sex = genderEl ? genderEl.value : 'male';
  const weight_kg = weightEl ? Number(weightEl.value || 71) : 71;
  const height_cm = heightEl ? Number(heightEl.value || 175) : 175;

  // 3) Fallback defaults
  return {
    sex,
    age_y: 23,
    height_cm,
    weight_kg,
    bodyfat_pct: 13,
    activity_pal: 1.6,
    goal: 'maintain'
  };
}

function showResultOverlay(result) {
  // create overlay
  let overlay = document.getElementById(ID_OVL);
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = ID_OVL;
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 10001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(960px, 100%)',
    maxHeight: '90vh',
    overflow: 'auto',
    background: 'white',
    borderRadius: '12px',
    padding: '16px'
  });

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';

  const h = document.createElement('h3');
  h.textContent = result.type === 'error' ? 'Plan Error' : 'Generated Day Plan';
  h.style.margin = '0';

  const btns = document.createElement('div');
  btns.style.display = 'flex';
  btns.style.gap = '8px';

  const useToday = document.createElement('button');
  useToday.textContent = 'Use Today';
  Object.assign(useToday.style, { border: 'none', padding: '6px 10px', borderRadius: '8px', background: '#0e7fff', color: '#fff', cursor: 'pointer' });
  useToday.disabled = (result.type === 'error');
  useToday.addEventListener('click', () => {
    if (result.type === 'error') return;
    applyPlan(result, 'day');
    overlay.remove();
  });

  const useWeek = document.createElement('button');
  useWeek.textContent = 'Use All Week';
  Object.assign(useWeek.style, { border: 'none', padding: '6px 10px', borderRadius: '8px', background: '#1a936f', color: '#fff', cursor: 'pointer' });
  useWeek.disabled = (result.type === 'error');
  useWeek.addEventListener('click', () => {
    if (result.type === 'error') return;
    applyPlan(result, 'week');
    overlay.remove();
  });

  const close = document.createElement('button');
  close.textContent = 'Close';
  Object.assign(close.style, { border: 'none', padding: '6px 10px', borderRadius: '8px', background: '#eee', cursor: 'pointer' });
  close.addEventListener('click', () => overlay.remove());

  btns.append(useToday, useWeek, close);
  header.append(h, btns);

  const summary = document.createElement('p');
  summary.textContent = (result.summary || result.message || '').toString();
  summary.style.marginTop = '8px';

  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.fontSize = '12px';
  pre.style.background = '#f6f8fa';
  pre.style.padding = '12px';
  pre.style.borderRadius = '8px';
  pre.textContent = JSON.stringify(result, null, 2);

  panel.append(header, summary, pre);
  overlay.append(panel);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

/* ---------- Apply to Diet (today or whole week) ---------- */

function applyPlan(engineResult, scope /* 'day' | 'week' */) {
  const idToName = Object.fromEntries((foodsBundle.foods || []).map(f => [f.id, f.name]));
  const toLegacyMeals = (meals) => (meals || []).map(m => ({
    meal: capitalize(m.slot || 'Meal'),
    items: (m.items || []).map(it => ({
      food: idToName[it.food_id] || prettyFromId(it.food_id),
      qty: `${Math.round(Number(it.qty_g || 0))} g`
    }))
  }));

  // Init container & load persisted copy if any
  window.mealPlan = window.mealPlan || {};
  try {
    const saved = JSON.parse(localStorage.getItem('nutrify_mealPlan') || 'null');
    if (saved) window.mealPlan = saved;
  } catch {}

  if (scope === 'day') {
    const dayEl = document.getElementById('dayName');
    const dayLabel = dayEl ? dayEl.textContent.trim() : 'Monday';
    window.mealPlan[dayLabel] = toLegacyMeals(engineResult.meals);
  } else {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const legacy = toLegacyMeals(engineResult.meals);
    for (const d of days) window.mealPlan[d] = legacy;
  }

  // Persist + trigger render
  try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(window.mealPlan)); } catch {}
  renderDietOrNudge();
}

/* ------------------- helpers ------------------- */

function renderDietOrNudge() {
  if (typeof window.renderDiet === 'function') {
    window.renderDiet();
  } else {
    location.hash = '#diet';
    setTimeout(() => window.dispatchEvent(new HashChangeEvent('hashchange')), 0);
    window.dispatchEvent(new CustomEvent('nutrify:planUpdated'));
  }
}

function capitalize(s){ return String(s||'').replace(/^\w/, c => c.toUpperCase()); }
function prettyFromId(id){ return String(id||'').replace(/^food_/, '').replace(/_/g,' '); }

/* ---- boot ---- */
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', () => setTimeout(() => ensureButton(), 0))
  : ensureButton();
window.addEventListener('hashchange', ensureButton);