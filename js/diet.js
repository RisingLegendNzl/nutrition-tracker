// filename: js/diet.js
// Diet tab renderer: reads/writes window.mealPlan, persists to localStorage, and exposes renderDiet().

import { loadState, saveState, GOAL_KEY, showSnack } from './utils.js';
import { foodsBundle } from '../brain/diet.data.js';

const STORAGE_KEY = 'nutrify_mealPlan';

// ------- ensure a mutable global mealPlan that Profile can overwrite -------
(function ensureMealPlan(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      window.mealPlan = saved;
      return;
    }
  } catch {}
  if (!window.mealPlan) {
    window.mealPlan = {
      Monday: [
        { meal: 'Breakfast', items: [{ food: 'Oats (example)', qty: '80 g' }] }
      ]
    };
  }
})();

// Optional: helper to persist current window.mealPlan (used by other features)
export function saveCurrentPlan(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(window.mealPlan)); } catch {}
}

// ------- rendering helpers -------
function el(tag, cls){ const n = document.createElement(tag); if(cls) n.className = cls; return n; }
function fmtItem(it){ return `${it.food} — ${it.qty}`; }
function daysOrder(){ return ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']; }

// ------- main render -------
export function renderDiet(){
  const host = document.getElementById('dietPage') || document.querySelector('[data-page="diet"]') || document.body;
  let container = document.getElementById('dietList');
  if (!container){ container = el('div'); container.id = 'dietList'; host.appendChild(container); }

  const plan = (window.mealPlan && typeof window.mealPlan === 'object') ? window.mealPlan : {};
  const days = daysOrder();

  const frag = document.createDocumentFragment();

  days.forEach(day => {
    const card = el('section','card');
    const h = el('h3');
    h.textContent = day;
    card.appendChild(h);

    const meals = plan[day] || [];
    if (!meals.length){
      const p = el('p','muted');
      p.textContent = 'No items';
      card.appendChild(p);
    } else {
      meals.forEach(m => {
        const row = el('div','meal-row');
        const title = el('div','meal-name');
        title.textContent = m.meal || 'Meal';
        const ul = el('ul','meal-items');
        (m.items || []).forEach(it => {
          const li = el('li');
          li.textContent = fmtItem(it);
          ul.appendChild(li);
        });
        row.appendChild(title);
        row.appendChild(ul);
        card.appendChild(row);
      });
    }

    frag.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

// expose for Profile → onGenerateFromProfile()
window.renderDiet = renderDiet;

// initial paint
renderDiet();

// ------- (optional) small API others may use -------
export function getDietPlan(){ return window.mealPlan; }
export function setDietPlan(newPlan){
  window.mealPlan = newPlan || {};
  saveCurrentPlan();
  renderDiet();
  showSnack?.('Diet updated');
}