// js/hydration.js — self-contained, works with the new HTML

const HYDRO_LS_KEY = 'nutrify_hydro_v2';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let ui = {};
let state = {
  goalMl: 3000,   // hard cap is enforced below
  todayMl: 0,
  history: []     // [{date:'YYYY-MM-DD', ml:number}, ...]
};

function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); }
function mlToL(ml){ return (ml/1000).toFixed(1); }
function todayKey(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

/* ---------- storage ---------- */
function load(){
  try {
    const raw = localStorage.getItem(HYDRO_LS_KEY);
    if (raw){
      const data = JSON.parse(raw);
      state.goalMl  = clamp(Number(data.goalMl)||3000, 500, 3000);
      state.todayMl = clamp(Number(data.todayMl)||0, 0, state.goalMl);
      state.history = Array.isArray(data.history) ? data.history : [];
    }
  } catch {}
  // ensure today's entry exists
  const key = todayKey();
  const i = state.history.findIndex(h => h.date === key);
  if (i === -1) state.history.unshift({date:key, ml: state.todayMl});
  // keep last 7
  state.history = state.history.slice(0, 7);
}

function save(){
  localStorage.setItem(HYDRO_LS_KEY, JSON.stringify(state));
}

/* ---------- UI wiring ---------- */
function grabUI(){
  ui.bottleFill = $('#bottleFill');
  ui.goalLitres = $('#goalLitres');
  ui.goalMl     = $('#goalMl');
  ui.todayStr   = $('#todayStr');
  ui.pctStr     = $('#pctStr');

  ui.quick = $$('.pill-btn[data-ml]');
  ui.customInput = $('#customMl');
  ui.customAdd   = $('#addCustom');
  ui.resetBtn    = $('#resetWater');
  ui.editGoalBtn = $('#editGoalBtn');
  ui.historyWrap = $('#hydroHistory');
}

function setGoal(ml){
  state.goalMl = clamp(Math.round(ml), 500, 3000); // cap at 3 L
  // clamp today's ml to goal
  state.todayMl = clamp(state.todayMl, 0, state.goalMl);
  // also clamp today's history bucket
  const key = todayKey();
  const i = state.history.findIndex(h => h.date === key);
  if (i !== -1) state.history[i].ml = state.todayMl;
  render();
  save();
}

function addWater(ml){
  const add = Math.max(0, Math.round(ml||0));
  if (!add) return;
  state.todayMl = clamp(state.todayMl + add, 0, state.goalMl);

  const key = todayKey();
  const i = state.history.findIndex(h => h.date === key);
  if (i === -1) state.history.unshift({date:key, ml: state.todayMl});
  else state.history[i].ml = state.todayMl;

  render();
  save();
}

function resetToday(){
  state.todayMl = 0;
  const key = todayKey();
  const i = state.history.findIndex(h => h.date === key);
  if (i !== -1) state.history[i].ml = 0;
  render();
  save();
}

/* ---------- render ---------- */
function render(){
  // numbers
  ui.goalLitres.textContent = mlToL(state.goalMl);
  ui.goalMl.textContent     = String(state.goalMl);

  const pct = state.goalMl ? Math.round((state.todayMl / state.goalMl) * 100) : 0;
  const pctClamped = clamp(pct, 0, 100);

  ui.todayStr.textContent = `Today: ${mlToL(state.todayMl)} L / ${mlToL(state.goalMl)} L`;
  ui.pctStr.textContent   = `${pctClamped}%`;

  // animate fill (height from 0–100%)
  if (ui.bottleFill){
    // ensure the element has the CSS transition; if not, set a default
    if (!ui.bottleFill.style.transition) {
      ui.bottleFill.style.transition = 'height .35s ease';
    }
    ui.bottleFill.style.height = `${pctClamped}%`;
  }

  // simple history (bars)
  if (ui.historyWrap){
    ui.historyWrap.innerHTML = '';
    state.history.forEach(h=>{
      const p = state.goalMl ? Math.round((clamp(h.ml,0,state.goalMl)/state.goalMl)*100) : 0;
      const bar = document.createElement('div');
      bar.className = 'hydro-bar';
      bar.style.cssText = `
        width: 10px; height: 80px; border-radius: 6px;
        background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
        position: relative; margin-right: 10px; display:inline-block;
      `;
      const fill = document.createElement('div');
      fill.style.cssText = `
        position:absolute; left:0; bottom:0; width:100%;
        height:${p}%; background: linear-gradient(180deg,#62a8ff,#2f81f7);
        border-bottom-left-radius:6px; border-bottom-right-radius:6px;
        transition: height .35s ease;
      `;
      bar.appendChild(fill);
      ui.historyWrap.appendChild(bar);
    });
  }
}

/* ---------- goal editing dialog (simple prompt for now) ---------- */
function promptGoal(){
  const raw = window.prompt('Enter daily goal (ml, max 3000):', String(state.goalMl));
  if (raw == null) return;
  const ml = Number(raw);
  if (!Number.isFinite(ml) || ml <= 0) return;
  setGoal(ml);
}

/* ---------- mount ---------- */
export function mountHydration(){
  grabUI();
  load();

  // quick-add buttons
  ui.quick.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const ml = Number(btn.getAttribute('data-ml')) || 0;
      addWater(ml);
    });
  });

  // custom add
  ui.customAdd?.addEventListener('click', ()=>{
    const ml = Number(ui.customInput?.value || 0);
    if (ml > 0) addWater(ml);
    if (ui.customInput) ui.customInput.value = '';
  });

  // reset
  ui.resetBtn?.addEventListener('click', resetToday);

  // edit goal
  ui.editGoalBtn?.addEventListener('click', promptGoal);

  render();
}

// Backwards compatibility if your router looks for these names
export function initHydration(){ mountHydration(); }
export function renderHydro(){ render(); }