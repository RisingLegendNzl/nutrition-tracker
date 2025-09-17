// js/engine.demo.js
// Minimal demo button to call the Nutrition Engine and show the result.
// Safe to remove later.

import { generateDayPlan } from '../engine/nutritionEngine.js';

function ensureButton() {
  if (document.getElementById('genPlanBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'genPlanBtn';
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
  // Try reading a saved profile if you have one (adjust key if your app uses a different one)
  let savedProfile = null;
  try {
    savedProfile = JSON.parse(localStorage.getItem('nutrify_profile') || 'null');
  } catch {}

  const profile = savedProfile || {
    sex: 'male',
    age_y: 23,
    height_cm: 188,
    weight_kg: 71,
    bodyfat_pct: 13,
    activity_pal: 1.6,
    goal: 'maintain'
  };

  const req = {
    engine_version: 'v1.0.0',
    data_version: '2025-09-17',
    profile,
    constraints: {
      diet: 'omnivore',
      allergies: [],
      dislikes: [],
      budget_mode: false,
      time_per_meal: '<=20min',
      training_days: []
    },
    features: { ai_swaps: false, live_prices: false }
  };

  const result = generateDayPlan(req);
  showResultOverlay(result);
}

function showResultOverlay(result) {
  // create overlay
  let overlay = document.getElementById('genPlanOverlay');
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'genPlanOverlay';
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
  const close = document.createElement('button');
  close.textContent = 'Close';
  Object.assign(close.style, { border: 'none', padding: '6px 10px', borderRadius: '8px', background: '#eee', cursor: 'pointer' });
  close.addEventListener('click', () => overlay.remove());
  header.append(h, close);

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

// Ensure button exists after page load and on hash route changes
window.addEventListener('DOMContentLoaded', ensureButton);
window.addEventListener('hashchange', ensureButton);
