// filename: js/diet.js
import { loadState, saveState, GOAL_KEY } from './utils.js';

/* -------------------- Nutrition helpers -------------------- */
const DB = window.NUTRITION_DB || {};

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

  return { grams:0, ml:0, units:0, unitLabel:'' };
}

function recFor(food){ return DB[(food||'').toLowerCase()] || null; }

function amountToGrams(q, rec){
  if (q.grams) return q.grams;
  if (q.ml)    return q.ml; // treat ml≈g for milk/yogurt/fluids; oil handled as grams in plan
  if (q.units && rec && rec.unit_g) return q.units * rec.unit_g;
  return 0;
}

function nutForItem(item){
  const rec = recFor(item.food);
  if (!rec) return { k:0,p:0,c:0,f:0,fib:0,fe:0,zn:0,ca:0,vC:0,fol:0,kplus:0 };

  const q = parseQty(item.qty);
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

/* -------------------- DOM & state -------------------- */
const mealsEl   = document.getElementById('meals');
const barsEl    = document.getElementById('bars');
const summaryEl = document.getElementById('macroSummary');
const dayNameEl = document.getElementById('dayName');
const prevBtn   = document.getElementById('prevDay');
const nextBtn   = document.getElementById('nextDay');

const EATEN_KEY   = 'diet_eaten';
const DAY_KEY     = 'diet_day';
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
  const plan = (window.mealPlan && Object.keys(window.mealPlan).length) ? window.mealPlan : {};
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
      <div class="empty-sub">Ensure <code>data.js</code> loads before <code>js/app.js</code> and day names match.</div>
    </div>`;
    return;
  }

  // ---------- Render meals with inline ingredient editors ----------
  mealsRaw.forEach(m=>{
    const items = getEffectiveItems(day, m.meal, m.items);
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
  const goals = loadState(GOAL_KEY) || { kcal:3500, protein:200, fibre:30, iron:8, zinc:14 };

  const remaining = mealsRaw.reduce((a,m)=>{
    const cid = `${day}:${m.meal}`;
    if (!eaten[cid]) {
      const effItems = getEffectiveItems(day, m.meal, m.items);
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
  const rec = recFor(foodKey);

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
        ${(!rec || (unit==='whole' && !rec.unit_g)) ? `<div class="ing-note">Tip: this food has no default per-piece weight. If you choose “whole”, set a weight in grams for best accuracy.</div>` : ``}
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
  const names = Object.keys(window.mealPlan || {});
  if (!names.length) return;
  const current = loadState(DAY_KEY) || names[0];
  const next = names[(names.indexOf(current) + delta + names.length) % names.length];
  saveState(DAY_KEY, next);
  renderDiet();
}