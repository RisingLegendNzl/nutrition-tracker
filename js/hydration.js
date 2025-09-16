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

// storage helpers
function waterKey(dateStr=AEST_DATE()){ return WATER_PREFIX + dateStr; }
function saveWater(total_ml, target_ml, dateStr=AEST_DATE()){
  localStorage.setItem(
    waterKey(dateStr),
    JSON.stringify({ total_ml: Math.max(0,total_ml), target_ml })
  );
}
function loadWater(dateStr=AEST_DATE()){
  return JSON.parse(localStorage.getItem(waterKey(dateStr)) || '{"total_ml":0,"target_ml":null}');
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
  hydroHistory.innerHTML = daysArr.map(({label,pct})=>`
    <div class="hbar">
      <div class="hbar-bar"><span style="height:${pct}%;"></span></div>
      <div class="hbar-lab">${label}</div>
    </div>
  `).join('');
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
    const ml = clamp(parseInt(val,10)||0, 500, 10000);
    localStorage.setItem(WATER_TARGET_KEY, String(ml));
    localStorage.setItem(WATER_AUTO_KEY, "0"); // manual override
    renderHydro();
  };
  autoGoalEl.onchange = ()=> {
    localStorage.setItem(WATER_AUTO_KEY, autoGoalEl.checked ? "1" : "0");
    renderHydro(); // recompute immediately
  };

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