// js/plan.io.js
import { LS_KEYS, EVENTS } from './constants.js';
import { getItem, setItem } from './storage.js';

/* ===========================================================
   Plan I/O: export, import, save, apply
   =========================================================== */

import { mountPlanToDiet } from './plan.mount.js';
import { prettyDate } from './utils.js';

/* Internal helpers */
function downloadFile(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function uploadFile(cb) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target.result);
        cb(data);
      } catch (err) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ================== Core Functions ================== */

function fromLocal() {
  return getItem(LS_KEYS.PLAN) || {};
}

export function applyPlanToDiet(plan) {
  if (!plan) return;
  try {
    mountPlanToDiet(plan);
  } catch (e) {
    console.error('Failed to apply plan to diet page', e);
  }
}

/* Persist current plan and emit update */
export function savePlan(plan){
  if (!plan || typeof plan !== 'object'){ return false; }
  setItem(LS_KEYS.PLAN, plan);
  document.dispatchEvent(new CustomEvent(EVENTS.PLAN_UPDATED, { detail: { source: 'savePlan' } }));
  return true;
}

/* ================== Menu Attach ================== */

export function attachPlanMenu(container) {
  if (!container) return;

  const wrap = document.createElement('div');
  wrap.className = 'plan-menu';

  const makeBtn = (label) => {
    const b = document.createElement('button');
    b.textContent = label;
    return b;
  };

  const genBtn = makeBtn('Generate');
  const libBtn = makeBtn('Library');
  const expBtn = makeBtn('Export');
  const impBtn = makeBtn('Import');

  wrap.appendChild(genBtn);
  wrap.appendChild(libBtn);
  wrap.appendChild(expBtn);
  wrap.appendChild(impBtn);

  // Export
  expBtn.addEventListener('click', () => {
    const plan = fromLocal();
    if (!plan || !plan.meta) {
      alert('No plan found to export.');
      return;
    }
    const filename = `nutrify_plan_${prettyDate(new Date())}.json`;
    downloadFile(filename, JSON.stringify(plan, null, 2));
  });

  // Import
  impBtn.addEventListener('click', () => {
    uploadFile(data => {
      if (!data || !data.meta) {
        alert('Invalid plan file');
        return;
      }
      setItem(LS_KEYS.PLAN, data);
      document.dispatchEvent(new CustomEvent(EVENTS.PLAN_UPDATED, { detail: { source: 'import' } }));
    });
  });

  container.appendChild(wrap);
}