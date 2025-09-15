// filename: js/app.js
import { mountDiet, renderDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';

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
  if (tab === 'diet') safeMountDiet();
}

function wireTabs() {
  tabButtons.diet .addEventListener('click', () => show('diet'));
  tabButtons.supps.addEventListener('click', () => show('supps'));
  tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

/* -------- Robust Diet init (handles slow data.js) -------- */
let dietTimer = null;
let tries = 0;
const MAX_TRIES = 40;   // ~6s total (40 * 150ms)
const INTERVAL  = 150;

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
          // Fallback: attempt anyway (diet.js shows empty state if plan missing)
          mountDiet();
          renderDiet();
        }
      }, INTERVAL);
    }
  } catch (e) {
    console.error('Diet init failed', e);
  }
}

/* ---------------- Mount & start ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  wireTabs();
  // Mount non-dependent modules immediately
  mountSupps();
  mountHydration();
  // Default to Diet and ensure it renders even if data.js lags
  show('diet');
  safeMountDiet();
});

// Extra safety: once everything is loaded, render Diet again
window.addEventListener('load', () => {
  safeMountDiet();
});