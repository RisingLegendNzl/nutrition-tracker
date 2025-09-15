// js/app.js
import { mountDiet, renderDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';
import { getProfile, saveProfile, applyDietGoalsFrom, deriveAgeFromDob } from './utils.js';

// IDs that exist in index.html
const tabButtons = {
  diet: document.getElementById('tabDiet'),
  supps: document.getElementById('tabSupps'),
  hydro: document.getElementById('tabHydro'),
};

const views = {
  diet:  document.getElementById('dietPage'),
  supps: document.getElementById('suppsPage'),
  hydro: document.getElementById('hydroPage'),
};

// Profile UI
const profileSheet = document.getElementById('profilePage');
const openProfileBtn = document.getElementById('openProfile');
const profileForm = document.getElementById('profileForm');
const skipProfileBtn = document.getElementById('skipProfile');

let mounted = false;

function show(view){
  for (const k in views){
    views[k].classList.toggle('hidden', k !== view);
    tabButtons[k].classList.toggle('active', k === view);
  }
}

function wireTabs() {
  tabButtons.diet.addEventListener('click', () => show('diet'));
  tabButtons.supps.addEventListener('click', () => show('supps'));
  tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

function mountAll(){
  if (mounted) return;
  mounted = true;
  mountDiet();
  mountSupps();
  mountHydration();
}

function openProfile(){
  // Prefill if exists
  const p = getProfile();
  if (p){
    document.getElementById('pfName').value = p.name || '';
    document.getElementById('pfSex').value = p.sex || 'NA';
    document.getElementById('pfDob').value = p.dob || '';
    document.getElementById('pfAge').value = p.age || '';
    document.getElementById('pfHeight').value = p.height_cm || '';
    document.getElementById('pfWeight').value = p.weight_kg || '';
    document.getElementById('pfActivity').value = p.activity || 'moderate';
    document.getElementById('pfGoal').value = p.goal || 'maintain';
    const t = p.targets || {};
    document.getElementById('pfCal').value = t.calories || '';
    document.getElementById('pfPro').value = t.protein_g || '';
    document.getElementById('pfFib').value = t.fibre_g || '';
    document.getElementById('pfFe').value  = t.iron_mg || '';
    document.getElementById('pfZn').value  = t.zinc_mg || '';
    document.getElementById('pfWaterL').value = t.water_L || '';
  } else {
    // clear
    ['pfName','pfDob','pfAge','pfHeight','pfWeight','pfCal','pfPro','pfFib','pfFe','pfZn','pfWaterL'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('pfSex').value = 'NA';
    document.getElementById('pfActivity').value='moderate';
    document.getElementById('pfGoal').value='maintain';
  }
  profileSheet.classList.remove('hidden');
}

function closeProfile(){
  profileSheet.classList.add('hidden');
}

function ensureProfileGate(){
  const p = getProfile();
  if (!p){
    // gate: open sheet and hide main views until saved/skipped
    openProfile();
    for (const k in views){ views[k].classList.add('hidden'); }
  } else {
    applyDietGoalsFrom(p);
    mountAll();
    show('diet');
  }
}

function handleProfileSubmit(ev){
  ev.preventDefault();
  const name = document.getElementById('pfName').value.trim();
  const sex = document.getElementById('pfSex').value;
  const dob = document.getElementById('pfDob').value || null;
  let age = parseInt(document.getElementById('pfAge').value,10);
  if (!age || age<10) age = deriveAgeFromDob(dob) || null;
  const height_cm = parseInt(document.getElementById('pfHeight').value,10) || null;
  const weight_kg = parseFloat(document.getElementById('pfWeight').value) || null;
  const activity = document.getElementById('pfActivity').value;
  const goal = document.getElementById('pfGoal').value;
  const t = {
    calories: parseInt(document.getElementById('pfCal').value,10) || null,
    protein_g: parseInt(document.getElementById('pfPro').value,10) || null,
    fibre_g:   parseInt(document.getElementById('pfFib').value,10) || null,
    iron_mg:   parseInt(document.getElementById('pfFe').value,10)  || null,
    zinc_mg:   parseInt(document.getElementById('pfZn').value,10)  || null,
    water_L:   parseFloat(document.getElementById('pfWaterL').value) || null
  };
  const existing = getProfile();
  const profile = {
    version: 1,
    name, sex, dob, age, height_cm, weight_kg,
    activity, goal,
    targets: t,
    created_at: (existing ? existing.created_at : new Date().toISOString().slice(0,10)),
    updated_at: new Date().toISOString().slice(0,10)
  };
  if (!profile.age) profile.age = deriveAgeFromDob(profile.dob) || 25;

  saveProfile(profile);
  applyDietGoalsFrom(profile);

  closeProfile();
  mountAll();
  renderDiet(); // refresh bars with new goals
  show('diet');
}

document.addEventListener('DOMContentLoaded', () => {
  wireTabs();

  openProfileBtn.addEventListener('click', openProfile);
  profileForm.addEventListener('submit', handleProfileSubmit);
  skipProfileBtn.addEventListener('click', ()=>{
    const p = {
      version:1,
      name:'',
      sex:'NA',
      dob:null,
      age:25,
      height_cm:175,
      weight_kg:70,
      activity:'moderate',
      goal:'maintain',
      targets:{}
    };
    saveProfile(p);
    applyDietGoalsFrom(p);
    closeProfile();
    mountAll();
    show('diet');
  });

  ensureProfileGate();
});