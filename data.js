/* ===== DIET DATA (7 days with ingredients) ===== */
const mealPlan = {
  Monday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1323, protein: 121, fibre: 28,
      iron: 15, zinc: 20, calcium: 140, vitaminC: 60, folate: 530, potassium: 3145,
      ingredients: [
        "Lean beef mince (5★) – 500 g raw","Eggs – 2 whole","Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: {
      calories: 935, protein: 72, fibre: 19,
      iron: 6.8, zinc: 6, calcium: 290, vitaminC: 63, folate: 410, potassium: 2660,
      ingredients: [
        "Chicken breast – 200 g raw","Sweet potato (cooked) – 400 g","Eggs – 2 whole",
        "Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  },

  Tuesday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw","Eggs – 2 whole","Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: { // Tuna
      calories: 1195, protein: 88, fibre: 22,
      iron: 5.2, zinc: 3, calcium: 290, vitaminC: 63, folate: 410, potassium: 2900,
      ingredients: [
        "Canned tuna (springwater) – 425 g can (~300 g drained)","Sweet potato (cooked) – 400 g",
        "Eggs – 2 whole","Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  },

  Wednesday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw","Eggs – 2 whole","Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: { // Beef (3★)
      calories: 1445, protein: 80, fibre: 24,
      iron: 12.9, zinc: 16, calcium: 290, vitaminC: 63, folate: 410, potassium: 2960,
      ingredients: [
        "Beef mince (3★) – 300 g raw","Sweet potato (cooked) – 400 g","Eggs – 2 whole",
        "Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  },

  Thursday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw","Eggs – 2 whole","Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: { // Tuna
      calories: 1195, protein: 88, fibre: 22,
      iron: 5.2, zinc: 3, calcium: 290, vitaminC: 63, folate: 410, potassium: 2900,
      ingredients: [
        "Canned tuna (springwater) – 425 g can (~300 g drained)","Sweet potato (cooked) – 400 g",
        "Eggs – 2 whole","Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  },

  Friday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1323, protein: 121, fibre: 28,
      iron: 15, zinc: 20, calcium: 140, vitaminC: 60, folate: 530, potassium: 3145,
      ingredients: [
        "Lean beef mince (5★) – 500 g raw","Eggs – 2 whole","Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: {
      calories: 935, protein: 72, fibre: 19,
      iron: 6.8, zinc: 6, calcium: 290, vitaminC: 63, folate: 410, potassium: 2660,
      ingredients: [
        "Chicken breast – 200 g raw","Sweet potato (cooked) – 400 g","Eggs – 2 whole",
        "Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  },

  Saturday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: {
      calories: 1163, protein: 101, fibre: 28,
      iron: 6.9, zinc: 8, calcium: 140, vitaminC: 60, folate: 530, potassium: 2845,
      ingredients: [
        "Chicken breast – 300 g raw","Eggs – 2 whole","Frozen mixed vegetables – 300 g",
        "Canned lentils – 100 g (½ can)","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: { // Beef (3★)
      calories: 1445, protein: 80, fibre: 24,
      iron: 12.9, zinc: 16, calcium: 290, vitaminC: 63, folate: 410, potassium: 2960,
      ingredients: [
        "Beef mince (3★) – 300 g raw","Sweet potato (cooked) – 400 g","Eggs – 2 whole",
        "Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  },

  Sunday: {
    Breakfast: {
      calories: 1311, protein: 56, fibre: 19,
      iron: 6.5, zinc: 7, calcium: 944, vitaminC: 193, folate: 135, potassium: 3770,
      ingredients: [
        "Rolled oats – 120 g","Full-cream milk – 400 ml","Banana – 120 g",
        "Peanut butter – 30 g","Egg – 1 whole","Orange – 150 g","Greek yoghurt – 200 g"
      ]
    },
    Lunch: { // Egg + chicken mix
      calories: 1174, protein: 98, fibre: 27,
      iron: 7.0, zinc: 8.2, calcium: 190, vitaminC: 55, folate: 450, potassium: 2600,
      ingredients: [
        "Eggs – 4 whole","Chicken breast – 150 g raw","Frozen spinach – 100 g",
        "Frozen mixed vegetables – 200 g","Avocado – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    },
    Dinner: { // Mixed beef + chicken
      calories: 1265, protein: 86, fibre: 22,
      iron: 10.5, zinc: 13, calcium: 290, vitaminC: 63, folate: 410, potassium: 2740,
      ingredients: [
        "Beef mince (3★) – 200 g raw","Chicken breast – 200 g raw","Sweet potato (cooked) – 400 g",
        "Eggs – 2 whole","Frozen spinach – 100 g","Frozen mixed vegetables – 200 g","Olive oil – 15 ml","Iodised salt"
      ]
    }
  }
};

/* ===== SUPP DEFAULTS ===== */
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

/* ===== SMART SUGGESTIONS KB ===== */
const SMART_SUGGESTIONS = {
  "creatine": { dose:"5 g", timing:"Anytime", pairs:"Carbs or post-workout",
    why:"Complements training by saturating muscle phosphocreatine", notes:"Hydrate well" },
  "vitamin d": { dose:"1000 IU", timing:"With fat-containing meal", pairs:"Breakfast or dinner",
    why:"Supports calcium status and immunity", notes:"Consider periodic blood test" },
  "d3": { dose:"1000 IU", timing:"With fat-containing meal", pairs:"Breakfast or dinner",
    why:"Same as Vitamin D", notes:"—" },
  "magnesium": { dose:"300–400 mg", timing:"Evening/before bed", pairs:"With food if sensitive",
    why:"Improves sleep and relaxation", notes:"Separate from high-dose iron" },
  "coq10": { dose:"100–200 mg", timing:"Morning with fat (coffee ok)", pairs:"Fat-containing meal",
    why:"Antioxidant; supports energy production", notes:"—" },
  "omega-3": { dose:"1–2 g EPA+DHA", timing:"With meals", pairs:"Any main meal",
    why:"Adds EPA/DHA on low-fish days", notes:"—" },
  "fish oil": { dose:"1–2 g EPA+DHA", timing:"With meals", pairs:"Any main meal",
    why:"Same as omega-3", notes:"—" },
  "zinc": { dose:"15–30 mg", timing:"With food", pairs:"—",
    why:"Supports immunity; complements high-protein diet", notes:"Avoid same-time with iron/calcium" },
  "iron": { dose:"per label", timing:"AM empty stomach + vitamin C", pairs:"Orange/fruit",
    why:"Supports ferritin if low", notes:"Keep 2h away from calcium, magnesium, zinc" },
  "calcium": { dose:"500–600 mg", timing:"With meals", pairs:"Fat-containing food",
    why:"Complements Vitamin D for bones", notes:"Separate from iron supplements" }
};