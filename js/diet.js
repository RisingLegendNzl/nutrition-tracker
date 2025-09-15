import { AEST_DATE, loadState, saveState, GOAL_KEY } from "./utils.js";

/* ---------- Helpers to compute nutrients from DB ---------- */
const DB = window.NUTRITION_DB || {};

function parseQty(q){
  if (!q) return { grams:0, ml:0, units:0 };
  const s = q.toLowerCase().trim();

  // numeric with g/ml
  let m = s.match(/([\d.]+)\s*g/);
  if (m) return { grams: parseFloat(m[1]), ml:0, units:0 };

  m = s.match(/([\d.]+)\s*ml/);
  if (m) return { grams:0, ml: parseFloat(m[1]), units:0 };

  // "1 whole" / "1 medium" / "1 can (200 g)"
  m = s.match(/([\d.]+)\s*(whole|medium|can)/);
  if (m) return { grams:0, ml:0, units: parseFloat(m[1]) };

  // fallback number only
  m = s.match(/^[\d.]+$/);
  if (m) return { grams: parseFloat(m[1]), ml:0, units:0 };

  // "1 can (200 g)" -> extract inner g
  m = s.match(/([\d.]+)\s*\(\s*([\d.]+)\s*g\s*\)/);
  if (m) return { grams: parseFloat(m[2]), ml:0, units:0 };

  return { grams:0, ml:0, units:0 };
}

function lookup(food){
  const key = (food||"").toLowerCase();
  return DB[key] || null;
}

function nutForItem(item){
  const rec = lookup(item.food);
  if (!rec) return { k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0 };

  const q = parseQty(item.qty);
  // decide grams to use:
  let grams = 0;
  if (q.grams) grams = q.grams;
  else if (q.ml)  grams = q.ml; // treat ml ~ g for water-rich foods (milk)
  else if (q.units && rec.unit_g) grams = q.units * rec.unit_g;
  else grams = 0;

  const factor = grams / (rec.per || 100);
  const mul = (v)=> (v||0) * factor;

  return {
    k:   mul(rec.k),   p:  mul(rec.p),  c:  mul(rec.c),  f:  mul(rec.f),
    fib: mul(rec.fib), fe: mul(rec.fe), zn: mul(rec.zn), ca: mul(rec.ca),
    vC:  mul(rec.vC),  fol:mul(rec.fol),kplus:mul(rec.kplus)
  };
}

function sumMeal(meal){
  return (meal.items||[]).reduce((acc,it)=>{
    const n = nutForItem(it);
    Object.keys(acc).forEach(k=> acc[k]+= (n[k]||0));
    return acc;
  }, {k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0});
}
function fmt(x){ return Math.round(x); }

/* ---------- State ---------- */
const mealsEl = document.getElementById("meals");
const barsEl  = document.getElementById("bars");
const summaryEl = document.getElementById("macroSummary");
const dayNameEl = document.getElementById("dayName");
const prevBtn = document.getElementById("prevDay");
const nextBtn = document.getElementById("nextDay");

const EATEN_KEY = "diet_eaten";
const DAY_KEY = "diet_day";

/* ---------- Render ---------- */
export function mountDiet(){
  prevBtn.onclick = ()=> changeDay(-1);
  nextBtn.onclick = ()=> changeDay(+1);
  renderDiet();
}

export function renderDiet(){
  const plan = window.mealPlan || {};
  const day = loadState(DAY_KEY) || AEST_DATE().weekdayName;
  const meals = plan[day] || [];
  dayNameEl.textContent = day;

  const eaten = loadState(EATEN_KEY) || {};
  mealsEl.innerHTML = "";

  // build cards
  meals.forEach((m,i)=>{
    const totals = sumMeal(m);
    const cid = `${day}:${m.meal}`; // use name as key, not index
    const checked = !!eaten[cid];

    const card = document.createElement("div");
    card.className = "meal-card";

    card.innerHTML = `
      <details class="meal-details">
        <summary class="meal-summary">
          <div class="meal-title">${m.meal}</div>
          <div class="meal-macros">
            ${fmt(totals.k)} kcal • ${fmt(totals.p)} g protein • ${fmt(totals.fib)} g fibre
          </div>
          <label class="switch">
            <input type="checkbox" ${checked?'checked':''} data-id="${cid}">
            <span class="slider"></span>
          </label>
        </summary>
        <div class="meal-items">
          ${(m.items||[]).map(it => `
            <div class="meal-item"><span>${it.food}</span><span>${it.qty}</span></div>
          `).join("")}
        </div>
      </details>
    `;
    // toggle handler
    card.querySelector('input[type="checkbox"]').onchange = (e)=>{
      const now = loadState(EATEN_KEY) || {};
      if (e.target.checked) now[cid]=true; else delete now[cid];
      saveState(EATEN_KEY, now);
      renderDiet(); // re-compute totals
    };

    mealsEl.appendChild(card);
  });

  // compute remaining totals based on uneaten meals
  const goals = loadState(GOAL_KEY) || { kcal:3500, protein:200, fibre:30, iron:8, zinc:14 };
  const dayTotals = meals.reduce((acc,m)=>{
    const cid = `${day}:${m.meal}`;
    const taken = !!eaten[cid];
    if (!taken){
      const t = sumMeal(m);
      acc.k   += t.k;   acc.p   += t.p;   acc.fib += t.fib;
      acc.fe  += t.fe;  acc.zn  += t.zn;  acc.ca  += t.ca;
      acc.vC  += t.vC;  acc.fol += t.fol; acc.kplus += t.kplus;
    }
    return acc;
  }, {k:0,p:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0});

  summaryEl.innerHTML = `
    <div class="pill">Calories <strong>${fmt(dayTotals.k)}</strong></div>
    <div class="pill">Protein <strong>${fmt(dayTotals.p)} g</strong></div>
    <div class="pill">Fibre <strong>${fmt(dayTotals.fib)} g</strong></div>
  `;

  barsEl.innerHTML = `
    ${bar("Calories", fmt(dayTotals.k), goals.kcal, "kcal")}
    ${bar("Protein", fmt(dayTotals.p), goals.protein, "g")}
    ${bar("Fibre",   fmt(dayTotals.fib), goals.fibre, "g")}
    ${bar("Iron",    (dayTotals.fe).toFixed(1), goals.iron, "mg")}
    ${bar("Zinc",    (dayTotals.zn).toFixed(1), goals.zinc, "mg")}
  `;
}

function bar(label, val, goal, unit){
  const pct = Math.min(100, (val/goal)*100);
  return `
    <div class="bar-row">
      <div class="bar-label">${label}</div>
      <div class="bar-info">${val} ${unit} / ${goal} ${unit}</div>
      <div class="bar">
        <div class="bar-fill" style="width:${pct}%"></div>
      </div>
    </div>
  `;
}

function changeDay(delta){
  const names = Object.keys(window.mealPlan||{});
  const current = (loadState(DAY_KEY) || names[0]);
  const idx = Math.max(0, names.indexOf(current));
  const next = names[(idx + delta + names.length) % names.length];
  saveState(DAY_KEY, next);
  renderDiet();
}