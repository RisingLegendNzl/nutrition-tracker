// js/hydration.js
import { loadState, saveState, clamp } from './utils.js';

const HYDRO_KEY = 'hydration_v1';

// read/write per-day log (ml) -----------------------------------------------
function dayKey(d = new Date()) {
  return d.toISOString().slice(0,10);
}
function readLog() {
  const all = loadState(HYDRO_KEY, {});
  const k = dayKey();
  return +all[k] || 0;
}
function writeLog(ml) {
  const all = loadState(HYDRO_KEY, {});
  all[dayKey()] = clamp(Math.round(ml), 0, 3000);    // hard-cap 3 L
  saveState(HYDRO_KEY, all);
}

// goal (ml) is kept in utils under GOAL_KEY for Diet/Hydration ---------------
import { loadState as _ls } from './utils.js';
const GOAL_KEY = 'daily_goal_ml';
function goalMl() {
  // fallback to 3000 if not set; cap at 3000
  return clamp(+( _ls(GOAL_KEY, 3000) || 3000 ), 0, 3000);
}

// DOM refs (exist in index.html) ---------------------------------------------
const root       = document.querySelector('#hydroPage');
const tankWrap   = root.querySelector('#hydroTank');     // container
const tankLevel  = root.querySelector('#hydroLevel');    // the blue fill
const todayText  = root.querySelector('#hydroToday');
const pctText    = root.querySelector('#hydroPct');
const btns       = root.querySelectorAll('[data-addml]');
const inputMl    = root.querySelector('#customMl');
const addBtn     = root.querySelector('#addMl');
const resetBtn   = root.querySelector('#resetHydro');
const editBtn    = root.querySelector('#editGoal');
const goalText   = root.querySelector('#goalText');
const goalSub    = root.querySelector('#goalSub');

// mask image according to profile gender -------------------------------------
function updateMask() {
  const g = (localStorage.getItem('profile_v1') && JSON.parse(localStorage.getItem('profile_v1')).gender) || 'Male';
  const img = g === 'Female' ? '/img/female.png' : '/img/male.png';
  tankWrap.style.setProperty('--human-mask', `url(${img})`);
  tankWrap.classList.add('human-mask');  // CSS gives the -webkit-mask/ mask
}

// animate the water rectangle inside the masked container --------------------
function render() {
  const total = goalMl();
  const ml = clamp(readLog(), 0, total);
  const pct = total ? ml/total : 0;

  // display
  goalText.textContent = `${(total/1000).toFixed(1)} L`;
  goalSub.textContent  = `(${total} ml)`;
  todayText.textContent = `Today: ${(ml/1000).toFixed(1)} L / ${(total/1000).toFixed(1)} L`;
  pctText.textContent   = `${Math.round(pct*100)}%`;

  // animation: translateY from 100% (empty) to 0% (full)
  tankLevel.style.transform = `translateY(${Math.round((1-pct)*-100)}%)`;
}

// actions --------------------------------------------------------------------
function add(ml) { writeLog(readLog() + ml); render(); }
function reset() { writeLog(0); render(); }

export function mountHydration() {
  if (!root) return;

  // initial UI state
  updateMask();
  render();

  // quick-add buttons
  btns.forEach(b=>{
    b.addEventListener('click', () => add(+b.dataset.addml));
  });

  // custom input
  addBtn?.addEventListener('click', ()=>{
    const ml = parseInt(inputMl.value, 10);
    if (!isFinite(ml) || ml <= 0) return;
    add(ml);
    inputMl.value = '';
  });

  resetBtn?.addEventListener('click', reset);

  // “Edit Goal” just routes to Profile’s editor (leave UI to profile.js)
  editBtn?.addEventListener('click', ()=> window.showPage?.('profile'));

  // re-render when coming back
  window.addEventListener('route:show', (e)=>{
    if (e.detail.page === 'hydro') render();
  });
}