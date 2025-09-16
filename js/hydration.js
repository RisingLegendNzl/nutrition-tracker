// filename: js/hydration.js
import {
  AEST_DATE, clamp, toLitres,
  WATER_TARGET_KEY, WATER_AUTO_KEY, WATER_PREFIX, SUPPS_KEY
} from "./utils.js";
import { getProfile, onProfileChange } from "./profile.js";

/**
 * Hydration module (human silhouette)
 * - Water is blue and rises upward inside a gendered human mask.
 * - Mask is applied via CSS `mask-image`/`-webkit-mask-image`.
 * - Auto-goal uses profile weight (kg) * ml_per_kg (+ creatine bump).
 */

// ---------- DOM ----------
const goalLitresEl = document.getElementById('goalLitres');
const goalMlEl     = document.getElementById('goalMl');
const editGoalBtn  = document.getElementById('editGoalBtn');
const autoGoalEl   = document.getElementById('autoGoal');

const bottleEl   = document.querySelector('.bottle'); // we reuse the same wrapper
const bottleFill = document.getElementById('bottleFill');
const todayStr   = document.getElementById('todayStr');
const pctStr     = document.getElementById('pctStr');

const quickBtns   = document.querySelectorAll('.pill-btn');
const customMl    = document.getElementById('customMl');
const addCustom   = document.getElementById('addCustom');
const resetWater  = document.getElementById('resetWater');
const hydroHistory= document.getElementById('hydroHistory');

// ---------- Storage helpers ----------
function waterKey(dateStr = AEST_DATE()) {
  return WATER_PREFIX + dateStr;
}
function saveWater(total_ml, target_ml, dateStr = AEST_DATE()) {
  localStorage.setItem(
    waterKey(dateStr),
    JSON.stringify({ total_ml: Math.max(0, total_ml), target_ml })
  );
}
function loadWater(dateStr = AEST_DATE()) {
  try {
    return JSON.parse(localStorage.getItem(waterKey(dateStr)) || '{"total_ml":0,"target_ml":null}');
  } catch {
    return { total_ml: 0, target_ml: null };
  }
}

// ---------- Flags & config ----------
export function isAutoOn() {
  const v = localStorage.getItem(WATER_AUTO_KEY);
  return v === "1" || v === "true";
}
function setAutoOn(flag) {
  localStorage.setItem(WATER_AUTO_KEY, flag ? "1" : "0");
}

const DEFAULT_MANUAL_TARGET_ML = 3000;
const DEFAULT_WATER_ML_PER_KG  = 35;
const CREATINE_BUMP_ML         = 500;

// ---------- Profile-aware computation ----------
function readProfile() {
  const p = getProfile();
  if (p) return p;
  return { weight_kg: 71, ml_per_kg: DEFAULT_WATER_ML_PER_KG, gender: 'male' };
}

function takingCreatine() {
  try {
    const list = JSON.parse(localStorage.getItem(SUPPS_KEY) || "[]");
    return list.some(s => (s.name || "").toLowerCase().includes("creatine"));
  } catch {
    return false;
  }
}

function computeAutoTargetMl() {
  const p = readProfile();
  const weight = Number(p.weight_kg) || 71;
  const mlPerKg = Number(p.ml_per_kg) || DEFAULT_WATER_ML_PER_KG;
  const baseline = weight * mlPerKg;
  const bump     = takingCreatine() ? CREATINE_BUMP_ML : 0;
  return Math.round((baseline + bump) / 100) * 100; // nearest 100 ml
}

function currentTargetMl() {
  return isAutoOn()
    ? computeAutoTargetMl()
    : (parseInt(localStorage.getItem(WATER_TARGET_KEY) || "0", 10) || DEFAULT_MANUAL_TARGET_ML);
}

// ---------- Human mask (external SVGs) ----------
function maleMaskURL(){   return `url('img/male.svg')`; }
function femaleMaskURL(){ return `url('img/female.svg')`; }

