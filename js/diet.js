// filename: js/diet.js  (patched to prefer saved plan + nutrify_targets, keep overrides)
// NOTE: Derived from your latest file; only surgical changes applied.

import { loadState, saveState, GOAL_KEY } from './utils.js';
import { foodsBundle, mealPlan } from '../brain/diet.data.js';

/* -------------------- Storage keys -------------------- */
const PLAN_KEY    = 'nutrify_mealPlan';   // new: preferred source of truth
const TARGETS_KEY = 'nutrify_targets';    // new: preferred targets for bars
const DAY_KEY     = 'diet_day';

/* -------------------- Nutrition helpers -------------------- */

// Build a legacy per-100g map keyed by lowercase food name
const _foods = (foodsBundle && foodsBundle.foods) || [];
const _pms   = (foodsBundle && foodsBundle.portion_maps) || [];
const _pmIndex = new Map(_pms.map(pm => [pm.food_id, (pm.portions && pm.portions[0] && pm.portions[0].qty_g) || null]));

function _toLegacy(f){
  const n = (f && f.nutrients_per_100g) || {};
  const rec = {
    per: 100,
    k: n.kcal || 0,
    p: n.protein_g || 0,
    c: n.carbs_g || 0,
    f: n.fat_g || 0,
    fib: n.fiber_g || 0,
    fe: n.iron_mg || 0,
    zn: n.zinc_mg || 0,
    ca: n.calcium_mg || 0,
    vC: 0,
    fol: 0,
    kplus: n.potassium_mg || 0
  };
  const unit = _pmIndex.get(f.id);
  if (unit != null) rec.unit_g = unit;
  return rec;
}

// Index by name (legacy) and by id (new)
const DB_BY_NAME = Object.fromEntries(_foods.map(f => [String(f.name || '').toLowerCase(), _toLegacy(f)]));
const DB_BY_ID   = Object.fromEntries(_foods.map(f => [f.id, _toLegacy(f)]));

function todayWeekdayAEST(){
  const d = new Date(new Date().toLocaleString('en-US',{ timeZone:'Australia/Brisbane' }));
  return d.toLocaleDateString('en-US',{ weekday:'long' }); // "Monday"
}

function parseQty(q){
  if (!q) return { grams:0, ml:0, units:0, unitLabel:'' };
  const s = q.toLowerCase().trim();

  let m = s.match(/([\d.]+)\s*g/);
  if (m) return { grams:+m[1], ml:0, units:0, unitLabel:'g' };

  m = s.match(/([\d.]+)\s*ml/);
  if (m) return { grams:0, ml:+m[1], units:0, unitLabel:'ml' };

  m = s.match(/([\d.]+)\s*(whole|medium|can)/);
  if (m) return { grams:0, ml:0, units:+m[1], unitLabel:m[2] };

  // "1 (200 g)" style not used in plan but kept for safety
  m = s.match(/([\d.]+)\s*\(\s*([\d.]+)\s*g\s*\)/);
  if (m) return { grams:+m[2], ml:0, units:0, unitLabel:'g' };

  // bare number: assume grams
  m = s.match(/^\s*([\d.]+)\s*$/);
  if (m) return { grams:+m[1], ml:0, units:0, unitLabel:'g' };

  return { grams:0, ml:0, units:0, unitLabel:'' };
}

function recForName(food){ return DB_BY_NAME[(food||'').toLowerCase()] || null; }
function recForId(id){ return DB_BY_ID[id] || null; }

function amountToGrams(q, rec){
  if (q.grams) return q.grams;
  if (q.ml)    return q.ml; // treat ml≈g for milk/yogurt/fluids; oil handled as grams in plan
  if (q.units && rec && rec.unit_g) return q.units * rec.unit_g;
  return 0;
}

function nutForItem(item){
  // NEW: prefer food_id mapping, fallback to name (keeps your original behavior)
  const rec = (item.food_id && recForId(item.food_id)) || recForName(item.food);
  if (!rec) return { k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0 };

  // normalise qty if engine gives qty_g
  const qtyStr = (typeof item.qty_g === 'number') ? `${Math.round(item.qty_g)} g` : item.qty;
  const q = parseQty(qtyStr);
  const grams = amountToGrams(q, rec);
  const factor = grams / (rec.per || 100);
  const scale = v => (v || 0) * factor;

  return {
    k:scale(rec.k), p:scale(rec.p), c:scale(rec.c), f:scale(rec.f),
    fib:scale(rec.fib), fe:scale(rec.fe), zn:scale(rec.zn), ca:scale(rec.ca),
    vC:scale(rec.vC), fol:scale(rec.fol), kplus:scale(rec.kplus)
  };
}

function sumMeal(meal){
  return (meal.items||[]).reduce((a,it)=>{
    const n = nutForItem(it);
    for (const k in a) a[k] += n[k] || 0;
    return a;
  }, { k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0 });
}

const rnd = x => Math.round(x);

