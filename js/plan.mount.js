// js/plan.mount.js
// Mounts the plan menu onto the Diet header when the Diet page is visible.

import { attachPlanMenu } from './plan.io.js';

function tryMount() {
  const diet = document.getElementById('dietPage');
  if (!diet || diet.classList.contains('hidden')) return;
  const header = diet.querySelector('.day-switcher') || diet.querySelector('.card');
  if (header) attachPlanMenu(header);
}

window.addEventListener('DOMContentLoaded', () => setTimeout(tryMount, 0));
window.addEventListener('hashchange', () => setTimeout(tryMount, 0));
document.addEventListener('nutrify:planUpdated', () => setTimeout(tryMount, 0));
