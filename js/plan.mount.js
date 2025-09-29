// Mounts a nutrition plan into the DOM.
// This function is stateless: it does not persist any global state outside
// of DOM elements. It renders navigation for Monday–Sunday and displays
// the meals and totals for the selected day.

export function mountPlan(plan, container) {
  if (!container) return;
  // Clear container
  container.innerHTML = '';
  if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) {
    container.textContent = 'No plan available.';
    return;
  }
  // Create navigation
  const nav = document.createElement('div');
  nav.className = 'plan-nav';
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Create display area
  const detail = document.createElement('div');
  detail.className = 'plan-detail';
  container.appendChild(nav);
  container.appendChild(detail);
  // Helper to render a day
  function renderDay(index) {
    const day = plan.days[index];
    if (!day) return;
    detail.innerHTML = '';
    const dateEl = document.createElement('h3');
    dateEl.textContent = day.date || names[index];
    detail.appendChild(dateEl);
    // List meals
    day.meals.forEach((meal, slotIdx) => {
      const mealDiv = document.createElement('div');
      mealDiv.className = 'meal';
      const slotName = ['Breakfast', 'Lunch', 'Dinner'][slotIdx] || 'Meal';
      const heading = document.createElement('h4');
      heading.textContent = slotName;
      mealDiv.appendChild(heading);
      const list = document.createElement('ul');
      meal.items.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.foodId} – ${item.grams}g`;
        list.appendChild(li);
      });
      mealDiv.appendChild(list);
      detail.appendChild(mealDiv);
    });
    // Totals
    if (day.totals) {
      const totalsDiv = document.createElement('div');
      totalsDiv.className = 'totals';
      const { kcal, protein, carbs, fat } = day.totals;
      totalsDiv.textContent = `Totals: ${kcal} kcal, P: ${protein}g, C: ${carbs}g, F: ${fat}g`;
      detail.appendChild(totalsDiv);
    }
  }
  // Create nav buttons
  plan.days.forEach((day, idx) => {
    const btn = document.createElement('button');
    btn.textContent = names[idx] || String(idx + 1);
    btn.addEventListener('click', () => renderDay(idx));
    nav.appendChild(btn);
  });
  // Render first day by default
  renderDay(0);
}

export default {
  mountPlan,
};