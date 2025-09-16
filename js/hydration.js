// filename: js/hydration.js
import {
  AEST_DATE, clamp, toLitres,
  WATER_TARGET_KEY, WATER_PREFIX
} from "./utils.js";
import { getProfile, onProfileChange } from "./profile.js";

/**
 * Hydration module (human silhouette, manual goal only)
 * - Fill = (total_ml / target_ml) clamped to 0–100%.
 * - Totals are capped at the goal; never exceed 100%.
 * - No snackbars/popups.
 */

// ---- Compatibility export (for supps.js, always false here) ----
export function isAutoOn() { return false; }

// ---------- DOM ----------
const goalLitresEl = document.getElementById('goalLitres');
const goalMlEl     = document.getElementById('goalMl');
const editGoalBtn  = document.getElementById('editGoalBtn'); // (hook reserved)

function bottleEl(){ return document.querySelector('.bottle'); }
const bottleFill = document.getElementById('bottleFill');
const todayStr   = document.getElementById('todayStr');
const pctStr     = document.getElementById('pctStr');

const quickBtns    = document.querySelectorAll('.pill-btn');
const customMl     = document.getElementById('customMl');
const addCustom    = document.getElementById('addCustom');
const resetWater   = document.getElementById('resetWater');
const hydroHistory = document.getElementById('hydroHistory');

// ---------- Storage helpers ----------
function waterKey(dateStr = AEST_DATE()) { return WATER_PREFIX + dateStr; }
function saveWater(total_ml, target_ml, dateStr = AEST_DATE()){
  localStorage.setItem(waterKey(dateStr), JSON.stringify({
    total_ml: Math.max(0, Math.round(total_ml)),
    target_ml: Math.round(target_ml)
  }));
}
function loadWater(dateStr = AEST_DATE()){
  try{ return JSON.parse(localStorage.getItem(waterKey(dateStr)) || '{"total_ml":0,"target_ml":null}'); }
  catch{ return { total_ml:0, target_ml:null }; }
}

// ---------- Config ----------
const DEFAULT_MANUAL_TARGET_ML = 3000; // 3.0 L default
const MIN_TARGET_ML            = 1500;
const MAX_TARGET_ML            = 3000;

// ---------- Profile / Mask ----------
function absUrl(rel){ return new URL(rel, document.baseURI).toString(); }
function maleMaskURL(){   return `url('${absUrl("img/male.png")}')`; }
function femaleMaskURL(){ return `url('${absUrl("img/female.png")}')`; }

function applyHumanMask(){
  const el = bottleEl();
  if (!el) return;
  el.classList.add('human-mask');
  const gender = (getProfile()?.gender || 'male').toLowerCase();
  el.style.setProperty('--human-mask', gender === 'female' ? femaleMaskURL() : maleMaskURL());
}

// ---------- Target helpers ----------
function currentTargetMl(){
  const raw = parseInt(localStorage.getItem(WATER_TARGET_KEY) || "0", 10);
  const base = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_MANUAL_TARGET_ML;
  return clamp(base, MIN_TARGET_ML, MAX_TARGET_ML);
}

// ---------- Rendering ----------
function animateFill(totalMl, targetMl){
  const pct = clamp((totalMl / targetMl) * 100, 0, 100);
  if (bottleFill) bottleFill.style.setProperty('--fill', pct + '%');
  if (pctStr) pctStr.textContent = `${Math.round(pct)}%`;
}

function renderHydroNumbers(totalMl, targetMl){
  if (todayStr) todayStr.textContent =
    `Today: ${toLitres(totalMl)} L (${totalMl} ml) / ${toLitres(targetMl)} L`;
  if (goalLitresEl) goalLitresEl.textContent = (targetMl / 1000).toFixed(1).replace(/\.0$/, '');
  if (goalMlEl) goalMlEl.textContent = targetMl;
}

function renderHistory(){
  if (!hydroHistory) return;
  const daysArr = [];
  const now = new Date(new Date().toLocaleString("en-US",{ timeZone:"Australia/Brisbane" }));
  for (let i=6;i>=0;i--){
    const d = new Date(now); d.setDate(d.getDate()-i);
    const ds = new Date(d).toLocaleString("en-CA",{ timeZone:"Australia/Brisbane" }).slice(0,10);
    const rec = loadWater(ds);
    const tgt = clamp(rec.target_ml || currentTargetMl(), MIN_TARGET_ML, MAX_TARGET_ML);
    const total = Math.min(rec.total_ml || 0, tgt);
    const pct = clamp((total / tgt) * 100, 0, 100);
    daysArr.push({ label: ds.slice(5), pct });
  }
  hydroHistory.innerHTML = daysArr.map(({label,pct})=>`
    <div class="hbar">
      <div class="hbar-bar"><span style="height:${pct}%;"></span></div>
      <div class="hbar-lab">${label}</div>
    </div>
  `).join('');
}

export function renderHydro(){
  applyHumanMask();
  const target = currentTargetMl();
  const rec = loadWater();
  const cappedTotal = Math.min(rec.total_ml || 0, target);

  // Keep persisted record consistent with clamps/caps.
  if (rec.target_ml !== target || cappedTotal !== rec.total_ml) {
    saveWater(cappedTotal, target);
  }

  renderHydroNumbers(cappedTotal, target);
  requestAnimationFrame(()=> animateFill(cappedTotal, target));
  renderHistory();
}

// ---------- Mutations ----------
function addWater(ml){
  const amt = Math.max(0, Math.round(ml) || 0);
  if (!amt) return;

  const tgt = currentTargetMl();
  const w = loadWater();
  const next = Math.min((w.total_ml || 0) + amt, tgt);

  saveWater(next, tgt);
  animateFill(next, tgt);
  renderHydroNumbers(next, tgt);
  renderHistory();
}

function resetTodayWater(){
  const tgt = currentTargetMl();
  saveWater(0, tgt);
  renderHydro();
}

// ---------- Mount ----------
export function mountHydration(){
  renderHydro();

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

  // If profile gender changes, re-apply mask
  onProfileChange(()=> applyHumanMask());
}

// --- Router hookup: Hydration ---
function _rerenderHydro(){
  if (typeof mountHydration === 'function') return mountHydration();
  if (typeof renderHydro === 'function')    return renderHydro();
  if (typeof initHydration === 'function')  return initHydration();
  if (typeof Hydration?.render === 'function') return Hydration.render();
  if (typeof Hydration?.mount  === 'function') return Hydration.mount();
}

window.addEventListener('route:show', (e)=>{
  if (e.detail?.page === 'hydro') _rerenderHydro();
});

// If last page was Hydration, run once on load
if (sessionStorage.getItem('nutrify_last_page') === 'hydro') _rerenderHydro();