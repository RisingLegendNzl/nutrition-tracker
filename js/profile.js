// filename: js/profile.js
// Profile UI + storage + Generate Plan (uses unsaved form first, then saved).
// Adds: age, activity PAL, goal, bodyfat%, diet, allergies, dislikes, training days.

import { clamp, showSnack } from './utils.js';
import { applyPlanToDiet } from './plan.io.js';
import { generateDayPlan, generateWeekPlan } from '../engine/nutritionEngine.js';
import { foodsBundle } from '../brain/diet.data.js';

const KEY = 'profile_v1';
const listeners = new Set();

let root;
let editBtn;
let state = null;

function nowDate(){ return new Date().toISOString().slice(0,10); }

/* ================= Storage ================= */

export function getProfile(){
  if (state) return state;
  try{
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const migrated = migrate(obj);
    if (isValid(migrated)){ state = migrated; return migrated; }
    return null;
  }catch{ return null; }
}

function saveProfile(p){
  const toSave = { ...p, updated_at: nowDate() };
  localStorage.setItem(KEY, JSON.stringify(toSave));
  state = toSave;
  listeners.forEach(cb => { try{ cb(toSave); }catch{} });
  showSnack('Profile saved.');
}

function migrate(p){
  if (!p) return p;
  // add defaults if missing (non-breaking)
  if (!('weight_unit' in p)) p.weight_unit = 'kg';
  if (!('height_unit' in p)) p.height_unit = 'cm';
  if (!('gender' in p))      p.gender = 'male';

  // new nutrition fields
  if (!('store_preference' in p)) p.store_preference = 'none';
  if (!('age_y' in p))          p.age_y = 23;
  if (!('activity_pal' in p))   p.activity_pal = 1.6;
  if (!('goal' in p))           p.goal = 'maintain';
  if (!('bodyfat_pct' in p))    p.bodyfat_pct = null;
  if (!('diet' in p))           p.diet = 'omnivore';
  if (!('allergies' in p))      p.allergies = [];
  if (!('dislikes' in p))       p.dislikes = [];
  if (!('training_days' in p))  p.training_days = [];
  return p;
}

export function onProfileChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }
export function requireComplete(){ return !!getProfile(); }

/* ================ Validation ================= */

function isValid(p){
  if (!p) return false;
  const w = Number(p.weight_kg);
  const mlkg = Number(p.ml_per_kg);
  if (!Number.isFinite(w) || w < 30 || w > 300) return false;
  if (!Number.isFinite(mlkg) || mlkg < 20 || mlkg > 60) return false;

  // height is optional in your UI; if provided, validate range
  if (p.height_cm !== '' && p.height_cm != null) {
    const h = Number(p.height_cm);
    if (!Number.isFinite(h) || h < 120 || h > 230) return false;
  }

  // nutrition fields (lenient)
  if (p.age_y != null && (!Number.isFinite(Number(p.age_y)) || p.age_y < 18 || p.age_y > 65)) return false;
  if (p.activity_pal != null && (!Number.isFinite(Number(p.activity_pal)) || p.activity_pal < 1.2 || p.activity_pal > 1.9)) return false;
  if (p.goal && !['cut','maintain','gain'].includes(String(p.goal).toLowerCase())) return false;
  if (p.bodyfat_pct != null && p.bodyfat_pct !== '' && (!Number.isFinite(Number(p.bodyfat_pct)) || p.bodyfat_pct < 5 || p.bodyfat_pct > 50)) return false;
  if (p.diet && !['omnivore','vegetarian','vegan','pescetarian'].includes(String(p.diet))) return false;
  if (p.store_preference && !['none','coles','woolworths'].includes(String(p.store_preference))) return false;

  return true;
}

/* ============ Compute helpers / units ============ */

function computeHydroLitres(weight_kg, ml_per_kg){
  const ml = weight_kg * ml_per_kg;
  return Math.round(ml) / 1000;
}
function kgFromLbs(lbs){ return Math.round((Number(lbs)||0) * 0.45359237 * 10) / 10; }
function cmFromFeetIn(feet, inches){
  const f = Number(feet)||0, i = Number(inches)||0;
  return Math.round(((f*12 + i) * 2.54));
}
function lbsFromKg(kg){ return Math.round((Number(kg)||0) / 0.45359237); }
function feetFromCm(cm){
  if (!Number.isFinite(Number(cm))) return ['', ''];
  const totalIn = (Number(cm)||0) / 2.54;
  const f = Math.floor(totalIn / 12);
  const i = Math.round(totalIn - f*12);
  return [f, i];
}

