// Mapping of food IDs to Woolworths store search URLs (AU).
// Using search URLs keeps us brand-agnostic while staying within stores/*.

const woolworthsMap = {
  chicken_breast_raw:            "https://www.woolworths.com.au/shop/search/products?searchTerm=chicken%20breast",
  broccoli_florets:              "https://www.woolworths.com.au/shop/search/products?searchTerm=broccoli%20florets",
  carrot:                        "https://www.woolworths.com.au/shop/search/products?searchTerm=carrot",
  capsicum_red:                  "https://www.woolworths.com.au/shop/search/products?searchTerm=red%20capsicum",
  soy_sauce:                     "https://www.woolworths.com.au/shop/search/products?searchTerm=soy%20sauce",
  garlic:                        "https://www.woolworths.com.au/shop/search/products?searchTerm=garlic",
  ginger:                        "https://www.woolworths.com.au/shop/search/products?searchTerm=ginger",
  canola_or_rice_bran_oil:       "https://www.woolworths.com.au/shop/search/products?searchTerm=canola%20oil%20rice%20bran%20oil",
  rice_cooked:                   "https://www.woolworths.com.au/shop/search/products?searchTerm=microwave%20rice",

  eggs:                          "https://www.woolworths.com.au/shop/search/products?searchTerm=eggs",
  bacon_rashers:                 "https://www.woolworths.com.au/shop/search/products?searchTerm=bacon%20rashers",
  canned_tomatoes:               "https://www.woolworths.com.au/shop/search/products?searchTerm=canned%20tomatoes",
  baked_beans:                   "https://www.woolworths.com.au/shop/search/products?searchTerm=baked%20beans",
  olive_oil:                     "https://www.woolworths.com.au/shop/search/products?searchTerm=olive%20oil",
  chilli_flakes:                 "https://www.woolworths.com.au/shop/search/products?searchTerm=chilli%20flakes",
  bread_sourdough:               "https://www.woolworths.com.au/shop/search/products?searchTerm=sourdough%20bread",

  onion_brown:                   "https://www.woolworths.com.au/shop/search/products?searchTerm=brown%20onion",
  potato:                        "https://www.woolworths.com.au/shop/search/products?searchTerm=potato",
  aubergine_eggplant:            "https://www.woolworths.com.au/shop/search/products?searchTerm=eggplant",
  button_mushrooms:              "https://www.woolworths.com.au/shop/search/products?searchTerm=button%20mushrooms",
  curry_paste:                   "https://www.woolworths.com.au/shop/search/products?searchTerm=curry%20paste",
  veg_stock:                     "https://www.woolworths.com.au/shop/search/products?searchTerm=vegetable%20stock",
  coconut_milk_light:            "https://www.woolworths.com.au/shop/search/products?searchTerm=coconut%20milk%20light",
  coriander_fresh:               "https://www.woolworths.com.au/shop/search/products?searchTerm=coriander%20bunch",

  tomatoes_roasted:              "https://www.woolworths.com.au/shop/search/products?searchTerm=roasted%20tomatoes",
  feta:                          "https://www.woolworths.com.au/shop/search/products?searchTerm=feta",
  bread_rye:                     "https://www.woolworths.com.au/shop/search/products?searchTerm=rye%20bread",

  rolled_oats_gluten_free:       "https://www.woolworths.com.au/shop/search/products?searchTerm=gluten%20free%20rolled%20oats",
  chia_seeds:                    "https://www.woolworths.com.au/shop/search/products?searchTerm=chia%20seeds",
  plant_milk_almond_unsweetened: "https://www.woolworths.com.au/shop/search/products?searchTerm=almond%20milk%20unsweetened",
  banana:                        "https://www.woolworths.com.au/shop/search/products?searchTerm=banana",
  berries_mixed:                 "https://www.woolworths.com.au/shop/search/products?searchTerm=mixed%20berries",

  potato_baking:                 "https://www.woolworths.com.au/shop/search/products?searchTerm=baking%20potato",
  canned_chickpeas_drained:      "https://www.woolworths.com.au/shop/search/products?searchTerm=canned%20chickpeas",
  tomato_passata:                "https://www.woolworths.com.au/shop/search/products?searchTerm=tomato%20passata",
  curry_powder:                  "https://www.woolworths.com.au/shop/search/products?searchTerm=curry%20powder",
  spinach:                       "https://www.woolworths.com.au/shop/search/products?searchTerm=spinach",

  salmon_fillet_raw:             "https://www.woolworths.com.au/shop/search/products?searchTerm=salmon%20fillet",
  asparagus:                     "https://www.woolworths.com.au/shop/search/products?searchTerm=asparagus",
  lemon:                         "https://www.woolworths.com.au/shop/search/products?searchTerm=lemon",
  salt:                          "https://www.woolworths.com.au/shop/search/products?searchTerm=salt",
  orange_or_lemon_juice:         "https://www.woolworths.com.au/shop/search/products?searchTerm=lemon%20juice%20orange%20juice",

  gf_plain_flour:                "https://www.woolworths.com.au/shop/search/products?searchTerm=gluten%20free%20plain%20flour",
  plant_milk:                    "https://www.woolworths.com.au/shop/search/products?searchTerm=plant%20milk",
  egg_or_substitute:             "https://www.woolworths.com.au/shop/search/products?searchTerm=egg%20substitute%20eggs",
  maple_syrup:                   "https://www.woolworths.com.au/shop/search/products?searchTerm=maple%20syrup",
  blueberries:                   "https://www.woolworths.com.au/shop/search/products?searchTerm=blueberries",

  snow_peas:                     "https://www.woolworths.com.au/shop/search/products?searchTerm=snow%20peas",
  sweet_sour_sauce:              "https://www.woolworths.com.au/shop/search/products?searchTerm=sweet%20and%20sour%20sauce",

  gf_pancake_mix:                "https://www.woolworths.com.au/shop/search/products?searchTerm=gluten%20free%20pancake%20mix",
  milk_or_df_milk:               "https://www.woolworths.com.au/shop/search/products?searchTerm=milk%20almond%20milk%20oat%20milk",
  protein_powder_vanilla:        "https://www.woolworths.com.au/shop/search/products?searchTerm=protein%20powder%20vanilla",
  peanut_butter:                 "https://www.woolworths.com.au/shop/search/products?searchTerm=peanut%20butter"
};

export default woolworthsMap;