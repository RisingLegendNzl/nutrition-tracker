// filename: js/profile.js
// Profile UI + storage + Generate Plan wiring

import { showSnack } from './utils.js';
import { applyPlanToDiet } from './plan.io.js';
import { generateDayPlan } from '../engine/nutritionEngine.js';
import { foodsBundle } from '../brain/diet.data.js';

const KEY = 'profile_v1';
const DRAFT_KEY = 'profile_draft_v1';
const listeners = new Set();

function nowDate(){ return new Date().toISOString().slice(0,10); }

/* ================= Storage ================= */

export function getProfile(){
  try{
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return migrate(obj);
  }catch{ return null; }
}

function saveProfile(p){
  const toSave = { ...p, updated_at: nowDate() };
  localStorage.setItem(KEY, JSON.stringify(toSave));
  listeners.forEach(cb => { try{ cb(toSave); }catch{} });
  showSnack('Profile saved.');
}

function migrate(p){
  if (!p) return p;
  if (!('weight_unit' in p)) p.weight_unit = 'kg';
  if (!('height_unit' in p)) p.height_unit = 'cm';
  if (!('gender' in p))      p.gender = 'male';
  if (!('age_y' in p))          p.age_y = 23;
  if (!('activity_pal' in p))   p.activity_pal = 1.6;
  if (!('goal' in p))           p.goal = 'maintain';
  if (!('bodyfat_pct' in p))    p.bodyfat_pct = null;
  if (!('diet' in p))           p.diet = 'omnivore';
  if (!('allergies' in p))      p.allergies = [];
  if (!('dislikes' in p))       p.dislikes = [];
  if (!('training_days' in p))  p.training_days = [];
  if (!('store_preference' in p)) p.store_preference = 'none';
  return p;
}

export function onProfileChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }
export function requireComplete(){ return !!getProfile(); }

/* ============ unit helpers ============ */
const KG_PER_LB = 0.45359237;
function kgFromLbs(lbs){ return Math.round((Number(lbs)||0) * KG_PER_LB * 10) / 10; }
function lbsFromKg(kg){ return Math.round((Number(kg)||0) / KG_PER_LB); }
function cmFromFeetIn(ft, inch){
  const f = Number(ft)||0, i = Number(inch)||0;
  return Math.round(((f*12 + i) * 2.54));
}
function feetInFromCm(cm){
  if (!Number.isFinite(Number(cm))) return ['', ''];
  const totalIn = (Number(cm)||0) / 2.54;
  const f = Math.floor(totalIn / 12);
  const i = Math.round(totalIn - f*12);
  return [f, i];
}

/* ============ DOM scaffold ============ */