/* -------------------- Plan/targets helpers (NEW) -------------------- */
function getActivePlan(){
  try{
    const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || 'null');
    if (saved && typeof saved === 'object' && Object.keys(saved).length) return saved;
  } catch {}
  return (mealPlan && typeof mealPlan === 'object') ? mealPlan : {};
}

function readGoalTargets(){
  // 1) Preferred: engine targets saved by generator
  try{
    const t = JSON.parse(localStorage.getItem(TARGETS_KEY) || 'null');
    if (t && t.targets){
      return {
        kcal: Number(t.targets.kcal) || 0,
        protein: Number(t.targets.protein_g) || 0,
        fibre: Number(t.targets.fiber_g) || 0,
        iron: 8,
        zinc: 14
      };
    }
  }catch{}
  // 2) Legacy fallback
  const legacy = loadState(GOAL_KEY);
  if (legacy) return legacy;
  // 3) Defaults
  return { kcal:2500, protein:140, fibre:30, iron:8, zinc:14 };
}

/* -------------------- DOM & state -------------------- */
const mealsEl   = document.getElementById('meals');
const barsEl    = document.getElementById('bars');
const summaryEl = document.getElementById('macroSummary');
const dayNameEl = document.getElementById('dayName');
const prevBtn   = document.getElementById('prevDay');
const nextBtn   = document.getElementById('nextDay');

const EATEN_KEY   = 'diet_eaten';
const QTY_OVR_KEY = 'diet_qty_overrides_v1'; // { [day:meal]: { [foodNameLower]: "120 g" } }

/* -------------------- Overrides helpers -------------------- */
function getOverrides(){
  return loadState(QTY_OVR_KEY) || {};
}
function setOverride(cid, food, qtyStr){
  const all = getOverrides();
  const bucket = all[cid] || {};
  if (qtyStr && qtyStr.trim()){
    bucket[food.toLowerCase()] = qtyStr.trim();
  } else {
    delete bucket[food.toLowerCase()];
  }
  all[cid] = bucket;
  saveState(QTY_OVR_KEY, all);
}
function getEffectiveItems(day, mealName, items){
  const cid = `${day}:${mealName}`;
  const ovr = getOverrides()[cid] || {};
  return (items || []).map(it => {
    const key = (it.food || '').toLowerCase();
    if (ovr[key]){
      return { ...it, qty: ovr[key] };
    }
    return it;
  });
}

/* -------------------- Public API -------------------- */
export function mountDiet(){
  prevBtn.onclick = ()=> changeDay(-1);
  nextBtn.onclick = ()=> changeDay(+1);
  renderDiet();
}

