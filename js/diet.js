// js/diet.js — full replacement (targets from nutrify_targets; plan from nutrify_mealPlan)

import { loadState, saveState } from './utils.js';
import { foodsBundle } from '../brain/diet.data.js';

// ----------------------------
// Storage keys & constants
// ----------------------------
const PLAN_KEY = 'nutrify_mealPlan';
const TARGETS_KEY = 'nutrify_targets';   // new, engine-owned
const GOAL_KEY = 'diet_goal';            // legacy fallback for bars
const DAY_KEY = 'diet_day';

// ----------------------------
// Food indexes (by id + name)
// ----------------------------
const foods = Array.isArray(foodsBundle?.foods) ? foodsBundle.foods : [];
const portionMaps = Array.isArray(foodsBundle?.portion_maps) ? foodsBundle.portion_maps : [];

const byId = Object.fromEntries(foods.map(f => [f.id, f]));
const byName = Object.fromEntries(
  foods.map(f => [String(f.name || '').toLowerCase(), f])
);

// default grams per “unit” for foods that have a portion map
const unitGrams = Object.fromEntries(
  portionMaps.map(pm => [pm.food_id, (pm.portions?.[0]?.qty_g) ?? null])
);

// ----------------------------
// Helpers
// ----------------------------
function todayName() {
  return new Date().toLocaleDateString('en-AU', { weekday: 'long' });
}

function parseQtyStr(s = '') {
  s = String(s).trim().toLowerCase();
  let m;
  if ((m = s.match(/^\s*([\d.]+)\s*g\b/))) return { grams: +m[1] };
  if ((m = s.match(/^\s*([\d.]+)\s*ml\b/))) return { ml: +m[1] };
  if ((m = s.match(/^\s*([\d.]+)\s*(?:unit|can|whole)\b/))) return { units: +m[1] };
  // If string is just a number, assume grams
  if ((m = s.match(/^\s*([\d.]+)\s*$/))) return { grams: +m[1] };
  return { grams: 0 };
}

function gramsFor(qtyStr, foodId) {
  const q = parseQtyStr(qtyStr);
  if (q.grams) return q.grams;
  if (q.ml) return q.ml; // density≈1 for common liquids we use
  if (q.units && unitGrams[foodId]) return q.units * unitGrams[foodId];
  return 0;
}

function nutForItem(it) {
  const f =
    (it.food_id && byId[it.food_id]) ||
    byName[String(it.food || '').toLowerCase()];
  if (!f) return { kcal: 0, p: 0, c: 0, fat: 0, fib: 0, fe: 0, zn: 0 };

  const n = f.nutrients_per_100g || {};
  const qtyStr =
    typeof it.qty_g === 'number' ? `${Math.round(it.qty_g)} g` : (it.qty || '');
  const g = gramsFor(qtyStr, f.id);
  const k = g / 100;

  return {
    kcal: (n.kcal || 0) * k,
    p: (n.protein_g || 0) * k,
    c: (n.carbs_g || 0) * k,
    fat: (n.fat_g || 0) * k,
    fib: (n.fiber_g || 0) * k,
    fe: (n.iron_mg || 0) * k,
    zn: (n.zinc_mg || 0) * k
  };
}

function sumMeal(items) {
  return items.reduce(
    (a, it) => {
      const t = nutForItem(it);
      a.kcal += t.kcal;
      a.p += t.p;
      a.c += t.c;
      a.fat += t.fat;
      a.fib += t.fib;
      a.fe += t.fe;
      a.zn += t.zn;
      return a;
    },
    { kcal: 0, p: 0, c: 0, fat: 0, fib: 0, fe: 0, zn: 0 }
  );
}

function getPlan() {
  try {
    const p = JSON.parse(localStorage.getItem(PLAN_KEY) || 'null');
    if (p && typeof p === 'object') return p;
  } catch {}
  // in-memory fallback, used right after generation
  return window.mealPlan || {};
}

function readGoalTargets() {
  // 1) Preferred: engine targets
  try {
    const t = JSON.parse(localStorage.getItem(TARGETS_KEY) || 'null');
    if (t && t.targets) {
      return {
        kcal: Number(t.targets.kcal) || 0,
        protein: Number(t.targets.protein_g) || 0,
        fibre: Number(t.targets.fiber_g) || 0,
        iron: 8,
        zinc: 14
      };
    }
  } catch {}
  // 2) Legacy: whatever your app used to store
  const legacy = loadState(GOAL_KEY);
  if (legacy) return legacy;
  // 3) Sensible fallback
  return { kcal: 2500, protein: 140, fibre: 30, iron: 8, zinc: 14 };
}

