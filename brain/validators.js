// Tiny guard checks; replace with Ajv in CI later.
export function validateFoodMinimal(food) {
  const need = ['id','name','canonical_portion_g','density_g_per_ml','category','diet_tags','allergens','is_fortified','kitchen_state','yield_factor','retention_factors','cost_aud_per_100g','nutrients_per_100g'];
  const missing = need.filter(k => !(k in food));
  return missing;
}