let root;
function ensureRoot(){
  if (root) return root;
  root = document.getElementById('profilePage');
  if (!root){
    root = document.createElement('section');
    root.id = 'profilePage';
    root.className = 'page hidden';
    document.getElementById('app')?.appendChild(root);
  }
  root.innerHTML = `
    <section class="card">
      <h2 class="section-title" id="p_title">Your Profile</h2>

      <div class="field">
        <label for="p_name">Name</label>
        <input id="p_name" type="text" placeholder="e.g., Jack"/>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label for="p_gender" style="margin:0">Gender</label>
          <select id="p_gender" style="max-width:160px">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label for="p_age_y" style="margin:0">Age (years)</label>
          <input id="p_age_y" type="number" inputmode="numeric" min="18" max="65" placeholder="e.g., 23" style="max-width:160px"/>
        </div>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label for="p_weight_value" style="margin:0">Weight</label>
          <select id="u_w_unit" style="max-width:120px">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>
        <input id="p_weight_value" type="number" inputmode="decimal" placeholder="kg" min="30" max="300"/>
      </div>

      <div class="field">
        <div style="display:flex; gap:10px; align-items:center; justify-content:space-between">
          <label style="margin:0">Height</label>
          <select id="u_h_unit" style="max-width:120px">
            <option value="cm">cm</option>
            <option value="ftin">ft/in</option>
          </select>
        </div>
        <div id="h_cm_block">
          <input id="p_height_cm" type="number" inputmode="decimal" placeholder="cm" min="120" max="230"/>
        </div>
        <div id="h_ftin_block" class="hidden">
          <div style="display:flex;gap:8px">
            <input id="p_height_ft" type="number" inputmode="numeric" placeholder="ft" min="4" max="7" style="flex:1"/>
            <input id="p_height_in" type="number" inputmode="numeric" placeholder="in" min="0" max="11" style="flex:1"/>
          </div>
        </div>
      </div>

      <div class="field">
        <label for="p_bodyfat">Bodyfat % (optional)</label>
        <input id="p_bodyfat" type="number" inputmode="decimal" placeholder="%" min="5" max="50" step="0.5"/>
      </div>

      <div class="field">
        <label for="p_activity">Activity (PAL)</label>
        <select id="p_activity">
          <option value="1.2">Sedentary (1.2)</option>
          <option value="1.375">Light (1.375)</option>
          <option value="1.55">Moderate (1.55)</option>
          <option value="1.725">Active (1.725)</option>
          <option value="1.9">Very active (1.9)</option>
        </select>
      </div>

      <div class="field">
        <label for="p_goal">Goal</label>
        <select id="p_goal">
          <option value="cut">Cut</option>
          <option value="maintain" selected>Maintain</option>
          <option value="gain">Gain</option>
        </select>
      </div>

      <div class="field">
        <label for="p_diet">Diet type</label>
        <select id="p_diet">
          <option value="omnivore" selected>Omnivore</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="pescetarian">Pescetarian</option>
        </select>
      </div>

      <div class="field">
        <label for="p_store">Preferred store</label>
        <select id="p_store">
          <option value="none" selected>None</option>
          <option value="coles">Coles</option>
          <option value="woolworths">Woolworths</option>
        </select>
      </div>

      <div class="field">
        <label for="p_allergies">Allergies (comma-separated)</label>
        <input id="p_allergies" type="text" placeholder="e.g., milk, soy"/>
      </div>

      <div class="field">
        <label for="p_dislikes">Dislikes (comma-separated)</label>
        <input id="p_dislikes" type="text" placeholder="e.g., capsicum, olives"/>
      </div>

      <div class="field">
        <label>Training days (optional)</label>
        <div id="p_training_days" class="chips">
          <label class="chip"><input type="checkbox" data-day="Mon"/>Mon</label>
          <label class="chip"><input type="checkbox" data-day="Tue"/>Tue</label>
          <label class="chip"><input type="checkbox" data-day="Wed"/>Wed</label>
          <label class="chip"><input type="checkbox" data-day="Thu"/>Thu</label>
          <label class="chip"><input type="checkbox" data-day="Fri"/>Fri</label>
          <label class="chip"><input type="checkbox" data-day="Sat"/>Sat</label>
          <label class="chip"><input type="checkbox" data-day="Sun"/>Sun</label>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button id="p_save" class="secondary">Save</button>
        <button id="p_reset" class="ghost">Reset to defaults</button>
        <button id="p_cancel" class="ghost">Cancel</button>
        <!-- Generate injected here -->
      </div>

      <div id="p_error" style="color:#ff7b7b;margin-top:8px;display:none"></div>
    </section>
  `;
  return root;
}

function ui(){
  ensureRoot();
  const el = id => document.getElementById(id);
  return {
    page: root,
    title: el('p_title'),
    name: el('p_name'),
    gender: el('p_gender'),
    age: el('p_age_y'),

    // weight
    weightVal: el('p_weight_value'),
    weightUnit: el('u_w_unit'),

    // height
    heightUnit: el('u_h_unit'),
    hcmBlock: el('h_cm_block'),
    hftinBlock: el('h_ftin_block'),
    hcm: el('p_height_cm'),
    hft: el('p_height_ft'),
    hin: el('p_height_in'),

    bodyfat: el('p_bodyfat'),
    activity: el('p_activity'),
    goal: el('p_goal'),
    diet: el('p_diet'),
    store: el('p_store'),
    allergies: el('p_allergies'),
    dislikes: el('p_dislikes'),
    trainingWrap: el('p_training_days'),

    save: el('p_save'),
    reset: el('p_reset'),
    cancel: el('p_cancel'),
    error: el('p_error'),
  };
}

