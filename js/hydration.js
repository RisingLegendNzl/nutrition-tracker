// filename: js/hydration.js
import {
  AEST_DATE, clamp, toLitres,
  WATER_TARGET_KEY, WATER_PREFIX
} from "./utils.js";
import { getProfile, onProfileChange } from "./profile.js";

/**
 * Hydration module (human silhouette, manual goal only)
 * - Blue water rises upward inside a gendered human mask.
 * - Goal is user-set and CLAMPED to 1500–3000 ml.
 * - Logged water is CAPPED at the goal (max 100% fill).
 */

// ---------- DOM ----------
const goalLitresEl = document.getElementById('goalLitres');
const goalMlEl     = document.getElementById('goalMl');
const editGoalBtn  = document.getElementById('editGoalBtn');

function bottleEl(){ return document.querySelector('.bottle'); }
const bottleFill = document.getElementById('bottleFill');
const todayStr   = document.getElementById('todayStr');
const pctStr     = document.getElementById('pctStr');

const quickBtns   = document.querySelectorAll('.pill-btn');
const customMl    = document.getElementById('customMl');
const addCustom   = document.getElementById('addCustom');
const resetWater  = document.getElementById('resetWater');
const hydroHistory= document.getElementById('hydroHistory');

// ---------- Storage helpers ----------
function waterKey(dateStr = AEST_DATE()) { return WATER_PREFIX + dateStr; }
function saveWater(total_ml, target_ml, dateStr = AEST_DATE()){
  localStorage.setItem(waterKey(dateStr), JSON.stringify({
    total_ml: Math.max(0, total_ml),
    target_ml
  }));
}
function loadWater(dateStr = AEST_DATE()){
  try{ return JSON.parse(localStorage.getItem(waterKey(dateStr)) || '{"total_ml":0,"target_ml":null}'); }
  catch{ return { total_ml:0, target_ml:null }; }
}

// ---------- Config ----------
const DEFAULT_MANUAL_TARGET_ML = 3000; // 3.0 L max
const MIN_TARGET_ML            = 1500; // sensible lower bound
const MAX_TARGET_ML            = 3000; // hard cap (requested)

// ---------- Profile / Mask ----------
function absUrl(rel){ return new URL(rel, document.baseURI).toString(); }
function maleMaskURL(){   return `url('${absUrl("img/male.png")}')`; }   // you set this file
function femaleMaskURL(){ return `url('${absUrl("img/female.png")}')`; } // and this file

function applyHumanMask(){
  const el = bottleEl();
  if (!el) return;
  el.classList.add('human-mask');
  const gender = (getProfile()?.gender || 'male').toLowerCase();
  el.style.setProperty('--human-mask', gender === 'female' ? femaleMaskURL() : maleMaskURL());
}

// ---------- Target helpers ----------
function currentTargetMl(){
  // Manual-only mode: read saved goal (clamped), fallback to default (3,000 ml)
  const raw = parseInt(localStorage.getItem(WATER_TARGET_KEY) || "0", 10);
  const clamped = clamp((Number.isFinite(raw) ? raw : DEFAULT_MANUAL_TARGET_ML), MIN_TARGET_ML, MAX_TARGET_ML);
  return clamped || DEFAULT_MANUAL_TARGET_ML;
}

// ---------- Rendering ----------
function animateFill(totalMl, targetMl){
  const pct = clamp((totalMl / targetMl) * 100, 0, 100);
  bottleFill?.style.setProperty('--fill', pct + '%');
  pctStr.textContent = `${Math.round(pct)}%`;
}

function renderHydroNumbers(totalMl, targetMl){
  todayStr.textContent = `Today: ${toLitres(totalMl)} L / ${toLitres(targetMl)} L`;
  goalLitresEl.textContent = (targetMl / 1000).toFixed(1).replace(/\.0$/, '');
  goalMlEl.textContent = targetMl;
}

function renderHistory(){
  const daysArr = [];
  const now = new Date(new Date().toLocaleString("en-US",{ timeZone:"Australia/Brisbane" }));
  for (let i=6;i>=0;i--){
    const d = new Date(now); d.setDate(d.getDate()-i);
    const ds = new Date(d).toLocaleString("en-CA",{ timeZone:"Australia/Brisbane" }).slice(0,10);
    const rec = loadWater(ds);
    const tgt = clamp(rec.target_ml || currentTargetMl(), MIN_TARGET_ML, MAX_TARGET_ML);
    const total = Math.min(rec.total_ml || 0, tgt); // cap history display at 100%
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
  const cappedTotal = Math.min(rec.total_ml || 0, target); // enforce 100% cap on render
  if (rec.target_ml !== target || cappedTotal !== rec.total_ml) saveWater(cappedTotal, target);
  renderHydroNumbers(cappedTotal, target);
  requestAnimationFrame(()=> animateFill(cappedTotal, target));
  renderHistory();
}

// ---------- Mutations ----------
function addWater(ml){
  const tgt = currentTargetMl();
  const w = loadWater();
  const next = Math.min((w.total_ml || 0) + ml, tgt); // cap at goal
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
  // Quick adds
  quickBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amt = parseInt(btn.getAttribute('data-ml')||'0',10)||0;
      if (amt>0) addWater(amt);
    });
  });

  // Custom add
  if (addCustom && customMl){
    addCustom.addEventListener('click', ()=>{
      const amt = parseInt(customMl.value||'0',10)||0;
      if (amt>0) addWater(amt);
      customMl.value = '';
    });
  }

  // Reset
  resetWater?.addEventListener('click', ()=> resetTodayWater());

  // Manual goal edit (CLAMP 1500–3000 ml)
  editGoalBtn?.addEventListener('click', ()=>{
    const current = currentTargetMl();
    const val = prompt("Set daily water goal (ml). Range: 1500–3000 ml.", String(current));
    if (val===null) return;
    const ml = clamp(parseInt(val,10)||0, MIN_TARGET_ML, MAX_TARGET_ML);
    localStorage.setItem(WATER_TARGET_KEY, String(ml));
    renderHydro();
  });

  // Profile changes (for gender mask)
  onProfileChange(()=> renderHydro());

  // Initial paint
  renderHydro();
}