// filename: js/app.js
import { mountDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';
import { mountProfile, requireComplete as profileComplete, onProfileChange } from './profile.js';

// Tab buttons
const tabButtons = {
  diet:  document.getElementById('tabDiet'),
  supps: document.getElementById('tabSupps'),
  hydro: document.getElementById('tabHydro'),
};

// Views (as defined in index.html)
const views = {
  diet:  document.getElementById('dietPage'),
  supps: document.getElementById('suppsPage'),
  hydro: document.getElementById('hydroPage'),
  // profilePage is created dynamically by profile.js
};

function show(name){
  Object.keys(views).forEach(k => {
    if (views[k]) views[k].classList.toggle('hidden', k !== name);
  });
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

  // Mount Profile first; it will show a first-run gate if no profile is saved.
  mountProfile();

  // Mount feature modules
  mountDiet();
  mountSupps();
  mountHydration();

  // If profile exists, go to Diet by default; otherwise profile module keeps tabs disabled.
  if (profileComplete()) show('diet');

  // If the user completes profile later, keep UX smooth by returning to Diet.
  onProfileChange(() => {
    show('diet');
  });
});