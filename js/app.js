// js/app.js
import { mountDiet, renderDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';

// IDs that actually exist in index.html
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
  if (tab === 'diet') renderDiet();
}

function wireTabs() {
  tabButtons.diet.addEventListener('click', () => show('diet'));
  tabButtons.supps.addEventListener('click', () => show('supps'));
  tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

document.addEventListener('DOMContentLoaded', () => {
  wireTabs();
  // Mount feature modules
  mountDiet();
  mountSupps();
  mountHydration();
  // Default to Diet
  show('diet');
});