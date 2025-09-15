// js/diet.js
import { loadState, saveState, GOAL_KEY } from './utils.js';

const DB = window.NUTRITION_DB || {};

function todayWeekdayAEST(){
  const d = new Date(new Date().toLocaleString('en-US',{ timeZone:'Australia/Brisbane' }));
  return d.toLocaleDateString('en-US',{ weekday:'long' }); // "Monday"
}

function parseQty(q){
  if (!q) return { grams:0, ml:0, units:0 };
  const s = q.toLowerCase().trim();
  let m = s.match(/([\d.]+)\s*g/);  if (m) return { grams: +m[1], ml:0, units:0 };
  m = s.match(/([\d.]+)\s*ml/);     if (m) return { grams: 0, ml:+m[1], units:0 };
  m = s.match(/([\d.]+)\s*(whole|medium|can)/);
  if (m) return { grams:0, ml:0, units:+m[1] };
  m = s.match(/([\d.]+)\s*\(\s*([\d.]+)\s*g\s*\)/);
  if (m) return { grams:+m[2], ml:0, units:0 };
  return { grams:0, ml:0, units:0 };
}

function recFor(food){
  return DB[(food||'').toLowerCase()] || null;
}
function nutForItem(item){
  const rec = recFor(item.food);
  if (!rec) return { k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0 };

  const q = parseQty(item.qty);
  let grams = 0;
  if (q.grams) grams = q.grams;
  else if (q.ml) grams = q.ml;
  else if (q.units && rec.unit_g) grams = q.units * rec.unit_g;

  const factor = grams / (rec.per || 100);
  const mul = v => (v||0) * factor;
  return {
    k:mul(rec.k), p:mul(rec.p), c:mul(rec.c), f:mul(rec.f),
    fib:mul(rec.fib), fe:mul(rec.fe), zn:mul(rec.zn), ca:mul(rec.ca),
    vC:mul(rec.vC), fol:mul(rec.fol), kplus:mul(rec.kplus)
  };
}
function sumMeal(meal){
  return (meal.items||[]).reduce((a,it)=>{
    const n = nutForItem(it);
    for (const k in a) a[k] += n[k]||0;
    return a;
  }, { k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0 });
}
const rnd = x => Math.round(x);

// DOM refs
const mealsEl   = document.getElementById('meals');
const barsEl    = document.getElementById('bars');
const summaryEl = document.getElementById('macroSummary');
const dayNameEl = document.getElementById('dayName');
const prevBtn   = document.getElementById('prevDay');
const nextBtn   = document.getElementById('nextDay');

const EATEN_KEY = 'diet_eaten';
const DAY_KEY   = 'diet_day';

export function mountDiet(){
  prevBtn.onclick = ()=> changeDay(-1);
  nextBtn.onclick = ()=> changeDay(+1);
  renderDiet();
}

export function renderDiet(){
  const plan = (window.mealPlan && Object.keys(window.mealPlan).length) ? window.mealPlan : {};
  const names = Object.keys(plan);
  let day = loadState(DAY_KEY);

  if (!day || !plan[day]){
    const today = todayWeekdayAEST();            // "Monday"
    day = plan[today] ? today : (names[0] || 'Monday');
    saveState(DAY_KEY, day);
  }

  dayNameEl.textContent = day;
  const meals = plan[day] || [];
  const eaten = loadState(EATEN_KEY) || {};
  mealsEl.innerHTML = '';

  if (!meals.length){
    mealsEl.innerHTML = `<div class="empty-state"><div class="empty-title">No meals found for ${day}.</div><div class="empty-sub">Check that <code>data.js</code> is loaded and the day names match.</div></div>`;
    barsEl.innerHTML = ''; summaryEl.innerHTML = '';
    return;
  }

  meals.forEach(m=>{
    const totals = sumMeal(m);
    const cid = `${day}:${m.meal}`;
    const checked = !!eaten[cid];

    const row = document.createElement('div');
    row.className = 'meal-row';
    row.innerHTML = `
      <div class="meal-top">
        <button class="meal-title">
          <div class="title-line"><span class="chev"></span><span>${m.meal}</span></div>
          <div class="meal-macros">${rnd(totals.k)} kcal • ${rnd(totals.p)} g protein • ${rnd(totals.fib)} g fibre</div>
        </button>
        <label class="switch"><input type="checkbox" ${checked?'checked':''} data-id="${cid}"><span class="slider"></span></label>
      </div>
      <div class="ingredients">
        <ul>${(m.items||[]).map(it=>`<li>${it.food} — <span>${it.qty}</span></li>`).join('')}</ul>
      </div>
    `;
    row.querySelector('.meal-title').onclick = ()=> row.classList.toggle('open');
    row.querySelector('input[type="checkbox"]').onchange = (e)=>{
      const map = loadState(EATEN_KEY) || {};
      if (e.target.checked) map[cid] = true; else delete map[cid];
      saveState(EATEN_KEY, map);
      renderDiet();
    };
    mealsEl.appendChild(row);
  });

  // Remaining (uneaten) vs goals
  const goals = loadState(GOAL_KEY) || { kcal:3500, protein:200, fibre:30, iron:8, zinc:14 };
  const remaining = meals.reduce((a,m)=>{
    const cid = `${day}:${m.meal}`;
    if (!eaten[cid]){
      const t = sumMeal(m);
      a.k+=t.k; a.p+=t.p; a.fib+=t.fib; a.fe+=t.fe; a.zn+=t.zn;
    }
    return a;
  }, {k:0,p:0,fib:0,fe:0,zn:0});

  summaryEl.innerHTML = `
    <div class="pill"><span>Calories</span><strong>${rnd(remaining.k)}</strong></div>
    <div class="pill"><span>Protein</span><strong>${rnd(remaining.p)} g</strong></div>
    <div class="pill"><span>Fibre</span><strong>${rnd(remaining.fib)} g</strong></div>
  `;

  barsEl.innerHTML = [
    bar('Calories', rnd(remaining.k), goals.kcal, 'kcal'),
    bar('Protein',  rnd(remaining.p), goals.protein, 'g'),
    bar('Fibre',    rnd(remaining.fib), goals.fibre, 'g'),
    bar('Iron',     remaining.fe.toFixed(1), goals.iron, 'mg'),
    bar('Zinc',     remaining.zn.toFixed(1), goals.zinc, 'mg'),
  ].join('');
}

function bar(label, val, goal, unit){
  const pct = Math.min(100, (Number(val)/Number(goal))*100);
  return `
    <div class="bar-row">
      <div class="bar-label"><span>${label}</span><span class="bar-value">${val} ${unit} / ${goal} ${unit}</span></div>
      <div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div>
    </div>
  `;
}

function changeDay(delta){
  const names = Object.keys(window.mealPlan || {});
  if (!names.length) return;
  const current = loadState(DAY_KEY) || names[0];
  const idx = names.indexOf(current);
  const next = names[(idx + delta + names.length) % names.length];
  saveState(DAY_KEY, next);
  renderDiet();
}