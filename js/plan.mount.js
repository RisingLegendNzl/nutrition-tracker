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
window.addEventListener('nutrify:planUpdated', () => setTimeout(tryMount, 0));

// Mount when route changes to ensure persistence
window.addEventListener('route:show', () => setTimeout(tryMount, 0));

// Keep the plan menu persistent if the Diet header is re-rendered dynamically
try {
  const obs = new MutationObserver(() => { tryMount(); });
  obs.observe(document.body, { childList: true, subtree: true });
} catch {}
