// js/profile.js
// Profile module: manages first-run profile gate, persistent user stats, and an always-present Edit button.
// Scoped to a dynamically inserted <main id="profilePage"> wrapper (no index.html changes).
// This version adds per-field unit toggles (Weight: kg/lb, Height: cm/ft+in) and keeps storage canonical (kg/cm).

import { clamp, showSnack } from './utils.js';

const KEY = 'profile_v1';
const listeners = new Set();

let root; // #profilePage element
let editBtn; // header "Edit Profile" button
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
  // Add display prefs if missing
  if (!('weight_unit' in p)) p.weight_unit = 'kg';
  if (!('height_unit' in p)) p.height_unit = 'cm';
  return p;
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
    // Card markup uses existing classes; inputs have generic .field styling already.
    // Unit segmented controls are wrapped in "input-like" chrome so they match text fields.
    root.innerHTML = `
      <section class="card">
        <h2 class="section-title" id="p_title">Your Profile</h2>
        <div class="field"><label for="p_name">Name (optional)</label>
          <input id="p_name" type="text" placeholder="e.g., Jack"/></div>

        <div class="field">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <label for="p_weight_value" style="margin:0">Weight</label>
            <div class="input-like" style="display:inline-flex;align-items:center;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:2px;">
              <div class="seg" role="tablist" aria-label="Weight unit">
                <button id="u_w_kg" class="seg-btn" data-unit="kg" aria-selected="true">kg</button>
                <button id="u_w_lb" class="seg-btn" data-unit="lb" aria-selected="false">lb</button>
              </div>
            </div>
          </div>
          <input id="p_weight_value" type="number" inputmode="decimal" placeholder="kg" min="30" max="300"/>
        </div>

        <div class="field">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
            <label style="margin:0">Height <span style="color:var(--muted)">(optional)</span></label>
            <div class="input-like" style="display:inline-flex;align-items:center;background:var(--input-bg);border:1px solid var(--border);border-radius:6px;padding:2px;">
              <div class="seg" role="tablist" aria-label="Height unit">
                <button id="u_h_cm" class="seg-btn" data-unit="cm" aria-selected="true">cm</button>
                <button id="u_h_ftin" class="seg-btn" data-unit="ftin" aria-selected="false">ft/in</button>
              </div>
            </div>
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
    // insert after header to mimic other pages
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
    // weight
    weightVal: document.getElementById('p_weight_value'),
    wKgBtn: document.getElementById('u_w_kg'),
    wLbBtn: document.getElementById('u_w_lb'),
    // height
    hModeCmBtn: document.getElementById('u_h_cm'),
    hModeFtInBtn: document.getElementById('u_h_ftin'),
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
    // prefs
    weight_unit: 'kg',  // 'kg' | 'lb'
    height_unit: 'cm',  // 'cm' | 'ftin'
    // canonical
    weight_kg: 71,
    height_cm: '',
    ml_per_kg: 35,
    created_at: nowDate(),
    updated_at: nowDate(),
  };
}

function readFromUI(u){
  const prefs = {
    weight_unit: u.wLbBtn.getAttribute('aria-selected') === 'true' ? 'lb' : 'kg',
    height_unit: u.hModeFtInBtn.getAttribute('aria-selected') === 'true' ? 'ftin' : 'cm',
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
  const ml_per_kg = Number(u.mlkg.value || 35);
  return {
    name: u.name.value.trim(),
    ...prefs,
    weight_kg,
    height_cm,
    ml_per_kg,
    created_at: getProfile()?.created_at || nowDate(),
    updated_at: nowDate(),
  };
}

function writeToUI(u, p){
  const profile = migrate({ ...defaults(), ...p });
  // Title tweak if first run
  u.title.textContent = getProfile() ? 'Edit Profile' : "Let's set up your profile";

  // prefs → buttons
  selectSeg(u.wKgBtn, u.wLbBtn, profile.weight_unit === 'kg' ? 'kg' : 'lb');
  selectSeg(u.hModeCmBtn, u.hModeFtInBtn, profile.height_unit === 'cm' ? 'cm' : 'ftin');

  // weight display
  if (profile.weight_unit === 'kg'){
    u.weightVal.placeholder = 'kg';
    u.weightVal.min = '30'; u.weightVal.max = '300';
    u.weightVal.value = profile.weight_kg || '';
  }else{
    u.weightVal.placeholder = 'lb';
    u.weightVal.min = '66'; u.weightVal.max = '661';
    u.weightVal.value = lbsFromKg(profile.weight_kg) || '';
  }

  // height display
  if (profile.height_unit === 'cm'){
    u.hcmBlock.classList.remove('hidden');
    u.hftinBlock.classList.add('hidden');
    u.hcm.value = (profile.height_cm === '' ? '' : profile.height_cm);
    u.hft.value = ''; u.hin.value = '';
  }else{
    u.hcmBlock.classList.add('hidden');
    u.hftinBlock.classList.remove('hidden');
    const [ft, inch] = profile.height_cm ? feetFromCm(profile.height_cm) : ['', ''];
    u.hft.value = ft || '';
    u.hin.value = inch || '';
    u.hcm.value = '';
  }

  u.name.value = profile.name || '';
  u.mlkg.value = profile.ml_per_kg || 35;

  refreshPreview(u);
  updateCancelVisibility(u);
}

function selectSeg(onBtn, offBtn, which){
  if (which === onBtn.dataset.unit){
    onBtn.setAttribute('aria-selected','true');
    offBtn.setAttribute('aria-selected','false');
  }else{
    onBtn.setAttribute('aria-selected','false');
    offBtn.setAttribute('aria-selected','true');
  }
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
  ensureEditButton();

  const existing = getProfile();
  const initial = existing || defaults();
  writeToUI(u, initial);

  // Events: seg toggles
  u.wKgBtn.addEventListener('click', () => { selectSeg(u.wKgBtn,u.wLbBtn,'kg'); writeToUI(u, { ...readFromUI(u), weight_unit:'kg' }); });
  u.wLbBtn.addEventListener('click', () => { selectSeg(u.wKgBtn,u.wLbBtn,'lb'); writeToUI(u, { ...readFromUI(u), weight_unit:'lb' }); });
  u.hModeCmBtn.addEventListener('click', () => { selectSeg(u.hModeCmBtn,u.hModeFtInBtn,'cm'); writeToUI(u, { ...readFromUI(u), height_unit:'cm' }); });
  u.hModeFtInBtn.addEventListener('click', () => { selectSeg(u.hModeCmBtn,u.hModeFtInBtn,'ftin'); writeToUI(u, { ...readFromUI(u), height_unit:'ftin' }); });

  // Inputs live preview
  [u.weightVal, u.hcm, u.hft, u.hin, u.mlkg, u.name].forEach(el => {
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
  if (!existing) show(true);
  else hide();
}

// ---------- Visibility control ----------
export function show(firstRun=false){
  ensureRoot();
  ensureEditButton();
  root.classList.remove('hidden');
  // hide other pages to make it clear this is a first-run gate
  ['dietPage','suppsPage','hydroPage'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add('hidden'); });
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(btn => btn.setAttribute('disabled', 'disabled'));
  if (editBtn) editBtn.classList.add('hidden');
  // title tweak
  const t = document.getElementById('p_title');
  if (t) t.textContent = firstRun ? "Let's set up your profile" : 'Edit Profile';
}
export function hide(){
  if (!root) return;
  root.classList.add('hidden');
  ['dietPage','suppsPage','hydroPage'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.remove('hidden'); });
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(btn => btn.removeAttribute('disabled'));
  if (editBtn) editBtn.classList.remove('hidden');
}