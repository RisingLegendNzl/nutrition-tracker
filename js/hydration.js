import { saveData, loadData } from './utils.js';

let hydrationData = {
  goal: 3000,
  intake: 0
};

let $goalEl, $todayEl, $percentEl, $fillEl, $customInput;

// Utility: grab UI elements
function grabUI() {
  $goalEl = document.getElementById('hydroGoal');
  $todayEl = document.getElementById('hydroToday');
  $percentEl = document.getElementById('hydroPercent');
  $fillEl = document.getElementById('bottleFill');
  $customInput = document.getElementById('customHydroInput');
}

// Apply silhouette mask depending on profile gender
function applyHumanMaskFromProfile () {
  const el = document.getElementById('bottle');
  if (!el) return;

  let gender = 'male';
  try {
    const prof = JSON.parse(localStorage.getItem('nutrify_profile') || '{}');
    if (prof?.gender) gender = String(prof.gender).toLowerCase();
  } catch {}

  const url = gender === 'female' ? 'img/female.png' : 'img/male.png';

  el.style.webkitMaskImage = `url("${url}")`;
  el.style.maskImage       = `url("${url}")`;
  el.classList.add('human-mask');
}

// Save/load hydration state
function save() {
  saveData('hydration', hydrationData);
}
function load() {
  const d = loadData('hydration');
  if (d) hydrationData = d;
}

// Update bottle + text
function render() {
  $goalEl.textContent = (hydrationData.goal / 1000).toFixed(1) + ' L';
  $todayEl.textContent = (hydrationData.intake / 1000).toFixed(1) + ' L';
  const pct = hydrationData.goal ? Math.min(100, (hydrationData.intake / hydrationData.goal) * 100) : 0;
  $percentEl.textContent = Math.round(pct) + '%';

  if ($fillEl) {
    $fillEl.style.height = pct + '%';
  }
}

// Add ml
function add(amount) {
  hydrationData.intake += amount;
  save();
  render();
}

// Reset
function reset() {
  hydrationData.intake = 0;
  save();
  render();
}

// Edit goal
function editGoal(newGoalMl) {
  hydrationData.goal = newGoalMl;
  save();
  render();
}

export function mountHydration(){
  grabUI();
  load();

  // Apply gender-based mask
  applyHumanMaskFromProfile();

  // Hook buttons
  document.querySelectorAll('[data-hydro-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ml = parseInt(btn.getAttribute('data-hydro-add'));
      add(ml);
    });
  });

  const addBtn = document.getElementById('customHydroAdd');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const ml = parseInt($customInput.value);
      if (!isNaN(ml)) {
        add(ml);
        $customInput.value = '';
      }
    });
  }

  const resetBtn = document.getElementById('hydroReset');
  if (resetBtn) resetBtn.addEventListener('click', reset);

  const goalBtn = document.getElementById('editHydroGoal');
  if (goalBtn) {
    goalBtn.addEventListener('click', () => {
      const newGoal = prompt('Enter new daily goal (ml):', hydrationData.goal);
      if (newGoal) {
        editGoal(parseInt(newGoal));
      }
    });
  }

  render();
}