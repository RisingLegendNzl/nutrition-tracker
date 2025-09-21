import { foodsBundle } from '../brain/diet.data.js';
// js/plan.io.js
// Plan export/import + local library + Library UI for Nutrify

const LIB_KEY = 'nutrify_plan_library_v1';   // localStorage key
const FILE_EXT = '.nutrify.json';

/* ================== Feature flags & safe loaders ================== */
export const FEATURE_TEMPLATES_KEY = 'feature_templates_v1';

/** Safe, optional template loader (guarded by feature flag). */
export async function safeLoadTemplates() {
  try {
    const enabled = localStorage.getItem(FEATURE_TEMPLATES_KEY) === '1';
    if (!enabled) return [];
    const mod = await import('../brain/recipes/meal-templates.js');
    const arr = (mod && (mod.default || mod.templates)) || [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** One-click regenerate using current profile + engine. */
export async function regenerateFromProfile() {
  try {
    const [{ getProfile }, eng] = await Promise.all([
      import('./profile.js'),
      import('../engine/nutritionEngine.js')
    ]);
    const prof = (typeof getProfile === 'function') ? getProfile() : null;
    if (!prof) { toast('Set up your Profile first'); return; }

    // Minimal request for engine
    const req = {
      profile: {
        sex: (prof.gender === 'female') ? 'female' : 'male',
        age_y: Number(prof.age_y),
        height_cm: Number(prof.height_cm),
        weight_kg: Number(prof.weight_kg),
        activity_pal: Number(prof.activity_pal),
        goal: String(prof.goal || 'maintain'),
        bodyfat_pct: (prof.bodyfat_pct == null || prof.bodyfat_pct === '') ? null : Number(prof.bodyfat_pct)
      },
      constraints: { diet: String(prof.diet || 'omnivore') }
    };

    const out = (typeof eng.generateWeekPlan === 'function')
      ? eng.generateWeekPlan(req)
      : { plan: {} };

    if (!out || !out.plan || !Object.keys(out.plan).length) {
      toast('Generation failed'); return;
    }
    const meta = out.meta || { type: 'week_plan', source: 'regen', created_at: new Date().toISOString() };
    applyPlanToDiet({ plan: out.plan, meta });
  } catch {
    toast('Could not re-generate');
  }
}


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

  const adapted = adaptPlanIfNeeded(planObject);
  window.mealPlan = adapted.plan;

  try { localStorage.setItem('nutrify_mealPlan', JSON.stringify(window.mealPlan)); } catch {}

  if (typeof window.renderDiet === 'function') {
    try { window.renderDiet(); } catch {}
  } else {
    location.hash = '#diet';
    setTimeout(() => window.dispatchEvent(new HashChangeEvent('hashchange')), 0);
  }

  try {
    window.dispatchEvent(new CustomEvent('nutrify:planUpdated', { detail: planObject }));
  } catch {}

  toast('Plan applied');
  return true;
}

/* -------- Download / Upload (file based) -------- */

export function downloadCurrentPlan() {
  const obj = captureCurrentPlan();
  downloadBlob(obj, (obj.meta.name || 'nutrify-plan') + FILE_EXT);
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
  obj.meta.name = (name || obj.meta.name).trim() || suggestName();
  lib.unshift(obj);                       // newest first
  while (lib.length > 20) lib.pop();      // cap
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

export function exportFromLibrary(index) {
  const lib = getLib();
  const entry = lib[index];
  if (!entry) return;
  const name = (entry.meta?.name || 'nutrify-plan') + FILE_EXT;
  downloadBlob(entry, name);
}



/* ================== Engine → UI adapter ================== */
function adaptPlanIfNeeded(planObject){
  try{
    if (!planObject || !planObject.plan || typeof planObject.plan !== 'object') return planObject;
    // Detect engine shape: items have { food_id, qty_g }
    const days = Object.keys(planObject.plan||{});
    if (!days.length) return planObject;

    const foods = (foodsBundle && foodsBundle.foods) || [];
    const idToName = new Map(foods.map(f => [String(f.id), String(f.name||'')]));

    const looksEngine = !!days.find(d => {
      const meals = planObject.plan[d] || [];
      const first = meals && meals[0];
      const it = first && first.items && first.items[0];
      return it && ('food_id' in it);
    });
    if (!looksEngine) return planObject; // already UI shape

    // Build new UI-shaped plan: { Monday: [{ meal:'Breakfast', items:[{food,qty}] }, ...], ... }
    const cap = s => (s||'').charAt(0).toUpperCase() + (s||'').slice(1);
    const uiPlan = {};
    for (const day of days){
      const meals = planObject.plan[day] || [];
      uiPlan[day] = meals.map(m => {
        const mealName = cap(m.slot || m.meal || 'Meal');
        const items = (m.items || []).map(it => {
          const name = idToName.get(String(it.food_id)) || String(it.food_id || it.food || '').replace(/^food_/, '').replace(/_/g,' ');
          const grams = Math.max(1, Math.round(Number(it.qty_g || it.qty || 0)));
          return { food: name, qty: grams ? (grams + ' g') : '' };
        });
        return { meal: mealName, items };
      });
    }
    return { ...planObject, plan: uiPlan };
  }catch{
    return planObject; // fail-open
  }
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
function downloadBlob(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

/* ---- Minimal UI helpers (menu + library modal) ---- */

export function attachPlanMenu(container) {
  if (!container || container.querySelector('.plan-menu')) return;
  const wrap = document.createElement('div');
  wrap.className = 'plan-menu';
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.marginLeft = 'auto';

  const makeBtn = (txt, cls='ghost small') => { const b=document.createElement('button'); b.className=cls; b.textContent=txt; return b; };
  const regenBtn = makeBtn('Re-generate', 'primary small');
  const libBtn = makeBtn('Library');
  const saveBtn = makeBtn('Save to Library');
  const exportBtn = makeBtn('Export');
  const importBtn = makeBtn('Import');

  regenBtn.onclick = async () => { try { regenBtn.disabled = true; await regenerateFromProfile(); } finally { regenBtn.disabled = false; } };
  libBtn.onclick = () => showLibraryModal();
  saveBtn.onclick = () => {
    const name = prompt('Name this plan:', suggestName());
    if (name != null) { saveToLibrary(name); showLibraryModal(true); }
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
        else showLibraryModal(true);
      } catch { toast('Import failed'); }
    };
    input.click();
  };

  wrap.append(regenBtn, libBtn, saveBtn, exportBtn, importBtn);
  container.appendChild(wrap);
}

function showLibraryModal(forceOpen=false) {
  const id = 'planLibraryOverlay';
  let ovl = document.getElementById(id);
  if (ovl && !forceOpen) { ovl.remove(); return; }
  if (ovl) ovl.remove();

  ovl = document.createElement('div');
  ovl.id = id;
  Object.assign(ovl.style, {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
  });
  ovl.addEventListener('click', (e)=>{ if (e.target === ovl) ovl.remove(); });

  const card = document.createElement('div');
  Object.assign(card.style, {
    width: 'min(720px, 100%)', maxHeight: '90vh', overflow: 'auto',
    background: 'white', borderRadius: '12px', padding: '16px'
  });

  const head = document.createElement('div');
  head.style.display = 'flex';
  head.style.justifyContent = 'space-between';
  head.style.alignItems = 'center';

  const title = document.createElement('h3');
  title.textContent = 'Plan Library';
  title.style.margin = '0';

  const close = document.createElement('button');
  close.textContent = 'Close';
  Object.assign(close.style, { border: 'none', padding: '6px 10px', borderRadius: '8px', background: '#eee', cursor: 'pointer' });
  close.addEventListener('click', () => ovl.remove());
  head.append(title, close);

  const list = document.createElement('div');
  list.style.marginTop = '12px';
  renderLibraryList(list);

  card.append(head, list);
  ovl.append(card);
  document.body.appendChild(ovl);
}

function renderLibraryList(container) {
  const lib = getLib();
  container.innerHTML = '';

  if (!lib.length) {
    const p = document.createElement('p');
    p.textContent = 'No saved plans yet.';
    container.appendChild(p);
    return;
  }

  const table = document.createElement('table');
  Object.assign(table.style, { width: '100%', borderCollapse: 'collapse' });

  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">Name</th>
    <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">Created</th>
    <th style="text-align:right;padding:8px;border-bottom:1px solid #eee">Actions</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  lib.forEach((entry, i) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.style.padding = '8px';
    nameTd.textContent = entry.meta?.name || `Plan #${i+1}`;

    const dateTd = document.createElement('td');
    dateTd.style.padding = '8px';
    const d = entry.meta?.created_at ? new Date(entry.meta.created_at) : null;
    dateTd.textContent = d ? d.toLocaleString() : '—';

    const actTd = document.createElement('td');
    actTd.style.padding = '8px';
    actTd.style.textAlign = 'right';
    actTd.style.whiteSpace = 'nowrap';

    const mkBtn = (label, bg, handler) => {
      const b = document.createElement('button');
      b.textContent = label;
      Object.assign(b.style, { border:'none', padding:'6px 10px', borderRadius:'8px', marginLeft:'6px', background:bg, color:'#fff', cursor:'pointer' });
      b.addEventListener('click', handler);
      return b;
    };

    const loadB = mkBtn('Load', '#0e7fff', () => { loadFromLibrary(i); });
    const expB  = mkBtn('Export', '#6b7280', () => { exportFromLibrary(i); });
    const delB  = mkBtn('Delete', '#ef4444', () => {
      if (confirm('Delete this saved plan?')) {
        deleteFromLibrary(i);
        renderLibraryList(container);
      }
    });

    actTd.append(loadB, expB, delB);
    tr.append(nameTd, dateTd, actTd);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
}

function toast(msg) {
  const s = document.getElementById('snackbar');
  const m = document.getElementById('snackMsg');
  if (!s || !m) return; // stay silent if snackbar not present
  m.textContent = msg; s.classList.remove('hidden');
  setTimeout(()=>s.classList.add('hidden'), 1600);
}