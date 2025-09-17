// js/plan.io.js
// Plan export/import + local library for Nutrify

const LIB_KEY = 'nutrify_plan_library_v1';   // localStorage key
const FILE_EXT = '.nutrify.json';

/* ================== Public API ================== */

export function captureCurrentPlan() {
  const plan = window.mealPlan || fromLocal();
  const meta = {
    name: suggestName(),
    created_at: new Date().toISOString(),
    engine_version: 'v1.0.0',
    data_version: '2025-09-17',
  };
  return { meta, plan };
}

export function applyPlanToDiet(planObject) {
  if (!planObject || !planObject.plan || typeof planObject.plan !== 'object') {
    toast('Invalid plan object'); 
    return false;
  }

  // Install/replace global plan
  window.mealPlan = planObject.plan;

  // Persist for reloads
  try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(window.mealPlan)); } catch {}

  // Trigger re-render (diet.js exposes renderDiet)
  if (typeof window.renderDiet === 'function') {
    try { window.renderDiet(); } catch {}
  } else {
    // Fallback: nudge the app to Diet tab
    location.hash = '#diet';
    setTimeout(() => window.dispatchEvent(new HashChangeEvent('hashchange')), 0);
  }

  // NEW: broadcast plan-updated event for any listeners
  try {
    window.dispatchEvent(new CustomEvent('nutrify:planUpdated', { detail: planObject }));
  } catch {}

  toast('Plan applied');
  return true;
}

export function downloadCurrentPlan() {
  const obj = captureCurrentPlan();
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.download = (obj.meta.name || 'nutrify-plan') + FILE_EXT;
  a.href = URL.createObjectURL(blob);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

export function uploadPlanFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    const reader = new FileReader();
    reader.onload = () => {
      try { resolve(JSON.parse(reader.result)); }
      catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, 'utf-8');
  });
}

/* -------- Local Library (quick saves) -------- */

export function saveToLibrary(name) {
  const lib = getLib();
  const obj = captureCurrentPlan();
  obj.meta.name = (name || obj.meta.name).trim();
  if (!obj.meta.name) obj.meta.name = suggestName();
  lib.unshift(obj);                 // newest first
  while (lib.length > 20) lib.pop();// cap
  setLib(lib);
  toast('Saved to Library');
  return obj.meta.name;
}

export function listLibrary() {
  return getLib().map((x, i) => ({ idx: i, name: x.meta.name, created_at: x.meta.created_at }));
}

export function loadFromLibrary(index) {
  const lib = getLib();
  const entry = lib[index];
  if (!entry) { toast('Not found'); return false; }
  return applyPlanToDiet(entry);
}

export function deleteFromLibrary(index) {
  const lib = getLib();
  if (index < 0 || index >= lib.length) return;
  lib.splice(index, 1);
  setLib(lib);
}

/* ----------------- helpers ----------------- */

function suggestName() {
  const d = new Date();
  const ds = d.toISOString().slice(0,10);
  const day = d.toLocaleDateString(undefined, { weekday: 'short' });
  return `Plan ${ds} ${day}`;
}
function getLib() {
  try { return JSON.parse(localStorage.getItem(LIB_KEY) || '[]') || []; }
  catch { return []; }
}
function setLib(arr) {
  try { localStorage.setItem(LIB_KEY, JSON.stringify(arr)); } catch {}
}
function fromLocal() {
  try { return JSON.parse(localStorage.getItem('nutrify_mealPlan') || 'null') || {}; }
  catch { return {}; }
}

/* ---- Minimal UI helpers (optional) ---- */
export function attachPlanMenu(container) {
  if (!container || container.querySelector('.plan-menu')) return;
  const wrap = document.createElement('div');
  wrap.className = 'plan-menu';
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.marginLeft = 'auto';

  const makeBtn = (txt, cls='ghost small') => { const b=document.createElement('button'); b.className=cls; b.textContent=txt; return b; };
  const saveBtn = makeBtn('Save to Library');
  const exportBtn = makeBtn('Export');
  const importBtn = makeBtn('Import');

  saveBtn.onclick = () => {
    const name = prompt('Name this plan:', suggestName());
    if (name != null) saveToLibrary(name);
  };
  exportBtn.onclick = () => downloadCurrentPlan();
  importBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,.nutrify.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = await uploadPlanFile(file);
        if (!applyPlanToDiet(data)) toast('Invalid plan file');
      } catch { toast('Import failed'); }
    };
    input.click();
  };

  wrap.append(saveBtn, exportBtn, importBtn);
  container.appendChild(wrap);
}

function toast(msg) {
  const s = document.getElementById('snackbar');
  const m = document.getElementById('snackMsg');
  if (!s || !m) return; // stay silent if snackbar not present
  m.textContent = msg; s.classList.remove('hidden');
  setTimeout(()=>s.classList.add('hidden'), 1600);
}