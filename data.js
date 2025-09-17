// =====================================================
// Nutrition Database (per 100 g unless unit_g is given)
// Brand-matched to Coles where labels exist; otherwise
// AU FSANZ/AFCD references for raw produce/meats.
// =====================================================
window.NUTRITION_DB = {
  // Pantry / staples
  "rolled oats":         { per:100, k:380, p:13.5, c:61.5, f:6.5,  fib:10.0, fe:4.3, zn:3.1, ca:54,  vC:0,   fol:56,  kplus:429 },
  "full cream milk":     { per:100, k:64,  p:3.3,  c:4.8,  f:3.6,  fib:0,    fe:0.03,zn:0.4, ca:120, vC:0,   fol:5,   kplus:150 },
  "greek yogurt":        { per:100, k:73,  p:10.0, c:3.6,  f:3.8,  fib:0,    fe:0.1, zn:0.6, ca:110, vC:0.5, fol:12,  kplus:141 },
  "peanut butter":       { per:100, k:588, p:25.0, c:20.0, f:50.0, fib:6.0,  fe:1.9, zn:3.3, ca:43,  vC:0,   fol:92,  kplus:649 },
  "olive oil":           { per:100, k:884, p:0,    c:0,    f:100,  fib:0,    fe:0,   zn:0,   ca:1,   vC:0,   fol:0,   kplus:1   },

  // Proteins (Coles / AFCD where noted)
  "beef mince 5★ (lean)":    { per:100, k:137, p:26,  c:0, f:5,  fib:0, fe:2.2, zn:4.5, ca:18, vC:0, fol:8,  kplus:330 },
  "beef mince 3★ (regular)": { per:100, k:254, p:17,  c:0, f:20, fib:0, fe:2.1, zn:4.2, ca:18, vC:0, fol:8,  kplus:330 },
  // Raw, skinless thigh fillet (FSANZ/AFCD typical)
  "chicken thigh fillets":   { per:100, k:145, p:18.0, c:0, f:8.0, fib:0, fe:0.9, zn:1.4, ca:14, vC:0, fol:6,  kplus:239 },
  "tuna (springwater, drained)": { per:100, k:116, p:26,  c:0, f:1,  fib:0, fe:1.0, zn:0.6, ca:9, vC:0, fol:2, kplus:210, unit_g:200 },
  "egg (whole)":            { per:100, k:155, p:13,  c:1.1,f:11, fib:0, fe:1.8, zn:1.3, ca:50, vC:0, fol:47, kplus:126, unit_g:50 },

  // Carbs / veg & canned
  "rice (cooked)":           { per:100, k:130, p:2.7, c:28.0, f:0.3, fib:0.4, fe:0.2, zn:0.4, ca:10, vC:0,   fol:58,  kplus:35  },
  "potatoes":                { per:100, k:77,  p:2.0, c:17.0, f:0.1, fib:2.2, fe:0.8, zn:0.3, ca:12, vC:20,  fol:19,  kplus:425 },
  "sweet potato":            { per:100, k:86,  p:1.6, c:20.0, f:0.1, fib:3.0, fe:0.6, zn:0.3, ca:30, vC:2.4, fol:11,  kplus:337 },
  // Coles Frozen Carrot/Corn/Peas back-calculated from label
  "frozen mixed vegetables": { per:100, k:40,  p:2.1, c:4.6,  f:1.0, fib:2.5, fe:0.5, zn:0.4, ca:20, vC:15,  fol:30,  kplus:160 },
  // Coles Lentils (canned, drained)
  "lentils (canned, drained)": { per:100, k:95, p:7.0, c:13.0, f:0.4, fib:6.0, fe:2.2, zn:1.2, ca:19, vC:1.5, fol:45, kplus:180 },
  "spinach":                 { per:100, k:23,  p:2.9, c:3.6,  f:0.4, fib:2.2, fe:2.7, zn:0.5, ca:99, vC:28,  fol:194, kplus:558 },
  "carrots":                 { per:100, k:41,  p:0.9, c:10.0, f:0.2, fib:2.8, fe:0.3, zn:0.2, ca:33, vC:5.9, fol:19,  kplus:320 },
  "peas":                    { per:100, k:81,  p:5.0, c:14.0, f:0.4, fib:5.1, fe:1.5, zn:1.2, ca:25, vC:40,  fol:65,  kplus:244 },

  // Fruit
  "banana":                  { per:100, k:89,  p:1.1, c:22.8, f:0.3, fib:2.6, fe:0.3, zn:0.2, ca:5,  vC:8.7, fol:20,  kplus:358, unit_g:118 },
  "orange":                  { per:100, k:47,  p:0.9, c:12.0, f:0.1, fib:2.4, fe:0.1, zn:0.1, ca:40, vC:53,  fol:30,  kplus:181, unit_g:130 },
  "mandarin":                { per:100, k:53,  p:0.8, c:13.3, f:0.3, fib:1.8, fe:0.2, zn:0.1, ca:37, vC:27,  fol:16,  kplus:166, unit_g:88 },

  // Fats / produce
  "avocado":                 { per:100, k:160, p:2.0, c:9.0,  f:15.0, fib:7.0, fe:0.6, zn:0.6, ca:12, vC:10,  fol:81,  kplus:485, unit_g:200 }
};

// =====================================================
// 7-Day Meal Plan (ingredients only; app computes totals)
// Portions adjusted to ~3.5–3.6k kcal/day; 1 avocado/day
// (Ensure names exactly match NUTRITION_DB keys)
// =====================================================

