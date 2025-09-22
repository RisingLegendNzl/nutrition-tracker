import { loadState, saveState, GOAL_KEY } from './utils.js';
import { getProfile, onProfileChange } from './profile.js';
import { getPlan, setPlan } from './storage.js';
import { foodsBundle, mealPlan as fallbackPlan } from '../brain/diet.data.js';

/* ---- Adapter: allow engine-shaped meals to render in legacy UI ---- */
function adaptPlanToDisplayShape(planObject) {
  const plan = planObject?.plan || planObject;
  const idToName = Object.fromEntries((foodsBundle?.foods || []).map(f => [f.id, f.name]));
  const toItems = (items = []) => items.map(it => {
    // If already in display shape, just return it
    if ('food' in it && 'qty' in it) {
      return it;
    }
    // Otherwise, convert from engine shape
    return {
      food_id: it.food_id,
      food: idToName[it.food_id] || String(it.food_id || '').replace(/^food_/, '').replace(/_/g, ' '),
      qty: `${Math.round(Number(it.qty_g || 0))} g`
    };
  });

  const adaptedPlan = {};
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (const day of days) {
    let dayMeals = plan[day] || [];

    // BUG C: Reverse Saturday meals
    if (day === 'Saturday') {
      console.log('BUG C: Reversing Saturday meals for testing.');
      dayMeals = [...dayMeals].reverse();
    }

    adaptedPlan[day] = (dayMeals || []).map(m => {
      const isEngineShape = m.slot && m.items;
      const mealName = isEngineShape
        ? (m.slot || 'Meal').replace(/^[a-z]/, c => c.toUpperCase())
        : (m.meal || 'Meal');

      // BUG A: Thursday breakfast label lowercase
      if (day === 'Thursday' && mealName.toLowerCase().includes('breakfast')) {
        console.log('BUG A: Lowercasing Thursday breakfast label for testing.');
        return { meal: 'breakfast', items: toItems(m.items || m.items) };
      }

      return {
        meal: mealName,
        items: toItems(isEngineShape ? m.items : m.items)
      };
    });
  }
  return { plan: adaptedPlan, meta: { type: 'diet_shape', passthrough: false } };
}


/* -------------------- Nutrition Goal Panel -------------------- */
function getDietGoals(){
  return loadState(GOAL_KEY);
}

// -------------------- Core Render --------------------
let DAY_KEY = 'diet_day_v1';
function renderDiet(){
  const container = document.getElementById('dietContent');
  const dayNameEl = document.getElementById('dayName');
  if (!container || !dayNameEl) return;

  const currentPlan = getPlan() || fallbackPlan;
  setPlan(currentPlan); // Persist fallback plan if not already present
  
  const { plan: displayPlan } = adaptPlanToDisplayShape(currentPlan);
  const days = Object.keys(displayPlan);
  if (!days.length) {
    container.innerHTML = '<div class="alert warn">No meal plan available.</div>';
    dayNameEl.textContent = '—';
    return;
  }

  const currentDay = loadState(DAY_KEY) || days[0];
  const todayMeals = displayPlan[currentDay] || [];

  dayNameEl.textContent = currentDay;
  container.innerHTML = todayMeals.map(renderMeal).join('');

  const nav = document.getElementById('day-switcher');
  if (nav){ nav.style.display = days.length > 1 ? '' : 'none'; }
}


/* -------------------- DOM Renderers -------------------- */
function renderMeal(mealObj){
  const itemsHtml = (mealObj.items || [])
    .map(it => `
      <li class="item">
        <span class="qty">${it.qty}</span>
        <span class="food">${it.food}</span>
      </li>
    `).join('');

  return `
    <div class="meal-card">
      <div class="meal-header">${mealObj.meal}</div>
      <ul class="meal-items">${itemsHtml}</ul>
    </div>
  `;
}
function bar(label, val, goal, unit){
  const pct = Math.min(100, (Number(val) / Number(goal)) * 100);
  return `
    <div class="bar-row">
      <div class="bar-label">
        <span>${label}</span>
        <span class="bar-value">${val} ${unit} / ${goal} ${unit}</span>
      </div>
      <div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div>
    </div>
  `;
}

function changeDay(delta){
  const names = Object.keys(getPlan() || fallbackPlan);
  if (!names.length) return;
  const current = loadState(DAY_KEY) || names[0];
  const next = names[(names.indexOf(current) + delta + names.length) % names.length];
  saveState(DAY_KEY, next);
  renderDiet();
}

// --- Router hookup: Diet ---
function _rerenderDiet(){
  if (typeof mountDiet === 'function') return mountDiet();
  if (typeof renderDiet === 'function') return renderDiet();
  if (typeof initDiet === 'function')   return initDiet();
  // If you use a namespaced API, expose it here:
  if (typeof Diet?.render === 'function') return Diet.render();
  if (typeof Diet?.mount  === 'function') return Diet.mount();
}

window.addEventListener('route:show', (e)=> {
  if (e.detail?.page === 'diet') _rerenderDiet();
});

// Optional init hook
export function initDiet() {
  document.getElementById('prevDayBtn')?.addEventListener('click', () => changeDay(-1));
  document.getElementById('nextDayBtn')?.addEventListener('click', () => changeDay(1));
  // Initial render when the module loads
  renderDiet();
}