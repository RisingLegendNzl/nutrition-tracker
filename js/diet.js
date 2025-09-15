// js/diet.js
import { AEST_DATE, loadState, saveState, GOAL_KEY } from "./utils.js";

/* ================= Helpers to compute from DB ================= */
const DB = window.NUTRITION_DB || {};

function parseQty(q) {
  if (!q) return { grams: 0, ml: 0, units: 0 };
  const s = q.toLowerCase().trim();

  let m = s.match(/([\d.]+)\s*g/);
  if (m) return { grams: parseFloat(m[1]), ml: 0, units: 0 };

  m = s.match(/([\d.]+)\s*ml/);
  if (m) return { grams: 0, ml: parseFloat(m[1]), units: 0 };

  // "1 whole" / "1 medium" / "1 can"
  m = s.match(/([\d.]+)\s*(whole|medium|can)/);
  if (m) return { grams: 0, ml: 0, units: parseFloat(m[1]) };

  // "1 can (200 g)"
  m = s.match(/([\d.]+)\s*\(\s*([\d.]+)\s*g\s*\)/);
  if (m) return { grams: parseFloat(m[2]), ml: 0, units: 0 };

  m = s.match(/^[\d.]+$/);
  if (m) return { grams: parseFloat(m[1]), ml: 0, units: 0 };

  return { grams: 0, ml: 0, units: 0 };
}

function lookup(food) {
  const key = (food || "").toLowerCase();
  return DB[key] || null;
}

function nutForItem(item) {
  const rec = lookup(item.food);
  if (!rec) return { k: 0, p: 0, c: 0, f: 0, fib: 0, fe: 0, zn: 0, ca: 0, vC: 0, fol: 0, kplus: 0 };

  const q = parseQty(item.qty);
  let grams = 0;
  if (q.grams) grams = q.grams;
  else if (q.ml) grams = q.ml; // treat ml≈g for milk etc.
  else if (q.units && rec.unit_g) grams = q.units * rec.unit_g;

  const factor = grams / (rec.per || 100);
  const mul = v => (v || 0) * factor;

  return {
    k: mul(rec.k), p: mul(rec.p), c: mul(rec.c), f: mul(rec.f),
    fib: mul(rec.fib), fe: mul(rec.fe), zn: mul(rec.zn), ca: mul(rec.ca),
    vC: mul(rec.vC), fol: mul(rec.fol), kplus: mul(rec.kplus)
  };
}

function sumMeal(meal) {
  return (meal.items || []).reduce((a, it) => {
    const n = nutForItem(it);
    for (const k in a) a[k] += n[k] || 0;
    return a;
  }, { k: 0, p: 0, c: 0, f: 0, fib: 0, fe: 0, zn: 0, ca: 0, vC: 0, fol: 0, kplus: 0 });
}
const rnd = x => Math.round(x);

/* ================= DOM & State ================= */
const mealsEl = document.getElementById("meals");
const barsEl = document.getElementById("bars");
const summaryEl = document.getElementById("macroSummary");
const dayNameEl = document.getElementById("dayName");
const prevBtn = document.getElementById("prevDay");
const nextBtn = document.getElementById("nextDay");

const EATEN_KEY = "diet_eaten";
const DAY_KEY = "diet_day";

/* ================= Mount ================= */
export function mountDiet() {
  prevBtn.onclick = () => changeDay(-1);
  nextBtn.onclick = () => changeDay(+1);
  renderDiet();
}

