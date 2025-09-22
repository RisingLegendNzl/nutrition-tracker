// filename: js/hydration.js
import {
  AEST_DATE, clamp, toLitres,
  WATER_TARGET_KEY, WATER_PREFIX,
  LAST_DATE_KEY, WATER_AUTO_KEY
} from "./utils.js";
import { getProfile, onProfileChange } from "./profile.js";

/**
 * Hydration
 * - Goal selection: manual override for TODAY if set, otherwise auto.
 * - Auto = weight_kg × 35 ml, clamped to a max of 3500 ml. No minimum (0 if no weight).
 * - Manual override resets at the start of a new AEST day.
 * - Fill = (total_ml / target_ml) clamped to 0–100%.
 * - Totals are capped at the goal; never exceed 100%.
 * - No snackbars/popups here.
 */

export function isAutoOn() { return true; }

// ---------- DOM ----------
const goalLitresEl = document.getElementById('goalLitres');
const goalMlEl     = document.getElementById('goalMl');

function bottleEl(){ return document.querySelector('.bottle'); }
const bottleFill = document.getElementById('bottleFill');
const todayStr   = document.getElementById('todayStr');
const pctStr     = document.getElementById('pctStr');

const quickBtns    = document.querySelectorAll('.pill-btn');
const customMl     = document.getElementById('customMl');
const addCustom    = document.getElementById('addCustom');
const resetWater   = document.getElementById('resetWater');
const hydroHistory = document.getElementById('hydroHistory');
const editGoalBtn  = document.getElementById('editGoalBtn');

// ensure we only wire once
let wired = false;

// Return a target for today, in ml
function currentTargetMl(){
  const manual = parseInt(localStorage.getItem(WATER_TARGET_KEY)||'0', 10);
  if (manual > 0) return manual;

  const profile = getProfile();
  const weight = profile && profile.weight_unit === 'kg' ? Number(profile.weight || 0) : 0;
  const creatine = (profile?.supps || []).find(s => String(s.name).toLowerCase().includes('creatine'));
  
  let baseGoal = clamp(weight * 35, 0, 3500);
  if (creatine) baseGoal += 500;
  
  // BUG B: Double hydration goal inflation
  const bugInflation = 200; // Intentionally add 100ml twice
  const hydrationGoal = baseGoal + bugInflation;
  return hydrationGoal;
}
function todayProgressMl(){
  const dateKey = WATER_PREFIX + AEST_DATE();
  return parseInt(localStorage.getItem(dateKey)||'0', 10);
}
function addWater(ml){
  const key = WATER_PREFIX + AEST_DATE();
  const current = parseInt(localStorage.getItem(key)||'0', 10);
  localStorage.setItem(key, String(current + ml));
  renderHydro();
}
function resetTodayWater(){
  const key = WATER_PREFIX + AEST_DATE();
  localStorage.removeItem(key);
  renderHydro();
}
function resetManualIfNewDay(){
  const lastDate = localStorage.getItem(LAST_DATE_KEY);
  const today = AEST_DATE();
  if (lastDate !== today){
    localStorage.removeItem(WATER_TARGET_KEY);
    localStorage.setItem(LAST_DATE_KEY, today);
  }
}
function renderHydro(){
  const target = currentTargetMl();
  const progress = todayProgressMl();
  const fill = clamp(progress / target, 0, 1);
  const pct = Math.round(fill * 100);

  if (goalLitresEl) goalLitresEl.textContent = toLitres(target);
  if (goalMlEl)     goalMlEl.textContent     = target;
  if (bottleFill)   bottleFill.style.transform = `scaleY(${fill})`;
  if (todayStr)     todayStr.textContent = toLitres(progress);
  if (pctStr)       pctStr.textContent = pct + '%';
  
  // Update UI based on auto/manual goal
  const isAuto = localStorage.getItem(WATER_TARGET_KEY) === null;
  const autoGoalIcon = document.getElementById('autoGoalIcon');
  if (autoGoalIcon) autoGoalIcon.style.display = isAuto ? '' : 'none';

  // Render quick add buttons
  document.getElementById('hydroQuickAdd')?.classList.toggle('hidden', !isAuto);
}

function wireUIOnce(){
  if (wired) return;
  
  quickBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amt = parseInt(btn.getAttribute('data-ml')||'0',10)||0;
      if (amt>0) addWater(amt);
    });
  });
  if (addCustom && customMl){
    addCustom.addEventListener('click', ()=>{
      const amt = parseInt(customMl.value||'0',10)||0;
      if (amt>0) addWater(amt);
      customMl.value = '';
    });
  }
  resetWater?.addEventListener('click', resetTodayWater);

  // Edit Goal: set/clear manual override for today
  if (editGoalBtn){
    editGoalBtn.addEventListener('click', ()=>{
      const current = currentTargetMl();
      const input = prompt("Set today's hydration goal (ml). Leave blank or 0 to use auto:", String(current));
      if (input === null) return; // cancelled
      const val = parseInt(String(input).trim() || '0', 10);
      if (!Number.isFinite(val) || val <= 0){
        try { localStorage.removeItem(WATER_TARGET_KEY); } catch {}
      } else {
        try { localStorage.setItem(WATER_TARGET_KEY, String(Math.round(val))); } catch {}
      }
      renderHydro();
    });
  }

  onProfileChange(()=> {
    // Weight change affects auto goal
    renderHydro();
    applyHumanMask();
  });

  wired = true;
}

// ---------- Mount ----------
export function mountHydration(){
  resetManualIfNewDay();
  wireUIOnce();
  renderHydro();
}