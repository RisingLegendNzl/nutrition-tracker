// engine/rotation.js
// Minimal, pure selector for goal × diet templates (deterministic)

function hash(str){
  let h = 2166136261 >>> 0;
  for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pseudoRand(seed){ // returns [0,1)
  const x = Math.sin(seed) * 10000; return x - Math.floor(x);
}

export function pickWeekFromTemplates({profile={}, constraints={}}, allTemplates){
  const rawGoal = String(profile.goal||'maintain').toLowerCase();
  const rawDiet = String(profile.diet||constraints.diet||'omnivore').toLowerCase().replace(/\s+/g,'_');

  // Normalize diet aliases from profile → template prefixes
  const dietAlias = {
    'omnivore': ['omnivore','omni'],
    'vegetarian': ['vegetarian'],
    'vegan': ['vegan'],
    'pescetarian': ['pescetarian','pescatarian'],
    // if in future DF/GF become profile diets:
    'dairy_free': ['dairy_free'],
    'gluten_free': ['gluten_free']
  };
  // Determine which normalized key to use
  let normKey = Object.keys(dietAlias).find(k => dietAlias[k].includes(rawDiet)) || rawDiet;

  // Build pool by trying all aliases for that normKey
  const candidates = (dietAlias[normKey] || [normKey]).map(alias => `rcp_${alias}_`);
  let pool = [];
  for (const pref of candidates){
    const sub = (allTemplates||[]).filter(t => String(t?.id||'').toLowerCase().startsWith(pref) && String(t?.id||'').toLowerCase().includes(`_${rawGoal}_`));
    pool = pool.concat(sub);
  }
  // Deduplicate
  pool = pool.filter((v,i,a)=> a.findIndex(x=>x.id===v.id)===i);

  if (!pool.length){
    // Diet-only fallback (ignore goal)
    for (const pref of candidates){
      const sub = (allTemplates||[]).filter(t => String(t?.id||'').toLowerCase().startsWith(pref));
      pool = pool.concat(sub);
    }
    pool = pool.filter((v,i,a)=> a.findIndex(x=>x.id===v.id)===i);
  }
  if (!pool.length) return null;

  return buildWeekFull(pool, {goal: rawGoal, diet: normKey});
}

function buildWeekFull(pool, profile){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const seed = hash(JSON.stringify(profile));
  const order = pool.map((_,i)=>i).sort((a,b)=> (pseudoRand(seed + a) - pseudoRand(seed + b)));

  const bySlot = {
    breakfast: pool.filter(t => String(t.slot||'').toLowerCase()==='breakfast'),
    lunch:     pool.filter(t => String(t.slot||'').toLowerCase()==='lunch'),
    dinner:    pool.filter(t => String(t.slot||'').toLowerCase()==='dinner')
  };
  // Fallback: if a slot pool is empty, use the whole pool
  if (!bySlot.breakfast.length) bySlot.breakfast = pool;
  if (!bySlot.lunch.length)     bySlot.lunch = pool;
  if (!bySlot.dinner.length)    bySlot.dinner = pool;

  const out = {};
  days.forEach((d, k)=>{
    const b = bySlot.breakfast[ order[k % bySlot.breakfast.length] ];
    const l = bySlot.lunch[     order[(k+1) % bySlot.lunch.length] ];
    const di= bySlot.dinner[    order[(k+2) % bySlot.dinner.length] ];
    out[d] = {
      breakfast: makeMeal(b, 'Breakfast'),
      lunch:     makeMeal(l, 'Lunch'),
      dinner:    makeMeal(di,'Dinner'),
      snacks:    { name:'Snacks', items: [] }
    };
  });
  return out;
}

function makeMeal(t, name){
  return { name: t?.name || name, items: (t?.items||[]).map(it=> ({ food: it.food, qty: it.qty })) };
}
function toMeals(t){
  // Map a single template into a day with a single focused meal in its slot, and simple placeholders for others
  const day = { breakfast: { name:'Breakfast', items:[] }, lunch:{ name:'Lunch', items:[] }, dinner:{ name:'Dinner', items:[] }, snacks:{ name:'Snacks', items:[] } };
  const slot = String(t.slot||'Dinner').toLowerCase();
  const key = (slot==='breakfast'?'breakfast': slot==='lunch'?'lunch':'dinner');
  day[key].name = t.name;
  day[key].items = (t.items||[]).map(it=> ({ food: it.food, qty: it.qty }));
  return day;
}