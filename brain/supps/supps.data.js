// brain/supps.data.js
// v1.0 — Supplements data module for Nutrify
// Exports three constants. Back-compat: also attaches them to window if present.

export const defaultSupps = [
  { name: "Creatine monohydrate", dose: "5 g",                 timing: "Anytime",                  pairs: "Carbs optional",            notes: "" },
  { name: "Magnesium",            dose: "300–400 mg",          timing: "Evening",                  pairs: "—",                          notes: "May aid sleep & relaxation" },
  { name: "Vitamin D",            dose: "1000 IU",             timing: "With fat-containing meal", pairs: "Avocado, milk, peanut butter", notes: "" },
  { name: "Omega-3",              dose: "500–1000 mg EPA+DHA", timing: "With meals",               pairs: "Fat-containing meals",       notes: "" },
  { name: "CoQ10",                dose: "150 mg",              timing: "Morning with coffee + fat",pairs: "Avocado, peanut butter",     notes: "" },
  { name: "L-theanine",           dose: "200–600 mg",          timing: "AM / PM",                  pairs: "Caffeine",                   notes: "200 mg with coffee; optional 200 mg pre-bed" }
];

export const SMART_SUGGESTIONS = {
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

export const ALIAS_TO_CANON = {
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

// Back-compat for existing code that reads from window.*
if (typeof window !== 'undefined') {
  window.defaultSupps = window.defaultSupps || defaultSupps;
  window.SMART_SUGGESTIONS = window.SMART_SUGGESTIONS || SMART_SUGGESTIONS;
  window.ALIAS_TO_CANON = window.ALIAS_TO_CANON || ALIAS_TO_CANON;
}
