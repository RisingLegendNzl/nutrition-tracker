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
  const goal = String(profile.goal||'maintain').toLowerCase();
  const diet = String(profile.diet||constraints.diet||'omni').toLowerCase().replace(/\s+/g,'_');
  const dietPrefix = `rcp_${diet}_`;
  const goalSuffix = `_${goal}_`;

  // filter templates whose id contains rcp_<diet>_<goal>_
  const pool = (allTemplates||[]).filter(t => {
    const id = String(t?.id||'').toLowerCase();
    return id.startsWith(dietPrefix) && id.includes(goalSuffix);
  });

  if (!pool.length){
    // fallback: any with diet only
    const poolDietOnly = (allTemplates||[]).filter(t => String(t?.id||'').toLowerCase().startsWith(dietPrefix));
    if (!poolDietOnly.length) return null;
    return buildWeek(poolDietOnly, profile);
  }
  return buildWeek(pool, profile);
}

function buildWeek(pool, profile){
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const seed = hash(JSON.stringify({goal:profile.goal||'maintain', diet:profile.diet||'omni'}) );
  let idx = 0;
  const out = {};
  // ensure some diversity by reshuffling deterministically
  const order = pool.map((_,i)=>i).sort((a,b)=> (pseudoRand(seed + a) - pseudoRand(seed + b)));
  days.forEach((d, k)=>{
    const t = pool[ order[k % order.length] ];
    out[d] = toMeals(t);
  });
  return out;
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