/* ================= UI Rendering ================= */

/* ===== Inline validation helpers (Phase: show missing fields) ===== */
function setInvalid(el, isBad){
  if (!el) return;
  const field = el.closest ? el.closest('.field') : null;
  if (!field) return;
  field.classList.toggle('invalid', !!isBad);
}
function clearAllInvalid(u){
  [
    u.age, u.weightVal, u.hcm, u.hft, u.hin, u.activity, u.goal
  ].forEach(el => setInvalid(el, false));
}
function missingRequired(u){
  const miss = [];
  // Age
  const ageStr = String(u.age.value||'').trim();
  const age = Number(ageStr);
  const ageMissing = ageStr === '' || !Number.isFinite(age);
  setInvalid(u.age, ageMissing);
  if (ageMissing) miss.push('Age');
  // Weight
  const wStr = String(u.weightVal.value||'').trim();
  const w = Number(wStr);
  const wMissing = wStr === '' || !Number.isFinite(w);
  setInvalid(u.weightVal, wMissing);
  if (wMissing) miss.push('Weight');
  // Height (cm or ft+in): require at least one mode filled
  const hunit = (u.heightUnit?.value || 'cm').toLowerCase();
  let hMissing = false;
  if (hunit === 'cm'){
    const hStr = String(u.hcm.value||'').trim();
    const hv = Number(hStr);
    hMissing = hStr === '' || !Number.isFinite(hv);
    setInvalid(u.hcm, hMissing);
  }else{
    const fStr = String(u.hft.value||'').trim();
    const iStr = String(u.hin.value||'').trim();
    const fOk = fStr !== '' && Number.isFinite(Number(fStr));
    const iOk = iStr !== '' && Number.isFinite(Number(iStr));
    hMissing = !(fOk || iOk);
    setInvalid(u.hft, hMissing);
    setInvalid(u.hin, hMissing);
  }
  if (hMissing) miss.push('Height');
  // Activity
  const palMissing = !u.activity.value;
  setInvalid(u.activity, palMissing);
  if (palMissing) miss.push('Activity (PAL)');
  // Goal
  const goalMissing = !u.goal.value;
  setInvalid(u.goal, goalMissing);
  if (goalMissing) miss.push('Goal');
  return miss;
}


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
          ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>(
            `<label class="chip">
               <input type="checkbox" data-day="${d}"/>
               ${d}
             </label>`
          )).join('')}
        </div>
      </div>

      <div class="field">
        <label for="p_mlkg">Hydration baseline (ml per kg)</label>
        <input id="p_mlkg" type="number" inputmode="numeric" min="20" max="60" step="1" placeholder="35"/>
        <div id="p_goal_preview" class="pill" style="margin-top:8px">
          <span>Daily hydration goal</span><strong id="p_goal_value">—</strong>
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
        <button id="p_save" class="secondary">Save</button>
        <button id="p_reset" class="ghost">Reset to defaults</button>
        <button id="p_cancel" class="ghost">Cancel</button>
        <!-- Generate Plan button is injected here at runtime -->
      </div>

      <div id="p_error" style="color:#ff7b7b;margin-top:8px;display:none"></div>
    </section>
  `;
  return root;
}

function ensureEditButton(){
  if (editBtn && document.body.contains(editBtn)) return editBtn;
  const hdr = document.querySelector('.topbar') || document.querySelector('.app-header');
  if (!hdr) return null;
  editBtn = document.createElement('button');
  editBtn.id = 'editProfileBtn';
  editBtn.className = 'ghost';
  editBtn.textContent = 'Edit Profile';
  editBtn.style.marginLeft = '8px';
  hdr.appendChild(editBtn);
  editBtn.addEventListener('click', () => {
    const u = ui();
    const p = getProfile() || defaults();
    writeToUI(u, p);
    document.getElementById('p_title').textContent = 'Edit Profile';
    show(false);
  });
  return editBtn;
}

function ui(){
  ensureRoot();
  ensureEditButton();
  const el = (id)=>document.getElementById(id);
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

    // ml/kg + preview
    mlkg: el('p_mlkg'),
    goalPrev: el('p_goal_preview'),
    goalVal: el('p_goal_value'),

    // actions
    save: el('p_save'),
    reset: el('p_reset'),
    cancel: el('p_cancel'),
    error: el('p_error'),
  };
}

function defaults(){
  return {
    name: '',
    gender: 'male',       // 'male' | 'female'
    weight_unit: 'kg',    // 'kg' | 'lb'
    height_unit: 'cm',    // 'cm' | 'ftin'
    weight_kg: 71,
    height_cm: '',
    ml_per_kg: 35,

    // nutrition fields
    store_preference: 'none',
    age_y: 23,
    activity_pal: 1.6,
    goal: 'maintain',
    bodyfat_pct: null,
    diet: 'omnivore',
    allergies: [],
    dislikes: [],
    training_days: [],

    created_at: nowDate(),
    updated_at: nowDate(),
  };
}

/* =============== Read/Write UI =============== */

function readFromUI(u){
  const prefs = {
    weight_unit: u.weightUnit.value === 'lb' ? 'lb' : 'kg',
    height_unit: u.heightUnit.value === 'ftin' ? 'ftin' : 'cm',
    gender: (u.gender.value || 'male') === 'female' ? 'female' : 'male',
  };

  // basic fields
  const name = u.name.value.trim();
  const age_y = Number(u.age.value || '');

  // weight
  let weight_kg;
  if (prefs.weight_unit === 'kg'){
    weight_kg = Number(u.weightVal.value);
  }else{
    weight_kg = kgFromLbs(u.weightVal.value);
  }

  // height
  let height_cm;
  if (prefs.height_unit === 'cm'){
    height_cm = u.hcm.value === '' ? '' : Number(u.hcm.value);
  }else{
    if (u.hft.value === '' && u.hin.value === '') height_cm = '';
    else height_cm = cmFromFeetIn(u.hft.value, u.hin.value);
  }

  // nutrition sliders
  const bodyfat_pct = u.bodyfat.value === '' ? null : Number(u.bodyfat.value);
  const activity_pal = Number(u.activity.value || 1.6);
  const goal = String(u.goal.value || 'maintain').toLowerCase();
  const diet = String(u.diet.value || 'omnivore');
  const store_preference = String(u.store.value || 'none');

  // lists
  const allergies = (u.allergies.value || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const dislikes = (u.dislikes.value || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  // training days
  const training_days = Array.from(u.trainingWrap.querySelectorAll('input[type="checkbox"]'))
    .filter(cb => cb.checked)
    .map(cb => cb.getAttribute('data-day'));

  const ml_per_kg = Number(u.mlkg.value);

  // quick validations
  const weightIsOk = Number.isFinite(weight_kg) && weight_kg >= 30 && weight_kg <= 300;
  const mlkgIsOk = Number.isFinite(ml_per_kg) && ml_per_kg >= 20 && ml_per_kg <= 60;
  const heightOk = (u.hcm.value === '' && prefs.height_unit==='cm')
                || (u.hft.value === '' && u.hin.value === '' && prefs.height_unit==='ftin')
                || (Number.isFinite(height_cm) && height_cm >= 120 && height_cm <= 230);
  const ageOk = (u.age.value === '') || (Number.isFinite(age_y) && age_y >= 18 && age_y <= 65);
  const bfOk = (bodyfat_pct === null) || (Number.isFinite(bodyfat_pct) && bodyfat_pct >= 5 && bodyfat_pct <= 50);

  return {
    prefs,
    ok: weightIsOk && mlkgIsOk && heightOk && ageOk && bfOk,
    data: {
      name, gender: prefs.gender,
      weight_unit: prefs.weight_unit,
      height_unit: prefs.height_unit,
      weight_kg,
      height_cm: height_cm === '' ? '' : Number(height_cm),
      ml_per_kg,

      age_y: u.age.value === '' ? null : age_y,
      activity_pal,
      goal,
      bodyfat_pct,
      diet,
      store_preference,
      allergies,
      dislikes,
      training_days
    }
  };
}

function writeToUI(u, p){
  u.title.textContent = 'Your Profile';
  u.name.value = p.name || '';
  u.gender.value = p.gender || 'male';
  u.age.value = (p.age_y ?? '') === null ? '' : (p.age_y ?? '');

  // units
  u.weightUnit.value = p.weight_unit || 'kg';
  u.heightUnit.value = p.height_unit || 'cm';

  // weight value
  if ((p.weight_unit || 'kg') === 'kg') u.weightVal.value = p.weight_kg ?? '';
  else u.weightVal.value = lbsFromKg(p.weight_kg ?? 0);

  // height blocks
  if ((p.height_unit || 'cm') === 'cm'){
    u.hcmBlock.classList.remove('hidden');
    u.hftinBlock.classList.add('hidden');
    u.hcm.value = p.height_cm ?? '';
  } else {
    u.hcmBlock.classList.add('hidden');
    u.hftinBlock.classList.remove('hidden');
    const [ft, inch] = feetFromCm(p.height_cm ?? '');
    u.hft.value = ft || '';
    u.hin.value = inch || '';
  }

  // nutrition / goal fields
  u.bodyfat.value = (p.bodyfat_pct ?? '') === null ? '' : (p.bodyfat_pct ?? '');
  u.activity.value = String(p.activity_pal ?? 1.6);
  u.goal.value = String(p.goal || 'maintain').toLowerCase();
  u.diet.value = p.diet || 'omnivore';
  if (u.store) u.store.value = p.store_preference || 'none';

  u.allergies.value = Array.isArray(p.allergies) ? p.allergies.join(', ') : '';
  u.dislikes.value = Array.isArray(p.dislikes) ? p.dislikes.join(', ') : '';

  // training days
  const days = new Set(p.training_days || []);
  u.trainingWrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const d = cb.getAttribute('data-day');
    cb.checked = days.has(d);
  });

  // ml/kg + preview
  u.mlkg.value = p.ml_per_kg ?? 35;
  const litres = computeHydroLitres(p.weight_kg, p.ml_per_kg);
  u.goalPrev.querySelector('strong').textContent = litres ? `${litres.toFixed(1).replace(/\.0$/, '')} L` : '—';
}

/* ================== Mount & Events ================== */

function show(readonly=true){
  const u = ui();
  if (readonly){
    const p = getProfile() || defaults();
    writeToUI(u, p);
  }
  u.page.classList.remove('hidden');
}

export function mountProfile(){
  const u = ui();

  // unit switchers
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
  });

  // live hydration preview
  const updatePreview = ()=>{
    const r = readFromUI(u);
    if (!Number.isFinite(r.data.weight_kg) || !Number.isFinite(r.data.ml_per_kg)) {
      u.goalPrev.querySelector('strong').textContent = '—';
      return;
    }
    const litres = computeHydroLitres(r.data.weight_kg, r.data.ml_per_kg);
    u.goalPrev.querySelector('strong').textContent = `${litres.toFixed(1).replace(/\.0$/, '')} L`;
  };
  u.weightVal.addEventListener('input', updatePreview);
  u.mlkg.addEventListener('input', updatePreview);
  u.weightUnit.addEventListener('change', updatePreview);

  // Save
  u.save.addEventListener('click', ()=>{
    const r = readFromUI(u);
    const missing = missingRequired(u);
    if (!r.ok || missing.length){
      u.error.style.display = 'block';
      u.error.textContent = missing.length ? `Please complete: ${missing.join(', ')}` : 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';

    // Normalize optional fields
    const cleaned = { ...r.data };
    if (cleaned.age_y === null) cleaned.age_y = 23; // default
    saveProfile(cleaned);
  });

  // Reset
  u.reset.addEventListener('click', ()=>{
    const d = defaults();
    writeToUI(u, d);
  });

  // Cancel (hide)
  u.cancel.addEventListener('click', ()=>{
    u.page.classList.add('hidden');
  });

  // Generate Plan button
  injectGenerateButton(u);

  // ---- JS enhancer for chips (fallback for browsers without :has) ----
  u.trainingWrap.querySelectorAll('label.chip').forEach(lbl => {
    const cb = lbl.querySelector('input[type="checkbox"]');
    const sync = () => lbl.classList.toggle('is-checked', cb.checked);
    cb.addEventListener('change', sync);
    cb.addEventListener('blur', sync);
    sync();
  });
}

export { ensureRoot as renderProfile, ensureRoot as initProfile };

/* =============== Generate Plan wiring =============== */


function injectGenerateButton(u){
  let btn = document.getElementById('p_gen');
  if (!btn){
    btn = document.createElement('button');
    btn.id = 'p_gen';
    btn.className = 'primary';
    btn.textContent = 'Generate Meal Plan';
    u.cancel.parentElement.appendChild(btn);
  }
  btn.onclick = ()=>{
    const r = readFromUI(u);
    const missing = (typeof missingRequired==='function') ? missingRequired(u) : [];
    if (!r.ok || missing.length){
      u.error.style.display = 'block';
      u.error.textContent = missing.length ? `Please complete: ${missing.join(', ')}` : 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';
    const req = { profile: r.data, constraints: { diet: r.data.diet, allergies: r.data.allergies, dislikes: r.data.dislikes } };
    try{
      const out = generateWeekPlan(req);
      if (out && out.plan){
        applyPlanToDiet({ plan: out.plan, meta: out.meta || {} });
      }
    }catch(e){
      console.warn('Generation failed', e);
      alert('Could not generate a plan.');
    }
  };
}

function onGenerateFromProfile(u){
  // Prefer UNSAVED form values first
  const r = readFromUI(u);
  const saved = getProfile() || defaults();

  // Compose engine profile with fallback for optional fields
  const sex = (r.data.gender || saved.gender || 'male').toLowerCase();
  const height_cm = (r.data.height_cm === '' || r.data.height_cm == null)
      ? (Number(saved.height_cm) || 175)
      : Number(r.data.height_cm);
  const weight_kg = Number(r.data.weight_kg || saved.weight_kg || 71);
  const age_y = Number((r.data.age_y ?? saved.age_y ?? 23) || 23);
  const bodyfat_pct = (r.data.bodyfat_pct != null ? Number(r.data.bodyfat_pct)
                      : (saved.bodyfat_pct != null ? Number(saved.bodyfat_pct) : null));
  const activity_pal = Number(r.data.activity_pal ?? saved.activity_pal ?? 1.6);
  const goal = String(r.data.goal || saved.goal || 'maintain').toLowerCase();

  const engineProfile = { sex, age_y, height_cm, weight_kg, bodyfat_pct, activity_pal, goal };
  const constraints = {
    diet: r.data.diet || saved.diet || 'omnivore',
    allergies: r.data.allergies?.length ? r.data.allergies : (saved.allergies || []),
    dislikes: r.data.dislikes?.length ? r.data.dislikes : (saved.dislikes || []),
    budget_mode: false,
    time_per_meal: '<=20min',
    training_days: r.data.training_days?.length ? r.data.training_days : (saved.training_days || [])
  };

  const req = {
    engine_version: 'v1.0.0',
    data_version: '2025-09-17',
    profile: engineProfile,
    constraints,
    features: { ai_swaps: false, live_prices: false }
  };

  const result = generateDayPlan(req);
  if (result?.type === 'error'){
    // Surface error inline and mark required fields
    try{
      const u = ui();
      const miss = missingRequired(u);
      u.error.style.display = 'block';
      u.error.textContent = result.message || (miss.length ? `Please complete: ${miss.join(', ')}` : 'Generation error');
    }catch{}
    showSnack(result.message || 'Generation error');
    return;
  }


  // ---- Phase 1: Save engine targets for Diet bars (future-proof) ----
  try {
    const goalStore = {
      engine_version: result.engine_version,
      data_version: result.data_version,
      targets: result.targets
    };
    localStorage.setItem('nutrify_targets', JSON.stringify(goalStore));
  } catch {}

  // Back-compat for legacy Diet bars that read GOAL_KEY ('diet_goal')
  try {
    const g = result.targets || {};
    const legacy = {
      kcal: g.kcal,
      protein: g.protein_g,
      fibre: g.fiber_g,
      iron: 8,
      zinc: 14
    };
    localStorage.setItem('diet_goal', JSON.stringify(legacy));
  } catch {}
  // -------------------------------------------------------------------
  // Convert engine JSON → legacy weekly plan and APPLY DIRECTLY
  const weeklyPlan = planFromEngine(result);

  // -------------- DIRECT APPLY + RERENDER --------------
  window.mealPlan = weeklyPlan;
  try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(weeklyPlan)); } catch {}
  if (typeof window.renderDiet === 'function') {
    try { window.renderDiet(); } catch {}
  }
  // -----------------------------------------------------

  showSnack(result.summary || 'Plan generated');
}

/* Map engine result to legacy mealPlan (same plan to all days) */
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
