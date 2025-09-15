// filename: js/app.js
// js/app.js
import { mountDiet, renderDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';

// IDs that exist in index.html
const tabButtons = {
  diet: document.getElementById('tabDiet'),
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
    // Always re-render when viewing Diet
    safeRenderDiet();
  }
}

function wireTabs() {
  tabButtons.diet.addEventListener('click', () => show('diet'));
  tabButtons.supps.addEventListener('click', () => show('supps'));
  tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

/* ---------------- Robust init for Diet ---------------- */
let dietRenderTimer = null;
let dietTries = 0;
const MAX_TRIES = 40;     // ~6s total (40 * 150ms)
const TRY_EVERY = 150;

function dataReady() {
  // mealPlan must exist and have at least one day; DB should be an object
  const planOK = !!(window.mealPlan && Object.keys(window.mealPlan).length);
  const dbOK   = !!(window.NUTRITION_DB && typeof window.NUTRITION_DB === 'object');
  return planOK && dbOK;
}

function safeRenderDiet() {
  try {
    if (dataReady()) {
      renderDiet();
      // If we got here from the retry loop, stop it.
      if (dietRenderTimer) {
        clearInterval(dietRenderTimer);
        dietRenderTimer = null;
      }
      return;
    }
    // If data not ready and no loop running, start a short retry loop.
    if (!dietRenderTimer) {
      dietTries = 0;
      dietRenderTimer = setInterval(() => {
        dietTries++;
        if (dataReady()) {
          clearInterval(dietRenderTimer);
          dietRenderTimer = null;
          renderDiet();
        } else if (dietTries >= MAX_TRIES) {
          clearInterval(dietRenderTimer);
          dietRenderTimer = null;
          // Fall back: render once; diet.js shows an empty-state hint if plan is missing.
          renderDiet();
        }
      }, TRY_EVERY);
    }
  } catch {
    // Swallow errors to avoid blocking the rest of the app; diet.js has its own guards.
  }
}

/* ---------------- Mount & start ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  wireTabs();

  // Mount feature modules
  mountDiet();
  mountSupps();
  mountHydration();

  // Default to Diet and ensure it renders even if data.js lags
  show('diet');
  safeRenderDiet();
});

// Extra safety: after all assets load, try one last time.
window.addEventListener('load', () => {
  safeRenderDiet();
});