// Core food definitions and utilities.

const foods = {
  chicken_breast_raw:            { id: "chicken_breast_raw",            label: "Chicken breast (raw, skinless)", base_grams: 100 },
  broccoli_florets:              { id: "broccoli_florets",              label: "Broccoli florets (raw)",         base_grams: 100 },
  carrot:                        { id: "carrot",                        label: "Carrot (raw)",                   base_grams: 100 },
  capsicum_red:                  { id: "capsicum_red",                  label: "Red capsicum / bell pepper",     base_grams: 100 },
  soy_sauce:                     { id: "soy_sauce",                     label: "Soy sauce",                      base_grams: 100 },
  garlic:                        { id: "garlic",                        label: "Garlic (raw)",                   base_grams: 100 },
  ginger:                        { id: "ginger",                        label: "Ginger (raw)",                   base_grams: 100 },
  canola_or_rice_bran_oil:       { id: "canola_or_rice_bran_oil",       label: "Canola or rice bran oil",        base_grams: 100 },
  rice_cooked:                   { id: "rice_cooked",                   label: "White rice (cooked)",            base_grams: 100 },

  eggs:                          { id: "eggs",                          label: "Eggs (whole)",                   base_grams: 100 },
  bacon_rashers:                 { id: "bacon_rashers",                 label: "Bacon rashers",                  base_grams: 100 },
  canned_tomatoes:               { id: "canned_tomatoes",               label: "Canned tomatoes",                base_grams: 100 },
  baked_beans:                   { id: "baked_beans",                   label: "Baked beans (canned)",           base_grams: 100 },
  olive_oil:                     { id: "olive_oil",                     label: "Olive oil",                      base_grams: 100 },
  chilli_flakes:                 { id: "chilli_flakes",                 label: "Chilli flakes",                  base_grams: 100 },
  bread_sourdough:               { id: "bread_sourdough",               label: "Sourdough bread",                base_grams: 100 },

  onion_brown:                   { id: "onion_brown",                   label: "Brown onion (raw)",              base_grams: 100 },
  potato:                        { id: "potato",                        label: "Potato (all-purpose)",           base_grams: 100 },
  aubergine_eggplant:            { id: "aubergine_eggplant",            label: "Eggplant / aubergine",           base_grams: 100 },
  button_mushrooms:              { id: "button_mushrooms",              label: "Button mushrooms",               base_grams: 100 },
  curry_paste:                   { id: "curry_paste",                   label: "Curry paste",                    base_grams: 100 },
  veg_stock:                     { id: "veg_stock",                     label: "Vegetable stock (prepared)",     base_grams: 100 },
  coconut_milk_light:            { id: "coconut_milk_light",            label: "Coconut milk (light)",           base_grams: 100 },
  coriander_fresh:               { id: "coriander_fresh",               label: "Coriander / cilantro (fresh)",   base_grams: 100 },

  tomatoes_roasted:              { id: "tomatoes_roasted",              label: "Roasted tomatoes",               base_grams: 100 },
  feta:                          { id: "feta",                          label: "Feta cheese",                    base_grams: 100 },
  bread_rye:                     { id: "bread_rye",                     label: "Rye bread",                      base_grams: 100 },

  rolled_oats_gluten_free:       { id: "rolled_oats_gluten_free",       label: "Rolled oats (gluten-free)",      base_grams: 100 },
  chia_seeds:                    { id: "chia_seeds",                    label: "Chia seeds",                     base_grams: 100 },
  plant_milk_almond_unsweetened: { id: "plant_milk_almond_unsweetened", label: "Almond milk (unsweetened)",      base_grams: 100 },
  banana:                        { id: "banana",                        label: "Banana",                         base_grams: 100 },
  berries_mixed:                 { id: "berries_mixed",                 label: "Mixed berries",                  base_grams: 100 },

  potato_baking:                 { id: "potato_baking",                 label: "Baking potato",                  base_grams: 100 },
  canned_chickpeas_drained:      { id: "canned_chickpeas_drained",      label: "Canned chickpeas (drained)",     base_grams: 100 },
  tomato_passata:                { id: "tomato_passata",                label: "Tomato passata",                 base_grams: 100 },
  curry_powder:                  { id: "curry_powder",                  label: "Curry powder",                   base_grams: 100 },
  spinach:                       { id: "spinach",                       label: "Spinach",                        base_grams: 100 },

  salmon_fillet_raw:             { id: "salmon_fillet_raw",             label: "Salmon fillet (raw)",            base_grams: 100 },
  asparagus:                     { id: "asparagus",                     label: "Asparagus",                      base_grams: 100 },
  lemon:                         { id: "lemon",                         label: "Lemon (whole)",                  base_grams: 100 },
  salt:                          { id: "salt",                          label: "Salt",                           base_grams: 100 },
  orange_or_lemon_juice:         { id: "orange_or_lemon_juice",         label: "Orange or lemon juice",          base_grams: 100 },

  gf_plain_flour:                { id: "gf_plain_flour",                label: "Gluten-free plain flour",        base_grams: 100 },
  plant_milk:                    { id: "plant_milk",                    label: "Plant milk (generic)",           base_grams: 100 },
  egg_or_substitute:             { id: "egg_or_substitute",             label: "Egg or substitute",              base_grams: 100 },
  maple_syrup:                   { id: "maple_syrup",                   label: "Maple syrup",                    base_grams: 100 },
  blueberries:                   { id: "blueberries",                   label: "Blueberries",                    base_grams: 100 },

  snow_peas:                     { id: "snow_peas",                     label: "Snow peas",                      base_grams: 100 },
  sweet_sour_sauce:              { id: "sweet_sour_sauce",              label: "Sweet & sour sauce",             base_grams: 100 },

  gf_pancake_mix:                { id: "gf_pancake_mix",                label: "Gluten-free pancake mix",        base_grams: 100 },
  milk_or_df_milk:               { id: "milk_or_df_milk",               label: "Milk or dairy-free milk",        base_grams: 100 },
  protein_powder_vanilla:        { id: "protein_powder_vanilla",        label: "Protein powder (vanilla)",       base_grams: 100 },
  peanut_butter:                 { id: "peanut_butter",                 label: "Peanut butter",                  base_grams: 100 }
};

export default foods;