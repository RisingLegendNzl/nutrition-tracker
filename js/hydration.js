import {
  AEST_DATE, clamp, toLitres,
  WATER_TARGET_KEY, WATER_AUTO_KEY, WATER_PREFIX, getWeightKg
} from "./utils.js";

// DOM
const goalLitresEl = document.getElementById('goalLitres');
const goalMlEl = document.getElementById('goalMl');
const editGoalBtn = document.getElementById('editGoalBtn');
const autoGoalEl = document.getElementById('autoGoal');
const bottleFill = document.getElementById('bottleFill');
const todayStr = document.getElementById('todayStr');
const pctStr = document.getElementById('pctStr');
const quickBtns = document.querySelectorAll('.pill-btn');
const customMl = document.getElementById('customMl');
const addCustom = document.getElementById('addCustom');
const resetWater = document.getElementById('resetWater');
const historyEl = document.getElementById('hydroHistory');

// State
function isAutoOn(){ return localStorage.getItem(WATER_AUTO_KEY) === '1'; }
function setAuto(v){ localStorage.setItem(WATER_AUTO_KEY, v ? '1' : '0'); }

function loadWater(){
  const key = WATER_PREFIX + AEST_DATE();
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function saveWater(total_ml, target_ml){
  const key = WATER_PREFIX + AEST_DATE();
  localStorage.setItem(key, JSON.stringify({ total_ml, target_ml }));
}

function takingCreatine(){
  try {
    const list = JSON.parse(localStorage.getItem("supps_v1") || "[]");
    return list.some(s => (s.name || "").toLowerCase().includes("creatine"));
  }catch{ return false; }
}
function computeAutoTargetMl(){
  const baseline = Math.round(getWeightKg() * 35); // 35 ml/kg
  const bump = takingCreatine() ? 500 : 0;
  return Math.round((baseline + bump)/100)*100; // nearest 100 ml
}
function currentTargetMl(){
  return isAutoOn() ? computeAutoTargetMl()
                    : (parseInt(localStorage.getItem(WATER_TARGET_KEY)||"0",10) || 3000);
}

function animateFill(totalMl, targetMl){
  const pctRaw = (totalMl/targetMl)*100;
  const pctFill = clamp(pctRaw, 0, 100);
  bottleFill.style.setProperty('--fill', pctFill + '%');
  if (pctRaw >= 100) {
    const surplusL = toLitres(totalMl - targetMl);
    pctStr.textContent = `${Math.round(pctRaw)}% (Goal met +${surplusL} L)`;
  } else {
    pctStr.textContent = `${Math.round(pctRaw)}%`;
  }
}
function renderHydroNumbers(totalMl, targetMl){
  todayStr.textContent = `Today: ${toLitres(totalMl)} L / ${toLitres(targetMl)} L`;
  goalLitresEl.textContent = (targetMl/1000).toFixed(1).replace(/\.0$/,'');
  goalMlEl.textContent = targetMl;
  autoGoalEl.checked = isAutoOn();
}

function renderHistory(){
  const days = [...Array(7)].map((_,i)=>{
    const d = new Date(new Date().toLocaleString('en-US',{ timeZone:'Australia/Brisbane' }));
    d.setDate(d.getDate()-i);
    const key = WATER_PREFIX + d.toLocaleDateString('en-CA',{ timeZone:'Australia/Brisbane' });
    let rec = {};
    try { rec = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
    return { date:d, total_ml: rec.total_ml||0, target_ml: rec.target_ml||currentTargetMl() };
  }).reverse();

  historyEl.innerHTML = days.map(d=>{
    const pct = Math.round((d.total_ml/(d.target_ml||1))*100);
    return `<div class="history-day"><div>${d.date.toLocaleDateString('en-AU',{ weekday:'short'})}</div><div>${pct}%</div></div>`;
  }).join('');
}

export function renderHydro(){
  const target = currentTargetMl();
  const rec = loadWater();
  const total = rec.total_ml || 0;
  if (rec.target_ml !== target) saveWater(total, target); // persist today's goal
  renderHydroNumbers(total, target);
  requestAnimationFrame(()=> animateFill(total, target));
  renderHistory();
}

function addWater(ml){
  const tgt = currentTargetMl();
  const w = loadWater();
  const updated = clamp((w.total_ml||0) + ml, 0, tgt*2); // cap 200% visual
  saveWater(updated, tgt);
  animateFill(updated, tgt);
  renderHydroNumbers(updated, tgt);
  renderHistory();
}

function resetTodayWater(){
  const tgt = currentTargetMl();
  saveWater(0, tgt);
  renderHydro();
}

export function mountHydration(){
  // events
  editGoalBtn.onclick = ()=>{
    const current = currentTargetMl();
    const val = prompt("Set daily water goal (ml). Tip: 2500–4000 ml for most active days.", String(current));
    if (val===null) return;
    const n = parseInt(val,10);
    if (!isNaN(n) && n>=1000 && n<=8000){
      localStorage.setItem(WATER_TARGET_KEY, String(n));
      setAuto(false);
      renderHydro();
    }
  };
  autoGoalEl.addEventListener('change', (ev)=>{
    setAuto(ev.target.checked);
    renderHydro();
  });

  document.querySelectorAll('.pill-btn').forEach(b=>{
    b.addEventListener('click', ()=> addWater(parseInt(b.dataset.ml,10)));
  });
  addCustom.onclick = ()=>{
    const ml = Math.max(0, parseInt(customMl.value||"0",10));
    if (!ml) return;
    addWater(ml);
    customMl.value = "";
  };
  resetWater.onclick = ()=> resetTodayWater();

  renderHydro();
}