// ----------------------------
// DOM refs
// ----------------------------
const dayNameEl = document.getElementById('dayName');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');
const mealsEl = document.getElementById('meals');
const barsEl = document.getElementById('bars');
const summaryEl = document.getElementById('macroSummary');

// ----------------------------
// Rendering
// ----------------------------
function bar(label, val, goal, unit) {
  const numVal = Number(val) || 0;
  const numGoal = Math.max(1, Number(goal) || 1);
  const pct = Math.min(100, (numVal / numGoal) * 100);
  return `
    <div class="bar-row">
      <div class="bar-label">
        <span>${label}</span>
        <span class="bar-value">${numVal} ${unit} / ${numGoal} ${unit}</span>
      </div>
      <div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div>
    </div>`;
}

export function renderDiet() {
  const plan = getPlan();
  const days = Object.keys(plan);

  if (!days.length) {
    mealsEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-title">No plan found</div>
        <div class="empty-sub">Generate a plan from your Profile.</div>
      </div>`;
    barsEl.innerHTML = '';
    summaryEl.innerHTML = '';
    return;
  }

  let day = loadState(DAY_KEY) || todayName();
  if (!plan[day]) day = days[0];
  saveState(DAY_KEY, day);
  if (dayNameEl) dayNameEl.textContent = day;

  // Render meals
  mealsEl.innerHTML = '';
  const dayMeals = plan[day] || [];
  const totals = { kcal: 0, p: 0, c: 0, fat: 0, fib: 0, fe: 0, zn: 0 };

  dayMeals.forEach((m) => {
    // Normalise items: support either {food_id, qty_g} or {food, qty}
    const items = (m.items || []).map((it) => ({
      ...it,
      qty:
        typeof it.qty_g === 'number'
          ? `${Math.round(it.qty_g)} g`
          : (it.qty || '')
    }));

    const t = sumMeal(items);
    for (const k in totals) totals[k] += t[k] || 0;

    const html = `
      <div class="meal-row">
        <div class="meal-top">
          <button class="meal-title">
            <div class="title-line">
              <span class="chev"></span>
              <span>${m.meal || m.slot || 'Meal'}</span>
            </div>
            <div class="meal-macros">
              ${Math.round(t.kcal)} kcal • ${Math.round(t.p)} g protein • ${Math.round(t.fib)} g fibre
            </div>
          </button>
        </div>
        <div class="ingredients">
          <ul class="ing-list">
            ${items
              .map((it) => {
                const name =
                  it.food ||
                  byId[it.food_id]?.name ||
                  (it.food_id ? String(it.food_id) : '');
                return `<li class="ing">
                          <div class="ing-line">
                            <span class="ing-food">${name}</span>
                            <span class="ing-qty">${it.qty || ''}</span>
                          </div>
                        </li>`;
              })
              .join('')}
          </ul>
        </div>
      </div>`;

    const el = document.createElement('div');
    el.innerHTML = html.trim();
    const row = el.firstElementChild;
    row.querySelector('.meal-title').onclick = () => row.classList.toggle('open');
    mealsEl.appendChild(row);
  });

  // Bars + summary from engine targets (preferred)
  const g = readGoalTargets();
  barsEl.innerHTML =
    bar('Calories', Math.round(totals.kcal), g.kcal, 'kcal') +
    bar('Protein', Math.round(totals.p), g.protein, 'g') +
    bar('Fibre', Math.round(totals.fib), g.fibre, 'g') +
    bar('Iron', totals.fe.toFixed(1), g.iron, 'mg') +
    bar('Zinc', totals.zn.toFixed(1), g.zinc, 'mg');

  summaryEl.innerHTML = `
    <div class="pill"><span>Calories</span><strong>${Math.round(
      totals.kcal
    )}</strong></div>
    <div class="pill"><span>Protein</span><strong>${Math.round(
      totals.p
    )} g</strong></div>
    <div class="pill"><span>Fibre</span><strong>${Math.round(
      totals.fib
    )} g</strong></div>`;
}

// Optional day cycling (enable later if you want)
function onPrev() {}
function onNext() {}

export function mountDiet() {
  if (prevBtn) prevBtn.onclick = onPrev;
  if (nextBtn) nextBtn.onclick = onNext;
  renderDiet();
}

// Auto-render if this screen is active
if (document.body.classList.contains('is-diet')) {
  renderDiet();
}

// Also expose for profile → generate flow
window.renderDiet = renderDiet;