function applyHumanMask(){
  if (!bottleEl) return;
  bottleEl.classList.add('human-mask');
  const gender = (readProfile().gender || 'male').toLowerCase();
  const maskUrl = gender === 'female' ? femaleMaskURL() : maleMaskURL();
  bottleEl.style.setProperty('--human-mask', maskUrl);
}

// ---------- Rendering ----------
function animateFill(totalMl, targetMl) {
  const pctRaw  = (totalMl / targetMl) * 100;
  const pctFill = clamp(pctRaw, 0, 100);
  bottleFill.style.setProperty('--fill', pctFill + '%');

  if (pctRaw >= 100) {
    const surplusL = toLitres(totalMl - targetMl);
    pctStr.textContent = `${Math.round(pctRaw)}% (Goal met +${surplusL} L)`;
  } else {
    pctStr.textContent = `${Math.round(pctRaw)}%`;
  }
}

function renderHydroNumbers(totalMl, targetMl) {
  todayStr.textContent = `Today: ${toLitres(totalMl)} L / ${toLitres(targetMl)} L`;
  goalLitresEl.textContent = (targetMl / 1000).toFixed(1).replace(/\.0$/, '');
  goalMlEl.textContent = targetMl;
  autoGoalEl.checked = isAutoOn();
}

function renderHistory() {
  const daysArr = [];
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Brisbane" }));
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const ds = new Date(d).toLocaleString("en-CA", { timeZone: "Australia/Brisbane" }).slice(0, 10);
    const rec = loadWater(ds);
    const total = rec.total_ml || 0;
    const tgt   = rec.target_ml || currentTargetMl();
    const pct   = clamp((total / tgt) * 100, 0, 100);
    daysArr.push({ label: ds.slice(5), pct });
  }
  hydroHistory.innerHTML = daysArr.map(({ label, pct }) => `
    <div class="hbar">
      <div class="hbar-bar"><span style="height:${pct}%;"></span></div>
      <div class="hbar-lab">${label}</div>
    </div>
  `).join('');
}

export function renderHydro() {
  applyHumanMask();
  const target = currentTargetMl();
  const rec = loadWater();
  const total = rec.total_ml || 0;
  if (rec.target_ml !== target) saveWater(total, target);
  renderHydroNumbers(total, target);
  requestAnimationFrame(() => animateFill(total, target));
  renderHistory();
}

// ---------- Mutations ----------
function addWater(ml) {
  const tgt = currentTargetMl();
  const w   = loadWater();
  const updated = clamp((w.total_ml || 0) + ml, 0, tgt * 2);
  saveWater(updated, tgt);
  animateFill(updated, tgt);
  renderHydroNumbers(updated, tgt);
  renderHistory();
}

function resetTodayWater() {
  const tgt = currentTargetMl();
  saveWater(0, tgt);
  renderHydro();
}

// ---------- Mount ----------
export function mountHydration() {
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = parseInt(btn.getAttribute('data-ml') || '0', 10) || 0;
      if (amt > 0) addWater(amt);
    });
  });

  if (addCustom && customMl) {
    addCustom.addEventListener('click', () => {
      const amt = parseInt(customMl.value || '0', 10) || 0;
      if (amt > 0) addWater(amt);
      customMl.value = '';
    });
  }

  if (resetWater) {
    resetWater.addEventListener('click', () => resetTodayWater());
  }

  if (editGoalBtn) {
    editGoalBtn.addEventListener('click', () => {
      const current = currentTargetMl();
      const val = prompt("Set daily water goal (ml). Tip: 2500–4000 ml for most active days.", String(current));
      if (val === null) return;
      const ml = clamp(parseInt(val, 10) || 0, 1500, 8000);
      localStorage.setItem(WATER_TARGET_KEY, String(ml));
      setAutoOn(false);
      renderHydro();
    });
  }

  if (autoGoalEl) {
    autoGoalEl.addEventListener('change', () => {
      setAutoOn(!!autoGoalEl.checked);
      renderHydro();
    });
  }

  onProfileChange(() => {
    renderHydro();
  });

  renderHydro();
}