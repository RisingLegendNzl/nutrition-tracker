// js/app.js
import { mountDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';
import { mountProfile, requireComplete as profileComplete, onProfileChange } from './profile.js';

// Tab buttons (static in index.html)
const tabButtons = {
  diet:  document.getElementById('tabDiet'),
  supps: document.getElementById('tabSupps'),
  hydro: document.getElementById('tabHydro'),
};

/**
 * Resolve current views on demand so dynamically inserted pages (e.g., #profilePage)
 * are correctly considered. Then hide all <main> elements except the requested one.
 */
function show(name){
  // Resolve commonly-used pages by id (if present)
  const map = {
    diet:   document.getElementById('dietPage'),
    supps:  document.getElementById('suppsPage'),
    hydro:  document.getElementById('hydroPage'),
    profile:document.getElementById('profilePage'),
  };
  const target = map[name] || null;

  // Hide every <main>, show only the target (if any)
  document.querySelectorAll('main').forEach(m => {
    m.classList.toggle('hidden', m !== target);
  });

  // Update tab active state
  Object.keys(tabButtons).forEach(k => {
    if (tabButtons[k]) tabButtons[k].classList.toggle('active', k === name);
  });
}

function wireTabs(){
  if (tabButtons.diet)  tabButtons.diet.addEventListener('click',  () => show('diet'));
  if (tabButtons.supps) tabButtons.supps.addEventListener('click', () => show('supps'));
  if (tabButtons.hydro) tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

document.addEventListener('DOMContentLoaded', () => {
  wireTabs();

  // Mount Profile first; it will add #profilePage dynamically and handle first-run gating.
  mountProfile();

  // Mount feature modules
  mountDiet();
  mountSupps();
  mountHydration();

  // If profile exists, go to Diet by default; otherwise the profile module will show its gate.
  if (profileComplete()) show('diet');

  // After saving/updating profile, snap back to Diet cleanly (and ensure only one page is visible).
  onProfileChange(() => {
    show('diet');
  });
});