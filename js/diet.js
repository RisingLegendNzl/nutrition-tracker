import { clamp } from "./utils.js";

// reads window.mealPlan & renders diet page
const dayNameEl = document.getElementById("dayName");
const mealsEl = document.getElementById("meals");
const barsEl = document.getElementById("bars");
const macroSummaryEl = document.getElementById("macroSummary");
const prevBtn = document.getElementById("prevDay");
const nextBtn = document.getElementById("nextDay");

let dayIndex = 0;
const days = Object.keys(window.mealPlan || {});
const mealEaten = {};
const openMeals = {};

const goals = {
  calories: 3500, protein: 200, fibre: 30,
  iron: 8, zinc: 14, calcium: 1000,
  vitaminC: 45, folate: 400, potassium: 3800
};

function labelPretty(key){
  return {
    calories:"Calories", protein:"Protein", fibre:"Fibre", iron:"Iron", zinc:"Zinc",
    calcium:"Calcium", vitaminC:"Vitamin C", folate:"Folate", potassium:"Potassium"
  }[key] || key;
}
function formatValue(key,v){
  if (key==="calories") return Math.round(v)+" kcal";
  if (key==="protein"||key==="fibre") return Math.round(v)+" g";
  if (key==="iron"||key==="zinc") return v.toFixed(1)+" mg";
  if (key==="vitaminC") return Math.round(v)+" mg";
  if (key==="folate") return Math.round(v)+" µg";
  if (key==="calcium"||key==="potassium") return Math.round(v)+" mg";
  return v;
}

export function mountDiet(){
  prevBtn.addEventListener("click", () => { if (dayIndex>0){ dayIndex--; renderDiet(); } });
  nextBtn.addEventListener("click", () => { if (dayIndex<days.length-1){ dayIndex++; renderDiet(); } });
  document.getElementById("resetDiet").addEventListener("click", ()=>{
    const day = days[dayIndex];
    mealEaten[day] = {};
    renderDiet();
  });
  document.getElementById("resetWeek").addEventListener("click", ()=>{
    days.forEach(d => { mealEaten[d] = {}; });
    renderDiet();
  });
  renderDiet();
}

export function renderDiet(){
  const day = days[dayIndex];
  const meals = window.mealPlan[day];
  dayNameEl.textContent = day;
  prevBtn.disabled = dayIndex===0; nextBtn.disabled = dayIndex===days.length-1;

  mealsEl.innerHTML = "";
  Object.entries(meals).forEach(([mealName, mealData]) => {
    const card = document.createElement("div");
    card.className = "meal-row";
    if (openMeals[day]?.[mealName]) card.classList.add("open");

    const rowBtn = document.createElement("div");
    rowBtn.className = "meal-title";
    rowBtn.innerHTML = `
      <div class="title-line">
        <span class="chev" aria-hidden="true"></span>
        <span class="meal-name">${mealName}</span>
      </div>
      <div class="meal-macros">${mealData.calories} kcal • ${mealData.protein} g protein • ${mealData.fibre} g fibre</div>
    `;
    rowBtn.addEventListener("click", () => {
      openMeals[day] = openMeals[day] || {};
      openMeals[day][mealName] = !openMeals[day][mealName];
      renderDiet();
    });

    const toggleWrap = document.createElement("label");
    toggleWrap.className = "switch";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = mealEaten[day]?.[mealName] || false;
    const slider = document.createElement("span");
    slider.className = "slider";
    toggleWrap.addEventListener("click", (e)=> e.stopPropagation());
    input.addEventListener("change", () => {
      mealEaten[day] = mealEaten[day] || {};
      mealEaten[day][mealName] = input.checked;
      updateNutrients();
    });
    toggleWrap.appendChild(input);
    toggleWrap.appendChild(slider);

    const top = document.createElement("div");
    top.className = "meal-top";
    top.appendChild(rowBtn);
    top.appendChild(toggleWrap);

    const details = document.createElement("div");
    details.className = "ingredients";
    if (mealData.ingredients?.length) {
      const ul = document.createElement("ul");
      mealData.ingredients.forEach(it => {
        const li = document.createElement("li");
        li.textContent = it;
        ul.appendChild(li);
      });
      details.appendChild(ul);
    }

    card.appendChild(top);
    card.appendChild(details);
    mealsEl.appendChild(card);
  });

  updateNutrients();
}

function updateNutrients(){
  const day = Object.keys(window.mealPlan)[dayIndex];
  const meals = window.mealPlan[day];
  const totals = Object.keys(goals).reduce((a,k)=>(a[k]=0,a),{});
  Object.entries(meals).forEach(([mName,mData])=>{
    if (!mealEaten[day]?.[mName]){
      for (const k in goals) totals[k] += mData[k] || 0;
    }
  });

  macroSummaryEl.innerHTML = `
    <div class="pill"><span>Calories</span><strong>${Math.round(totals.calories)}</strong></div>
    <div class="pill"><span>Protein</span><strong>${Math.round(totals.protein)} g</strong></div>
    <div class="pill"><span>Fibre</span><strong>${Math.round(totals.fibre)} g</strong></div>
  `;

  barsEl.innerHTML = "";
  Object.entries(goals).forEach(([k,goal])=>{
    const v = totals[k];
    const pct = Math.min(100, (v/goal)*100);
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-label">
        <span>${labelPretty(k)}</span>
        <span class="bar-value">${formatValue(k,v)} / ${formatValue(k,goal)}</span>
      </div>
      <div class="bar-outer"><div class="bar-inner" style="width:${pct}%"></div></div>
    `;
    barsEl.appendChild(row);
  });
}