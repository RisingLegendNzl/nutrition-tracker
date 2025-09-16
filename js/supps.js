// js/supps.js
import { loadState, saveState } from './utils.js';

const KEY = 'supps_v1';
const DB  = window.SUPP_DB || {};          // from data.js
const DEFAULTS = window.DEFAULT_SUPPS || []; // from data.js (if provided)

const root   = document.querySelector('#suppsPage');
const listEl = root.querySelector('#suppList');
const addBtn = root.querySelector('#suppAdd');
const resetBtn = root.querySelector('#suppReset');

function read(){ return loadState(KEY, DEFAULTS.slice()); }
function write(v){ saveState(KEY, v); }

function rowHtml(name, cfg) {
  const tip = DB[name] || {};
  return `
    <div class="card supp-row">
      <div class="supp-head">
        <strong>${name}</strong>
        <button class="btn sm danger" data-del="${name}">Remove</button>
      </div>
      <div class="supp-grid">
        <div><label>Dose</label><input data-k="dose" value="${cfg.dose||tip.dose||''}"></div>
        <div><label>Timing</label><input data-k="timing" value="${cfg.timing||tip.timing||''}"></div>
        <div><label>Pairs with</label><input data-k="pairs" value="${cfg.pairs||tip.pairs||''}"></div>
        <div><label>Notes</label><input data-k="notes" value="${cfg.notes||tip.notes||''}"></div>
      </div>
    </div>`;
}

function render() {
  const cur = read();
  if (!cur.length) {
    listEl.innerHTML = `<div class="muted" style="text-align:center;padding:12px 0">No supplements yet</div>`;
    return;
  }
  listEl.innerHTML = cur.map(x => rowHtml(x.name, x)).join('');
}

export function mountSupps(){
  if (!root) return;
  render();

  // Add (simple prompt for now)
  addBtn?.addEventListener('click', ()=>{
    const name = (prompt('Add supplement (e.g., “Creatine monohydrate”)')||'').trim();
    if (!name) return;
    const cur = read();
    if (!cur.find(x=>x.name.toLowerCase()===name.toLowerCase())) {
      cur.push({ name });
      write(cur);
      render();
    }
  });

  // Restore defaults
  resetBtn?.addEventListener('click', ()=>{
    if (!confirm('Restore the default stack?')) return;
    write(DEFAULTS.slice());
    render();
  });

  // Delegated edits/removals
  listEl.addEventListener('input', (e)=>{
    const row = e.target.closest('.supp-row');
    if (!row) return;
    const name = row.querySelector('[data-del]')?.dataset.del;
    const key  = e.target.dataset.k;
    const cur  = read();
    const it   = cur.find(x=>x.name===name);
    if (it) { it[key] = e.target.value; write(cur); }
  });

  listEl.addEventListener('click', (e)=>{
    const del = e.target.closest('[data-del]');
    if (!del) return;
    const name = del.dataset.del;
    const cur = read().filter(x=>x.name!==name);
    write(cur); render();
  });

  window.addEventListener('route:show', (ev)=>{
    if (ev.detail.page === 'supps') render();
  });
}