/* ================== UI Validation (inline) ================== */
function _fieldWrap(el){ return el ? el.closest('.field') : null; }
function setInvalid(el, msg){
  const wrap = _fieldWrap(el); if (!wrap) return;
  wrap.classList.add('invalid');
  let m = wrap.querySelector('.error-msg');
  if (!m){ m = document.createElement('div'); m.className = 'error-msg'; wrap.appendChild(m); }
  m.textContent = msg || 'Required';
}
function clearInvalid(el){
  const wrap = _fieldWrap(el); if (!wrap) return;
  wrap.classList.remove('invalid');
  const m = wrap.querySelector('.error-msg'); if (m) m.remove();
}

function validateUI(u){
  const missing = [];

  // Weight
  let wk;
  if (u.weightUnit.value === 'kg') wk = Number(u.weightVal.value);
  else wk = (Number(u.weightVal.value)||0) * KG_PER_LB;
  const weightOk = Number.isFinite(wk) && wk >= 30 && wk <= 300;
  if (!weightOk) { missing.push('Weight'); setInvalid(u.weightVal, 'Enter 30–300'); } else { clearInvalid(u.weightVal); }

  // Age
  const ageVal = u.age.value === '' ? NaN : Number(u.age.value);
  const ageOk = Number.isFinite(ageVal) && ageVal >= 18 && ageVal <= 65;
  if (!ageOk) { missing.push('Age'); setInvalid(u.age, 'Enter 18–65'); } else { clearInvalid(u.age); }

  // Height
  let heightOk = false;
  if (u.heightUnit.value === 'cm'){
    const h = u.hcm.value === '' ? NaN : Number(u.hcm.value);
    heightOk = Number.isFinite(h) && h >= 120 && h <= 230;
    if (!heightOk) setInvalid(u.hcm, 'Enter 120–230'); else clearInvalid(u.hcm);
  } else {
    const ft = u.hft.value === '' ? NaN : Number(u.hft.value);
    const inch = u.hin.value === '' ? NaN : Number(u.hin.value);
    if (Number.isFinite(ft) && Number.isFinite(inch)){
      const cm = Math.round(((ft*12)+inch)*2.54);
      heightOk = cm >= 120 && cm <= 230;
    }
    if (!heightOk){ setInvalid(u.hft, 'Enter ft/in'); setInvalid(u.hin, 'Enter ft/in'); }
    else { clearInvalid(u.hft); clearInvalid(u.hin); }
  }

  const ok = weightOk && ageOk && heightOk;
  return { ok, missing };
}

/* =============== Read/Write UI =============== */

function defaults(){
  return {
    name: '',
    gender: 'male',
    weight_unit: 'kg',
    height_unit: 'cm',
    weight_kg: '',
    height_cm: '',
    age_y: '',
    activity_pal: 1.6,
    goal: 'maintain',
    bodyfat_pct: '',
    diet: 'omnivore',
    store_preference: 'none',
    allergies: [],
    dislikes: [],
    training_days: [],
  };
}

function writeToUI(u, p){
  u.title.textContent = 'Your Profile';
  u.name.value = p.name || '';
  u.gender.value = p.gender || 'male';

  u.weightUnit.value = p.weight_unit || 'kg';
  u.heightUnit.value = p.height_unit || 'cm';

  // values
  if (u.weightUnit.value === 'kg') u.weightVal.value = p.weight_kg ?? '';
  else u.weightVal.value = lbsFromKg(p.weight_kg ?? 0);

  if (u.heightUnit.value === 'cm'){
    u.hcmBlock.classList.remove('hidden');
    u.hftinBlock.classList.add('hidden');
    u.hcm.value = p.height_cm ?? '';
  }else{
    u.hcmBlock.classList.add('hidden');
    u.hftinBlock.classList.remove('hidden');
    const [ft, inch] = feetInFromCm(p.height_cm ?? '');
    u.hft.value = ft || '';
    u.hin.value = inch || '';
  }

  u.age.value = p.age_y ?? '';
  u.bodyfat.value = p.bodyfat_pct ?? '';
  u.activity.value = String(p.activity_pal ?? 1.6);
  u.goal.value = String(p.goal || 'maintain').toLowerCase();
  u.diet.value = p.diet || 'omnivore';
  u.store.value = p.store_preference || 'none';
  u.allergies.value = Array.isArray(p.allergies) ? p.allergies.join(', ') : '';
  u.dislikes.value = Array.isArray(p.dislikes) ? p.dislikes.join(', ') : '';

  const days = new Set(p.training_days || []);
  u.trainingWrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = days.has(cb.getAttribute('data-day'));
  });
}

