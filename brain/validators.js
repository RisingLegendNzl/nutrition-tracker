// Tiny guard checks; replace with Ajv in CI later.
export function validateFoodMinimal(food) {
  const need = ['id','name','canonical_portion_g','density_g_per_ml','category','diet_tags','allergens','is_fortified','kitchen_state','yield_factor','retention_factors','cost_aud_per_100g','nutrients_per_100g'];
  const missing = need.filter(k => !(k in food));
  return missing;
}

// Validate that a weekly plan has entries for all seven days and each day includes breakfast, lunch and dinner.
// Returns an array of issues (empty if valid).
export function validateWeeklyPlan(plan) {
  const issues = [];
  const expectedDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  if (!plan || typeof plan !== 'object') {
    issues.push('Plan is missing or not an object');
    return issues;
  }
  expectedDays.forEach(day => {
    const dayPlan = plan[day];
    if (!dayPlan) {
      issues.push(`Missing day: ${day}`);
    } else {
      // Check presence of breakfast, lunch and dinner slots
      ['breakfast','lunch','dinner'].forEach(slot => {
        if (!dayPlan[slot]) {
          issues.push(`${day} missing ${slot}`);
        }
      });
    }
  });
  return issues;
}