/* ================= Render Diet ================= */
export function renderDiet() {
  const plan = (window.mealPlan && Object.keys(window.mealPlan).length) ? window.mealPlan : {};
  const dayNames = Object.keys(plan);

  // robust day selection (handles stale localStorage)
  let day = loadState(DAY_KEY);
  if (!day || !plan[day]) {
    const todayName = AEST_DATE().weekdayName;        // e.g. "Monday"
    day = plan[todayName] ? todayName : (dayNames[0] || "Monday");
    saveState(DAY_KEY, day);
  }

  dayNameEl.textContent = day;
  const meals = plan[day] || [];
  const eaten = loadState(EATEN_KEY) || {};
  mealsEl.innerHTML = "";

  if (!meals.length) {
    mealsEl.innerHTML = `<div class="empty-state"><div class="empty-title">No meals found for ${day}.</div><div class="empty-sub">Check that <code>data.js</code> is loaded before <code>diet.js</code> and that the day name matches exactly.</div></div>`;
    barsEl.innerHTML = "";
    summaryEl.innerHTML = "";
    return;
  }

  meals.forEach(m => {
    const totals = sumMeal(m);
    const cid = `${day}:${m.meal}`; // use the meal name as the key
    const checked = !!eaten[cid];

    const card = document.createElement("div");
    card.className = "meal-card";
    card.innerHTML = `
      <details class="meal-details">
        <summary class="meal-summary">
          <div class="meal-title">${m.meal}</div>
          <div class="meal-macros">${rnd(totals.k)} kcal • ${rnd(totals.p)} g protein • ${rnd(totals.fib)} g fibre</div>
          <label class="switch">
            <input type="checkbox" ${checked ? "checked" : ""} data-id="${cid}">
            <span class="slider"></span>
          </label>
        </summary>
        <div class="meal-items">
          ${(m.items || []).map(it => `<div class="meal-item"><span>${it.food}</span><span>${it.qty}</span></div>`).join("")}
        </div>
      </details>
    `;
    card.querySelector('input[type="checkbox"]').onchange = (e) => {
      const map = loadState(EATEN_KEY) || {};
      if (e.target.checked) map[cid] = true; else delete map[cid];
      saveState(EATEN_KEY, map);
      renderDiet();
    };
    mealsEl.appendChild(card);
  });

  // Remaining (uneaten) totals vs goals
  const goals = loadState(GOAL_KEY) || { kcal: 3500, protein: 200, fibre: 30, iron: 8, zinc: 14 };

  const remaining = meals.reduce((a, m) => {
    const cid = `${day}:${m.meal}`;
    if (!eaten[cid]) {
      const t = sumMeal(m);
      a.k += t.k; a.p += t.p; a.fib += t.fib; a.fe += t.fe; a.zn += t.zn;
    }
    return a;
  }, { k: 0, p: 0, fib: 0, fe: 0, zn: 0 });

  summaryEl.innerHTML = `
    <div class="pill">Calories <strong>${rnd(remaining.k)}</strong></div>
    <div class="pill">Protein <strong>${rnd(remaining.p)} g</strong></div>
    <div class="pill">Fibre <strong>${rnd(remaining.fib)} g</strong></div>
  `;

  barsEl.innerHTML = [
    bar("Calories", rnd(remaining.k), goals.kcal, "kcal"),
    bar("Protein", rnd(remaining.p), goals.protein, "g"),
    bar("Fibre", rnd(remaining.fib), goals.fibre, "g"),
    bar("Iron", remaining.fe.toFixed(1), goals.iron, "mg"),
    bar("Zinc", remaining.zn.toFixed(1), goals.zinc, "mg"),
  ].join("");
}

function bar(label, val, goal, unit) {
  const pct = Math.min(100, (Number(val) / Number(goal)) * 100);
  return `
    <div class="bar-row">
      <div class="bar-label">${label}</div>
      <div class="bar-info">${val} ${unit} / ${goal} ${unit}</div>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
    </div>
  `;
}

function changeDay(delta) {
  const names = Object.keys(window.mealPlan || {});
  if (!names.length) return;
  const current = loadState(DAY_KEY) || names[0];
  const idx = names.indexOf(current);
  const next = names[(idx + delta + names.length) % names.length];
  saveState(DAY_KEY, next);
  renderDiet();
}