// filename: js/hydration.js
import {
  AEST_DATE, clamp, toLitres,
  WATER_TARGET_KEY, WATER_AUTO_KEY, WATER_PREFIX
} from "./utils.js";

const USER_WEIGHT_KG = 71; // adjust if needed

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
const hydroHistory = document.getElementById('hydroHistory');

// Ensure seamless wave animation by duplicating SVG paths offset by +300px
(function ensureSeamlessWaves(){
  try{
    const svg = bottleFill && bottleFill.querySelector('svg.liq');
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll('path.wave'));
    paths.forEach(p=>{
      const clone = p.cloneNode(true);
      clone.style.transform = 'translateX(300px)';
      svg.appendChild(clone);
    });
  }catch(e){}
})();

// storage helpers
function waterKey(dateStr=AEST_DATE()){ return WATER_PREFIX + dateStr; }
function saveWater(total_ml, target_ml, dateStr=AEST_DATE()){
  localStorage.setItem(
    waterKey(dateStr),
    JSON.stringify({ total_ml: Math.max(0,total_ml), target_ml })
  );
}
function loadWater(dateStr=AEST_DATE()){
  return JSON.parse(localStorage.getItem(
waterKey(dateStr)) || '{"total_ml":0,"target_ml":null}');
}

export function isAutoOn(){
  const v = localStorage.getItem(WATER_AUTO_KEY);
  return v === "1" || v === "true";
}
function takingCreatine(){
  try{
    const list = JSON.parse(localStorage.getItem("supps_v1") || "[]");
    return list.some(s => (s.name || "").toLowerCase().includes("creatine"));
  }catch{ return false; }
}
function computeAutoTargetMl(){
  const baseline = Math.round(USER_WEIGHT_KG * 35); // 35 ml/kg
  const bump = takingCreatine() ? 500 : 0;
  return baseline + bump;
}
function currentTargetMl(){
  const stored = parseInt(localStorage.getItem(WATER_TARGET_KEY)||"0",10);
  if (stored) return clamp(stored, 1000, 6000);
  if (isAutoOn()) return computeAutoTargetMl();
  return 3000;
}

// history helpers
function getTotalTodayMl(){
  const rec = loadWater();
  return rec.total_ml || 0;
}
function setTotalTodayMl(v){
  const rec = loadWater();
  saveWater(v, rec.target_ml ?? currentTargetMl());
}
function setTargetTodayMl(tgtMl){
  const rec = loadWater();
  saveWater(rec.total_ml || 0, tgtMl);
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
  const daysArr = [];
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Australia/Brisbane" }));
  for (let i=6; i>=0; i--){
    const d = new Date(now); d.setDate(d.getDate()-i);
    const ds = new Date(d).toLocaleString("en-CA",{ timeZone:"Australia/Brisbane" }).slice(0,10);
    const rec = loadWater(ds);
    const total = rec.total_ml || 0;
    const tgt = rec.target_ml || currentTargetMl(); // fallback for legacy
    const pct = clamp((total/tgt)*100, 0, 100);
    daysArr.push({ label: ds.slice(5), pct });
  }

  // render
  hydroHistory.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.style.display = 'grid';
  wrap.style.gridTemplateColumns = 'repeat(7, 1fr)';
  wrap.style.gap = '8px';

  daysArr.forEach(day=>{
    const col = document.createElement('div');
    col.style.display = 'flex';
    col.style.flexDirection = 'column';
    col.style.alignItems = 'center';
    const bar = document.createElement('div');
    bar.style.width = '20px';
    bar.style.height = '100px';
    bar.style.border = '1px solid var(--border)';
    bar.style.borderRadius = '6px';
    bar.style.overflow = 'hidden';
    const fill = document.createElement('div');
    fill.style.height = day.pct + '%';
    fill.style.width = '100%';
    fill.style.background = 'var(--accent)';
    fill.style.marginTop = (100-day.pct) + '%';
    bar.appendChild(fill);
    const lab = document.createElement('div');
    lab.style.fontSize = '12px';
    lab.style.marginTop = '4px';
    lab.style.color = 'var(--muted)';
    lab.textContent = day.label.replace(/^0/,'');
    col.appendChild(bar); col.appendChild(lab);
    wrap.appendChild(col);
  });
  hydroHistory.appendChild(wrap);
}

// Actions
function addWater(ml){
  const rec = loadWater();
  const total = (rec.total_ml || 0) + ml;
  saveWater(total, rec.target_ml ?? currentTargetMl());
  renderHydro();
}
function resetTodayWater(){
  const rec = loadWater();
  saveWater(0, rec.target_ml ?? currentTargetMl());
  renderHydro();
}

function renderHydro(){
  const rec = loadWater();
  const totalMl = rec.total_ml || 0;
  const targetMl = rec.target_ml ?? currentTargetMl();

  renderHydroNumbers(totalMl, targetMl);
  animateFill(totalMl, targetMl);
}

export function mountHydration(){
  // initial ensure record exists for today
  const rec = loadWater();
  if (rec.target_ml == null) setTargetTodayMl(currentTargetMl());

  editGoalBtn.addEventListener('click', ()=>{
    const val = prompt('Enter daily goal (ml):', String(currentTargetMl()));
    if (!val) return;
    const ml = clamp(parseInt(val,10)||0, 1000, 6000);
    localStorage.setItem(WATER_TARGET_KEY, String(ml));
    setTargetTodayMl(ml);
    renderHydro();
  });

  autoGoalEl.addEventListener('change', ()=>{
    localStorage.setItem(WATER_AUTO_KEY, autoGoalEl.checked ? "1" : "0");
    if (autoGoalEl.checked){
      const ml = currentTargetMl();
      localStorage.setItem(WATER_TARGET_KEY, String(ml));
      setTargetTodayMl(ml);
    }
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