// Nutritional information definitions and accessors.
// All values are per 100 g (or ml for liquids where appropriate), rounded sensibly.

const nutritionalInfo = {
  chicken_breast_raw:            { kcal: 120, p: 22.0, c: 0.0,  f: 2.5 },
  broccoli_florets:              { kcal: 35,  p: 2.8,  c: 7.0,  f: 0.4 },
  carrot:                        { kcal: 41,  p: 0.9,  c: 10.0, f: 0.2 },
  capsicum_red:                  { kcal: 31,  p: 1.0,  c: 6.0,  f: 0.3 },
  soy_sauce:                     { kcal: 53,  p: 8.0,  c: 5.0,  f: 0.1 },
  garlic:                        { kcal: 149, p: 6.4,  c: 33.0, f: 0.5 },
  ginger:                        { kcal: 80,  p: 1.8,  c: 18.0, f: 0.8 },
  canola_or_rice_bran_oil:       { kcal: 884, p: 0.0,  c: 0.0,  f: 100.0 },
  rice_cooked:                   { kcal: 130, p: 2.7,  c: 28.0, f: 0.3 },

  eggs:                          { kcal: 143, p: 12.6, c: 1.1,  f: 9.5 },
  bacon_rashers:                 { kcal: 541, p: 37.0, c: 1.4,  f: 42.0 },
  canned_tomatoes:               { kcal: 21,  p: 1.1,  c: 4.0,  f: 0.2 },
  baked_beans:                   { kcal: 94,  p: 5.0,  c: 16.0, f: 0.5 },
  olive_oil:                     { kcal: 884, p: 0.0,  c: 0.0,  f: 100.0 },
  chilli_flakes:                 { kcal: 282, p: 12.0, c: 50.0, f: 14.0 },
  bread_sourdough:               { kcal: 230, p: 8.5,  c: 48.0, f: 1.5 },

  onion_brown:                   { kcal: 40,  p: 1.1,  c: 9.0,  f: 0.1 },
  potato:                        { kcal: 77,  p: 2.0,  c: 17.0, f: 0.1 },
  aubergine_eggplant:            { kcal: 25,  p: 1.0,  c: 6.0,  f: 0.2 },
  button_mushrooms:              { kcal: 22,  p: 3.1,  c: 3.3,  f: 0.3 },
  curry_paste:                   { kcal: 120, p: 2.0,  c: 16.0, f: 4.0 },
  veg_stock:                     { kcal: 5,   p: 0.5,  c: 0.5,  f: 0.1 },
  coconut_milk_light:            { kcal: 60,  p: 1.5,  c: 3.0,  f: 5.0 },
  coriander_fresh:               { kcal: 23,  p: 2.1,  c: 3.7,  f: 0.5 },

  tomatoes_roasted:              { kcal: 45,  p: 1.8,  c: 10.0, f: 0.4 },
  feta:                          { kcal: 265, p: 14.0, c: 4.0,  f: 21.0 },
  bread_rye:                     { kcal: 259, p: 8.5,  c: 48.0, f: 3.3 },

  rolled_oats_gluten_free:       { kcal: 379, p: 13.0, c: 66.0, f: 7.0 },
  chia_seeds:                    { kcal: 486, p: 17.0, c: 42.0, f: 31.0 },
  plant_milk_almond_unsweetened: { kcal: 13,  p: 0.5,  c: 0.3,  f: 1.1 },
  banana:                        { kcal: 89,  p: 1.1,  c: 23.0, f: 0.3 },
  berries_mixed:                 { kcal: 57,  p: 0.7,  c: 14.0, f: 0.3 },

  potato_baking:                 { kcal: 77,  p: 2.0,  c: 17.0, f: 0.1 },
  canned_chickpeas_drained:      { kcal: 164, p: 9.0,  c: 27.0, f: 2.6 },
  tomato_passata:                { kcal: 32,  p: 1.6,  c: 6.0,  f: 0.2 },
  curry_powder:                  { kcal: 325, p: 14.0, c: 58.0, f: 14.0 },
  spinach:                       { kcal: 23,  p: 2.9,  c: 3.6,  f: 0.4 },

  salmon_fillet_raw:             { kcal: 208, p: 20.0, c: 0.0,  f: 13.0 },
  asparagus:                     { kcal: 20,  p: 2.2,  c: 3.9,  f: 0.1 },
  lemon:                         { kcal: 29,  p: 1.1,  c: 9.3,  f: 0.3 },
  salt:                          { kcal: 0,   p: 0.0,  c: 0.0,  f: 0.0 },
  orange_or_lemon_juice:         { kcal: 45,  p: 0.7,  c: 10.0, f: 0.2 },

  gf_plain_flour:                { kcal: 364, p: 2.0,  c: 86.0, f: 1.0 },
  plant_milk:                    { kcal: 30,  p: 1.0,  c: 3.0,  f: 1.5 },
  egg_or_substitute:             { kcal: 143, p: 12.6, c: 1.1,  f: 9.5 }, // default to egg profile
  maple_syrup:                   { kcal: 260, p: 0.0,  c: 67.0, f: 0.0 },
  blueberries:                   { kcal: 57,  p: 0.7,  c: 14.0, f: 0.3 },

  snow_peas:                     { kcal: 42,  p: 3.0,  c: 7.0,  f: 0.2 },
  sweet_sour_sauce:              { kcal: 150, p: 0.5,  c: 37.0, f: 0.2 },

  gf_pancake_mix:                { kcal: 360, p: 6.0,  c: 80.0, f: 2.0 },
  milk_or_df_milk:               { kcal: 45,  p: 3.0,  c: 4.5,  f: 1.5 }, // midpoint of dairy/DF options
  protein_powder_vanilla:        { kcal: 400, p: 80.0, c: 10.0, f: 6.0 },
  peanut_butter:                 { kcal: 588, p: 25.0, c: 20.0, f: 50.0 }
};

export default nutritionalInfo;