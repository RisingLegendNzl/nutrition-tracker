// filename: js/diet.js  (SYNC PATCH)
// Reads plan from localStorage: 'nutrify_mealPlan'
// Reads targets from localStorage: 'nutrify_targets' (preferred) then 'diet_goal'
// Computes nutrition using foodsBundle (by food_id preferred; name fallback)

import { loadState, saveState } from './utils.js';
import { foodsBundle } from '../brain/diet.data.js';

const PLAN_KEY = 'nutrify_mealPlan';
const TARGETS_KEY = 'nutrify_targets';
const LEGACY_GOAL_KEY = 'diet_goal';

// ---- foods index
const foods = (foodsBundle?.foods)||[];
const portionMaps = (foodsBundle?.portion_maps)||[];
const unitG = Object.fromEntries(portionMaps.map(pm => [pm.food_id, pm.portions?.[0]?.qty_g || null]));
const byId = Object.fromEntries(foods.map(f => [f.id, f]));
const byName = Object.fromEntries(foods.map(f => [String(f.name||'').toLowerCase(), f]));

function todayName(){
  const d = new Date();
  return d.toLocaleDateString('en-AU', { weekday:'long' }); // Monday...
}
function parseQtyStr(s=''){
  s = String(s).toLowerCase().trim();
  let m;
  if ((m = s.match(/([\d.]+)\s*g/)))  return { grams: +m[1] };
  if ((m = s.match(/([\d.]+)\s*ml/))) return { ml: +m[1] };
  if ((m = s.match(/([\d.]+)\s*(whole|can)/))) return { units:+m[1] };
  return { grams: 0 };
}
function gramsFor(qtyStr, fid){
  const q = parseQtyStr(qtyStr);
  if (q.grams) return q.grams;
  if (q.ml) return q.ml; // density≈1 for most liquids we use here
  if (q.units && unitG[fid]) return q.units * unitG[fid];
  return 0;
}
function nutForItem(it){
  const f = (it.food_id && byId[it.food_id]) || byName[String(it.food||'').toLowerCase()];
  if (!f) return { kcal:0, p:0, c:0, fat:0, fib:0, fe:0, zn:0 };
  const n = f.nutrients_per_100g || {};
  const g = gramsFor(it.qty, f.id);
  const k = g/100;
  return {
    kcal: (n.kcal||0)*k,
    p:    (n.protein_g||0)*k,
    c:    (n.carbs_g||0)*k,
    fat:  (n.fat_g||0)*k,
    fib:  (n.fiber_g||0)*k,
    fe:   (n.iron_mg||0)*k,
    zn:   0
  };
}
function sumMeal(items){
  return items.reduce((a,it)=>{
    const t = nutForItem(it);
    a.kcal+=t.kcal; a.p+=t.p; a.c+=t.c; a.fat+=t.fat; a.fib+=t.fib; a.fe+=t.fe; a.zn+=t.zn;
    return a;
  }, { kcal:0, p:0, c:0, fat:0, fib:0, fe:0, zn:0 });
}

function getPlan(){
  try{
    const p = JSON.parse(localStorage.getItem(PLAN_KEY)||'null');
    if (p && typeof p==='object') return p;
  }catch{}
  return window.mealPlan || {};
}
function getTargets(){
  // Preferred
  try{
    const t = JSON.parse(localStorage.getItem(TARGETS_KEY)||'null');
    if (t?.targets) return {
      kcal: t.targets.kcal,
      protein: t.targets.protein_g,
      fibre: t.targets.fiber_g,
      iron: 8, zinc: 14
    };
  }catch{}
  // Legacy
  try{
    const g = JSON.parse(localStorage.getItem(LEGACY_GOAL_KEY)||'null');
    if (g) return g;
  }catch{}
  // Defaults
  return { kcal: 2500, protein: 140, fibre: 30, iron: 8, zinc: 14 };
}

// ---- DOM
const dayNameEl = document.getElementById('dayName');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');
const mealsEl = document.getElementById('meals');
const barsEl = document.getElementById('bars');
const summaryEl = document.getElementById('macroSummary');

const DAY_KEY = 'diet_day';

export function renderDiet(){
  const plan = getPlan();
  const days = Object.keys(plan);
  if (!days.length){
    mealsEl.innerHTML = `<div class="empty-state"><div class="empty-title">No plan found.</div><div class="empty-sub">Generate a plan from Profile.</div></div>`;
    barsEl.innerHTML = '';
    summaryEl.innerHTML = '';
    return;
  }
  let day = loadState(DAY_KEY) || todayName();
  if (!plan[day]) day = days[0];
  saveState(DAY_KEY, day);
  dayNameEl.textContent = day;

  // render meals
  mealsEl.innerHTML = '';
  const dayMeals = plan[day] || [];
  const totals = { kcal:0,p:0,c:0,fat:0,fib:0,fe:0,zn:0 };
  dayMeals.forEach(m=>{
    const items = (m.items||[]).map(it => ({
      ...it,
      // Allow engine shape: qty_g → to "N g"
      qty: typeof it.qty_g==='number' ? `${Math.round(it.qty_g)} g` : (it.qty||'')
    }));
    const t = sumMeal(items);
    for (const k in totals) totals[k]+=t[k]||0;
    const el = document.createElement('div');
    el.className='meal-row';
    el.innerHTML = `
      <div class="meal-top">
        <button class="meal-title"><div class="title-line"><span class="chev"></span><span>${m.meal||m.slot||'Meal'}</span></div>
        <div class="meal-macros">${Math.round(t.kcal)} kcal • ${Math.round(t.p)} g protein • ${Math.round(t.fib)} g fibre</div></button>
      </div>
      <div class="ingredients">
        <ul class="ing-list">${items.map(it=>`<li class="ing"><div class="ing-line"><span class="ing-food">${it.food || byId[it.food_id]?.name || it.food_id}</span><span class="ing-qty">${it.qty}</span></div></li>`).join('')}</ul>
      </div>`;
    el.querySelector('.meal-title').onclick=()=>el.classList.toggle('open');
    mealsEl.appendChild(el);
  });

  // bars + summary
  const g = getTargets();
  barsEl.innerHTML = [
    bar('Calories', Math.round(totals.kcal), g.kcal, 'kcal'),
    bar('Protein',  Math.round(totals.p), g.protein, 'g'),
    bar('Fibre',    Math.round(totals.fib), g.fibre, 'g'),
    bar('Iron',     totals.fe.toFixed(1), g.iron, 'mg'),
    bar('Zinc',     totals.zn.toFixed(1), g.zinc, 'mg')
  ].join('');
  summaryEl.innerHTML = `
    <div class="pill"><span>Calories</span><strong>${Math.round(totals.kcal)}</strong></div>
    <div class="pill"><span>Protein</span><strong>${Math.round(totals.p)} g</strong></div>
    <div class="pill"><span>Fibre</span><strong>${Math.round(totals.fib)} g</strong></div>
  `;
}
function bar(label, val, goal, unit){
  const pct = Math.min(100, (Number(val)/Number(goal))*100);
  return `<div class="bar-row"><div class="bar-label"><span>${label}</span><span class="bar-value">${val} ${unit} / ${goal} ${unit}</span></div><div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div></div>`;
}

export function mountDiet(){
  prevBtn.onclick = ()=>{ /* day cycling optional later */ };
  nextBtn.onclick = ()=>{ /* day cycling optional later */ };
  renderDiet();
}
if (document.body.classList.contains('is-diet')) renderDiet();
window.renderDiet = renderDiet;