function readFromUI(u){
  const prefs = {
    weight_unit: u.weightUnit.value === 'lb' ? 'lb' : 'kg',
    height_unit: u.heightUnit.value === 'ftin' ? 'ftin' : 'cm',
    gender: (u.gender.value || 'male').toLowerCase(),
  };

  // weight
  let weight_kg = '';
  if (prefs.weight_unit === 'kg') weight_kg = u.weightVal.value === '' ? '' : Number(u.weightVal.value);
  else weight_kg = u.weightVal.value === '' ? '' : kgFromLbs(u.weightVal.value);

  // height
  let height_cm = '';
  if (prefs.height_unit === 'cm'){
    height_cm = u.hcm.value === '' ? '' : Number(u.hcm.value);
  } else {
    if (u.hft.value !== '' || u.hin.value !== '') height_cm = cmFromFeetIn(u.hft.value, u.hin.value);
  }

  // lists & misc
  const training_days = Array.from(u.trainingWrap.querySelectorAll('input[type="checkbox"]'))
    .filter(cb => cb.checked).map(cb => cb.getAttribute('data-day'));

  return {
    prefs,
    data: {
      name: u.name.value.trim(),
      gender: prefs.gender,
      weight_unit: prefs.weight_unit,
      height_unit: prefs.height_unit,
      weight_kg,
      height_cm,
      age_y: u.age.value === '' ? '' : Number(u.age.value),
      activity_pal: Number(u.activity.value || 1.6),
      goal: String(u.goal.value || 'maintain').toLowerCase(),
      bodyfat_pct: u.bodyfat.value === '' ? '' : Number(u.bodyfat.value),
      diet: String(u.diet.value || 'omnivore'),
      store_preference: String(u.store.value || 'none'),
      allergies: (u.allergies.value || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean),
      dislikes: (u.dislikes.value || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean),
      training_days
    }
  };
}

/* ================= Mount & Events ================= */

