import { ensureToday } from "./utils.js";
import { mountDiet, renderDiet } from "./diet.js";
import { mountSupps, renderSupps } from "./supps.js";
import { mountHydration, renderHydro } from "./hydration.js";

const tabDiet  = document.getElementById("tabDiet");
const tabSupps = document.getElementById("tabSupps");
const tabHydro = document.getElementById("tabHydro");
const dietPage = document.getElementById("dietPage");
const suppsPage= document.getElementById("suppsPage");
const hydroPage= document.getElementById("hydroPage");
const daySwitcher = document.getElementById("daySwitcher");

/* NEW: verify data.js is present & defines window.mealPlan/defaultSupps */
function assertDataLoaded() {
  const ok =
    window.mealPlan && Object.keys(window.mealPlan).length &&
    window.defaultSupps && Array.isArray(window.defaultSupps);
  if (!ok) {
    const meals = document.getElementById("meals");
    if (meals) {
      meals.innerHTML = `
        <div class="empty-state">
          <div class="empty-title">Missing data</div>
          <div class="empty-sub">
            Couldn’t find <code>data.js</code> or it doesn’t define
            <code>window.mealPlan</code> / <code>window.defaultSupps</code>.
          </div>
        </div>`;
    }
  }
  return ok;
}

function setTab(which){
  const sh = document.getElementById("sheet");
  if (sh) sh.classList.add("hidden");

  const showDiet = which==="diet";
  const showSupp = which==="supps";
  const showHydr = which==="hydro";

  tabDiet.classList.toggle("active", showDiet);
  tabSupps.classList.toggle("active", showSupp);
  tabHydro.classList.toggle("active", showHydr);
  dietPage.classList.toggle("hidden", !showDiet);
  suppsPage.classList.toggle("hidden", !showSupp);
  hydroPage.classList.toggle("hidden", !showHydr);
  daySwitcher.style.display = showDiet ? "flex" : "none";

  if (showSupp){ ensureToday(); renderSupps(); }
  if (showHydr){ ensureToday(); renderHydro(); }
  if (showDiet){ renderDiet(); }
}

function init(){
  /* NEW: run check before mounting */
  assertDataLoaded();

  ensureToday();
  // mount sections
  mountDiet();
  mountSupps();
  mountHydration();

  // tabs
  tabDiet.onclick  = () => setTab("diet");
  tabSupps.onclick = () => setTab("supps");
  tabHydro.onclick = () => setTab("hydro");

  // default tab
  setTab("diet");

  // re-checks across midnight / background resume
  document.addEventListener("visibilitychange", ()=>{
    if (!document.hidden) {
      ensureToday();
      if (!hydroPage.classList.contains('hidden')) renderHydro();
      if (!suppsPage.classList.contains('hidden')) renderSupps();
    }
  });
  setInterval(()=> {
    ensureToday();
    if (!hydroPage.classList.contains('hidden')) renderHydro();
    if (!suppsPage.classList.contains('hidden')) renderSupps();
  }, 60000);
}

init();