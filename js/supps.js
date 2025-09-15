import {
  AEST_DATE, LAST_DATE_KEY, DEFAULTS_KEY, SUPPS_KEY, TAKEN_PREFIX,
  showSnack
} from "./utils.js";
import { renderHydro, isAutoOn } from "./hydration.js";

/* Storage helpers */
function loadSupps(){
  if (!localStorage.getItem(DEFAULTS_KEY)) {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(window.defaultSupps || []));
  }
  if (!localStorage.getItem(SUPPS_KEY)) {
    localStorage.setItem(SUPPS_KEY, JSON.stringify(window.defaultSupps || []));
  }
  return JSON.parse(localStorage.getItem(SUPPS_KEY) || "[]");
}
function saveSupps(list){ localStorage.setItem(SUPPS_KEY, JSON.stringify(list)); }
function dayKey(dateStr){ return TAKEN_PREFIX + dateStr; }
function loadTakenMap(dateStr=AEST_DATE()){ return JSON.parse(localStorage.getItem(dayKey(dateStr)) || "{}"); }
function saveTakenMap(map, dateStr=AEST_DATE()){ localStorage.setItem(dayKey(dateStr), JSON.stringify(map)); }

/* Suggestion engine */
function resolveCanonicalName(inputStr){
  const s = (inputStr||"").trim().toLowerCase();
  if (!s) return null;
  const map = window.ALIAS_TO_CANON || {};
  if (map[s]) return map[s];
  // fuzzy: starts-with / contains on flattened keys
  const keys = Object.keys(map);
  const flat = x => x.replace(/[^a-z0-9]/g,'');
  const sFlat = flat(s);
  let hit = keys.find(k => flat(k).startsWith(sFlat)) || keys.find(k => flat(k).includes(sFlat));
  return hit ? map[hit] : null;
}
function suggestFor(name){
  const canon = resolveCanonicalName(name) || name.trim();
  const dict = window.SMART_SUGGESTIONS || {};
  const sug = dict[canon];
  if (sug) return { ...sug, _canon: canon };
  // sensible defaults
  return {
    dose:"", timing:"With a meal",
    pairs:"Food (improves tolerance/absorption)",
    notes:"General guidance; adjust if sensitive.",
    why:"Complements diet gaps."
  };
}

/* DOM refs */
const suppListEl = document.getElementById("suppList");
const addSuppBtn = document.getElementById("addSupp");
const restoreBtn = document.getElementById("restoreDefaults");
const sheet = document.getElementById("sheet");
const form = document.getElementById("suppForm");
const fName = document.getElementById("fName");
const fDose = document.getElementById("fDose");
const fTiming = document.getElementById("fTiming");
const fPairs = document.getElementById("fPairs");
const fNotes = document.getElementById("fNotes");
const cancelSheet = document.getElementById("cancelSheet");
const undoBtn = document.getElementById("undoBtn");

let editingIndex = null;
let lastDeleted = null;

export function mountSupps(){
  addSuppBtn.onclick = ()=> openEditor(null, null);
  cancelSheet.onclick = ()=> closeEditor();
  restoreBtn.onclick = onRestoreDefaults;

  setupTypeahead();      // expanded suggestions
  form.onsubmit = onSubmit;

  renderSupps();         // ensure list renders; sheet remains hidden by default
}