// =====================================================
// Default Supplements (initial Sup-Stack list)
// =====================================================
window.defaultSupps = [
  { name: "Creatine monohydrate", dose: "5 g",                 timing: "Anytime",                  pairs: "Carbs optional",            notes: "" },
  { name: "Magnesium",            dose: "300–400 mg",          timing: "Evening",                  pairs: "—",                          notes: "May aid sleep & relaxation" },
  { name: "Vitamin D",            dose: "1000 IU",             timing: "With fat-containing meal", pairs: "Avocado, milk, peanut butter", notes: "" },
  { name: "Omega-3",              dose: "500–1000 mg EPA+DHA", timing: "With meals",               pairs: "Fat-containing meals",       notes: "" },
  { name: "CoQ10",                dose: "150 mg",              timing: "Morning with coffee + fat",pairs: "Avocado, peanut butter",     notes: "" },
  { name: "L-theanine",           dose: "200–600 mg",          timing: "AM / PM",                  pairs: "Caffeine",                   notes: "200 mg with coffee; optional 200 mg pre-bed" }
];

// =====================================================
// Smart Suggestions (auto-fill for add-supplement form)
// =====================================================
window.SMART_SUGGESTIONS = {
  "Creatine monohydrate": { dose:"5 g", timing:"Anytime", pairs:"Optional carbs", notes:"Increase water by +500 ml", why:"Supports strength/power" },
  "Magnesium":            { dose:"300–400 mg", timing:"Evening", pairs:"—", notes:"Sleep & muscle relaxation", why:"Recovery support" },
  "Vitamin D":            { dose:"1000 IU", timing:"Morning", pairs:"Fat-containing meal", notes:"Better absorption with fat", why:"Bone & immunity" },
  "Omega-3":              { dose:"500–1000 mg EPA+DHA", timing:"With meals", pairs:"Fat-containing meals", notes:"", why:"Balances omega-6:3" },
  "CoQ10":                { dose:"150 mg", timing:"Morning", pairs:"Fat + caffeine", notes:"With breakfast and coffee", why:"Mitochondrial support" },
  "L-theanine":           { dose:"200–600 mg", timing:"AM/PM", pairs:"Caffeine", notes:"200 mg with coffee; 200 mg pre-bed optional", why:"Smooths caffeine" },

  // Expanded keys for type-ahead
  "Zinc":                         { dose:"25–30 mg", timing:"With dinner", pairs:"With food", notes:"Keep 2 h away from iron & calcium", why:"Immune & hormone support" },
  "Zinc picolinate":              { dose:"22–30 mg", timing:"With dinner", pairs:"With food", notes:"Highly absorbable", why:"Alternative zinc form" },
  "Vitamin C":                    { dose:"500 mg",   timing:"With meals",  pairs:"Iron-rich meals", notes:"Enhances non-heme iron absorption", why:"Antioxidant" },
  "Vitamin B complex":            { dose:"1 capsule", timing:"Morning",    pairs:"Breakfast", notes:"May feel stimulating", why:"Covers B-group" },
  "Vitamin B12 (methylcobalamin)":{"dose":"1000 µg", timing:"Morning",    pairs:"Any meal", notes:"Sublingual optional",   why:"Energy & neuro support" },
  "Vitamin B6 (P-5-P)":           { dose:"25–50 mg", timing:"Morning",    pairs:"Any meal", notes:"Don’t exceed 100 mg/day long-term", why:"Neurotransmitters" },
  "Folate (5-MTHF)":              { dose:"400 µg",  timing:"With meals",  pairs:"B12",      notes:"Use 5-MTHF form",       why:"Methylation" },
  "Iron (gentle/chelated)":       { dose:"18–24 mg", timing:"AM or mid-day", pairs:"Vitamin C", notes:"Keep 2 h away from calcium, zinc, coffee/tea", why:"For diagnosed low iron" },
  "Calcium (citrate/carbonate)":  { dose:"500 mg",   timing:"Evening or split", pairs:"With food", notes:"Keep 2 h away from iron & zinc", why:"Bone health if diet low" }
};

// =====================================================
// Aliases → Canonical names for type-ahead
// =====================================================
window.ALIAS_TO_CANON = {
  // Core stack aliases
  "creatine": "Creatine monohydrate",
  "mag": "Magnesium",
  "vit d": "Vitamin D",
  "vitamin d": "Vitamin D",
  "fish oil": "Omega-3",
  "omega": "Omega-3",
  "coq10": "CoQ10",
  "coenzyme q10": "CoQ10",
  "theanine": "L-theanine",
  "l theanine": "L-theanine",

  // Expanded
  "zinc": "Zinc",
  "zn": "Zinc",
  "zinc picolinate": "Zinc picolinate",
  "vitamin c": "Vitamin C",
  "ascorbic acid": "Vitamin C",
  "b complex": "Vitamin B complex",
  "vitamin b complex": "Vitamin B complex",
  "vit b12": "Vitamin B12 (methylcobalamin)",
  "b12": "Vitamin B12 (methylcobalamin)",
  "methyl b12": "Vitamin B12 (methylcobalamin)",
  "p-5-p": "Vitamin B6 (P-5-P)",
  "p5p": "Vitamin B6 (P-5-P)",
  "vit b6": "Vitamin B6 (P-5-P)",
  "folate": "Folate (5-MTHF)",
  "5-mthf": "Folate (5-MTHF)",
  "iron": "Iron (gentle/chelated)",
  "gentle iron": "Iron (gentle/chelated)",
  "calcium": "Calcium (citrate/carbonate)",
  "calcium citrate": "Calcium (citrate/carbonate)",
  "calcium carbonate": "Calcium (citrate/carbonate)"
};