export function renderDiet(){
  // CHANGED: prefer saved plan (localStorage) then bundled plan
  const plan = getActivePlan();
  const names = Object.keys(plan);

  // resolve active day safely
  let day = loadState(DAY_KEY);
  if (!day || !plan[day]){
    const today = todayWeekdayAEST();
    day = plan[today] ? today : (names[0] || 'Monday');
    saveState(DAY_KEY, day);
  }

  dayNameEl.textContent = day;
  const mealsRaw = plan[day] || [];
  const eaten = loadState(EATEN_KEY) || {};

  // clear UI
  mealsEl.innerHTML = '';
  barsEl.innerHTML = '';
  summaryEl.innerHTML = '';

  if (!mealsRaw.length){
    mealsEl.innerHTML = `<div class="empty-state">
      <div class="empty-title">No meals found for ${day}.</div>
      <div class="empty-sub">Generate a plan from your Profile, or ensure <code>brain/diet.data.js</code> is loaded.</div>
    </div>`;
    return;
  }

  // ---------- Render meals with inline ingredient editors ----------
  mealsRaw.forEach(m=>{
    const items = getEffectiveItems(day, m.meal, m.items).map(it => {
      // normalise if engine provided qty_g
      const qty = (typeof it.qty_g === 'number') ? `${Math.round(it.qty_g)} g` : it.qty;
      return { ...it, qty };
    });
    const mealForSum = { ...m, items };
    const totals = sumMeal(mealForSum);
    const cid = `${day}:${m.meal}`;
    const checked = !!eaten[cid];

    const row = document.createElement('div');
    row.className = 'meal-row';
    row.innerHTML = `
      <div class="meal-top">
        <button class="meal-title" type="button">
          <div class="title-line"><span class="chev"></span><span>${m.meal}</span></div>
          <div class="meal-macros">${rnd(totals.k)} kcal • ${rnd(totals.p)} g protein • ${rnd(totals.fib)} g fibre</div>
        </button>
        <label class="switch"><input type="checkbox" ${checked?'checked':''} data-id="${cid}"><span class="slider"></span></label>
      </div>
      <div class="ingredients">
        <ul class="ing-list">
          ${items.map(it=>ingredientRowHTML(day, m.meal, it)).join('')}
        </ul>
      </div>
    `;
    row.querySelector('.meal-title').onclick = ()=> row.classList.toggle('open');
    row.querySelector('input[type="checkbox"]').onchange = (e)=>{
      const map = loadState(EATEN_KEY) || {};
      if (e.target.checked) map[cid] = true; else delete map[cid];
      saveState(EATEN_KEY, map);
      renderDiet(); // recalc remaining from scratch
    };

    // Wire ingredient editors
    row.querySelectorAll('.ing-edit-btn').forEach(btn=>{
      btn.onclick = (ev)=>{
        const li = ev.currentTarget.closest('li');
        li.classList.toggle('edit-open');
        const input = li.querySelector('.ing-input');
        if (input) input.focus();
      };
    });

    row.querySelectorAll('.ing-save').forEach(btn=>{
      btn.onclick = (ev)=>{
        const li = ev.currentTarget.closest('li');
        const food = li.getAttribute('data-food');
        const cidLocal = li.getAttribute('data-cid');
        const amt = li.querySelector('.ing-input').value.trim();
        const unit = li.querySelector('.ing-unit').value;
        const qtyStr = amt ? `${amt} ${unit}` : '';
        setOverride(cidLocal, food, qtyStr);
        renderDiet();
      };
    });

    row.querySelectorAll('.ing-reset').forEach(btn=>{
      btn.onclick = (ev)=>{
        const li = ev.currentTarget.closest('li');
        const food = li.getAttribute('data-food');
        const cidLocal = li.getAttribute('data-cid');
        setOverride(cidLocal, food, '');
        renderDiet();
      };
    });

    mealsEl.appendChild(row);
  });

  // ---------- Compute Remaining (single pass, uneaten only) ----------
  // CHANGED: use nutrify_targets (preferred), fallback to legacy
  const goals = readGoalTargets();

  const remaining = mealsRaw.reduce((a,m)=>{
    const cid = `${day}:${m.meal}`;
    if (!eaten[cid]) {
      const effItems = getEffectiveItems(day, m.meal, m.items).map(it => {
        const qty = (typeof it.qty_g === 'number') ? `${Math.round(it.qty_g)} g` : it.qty;
        return { ...it, qty };
      });
      const t = sumMeal({ ...m, items: effItems });
      a.k   += t.k;
      a.p   += t.p;
      a.fib += t.fib;
      a.fe  += t.fe;
      a.zn  += t.zn;
    }
    return a;
  }, { k:0, p:0, fib:0, fe:0, zn:0 });

  summaryEl.innerHTML = `
    <div class="pill"><span>Calories</span><strong>${rnd(remaining.k)}</strong></div>
    <div class="pill"><span>Protein</span><strong>${rnd(remaining.p)} g</strong></div>
    <div class="pill"><span>Fibre</span><strong>${rnd(remaining.fib)} g</strong></div>
  `;

  barsEl.innerHTML = [
    bar('Calories', rnd(remaining.k), goals.kcal, 'kcal'),
    bar('Protein',  rnd(remaining.p), goals.protein, 'g'),
    bar('Fibre',    rnd(remaining.fib), goals.fibre, 'g'),
    bar('Iron',     remaining.fe.toFixed(1),  goals.iron, 'mg'),
    bar('Zinc',     remaining.zn.toFixed(1),  goals.zinc, 'mg'),
  ].join('');
}

/* -------------------- UI helpers -------------------- */
function ingredientRowHTML(day, mealName, it){
  const cid = `${day}:${mealName}`;
  const foodKey = (it.food || '').toLowerCase();

  // Prefill numeric amount + unit selector from it.qty
  const q = parseQty(it.qty);
  let amt = q.grams || q.ml || q.units || '';
  let unit = q.unitLabel || (q.ml ? 'ml' : 'g');

  // allowed units: g, ml, whole
  const unitOptions = ['g','ml','whole'];
  if (unit && !unitOptions.includes(unit)) unitOptions.unshift(unit);

  return `
    <li class="ing" data-food="${foodKey}" data-cid="${cid}">
      <div class="ing-line">
        <span class="ing-food">${it.food}</span>
        <span class="ing-qty">${it.qty}</span>
        <button class="ing-edit-btn" type="button" aria-label="Edit amount">Edit</button>
      </div>
      <div class="ing-editor">
        <div class="ing-editor-row">
          <input class="ing-input" type="number" min="0" step="1" value="${amt}" inputmode="decimal">
          <select class="ing-unit">
            ${unitOptions.map(u=>`<option value="${u}" ${u===unit?'selected':''}>${u}</option>`).join('')}
          </select>
          <button class="ing-save" type="button">Save</button>
          <button class="ing-reset" type="button">Reset</button>
        </div>
        <!-- Tip removed by request -->
      </div>
    </li>
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
  // CHANGED: use active plan (may be saved or bundled)
  const names = Object.keys(getActivePlan() || {});
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

window.addEventListener('route:show', (e)=>{
  if (e.detail?.page === 'diet') _rerenderDiet();
});

// Optional: render immediately if user lands on Diet first
if (document.body.classList.contains('is-diet')) _rerenderDiet();