export function renderSupps(){
  sheet.classList.add("hidden");
  editingIndex = null;

  const list = loadSupps();
  const taken = loadTakenMap();
  suppListEl.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <div class="empty-title">No supplements yet</div>
      <div class="empty-sub">Tap “Add” to create your Sup-Stack. You can restore defaults anytime.</div>
    `;
    suppListEl.appendChild(empty);
    return;
  }

  list.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "supp-row";

    const left = document.createElement("div");
    left.className = "supp-left";
    left.innerHTML = `
      <div class="supp-title">${s.name}</div>
      <div class="supp-sub">${s.dose || ""} ${s.timing ? "• "+s.timing : ""}</div>
      <div class="supp-sub muted">
        ${s.pairs ? "Pairs: "+s.pairs : ""} ${s.why ? "• "+s.why : ""}
      </div>
      ${s.notes ? `<div class="supp-notes">${s.notes}</div>`:""}
    `;

    // toggle taken today
    const toggle = document.createElement("label");
    toggle.className = "switch";
    const inp = document.createElement("input");
    inp.type = "checkbox";
    inp.checked = !!taken[s.name];
    const slid = document.createElement("span");
    slid.className = "slider";
    toggle.appendChild(inp); toggle.appendChild(slid);

    inp.addEventListener("change", ()=>{
      const m = loadTakenMap();
      if (inp.checked) m[s.name] = true; else delete m[s.name];
      saveTakenMap(m);
      // live auto-goal update if creatine present & auto-goal on
      if ((s.name || '').toLowerCase().includes('creatine') && isAutoOn()) {
        renderHydro();
      }
    });

    const menu = document.createElement("div");
    menu.className = "menu";
    menu.innerHTML = `
      <button class="menu-btn" aria-label="More">⋮</button>
      <div class="menu-sheet hidden">
        <button class="menu-item" data-act="edit">Edit</button>
        <button class="menu-item danger" data-act="delete">Delete</button>
        <button class="menu-item" data-act="info">Info</button>
      </div>
    `;
    const btn = menu.querySelector(".menu-btn");
    const sheetEl = menu.querySelector(".menu-sheet");
    btn.onclick = (e)=> {
      e.stopPropagation();
      sheetEl.classList.toggle("hidden");
      document.addEventListener("click", function docClose(ev){
        if (!menu.contains(ev.target)) { sheetEl.classList.add("hidden"); document.removeEventListener("click", docClose); }
      });
    };
    sheetEl.onclick = (e)=>{
      const act = e.target.getAttribute("data-act");
      if (!act) return;
      sheetEl.classList.add("hidden");
      if (act==="edit") openEditor(s, idx);
      if (act==="delete") doDelete(idx);
      if (act==="info") showInfo(s);
    };

    const right = document.createElement("div");
    right.className = "supp-right";
    right.appendChild(toggle);
    right.appendChild(menu);

    row.appendChild(left);
    row.appendChild(right);
    suppListEl.appendChild(row);
  });

  // Snackbar undo
  if (undoBtn){
    undoBtn.onclick = ()=>{
      const snack = document.getElementById("snackbar");
      snack?.classList.add("hidden");
      if (lastDeleted){
        const list = loadSupps();
        const idx = Math.min(lastDeleted.index, list.length);
        list.splice(idx, 0, lastDeleted.item);
        saveSupps(list);
        renderSupps();
        lastDeleted = null;
        if (isAutoOn()) renderHydro();
      }
    };
  }
}

function openEditor(s=null, idx=null){
  editingIndex = idx;
  const title = document.getElementById("sheetTitle");
  if (s){
    title.textContent = "Edit supplement";
    fName.value = s.name; fDose.value = s.dose||""; fTiming.value=s.timing||"";
    fPairs.value = s.pairs||""; fNotes.value = s.notes||"";
  } else {
    title.textContent = "Add supplement";
    fName.value = ""; fDose.value=""; fTiming.value=""; fPairs.value=""; fNotes.value="";
  }
  sheet.classList.remove("hidden");
}
function closeEditor(){ sheet.classList.add("hidden"); }

function onSubmit(e){
  e.preventDefault();
  const name = fName.value.trim();
  if (!name){ fName.focus(); return; }

  let dose = fDose.value.trim();
  let timing = fTiming.value.trim();
  let pairs = fPairs.value.trim();
  let notes = fNotes.value.trim();
  let why = "";

  if (editingIndex===null){
    const sug = suggestFor(name);
    if (!dose)   dose   = sug.dose || "";
    if (!timing) timing = sug.timing || "";
    if (!pairs)  pairs  = sug.pairs || "";
    if (!notes)  notes  = sug.notes || "";
    why = sug.why || "";
  }

  const list = loadSupps();
  const exists = list.findIndex(x => x.name.toLowerCase() === name.toLowerCase());
  if (exists !== -1 && exists !== editingIndex){
    alert("A supplement with that name already exists.");
    return;
  }

  const obj = { name, dose, timing, pairs, notes, why: why || (list[editingIndex]?.why || "") };

  if (editingIndex===null){ list.unshift(obj); } else { list[editingIndex] = obj; }
  saveSupps(list);
  renderSupps();
  closeEditor();
  if (isAutoOn()) renderHydro();
}

function doDelete(idx){
  const list = loadSupps();
  lastDeleted = { item: list[idx], index: idx };
  list.splice(idx,1);
  saveSupps(list);
  renderSupps();
  showSnack(`Deleted ${lastDeleted.item.name}`);
  if (isAutoOn()) renderHydro();
}

function showInfo(s){
  const parts = [
    s.name,
    s.dose && `Dose: ${s.dose}`,
    s.timing && `Timing: ${s.timing}`,
    s.pairs && `Pairs best with: ${s.pairs}`,
    s.why && `Why: ${s.why}`,
    s.notes && `Notes: ${s.notes}`
  ].filter(Boolean).join("\n");
  alert(parts || s.name);
}

function onRestoreDefaults(){
  const defs = JSON.parse(localStorage.getItem(DEFAULTS_KEY) || "[]");
  const curr = loadSupps();
  const names = new Set(curr.map(x=>x.name.toLowerCase()));
  defs.forEach(d => { if (!names.has(d.name.toLowerCase())) curr.push(d); });
  saveSupps(curr);
  renderSupps();
  showSnack("Defaults restored");
  if (isAutoOn()) renderHydro();
}

/* -------- Typeahead (expanded) -------- */
function setupTypeahead(){
  const wrap = document.querySelector('#fName')?.parentElement;
  if (!wrap) return;
  wrap.style.position = 'relative';
  const ta = document.createElement('div');
  ta.id = 'typeahead';
  ta.className = 'typeahead hidden';
  wrap.appendChild(ta);

  function suggestionsFor(inputStr, limit=8){
    const s = (inputStr||"").trim().toLowerCase();
    if (!s) return [];
    const map = window.ALIAS_TO_CANON || {};
    const keys = Object.keys(map);
    const flat = x => x.replace(/[^a-z0-9]/g,'');
    const sFlat = flat(s);
    const uniq = new Set(), out = [];
    // strong starts-with
    keys.forEach(k=>{
      if (flat(k).startsWith(sFlat)){
        const canon = map[k]; if (!uniq.has(canon)){ uniq.add(canon); out.push(canon); }
      }
    });
    // then contains
    keys.forEach(k=>{
      if (out.length>=limit) return;
      if (flat(k).includes(sFlat)){
        const canon = map[k]; if (!uniq.has(canon)){ uniq.add(canon); out.push(canon); }
      }
    });
    return out.slice(0,limit);
  }

  function show(list){
    if (!list.length){ ta.classList.add('hidden'); ta.innerHTML=''; return; }
    ta.innerHTML = list.map(c => `<button type="button" data-canon="${c}">${c}</button>`).join('');
    ta.classList.remove('hidden');
    [...ta.querySelectorAll('button')].forEach(btn=>{
      btn.onclick = ()=>{
        const canon = btn.getAttribute('data-canon');
        document.getElementById('fName').value = canon;
        const sug = (window.SMART_SUGGESTIONS||{})[canon];
        if (sug){
          if (!fDose.value)   fDose.value   = sug.dose || '';
          if (!fTiming.value) fTiming.value = sug.timing || '';
          if (!fPairs.value)  fPairs.value  = sug.pairs || '';
          if (!fNotes.value)  fNotes.value  = sug.notes || '';
        }
        ta.classList.add('hidden'); ta.innerHTML='';
      };
    });
  }

  fName.addEventListener('input', ()=> show(suggestionsFor(fName.value)));
  fName.addEventListener('blur',  ()=> setTimeout(()=> ta.classList.add('hidden'), 150));
}