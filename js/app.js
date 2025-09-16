// filename: js/app.js
// js/app.js
import { mountDiet, renderDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';

// IDs that exist in index.html
const tabButtons = {
  diet:  document.getElementById('tabDiet'),
  supps: document.getElementById('tabSupps'),
  hydro: document.getElementById('tabHydro'),
};

const views = {
  diet:  document.getElementById('dietPage'),
  supps: document.getElementById('suppsPage'),
  hydro: document.getElementById('hydroPage'),
};

function show(tab) {
  Object.keys(views).forEach(k => {
    views[k].classList.toggle('hidden', k !== tab);
    tabButtons[k].classList.toggle('active', k === tab);
  });
  if (tab === 'diet') {
    // Fully re-mount Diet whenever user switches to it
    safeMountDiet();
  }
}

function wireTabs() {
  tabButtons.diet .addEventListener('click', () => show('diet'));
  tabButtons.supps.addEventListener('click', () => show('supps'));
  tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

/* ---------------- Robust Diet init (handles slow data.js) ---------------- */
let dietTimer = null;
let tries = 0;
const MAX_TRIES = 40;      // ~6s total
const INTERVAL  = 150;     // ms

function dataReady() {
  const planOK = !!(window.mealPlan && Object.keys(window.mealPlan).length);
  const dbOK   = !!(window.NUTRITION_DB && typeof window.NUTRITION_DB === 'object');
  return planOK && dbOK;
}

function safeMountDiet() {
  try {
    if (dataReady()) {
      mountDiet();
      renderDiet();
      if (dietTimer) { clearInterval(dietTimer); dietTimer = null; }
      return;
    }
    if (!dietTimer) {
      tries = 0;
      dietTimer = setInterval(() => {
        tries++;
        if (dataReady()) {
          clearInterval(dietTimer); dietTimer = null;
          mountDiet();
          renderDiet();
        } else if (tries >= MAX_TRIES) {
          clearInterval(dietTimer); dietTimer = null;
          // Fallback: try anyway (diet.js shows an empty state if plan missing)
          mountDiet();
          renderDiet();
        }
      }, INTERVAL);
    }
  } catch (err) {
    console.error('Diet init failed:', err);
  }
}

/* ---------------- Mount & start ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  wireTabs();

  // Mount non-dependent modules
  mountSupps();
  mountHydration();

  // Default to Diet view and ensure it renders even if data.js lags
  show('diet');
  safeMountDiet();
});

// Extra safety: after all assets load, try again once.
window.addEventListener('load', () => {
  safeMountDiet();
});