// js/app.js
import { mountDiet, renderDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';

// Simple tab router
const tabButtons = {
  diet: document.getElementById('tabDiet'),
  supps: document.getElementById('tabSupps'),
  hydration: document.getElementById('tabHydration'),
};

const views = {
  diet: document.getElementById('viewDiet'),
  supps: document.getElementById('viewSupps'),
  hydration: document.getElementById('viewHydration'),
};

function show(tab) {
  Object.keys(views).forEach(k => {
    views[k].style.display = (k === tab) ? 'block' : 'none';
    tabButtons[k].classList.toggle('active', k === tab);
  });
  // Re-render current tab if needed
  if (tab === 'diet') renderDiet();
}

function wireTabs() {
  tabButtons.diet.addEventListener('click', () => show('diet'));
  tabButtons.supps.addEventListener('click', () => show('supps'));
  tabButtons.hydration.addEventListener('click', () => show('hydration'));
}

function dataReady() {
  return typeof window.mealPlan === 'object' && Object.keys(window.mealPlan).length > 0;
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  wireTabs();

  // Mount feature modules (idempotent)
  mountDiet();
  mountSupps();
  mountHydration();

  // If data.js hasn’t executed yet, wait a tick before first render
  if (dataReady()) {
    show('diet');           // default tab
  } else {
    setTimeout(() => show('diet'), 0);
  }
});