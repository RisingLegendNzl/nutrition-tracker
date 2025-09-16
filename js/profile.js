// js/profile.js
// Profile module: manages first-run profile gate and persistent user stats
// Scoped to a dynamically inserted <main id="profilePage"> wrapper (no index.html changes).

import { clamp, showSnack } from './utils.js';

const KEY = 'profile_v1';
const listeners = new Set();

let root; // #profilePage element
let state = null; // cached profile or null

function nowDate(){
  return new Date().toISOString().slice(0,10);
}

// ---------- Storage ----------
export function getProfile(){
  if (state) return state;
  try{
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (isValid(obj)){ state = obj; return obj; }
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

export function onProfileChange(cb){
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function requireComplete(){
  return !!getProfile();
}

// ---------- Validation ----------
function isValid(p){
  if (!p) return false;
  const w = Number(p.weight_kg);
  const mlkg = Number(p.ml_per_kg);
  if (!Number.isFinite(w) || w < 30 || w > 300) return false;
  if (!Number.isFinite(mlkg) || mlkg < 20 || mlkg > 60) return false;
  // height is optional if empty or within range
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
    // Card markup uses existing classes; inputs have generic .field styling already.
    root.innerHTML = `
      <section class="card">
        <h2 class="section-title">Your Profile</h2>
        <div class="field"><label for="p_name">Name (optional)</label>
          <input id="p_name" type="text" placeholder="e.g., Jack"/></div>
        <div class="field">
          <label>Units</label>
          <div style="display:flex;gap:12px;align-items:center">
            <label><input id="p_units_metric" type="radio" name="units" value="metric" checked> Metric</label>
            <label><input id="p_units_imperial" type="radio" name="units" value="imperial"> Imperial</label>
          </div>
        </div>
        <div id="metricBlock">
          <div class="field"><label for="p_weight_kg">Weight (kg)</label>
            <input id="p_weight_kg" type="number" inputmode="decimal" placeholder="kg" min="30" max="300"/></div>
          <div class="field"><label for="p_height_cm">Height (cm) <span style="color:var(--muted)">(optional)</span></label>
            <input id="p_height_cm" type="number" inputmode="decimal" placeholder="cm" min="120" max="230"/></div>
        </div>
        <div id="imperialBlock" class="hidden">
          <div class="field"><label>Weight (lb)</label>
            <input id="p_weight_lb" type="number" inputmode="decimal" placeholder="lb" min="66" max="661"/></div>
          <div class="field"><label>Height (ft/in) <span style="color:var(--muted)">(optional)</span></label>
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
    // insert after header to mimic other pages
    const hdr = document.querySelector('.app-header');
    (hdr && hdr.nextSibling) ? hdr.parentNode.insertBefore(root, hdr.nextSibling) : document.body.appendChild(root);
  }
  return root;
}

function ui(){
  ensureRoot();
  return {
    page: root,
    name: document.getElementById('p_name'),
    unitsMetric: document.getElementById('p_units_metric'),
    unitsImperial: document.getElementById('p_units_imperial'),
    metricBlock: document.getElementById('metricBlock'),
    imperialBlock: document.getElementById('imperialBlock'),
    wkg: document.getElementById('p_weight_kg'),
    hcm: document.getElementById('p_height_cm'),
    wlb: document.getElementById('p_weight_lb'),
    hft: document.getElementById('p_height_ft'),
    hin: document.getElementById('p_height_in'),
    mlkg: document.getElementById('p_mlkg'),
    goalPrev: document.getElementById('p_goal_preview'),
    goalVal: document.getElementById('p_goal_value'),
    save: document.getElementById('p_save'),
    reset: document.getElementById('p_reset'),
    cancel: document.getElementById('p_cancel'),
    error: document.getElementById('p_error'),
  };
}

function defaults(){
  return {
    name: '',
    unit_system: 'metric',
    weight_kg: 71,
    height_cm: '',
    ml_per_kg: 35,
    created_at: nowDate(),
    updated_at: nowDate(),
  };
}

function readFromUI(u){
  const unit_system = u.unitsImperial.checked ? 'imperial' : 'metric';
  let weight_kg, height_cm;
  if (unit_system === 'metric'){
    weight_kg = Number(u.wkg.value);
    height_cm = u.hcm.value === '' ? '' : Number(u.hcm.value);
  }else{
    weight_kg = kgFromLbs(u.wlb.value);
    if (u.hft.value === '' && u.hin.value === '') height_cm = '';
    else height_cm = cmFromFeetIn(u.hft.value, u.hin.value);
  }
  const ml_per_kg = Number(u.mlkg.value || 35);
  return {
    name: u.name.value.trim(),
    unit_system,
    weight_kg,
    height_cm,
    ml_per_kg,
    created_at: getProfile()?.created_at || nowDate(),
    updated_at: nowDate(),
  };
}

function writeToUI(u, p){
  u.name.value = p.name || '';
  u.unitsMetric.checked = (p.unit_system !== 'imperial');
  u.unitsImperial.checked = (p.unit_system === 'imperial');
  if (p.unit_system === 'imperial'){
    const lbs = lbsFromKg(p.weight_kg);
    const [ft, inch] = p.height_cm ? feetFromCm(p.height_cm) : ['', ''];
    u.metricBlock.classList.add('hidden');
    u.imperialBlock.classList.remove('hidden');
    u.wlb.value = lbs || '';
    u.hft.value = ft || '';
    u.hin.value = inch || '';
    u.wkg.value = '';
    u.hcm.value = '';
  }else{
    u.metricBlock.classList.remove('hidden');
    u.imperialBlock.classList.add('hidden');
    u.wkg.value = p.weight_kg || '';
    u.hcm.value = (p.height_cm === '' ? '' : p.height_cm);
    u.wlb.value = '';
    u.hft.value = '';
    u.hin.value = '';
  }
  u.mlkg.value = p.ml_per_kg || 35;
  refreshPreview(u);
  updateCancelVisibility(u);
}

function refreshPreview(u){
  const temp = readFromUI(u);
  if (!Number.isFinite(temp.weight_kg)) { u.goalVal.textContent = '—'; return; }
  const L = computeHydroLitres(temp.weight_kg, clamp(temp.ml_per_kg,20,60));
  u.goalVal.textContent = `${L.toFixed(1)} L`;
}

function updateCancelVisibility(u){
  const has = !!getProfile();
  if (has) u.cancel.classList.remove('hidden');
  else u.cancel.classList.add('hidden');
}

function showError(u, msg){
  u.error.textContent = msg || '';
  u.error.style.display = msg ? 'block' : 'none';
}

// ---------- Public: init/mount ----------
export function mountProfile(){
  const u = ui();
  const existing = getProfile();
  const initial = existing || defaults();
  writeToUI(u, initial);

  // Events
  u.unitsMetric.addEventListener('change', () => writeToUI(u, { ...readFromUI(u), unit_system:'metric' }));
  u.unitsImperial.addEventListener('change', () => writeToUI(u, { ...readFromUI(u), unit_system:'imperial' }));
  [u.wkg, u.hcm, u.wlb, u.hft, u.hin, u.mlkg, u.name].forEach(el => {
    el && el.addEventListener('input', () => { showError(u, ''); refreshPreview(u); });
  });

  u.save.addEventListener('click', () => {
    const draft = readFromUI(u);
    if (!isValid(draft)){
      showError(u, 'Please enter a valid weight (30–300 kg) and ml/kg (20–60). Height is optional.');
      return;
    }
    saveProfile(draft);
    hide();
  });
  u.reset.addEventListener('click', () => {
    writeToUI(u, defaults());
    showError(u, '');
  });
  u.cancel.addEventListener('click', () => {
    hide();
  });

  // Gate on first run
  if (!existing) show();
  else hide();
}

// ---------- Visibility control ----------
export function show(){
  ensureRoot();
  root.classList.remove('hidden');
  // hide other pages to make it clear this is a first-run gate
  ['dietPage','suppsPage','hydroPage'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add('hidden'); });
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(btn => btn.setAttribute('disabled', 'disabled'));
}
export function hide(){
  if (!root) return;
  root.classList.add('hidden');
  ['dietPage','suppsPage','hydroPage'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.remove('hidden'); });
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(btn => btn.removeAttribute('disabled'));
}