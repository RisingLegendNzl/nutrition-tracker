// engine/rotation.js
// Deterministic rotation utilities (seeded RNG) for weekly plan variety.

function xmur3(str){
  let h = 1779033703 ^ str.length;
  for (let i=0; i<str.length; i++){
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function(){
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function mulberry32(a){
  return function(){
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededRng(seedStr){
  const seed = xmur3(String(seedStr))();
  return mulberry32(seed);
}

export function shuffleDeterministic(arr, rng){
  const a = arr.slice();
  for (let i=a.length-1; i>0; i--){
    const j = Math.floor(rng() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Crude primary-protein detector based on ingredient names
const PROTEIN_HINTS = ['beef','chicken','tuna','salmon','egg','eggs','yogurt','yoghurt','lentil','beans','mince','thigh','breast'];

export function primaryProteinOf(template){
  const items = template?.items || [];
  const names = items.map(it => String(it.food||'').toLowerCase());
  for (const n of names){
    for (const hint of PROTEIN_HINTS){
      if (n.includes(hint)) return hint;
    }
  }
  // fallback to first ingredient
  return names[0] || 'unknown';
}

export function rotateUniqueByProtein(templates, days, rng){
  const out = [];
  const used = new Set();
  const pool = shuffleDeterministic(templates, rng);
  let idx = 0;
  for (let d=0; d<days; d++){
    let pick = null;
    let tries = 0;
    while (tries < pool.length * 2){
      const cand = pool[idx % pool.length];
      idx++;
      const prot = primaryProteinOf(cand);
      if (!used.has(prot) || used.size >= pool.length){
        pick = cand;
        used.add(prot);
        break;
      }
      tries++;
    }
    if (!pick) pick = pool[(d) % pool.length];
    out.push(pick);
  }
  return out;
}

export function rotateSimple(templates, days, rng){
  const pool = shuffleDeterministic(templates, rng);
  return Array.from({length: days}, (_,i) => pool[i % pool.length]);
}
