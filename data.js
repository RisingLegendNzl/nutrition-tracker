/* =========================================================
   Nutrify Data — Meals & Supplements
   - Full 7-day meal plan with nutrients
   - Supplement defaults
   - Smart Suggestions KB (+ alias mapping)
   ========================================================= */

/* ===== 7-DAY MEAL PLAN =====
   Units:
   - calories (kcal)
   - protein, fibre (g)
   - iron, zinc, calcium, vitaminC, potassium (mg)
   - folate (µg)
*/
const mealPlan = {
  Monday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1323, protein: 121, fibre: 28,
      iron: 15, zinc: 20, calcium: 140, vitaminC: 60, folate: 530, potassium: 3145,
      ingredients: [
        "Lean beef mince (5★) – 500 g raw", "Eggs – 2 whole", "Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: {
      calories: 935, protein: 72, fibre: 19,
      iron: 6.8, zinc: 6, calcium: 290, vitaminC: 63, folate: 410, potassium: 2660,
      ingredients: [
        "Chicken breast – 200 g raw", "Sweet potato (cooked) – 400 g", "Eggs – 2 whole",
        "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  },

  Tuesday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw", "Eggs – 2 whole", "Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: { // Tuna
      calories: 1195, protein: 88, fibre: 22,
      iron: 5.2, zinc: 3, calcium: 290, vitaminC: 63, folate: 410, potassium: 2900,
      ingredients: [
        "Canned tuna (springwater) – 425 g can (~300 g drained)", "Sweet potato (cooked) – 400 g",
        "Eggs – 2 whole", "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g",
        "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  },

  Wednesday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw", "Eggs – 2 whole", "Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: { // Beef (3★)
      calories: 1445, protein: 80, fibre: 24,
      iron: 12.9, zinc: 16, calcium: 290, vitaminC: 63, folate: 410, potassium: 2960,
      ingredients: [
        "Beef mince (3★) – 300 g raw", "Sweet potato (cooked) – 400 g", "Eggs – 2 whole",
        "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  },

  Thursday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw", "Eggs – 2 whole", "Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: { // Tuna
      calories: 1195, protein: 88, fibre: 22,
      iron: 5.2, zinc: 3, calcium: 290, vitaminC: 63, folate: 410, potassium: 2900,
      ingredients: [
        "Canned tuna (springwater) – 425 g can (~300 g drained)", "Sweet potato (cooked) – 400 g",
        "Eggs – 2 whole", "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g",
        "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  },

  Friday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1323, protein: 121, fibre: 28,
      iron: 15, zinc: 20, calcium: 140, vitaminC: 60, folate: 530, potassium: 3145,
      ingredients: [
        "Lean beef mince (5★) – 500 g raw", "Eggs – 2 whole", "Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: {
      calories: 935, protein: 72, fibre: 19,
      iron: 6.8, zinc: 6, calcium: 290, vitaminC: 63, folate: 410, potassium: 2660,
      ingredients: [
        "Chicken breast – 200 g raw", "Sweet potato (cooked) – 400 g", "Eggs – 2 whole",
        "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  },

  Saturday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw", "Eggs – 2 whole", "Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: { // Beef (3★)
      calories: 1445, protein: 80, fibre: 24,
      iron: 12.9, zinc: 16, calcium: 290, vitaminC: 63, folate: 410, potassium: 2960,
      ingredients: [
        "Beef mince (3★) – 300 g raw", "Sweet potato (cooked) – 400 g", "Eggs – 2 whole",
        "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  },

  Sunday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g", "Full-cream milk – 400 ml", "Banana – 120 g",
        "Peanut butter – 30 g", "Egg – 1 whole", "Orange – 150 g", "Greek yoghurt – 200 g"
      ]
    },
    Lunch: { // Egg + chicken mix
      calories: 1174, protein: 98, fibre: 27,
      iron: 7.0, zinc: 8.2, calcium: 190, vitaminC: 55, folate: 450, potassium: 2600,
      ingredients: [
        "Eggs – 4 whole", "Chicken breast – 150 g raw", "Frozen spinach – 100 g",
        "Frozen mixed vegetables – 200 g", "Avocado – 200 g", "Olive oil – 15 ml", "Iodised salt"
      ]
    },
    Dinner: { // Mixed beef + chicken
      calories: 1265, protein: 86, fibre: 22,
      iron: 10.5, zinc: 13, calcium: 290, vitaminC: 63, folate: 410, potassium: 2740,
      ingredients: [
        "Beef mince (3★) – 200 g raw", "Chicken breast – 200 g raw", "Sweet potato (cooked) – 400 g",
        "Eggs – 2 whole", "Frozen spinach – 100 g", "Frozen mixed vegetables – 200 g",
        "Olive oil – 15 ml", "Iodised salt"
      ]
    }
  }
};

/* ===== SUPPLEMENT DEFAULTS (seeded on first run) ===== */
const defaultSupps = [
  { name:"Creatine monohydrate", dose:"5 g", timing:"Anytime",
    pairs:"Carbs (oats/sweet potato) optional", why:"Supports strength and lean mass",
    notes:"Stay hydrated" },
  { name:"Magnesium", dose:"~400 mg", timing:"Evening / before bed",
    pairs:"With food if sensitive", why:"Supports relaxation and sleep",
    notes:"Separate from high-dose iron" },
  { name:"Vitamin D", dose:"1000 IU", timing:"With fat-containing meal",
    pairs:"Breakfast or dinner (fat present)", why:"Supports bone and immune health",
    notes:"Consider blood test periodically" },
  { name:"CoQ10", dose:"150 mg", timing:"Morning with coffee + fat",
    pairs:"Coffee + yoghurt/peanut butter", why:"Supports energy and antioxidant status",
    notes:"Non-essential but fine to keep" },
  { name:"L-theanine", dose:"200 mg", timing:"With coffee (AM)",
    pairs:"Caffeine", why:"Smooths jitters, supports focus",
    notes:"Optional 200 mg later if needed" },
  { name:"Omega-3 (EPA/DHA)", dose:"~1–2 g EPA+DHA", timing:"With meals",
    pairs:"Any main meal", why:"Anti-inflammatory; supports heart/brain",
    notes:"If tuna that day, still ok" }
];

/* ===== SMART SUGGESTIONS KB (expanded with aliases) =====
   Keys are canonical names. 'aliases' contains alternative spellings.
*/
const SMART_SUGGESTIONS = {
  "Creatine monohydrate": {
    aliases:["creatine","creatine mono"],
    dose:"5 g", timing:"Anytime", pairs:"Carbs or post-workout",
    why:"Complements training by saturating muscle phosphocreatine",
    notes:"Hydrate well"
  },
  "Vitamin D": {
    aliases:["vitamin d3","d3","cholecalciferol"],
    dose:"1000 IU", timing:"With fat-containing meal", pairs:"Breakfast or dinner",
    why:"Supports calcium status and immunity",
    notes:"Consider periodic blood test"
  },
  "Magnesium": {
    aliases:["magnesium glycinate","magnesium citrate","mag"],
    dose:"300–400 mg", timing:"Evening / before bed", pairs:"With food if sensitive",
    why:"Improves sleep and relaxation",
    notes:"Separate from high-dose iron"
  },
  "CoQ10": {
    aliases:["ubiquinone","ubiquinol","co q10"],
    dose:"100–200 mg", timing:"Morning with fat (coffee ok)", pairs:"Fat-containing meal",
    why:"Antioxidant; supports energy production",
    notes:"—"
  },
  "Omega-3 (EPA/DHA)": {
    aliases:["omega 3","fish oil","epa dha","epa/dha"],
    dose:"1–2 g EPA+DHA", timing:"With meals", pairs:"Any main meal",
    why:"Adds EPA/DHA on low-fish days; anti-inflammatory",
    notes:"—"
  },
  "L-theanine": {
    aliases:["theanine"],
    dose:"200 mg", timing:"With coffee (AM)", pairs:"Caffeine",
    why:"Smooths caffeine jitters; supports focus",
    notes:"Optional 200 mg in PM if needed"
  },
  "Vitamin B Complex": {
    aliases:["vitamin b","b complex","b-complex","vit b","vit-b"],
    dose:"Per label (usually 1 cap)", timing:"With breakfast",
    pairs:"Any meal", why:"Covers B-vitamins supporting energy metabolism",
    notes:"May tint urine bright yellow (riboflavin)"
  },
  "Vitamin B12": {
    aliases:["b12","cobalamin","methylcobalamin"],
    dose:"500–1000 µg", timing:"Morning", pairs:"Any meal",
    why:"Supports red blood cells & nerves; useful if low animal intake",
    notes:"Sublingual forms are fine"
  },
  "Vitamin B6": {
    aliases:["b6","pyridoxine","p5p"],
    dose:"10–25 mg", timing:"Morning", pairs:"Any meal",
    why:"Cofactor for amino acid metabolism",
    notes:"Avoid chronic high doses"
  },
  "Vitamin C": {
    aliases:["ascorbic acid","vit c","vitamin-c"],
    dose:"200–500 mg", timing:"With meals", pairs:"Iron (enhances absorption)",
    why:"Antioxidant; supports immunity",
    notes:"Space out if >500 mg/day"
  },
  "Vitamin K2": {
    aliases:["k2","menaquinone","mk-7","mk7"],
    dose:"90–180 µg", timing:"With fat-containing meal", pairs:"Vitamin D, calcium",
    why:"Directs calcium to bones",
    notes:"—"
  },
  "Calcium": {
    aliases:["calcium citrate","calcium carbonate"],
    dose:"500–600 mg", timing:"With meals", pairs:"Vitamin D / fat",
    why:"Bone health (if diet is low)",
    notes:"Separate from iron by 2h"
  },
  "Zinc": {
    aliases:["zinc picolinate","zinc citrate"],
    dose:"15–30 mg", timing:"With food", pairs:"—",
    why:"Supports immunity and hormones",
    notes:"Avoid same-time with iron/calcium"
  },
  "Iron": {
    aliases:["ferrous sulfate","iron bisglycinate"],
    dose:"Per label", timing:"Morning empty stomach + Vitamin C", pairs:"Orange/fruit",
    why:"Raises ferritin if low",
    notes:"Keep 2h away from calcium, magnesium, zinc"
  },
  "Ashwagandha": {
    aliases:["withania","ksm-66","sensoril"],
    dose:"300–600 mg extract", timing:"Evening or split", pairs:"With meals",
    why:"May reduce stress and support sleep",
    notes:"Discuss if thyroid issues"
  },
  "Taurine": {
    aliases:["taurine powder"],
    dose:"1–2 g", timing:"Anytime (often PM)", pairs:"With water",
    why:"Osmolyte; may aid calm focus & pumps",
    notes:"—"
  },
  "Electrolytes": {
    aliases:["sodium potassium magnesium","electrolyte mix"],
    dose:"Per label", timing:"Around training or heat", pairs:"Water",
    why:"Hydration/nerve function when sweating",
    notes:"Watch total sodium intake"
  },
  "Curcumin": {
    aliases:["turmeric extract","curcuminoids"],
    dose:"500–1000 mg", timing:"With fat-containing meal", pairs:"Piperine/black pepper",
    why:"Anti-inflammatory",
    notes:"Can interact with anticoagulants"
  },
  "Berberine": {
    aliases:["berberine hcl"],
    dose:"500 mg 2–3×/day", timing:"With meals", pairs:"—",
    why:"Supports glucose control",
    notes:"Avoid if on certain meds — check with GP"
  },
  "Probiotic": {
    aliases:["lactobacillus","bifidobacterium","probiotics"],
    dose:"Per label (CFU)", timing:"With breakfast", pairs:"Yoghurt/ferments",
    why:"Gut support",
    notes:"Cycle or use during/after antibiotics"
  },
  "Melatonin": {
    aliases:["mel","melat"],
    dose:"0.5–3 mg", timing:"30–60 min before bed", pairs:"Dark room",
    why:"Sleep onset support",
    notes:"Short-term use; consult if needed regularly"
  },
  "Caffeine": {
    aliases:["coffee","caffeine tabs"],
    dose:"100–200 mg", timing:"AM or pre-workout", pairs:"L-theanine",
    why:"Alertness & performance",
    notes:"Avoid late PM to protect sleep"
  }
};

/* ===== ALIAS → CANONICAL NAME MAP ===== */
const ALIAS_TO_CANON = (() => {
  const map = {};
  Object.entries(SMART_SUGGESTIONS).forEach(([canon, data]) => {
    map[canon.toLowerCase()] = canon;
    (data.aliases || []).forEach(a => { map[a.toLowerCase()] = canon; });
  });
  return map;
})();