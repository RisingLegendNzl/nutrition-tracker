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

// ensure we only wire listeners once
let wired = false;

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

// ---------- Auto & current goal helpers ----------
function autoGoalMl(){
  const w = Number(getProfile()?.weight_kg);
  if (!Number.isFinite(w) || w <= 0) {
    try { localStorage.setItem(WATER_AUTO_KEY, JSON.stringify(0)); } catch {}
    return 0;
  }
  let ml = Math.round(w * 35);
  try {
    const supps = JSON.parse(localStorage.getItem('supps_v1') || '[]');
    const creatineOn = !!(supps||[]).find(s => String(s.name||'').toLowerCase().includes('creatine'));
    if (creatineOn) ml += 500;
  } catch {}
  const capped = Math.min(ml, 3500);
  try { localStorage.setItem(WATER_AUTO_KEY, JSON.stringify(capped)); } catch {}
  return capped;
}

function currentTargetMl(){
  // Manual override for today?
  const raw = parseInt(localStorage.getItem(WATER_TARGET_KEY) || "0", 10);
  if (Number.isFinite(raw) && raw > 0) return Math.round(raw);
  // Fallback to auto (no min floor)
  return Math.max(0, Math.round(autoGoalMl()));
}

// ---------- Rendering ----------
function animateFill(totalMl, targetMl){
  const pct = targetMl > 0 ? clamp((totalMl / targetMl) * 100, 0, 100) : 0;
  if (bottleFill) bottleFill.style.setProperty('--fill', pct + '%');
  if (pctStr) pctStr.textContent = `${Math.round(pct)}%`;
}

function renderHydroNumbers(totalMl, targetMl){
  if (todayStr) todayStr.textContent =
    `Today: ${toLitres(totalMl)} L (${totalMl} ml) / ${toLitres(targetMl)} L`;
  if (goalLitresEl) goalLitresEl.textContent = (targetMl / 1000).toFixed(1).replace(/\.0$/, '');
  if (goalMlEl) goalMlEl.textContent = targetMl;
}

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

// ---------- History ----------
function renderHistory(){
  if (!hydroHistory) return;
  const daysArr = [];
  const now = new Date(new Date().toLocaleString("en-US",{ timeZone:"Australia/Brisbane" }));
  for (let i=6;i>=0;i--){
    const d = new Date(now); d.setDate(d.getDate()-i);
    const ds = new Date(d).toLocaleString("en-CA",{ timeZone:"Australia/Brisbane" }).slice(0,10);
    const rec = loadWater(ds);
    const tgt = Number(rec.target_ml) > 0 ? Number(rec.target_ml) : autoGoalMl();
    const total = tgt > 0 ? Math.min(rec.total_ml || 0, tgt) : 0;
    const pct = tgt > 0 ? clamp((total / tgt) * 100, 0, 100) : 0;
    daysArr.push({ label: ds.slice(5), pct });
  }
  hydroHistory.innerHTML = daysArr.map(({label,pct})=>`
    <div class="hbar">
      <div class="hbar-bar"><span style="height:${pct}%;"></span></div>
      <div class="hbar-lab">${label}</div>
    </div>
  `).join('');
}

// ---------- Daily reset of manual override ----------
function resetManualIfNewDay(){
  const today = AEST_DATE();
  const last = localStorage.getItem(LAST_DATE_KEY);
  if (last !== today){
    try { localStorage.setItem(LAST_DATE_KEY, today); } catch {}
    try { localStorage.removeItem(WATER_TARGET_KEY); } catch {}
  }
}

// ---------- Render root ----------
export function renderHydro(){
  applyHumanMask();
  const target = currentTargetMl();
  const rec = loadWater();
  const cappedTotal = target > 0 ? Math.min(rec.total_ml || 0, target) : 0;

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
  const next = tgt > 0 ? Math.min((w.total_ml || 0) + amt, tgt) : (w.total_ml || 0);

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

// ---------- Wire once ----------
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

// NOTE: Routing is handled by app.js which calls mountHydration on the Hydration route.
// We intentionally DO NOT add any route listeners here to avoid double-mounting.