export function mountProfile(){
  const u = ui();

  // initial load
  const saved = getProfile() || defaults();
  writeToUI(u, saved);

  // switch height unit
  u.heightUnit.addEventListener('change', ()=>{
    if (u.heightUnit.value === 'cm'){
      u.hcmBlock.classList.remove('hidden');
      u.hftinBlock.classList.add('hidden');
      u.hft.value = ''; u.hin.value = '';
    } else {
      u.hcmBlock.classList.add('hidden');
      u.hftinBlock.classList.remove('hidden');
      u.hcm.value = '';
    }
    syncButtons();
  });

  // live validation + buttons
  const inputs = [u.name,u.gender,u.age,u.weightVal,u.weightUnit,u.heightUnit,u.hcm,u.hft,u.hin,u.bodyfat,u.activity,u.goal,u.diet,u.store,u.allergies,u.dislikes];
  inputs.forEach(el => el && el.addEventListener('input', syncButtons));
  inputs.forEach(el => el && el.addEventListener('change', syncButtons));
  syncButtons();

  // Save
  u.save.addEventListener('click', ()=>{
    const v = validateUI(u);
    if (!v.ok){
      u.error.style.display = 'block';
      u.error.textContent = v.missing.length ? `Please complete: ${v.missing.join(', ')}` : 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';
    const r = readFromUI(u);
    const cleaned = { ...r.data };
    saveProfile(cleaned);
  });

  // Reset
  u.reset.addEventListener('click', ()=>{
    const d = defaults();
    writeToUI(u, d);
    // clear errors
    ['weightVal','age','hcm','hft','hin'].forEach(k=>{ const el = u[k]; if (el) clearInvalid(el); });
    syncButtons();
  });

  // Cancel (hide)
  u.cancel.addEventListener('click', ()=> u.page.classList.add('hidden'));

  // Generate button
  injectGenerateButton(u);

  // chip styling fallback (no :has)
  u.trainingWrap.querySelectorAll('label.chip').forEach(lbl=>{
    const cb = lbl.querySelector('input[type="checkbox"]');
    const sync = ()=> lbl.classList.toggle('is-checked', cb.checked);
    cb.addEventListener('change', sync); sync();
  });

  function syncButtons(){
    const v = validateUI(u);
    if (u.save) u.save.disabled = !v.ok;
    const g = document.getElementById('p_gen'); if (g) g.disabled = !v.ok;
  }
}

/* ===== Generate Meal Plan ===== */

function injectGenerateButton(u){
  let btn = document.getElementById('p_gen');
  if (!btn){
    btn = document.createElement('button');
    btn.id = 'p_gen';
    btn.className = 'primary';
    btn.textContent = 'Generate Meal Plan';
    u.cancel.parentElement.appendChild(btn);
  }
  { const v = validateUI(u); btn.disabled = !v.ok; }

  btn.onclick = ()=>{
    const v2 = validateUI(u);
    if (!v2.ok){
      u.error.style.display = 'block';
      u.error.textContent = v2.missing.length ? `Please complete: ${v2.missing.join(', ')}` : 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';

    // Use unsaved form values for engine profile (basic subset)
    const r = readFromUI(u);
    const sex = r.data.gender || 'male';
    const height_cm = Number(r.data.height_cm);
    const weight_kg = Number(r.data.weight_kg);
    const age_y = Number(r.data.age_y || 23);
    const activity_pal = Number(r.data.activity_pal || 1.6);
    const goal = String(r.data.goal || 'maintain');

    const engineProfile = { sex, age_y, height_cm, weight_kg, bodyfat_pct: (r.data.bodyfat_pct===''?null:Number(r.data.bodyfat_pct)), activity_pal, goal };
    const constraints = {
      diet: r.data.diet || 'omnivore',
      allergies: r.data.allergies || [],
      dislikes: r.data.dislikes || [],
      training_days: r.data.training_days || [],
      budget_mode: false,
      time_per_meal: '<=20min'
    };

    const req = {
      engine_version: 'v1.0.0',
      data_version: '2025-09-17',
      profile: engineProfile,
      constraints,
      features: { ai_swaps: false, live_prices: false }
    };

    const result = generateDayPlan(req);
    if (result?.type === 'error'){ showSnack(result.message || 'Generation error'); return; }

    // Save targets for Diet bars (legacy)
    try {
      const g = result.targets || {};
      const legacy = { kcal: g.kcal, protein: g.protein_g, fibre: g.fiber_g, iron: 8, zinc: 14 };
      localStorage.setItem('diet_goal', JSON.stringify(legacy));
    } catch {}

    // Map to legacy weekly plan & apply
    const weeklyPlan = planFromEngine(result);
    window.mealPlan = weeklyPlan;
    try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(weeklyPlan)); } catch {}
    if (typeof window.renderDiet === 'function') { try { window.renderDiet(); } catch {} }
    showSnack(result.summary || 'Plan generated');
  };
}

/* Map engine result to legacy mealPlan */
function planFromEngine(engineRes){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const idToName = Object.fromEntries((foodsBundle?.foods || []).map(f => [f.id, f.name]));
  const legacyMeals = (engineRes.meals || []).map(m => ({
    meal: (m.slot || 'meal').replace(/^\w/, c => c.toUpperCase()),
    items: (m.items || []).map(it => ({
      food_id: it.food_id,
      food: idToName[it.food_id] || (String(it.food_id||'').replace(/^food_/,'').replace(/_/g,' ')),
      qty: `${Math.round(Number(it.qty_g||0))} g`
    }))
  }));
  const plan = {};
  for (const d of days) plan[d] = legacyMeals;
  return plan;
}