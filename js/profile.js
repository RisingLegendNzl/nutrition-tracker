// filename: js/profile.js
// Profile with Gender field; saves gender used by hydration mask.

import { clamp, showSnack } from './utils.js';

const KEY = 'profile_v1';
const listeners = new Set();

let root;
let editBtn;
let state = null;

function nowDate(){ return new Date().toISOString().slice(0,10); }

// ---------- Storage ----------
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
  if (!('weight_unit' in p)) p.weight_unit = 'kg';
  if (!('height_unit' in p)) p.height_unit = 'cm';
  if (!('gender' in p))      p.gender = 'male';
  return p;
}
export function onProfileChange(cb){ listeners.add(cb); return ()=>listeners.delete(cb); }
export function requireComplete(){ return !!getProfile(); }

// ---------- Validation ----------
function isValid(p){
  if (!p) return false;
  const w = Number(p.weight_kg);
  const mlkg = Number(p.ml_per_kg);
  if (!Number.isFinite(w) || w < 30 || w > 300) return false;
  if (!Number.isFinite(mlkg) || mlkg < 20 || mlkg > 60) return false;
  if (p.height_cm === '' || p.height_cm === null || typeof p.height_cm === 'undefined') return true;
  const h = Number(p.height_cm);
  return Number.isFinite(h) && h >= 120 && h <= 230;
}

// ---------- Compute helpers ----------
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

// ---------- UI Rendering ----------
function ensureRoot(){
  if (root) return root;
  root = document.getElementById('profilePage');
  if (!root){
    root = document.createElement('main');
    root.id = 'profilePage';
    root.className = 'hidden';
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
          <label for="p_mlkg">Hydration baseline (ml per kg)</label>
          <input id="p_mlkg" type="number" inputmode="numeric" min="20" max="60" step="1" placeholder="35"/>
          <div id="p_goal_preview" class="pill" style="margin-top:8px">
            <span>Daily hydration goal</span><strong id="p_goal_value">—</strong>
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <button id="p_save" class="primary">Save</button>
          <button id="p_reset" class="ghost">Reset to defaults</button>
          <button id="p_cancel" class="ghost hidden">Cancel</button>
        </div>

        <div id="p_error" style="color:#ff7b7b;margin-top:8px;display:none"></div>
      </section>
    `;
    const hdr = document.querySelector('.app-header');
    (hdr && hdr.nextSibling) ? hdr.parentNode.insertBefore(root, hdr.nextSibling) : document.body.appendChild(root);
  }
  return root;
}

function ensureEditButton(){
  if (editBtn && document.body.contains(editBtn)) return editBtn;
  const hdr = document.querySelector('.app-header');
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
  return {
    page: root,
    title: document.getElementById('p_title'),
    name: document.getElementById('p_name'),
    gender: document.getElementById('p_gender'),
    // weight
    weightVal: document.getElementById('p_weight_value'),
    weightUnit: document.getElementById('u_w_unit'),
    // height
    heightUnit: document.getElementById('u_h_unit'),
    hcmBlock: document.getElementById('h_cm_block'),
    hftinBlock: document.getElementById('h_ftin_block'),
    hcm: document.getElementById('p_height_cm'),
    hft: document.getElementById('p_height_ft'),
    hin: document.getElementById('p_height_in'),
    // ml/kg + preview
    mlkg: document.getElementById('p_mlkg'),
    goalPrev: document.getElementById('p_goal_preview'),
    goalVal: document.getElementById('p_goal_value'),
    // actions
    save: document.getElementById('p_save'),
    reset: document.getElementById('p_reset'),
    cancel: document.getElementById('p_cancel'),
    error: document.getElementById('p_error'),
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
    created_at: nowDate(),
    updated_at: nowDate(),
  };
}

function readFromUI(u){
  const prefs = {
    weight_unit: u.weightUnit.value === 'lb' ? 'lb' : 'kg',
    height_unit: u.heightUnit.value === 'ftin' ? 'ftin' : 'cm',
    gender: (u.gender.value || 'male') === 'female' ? 'female' : 'male',
  };
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

  const ml_per_kg = Number(u.mlkg.value);
  const weightIsOk = Number.isFinite(weight_kg) && weight_kg >= 30 && weight_kg <= 300;
  const mlkgIsOk = Number.isFinite(ml_per_kg) && ml_per_kg >= 20 && ml_per_kg <= 60;
  const heightOk = (u.hcm.value === '' && prefs.height_unit==='cm')
                || (u.hft.value === '' && u.hin.value === '' && prefs.height_unit==='ftin')
                || (Number.isFinite(height_cm) && height_cm >= 120 && height_cm <= 230);

  return {
    prefs,
    data: {
      name: u.name.value.trim(),
      gender: prefs.gender,
      weight_unit: prefs.weight_unit,
      height_unit: prefs.height_unit,
      weight_kg,
      height_cm: height_cm === '' ? '' : Number(height_cm),
      ml_per_kg
    },
    ok: weightIsOk && mlkgIsOk && heightOk
  };
}

function writeToUI(u, p){
  u.title.textContent = 'Your Profile';
  u.name.value = p.name || '';
  u.gender.value = p.gender || 'male';

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

  // ml/kg + preview
  u.mlkg.value = p.ml_per_kg ?? 35;
  const litres = computeHydroLitres(p.weight_kg, p.ml_per_kg);
  u.goalPrev.querySelector('strong').textContent = litres ? `${litres.toFixed(1).replace(/\.0$/, '')} L` : '—';
}

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

  // Unit switchers
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

  // Save
  u.save.addEventListener('click', ()=>{
    const r = readFromUI(u);
    if (!r.ok){
      u.error.style.display = 'block';
      u.error.textContent = 'Please check your entries.';
      return;
    }
    u.error.style.display = 'none';
    saveProfile(r.data);
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
}
export { ensureRoot as renderProfile, ensureRoot as initProfile };