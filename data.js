// =====================================================
// 7-Day Meal Plan (ingredients only; app computes totals)
// =====================================================
window.mealPlan = {
  "Monday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"300 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Beef mince 5★ (lean)", qty:"250 g" },
      { food:"Frozen mixed vegetables", qty:"200 g" },
      { food:"Sweet potato", qty:"400 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Lentils (canned, drained)", qty:"150 g" },
      { food:"Spinach", qty:"100 g" },
      { food:"Avocado", qty:"1 whole" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ],

  "Tuesday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"250 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Greek yogurt", qty:"150 g" },
      { food:"Peanut butter", qty:"30 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Beef mince 3★ (regular)", qty:"250 g" },
      { food:"Frozen mixed vegetables", qty:"200 g" },
      { food:"Rice (cooked)", qty:"300 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Potatoes", qty:"350 g" },
      { food:"Carrots", qty:"100 g" },
      { food:"Peas", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ],

  "Wednesday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"300 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Tuna (springwater, drained)", qty:"200 g" },
      { food:"Lentils (canned, drained)", qty:"150 g" },
      { food:"Sweet potato", qty:"350 g" },
      { food:"Spinach", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Potatoes", qty:"350 g" },
      { food:"Carrots", qty:"100 g" },
      { food:"Peas", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ],

  "Thursday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"300 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Greek yogurt", qty:"150 g" },
      { food:"Peanut butter", qty:"30 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Beef mince 5★ (lean)", qty:"250 g" },
      { food:"Frozen mixed vegetables", qty:"200 g" },
      { food:"Sweet potato", qty:"400 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Rice (cooked)", qty:"300 g" },
      { food:"Spinach", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ],

  "Friday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"250 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Tuna (springwater, drained)", qty:"200 g" },
      { food:"Lentils (canned, drained)", qty:"150 g" },
      { food:"Potatoes", qty:"350 g" },
      { food:"Spinach", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Sweet potato", qty:"350 g" },
      { food:"Carrots", qty:"100 g" },
      { food:"Peas", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ],

  "Saturday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"300 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Greek yogurt", qty:"150 g" },
      { food:"Peanut butter", qty:"30 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Beef mince 3★ (regular)", qty:"250 g" },
      { food:"Frozen mixed vegetables", qty:"200 g" },
      { food:"Rice (cooked)", qty:"300 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Potatoes", qty:"350 g" },
      { food:"Spinach", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ],

  "Sunday": [
    { meal: "Breakfast", items: [
      { food:"Rolled oats", qty:"120 g" },
      { food:"Full cream milk", qty:"250 ml" },
      { food:"Banana", qty:"1 medium" },
      { food:"Peanut butter", qty:"40 g" }
    ]},
    { meal: "Lunch", items: [
      { food:"Tuna (springwater, drained)", qty:"200 g" },
      { food:"Lentils (canned, drained)", qty:"150 g" },
      { food:"Sweet potato", qty:"350 g" },
      { food:"Spinach", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]},
    { meal: "Dinner", items: [
      { food:"Chicken thigh fillets", qty:"450 g" },
      { food:"Potatoes", qty:"350 g" },
      { food:"Carrots", qty:"100 g" },
      { food:"Peas", qty:"100 g" },
      { food:"Olive oil", qty:"15 ml" }
    ]}
  ]
};