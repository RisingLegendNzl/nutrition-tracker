// app.js (root) — hamburger dropdown, avatar upload, routing, landing state

const qs  = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

// Elements
const menuBtn    = qs('#menuBtn');
const menuPanel  = qs('#menuPanel');
const avatarImg  = qs('#avatarImg');
const avatarIn   = qs('#avatarInput');

const PAGES = {
  profile: qs('#profilePage'),
  diet:    qs('#dietPage'),
  supps:   qs('#suppsPage'),
  hydro:   qs('#hydroPage'),
};

const AVATAR_KEY = 'nutrify_avatar';
const LAST_PAGE  = 'nutrify_last_page';

function hideAllPages(){ Object.values(PAGES).forEach(el => el && el.classList.add('hidden')); }
function blurOn(){  document.body.classList.add('menu-open');  menuBtn?.setAttribute('aria-expanded','true');  menuPanel.hidden = false; }
function blurOff(){ document.body.classList.remove('menu-open');menuBtn?.setAttribute('aria-expanded','false'); menuPanel.hidden = true;  }

async function callAny(modulePromise, names){
  try {
    const m = await modulePromise;
    for (const n of names) {
      if (typeof m[n] === 'function') { m[n](); return; }
    }
  } catch(e) {
    console.warn('Mount skipped:', e);
  }
}

// ROUTER (imports from ./js/* because app.js is in project root)
async function showPage(page){
  if (!PAGES[page]) return;
  hideAllPages();
  PAGES[page].classList.remove('hidden');
  document.body.classList.remove('empty');
  document.body.classList.toggle('is-diet', page === 'diet');
  sessionStorage.setItem(LAST_PAGE, page);
  blurOff();

  switch(page){
    case 'profile':
      await callAny(import('./js/profile.js'),   ['mountProfile','renderProfile','initProfile']);
      break;
    case 'diet':
      await callAny(import('./js/diet.js'),      ['mountDiet','renderDiet','initDiet']);
      break;
    case 'supps':
      await callAny(import('./js/supps.js'),     ['mountSupps','renderSupps','initSupps']);
      break;
    case 'hydro':
      await callAny(import('./js/hydration.js'), ['mountHydration','renderHydro','initHydration']);
      break;
  }
}
window.showPage = showPage;

// First-load: header only until user picks a page
(function initLanding(){
  const last = sessionStorage.getItem(LAST_PAGE);
  if (last && PAGES[last]) showPage(last);
  else { document.body.classList.add('empty'); hideAllPages(); }
})();

// Hamburger interactions
menuBtn?.addEventListener('click', () => {
  document.body.classList.contains('menu-open') ? blurOff() : blurOn();
});
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') blurOff(); });
document.addEventListener('click', (e)=>{
  if (!document.body.classList.contains('menu-open')) return;
  const within = menuPanel.contains(e.target) || menuBtn.contains(e.target);
  if (!within) blurOff();
});

// Menu items delegate
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item');
  if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (page) showPage(page);
});

// Avatar upload behavior
avatarImg?.addEventListener('click', ()=>{
  showPage('profile');
  avatarIn?.click();
});

avatarIn?.addEventListener('change', () => {
  const f = avatarIn.files?.[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(AVATAR_KEY, reader.result);
    avatarImg.src = reader.result;
  };
  reader.readAsDataURL(f);
});

// Init avatar
(function initAvatar(){
  const saved = localStorage.getItem(AVATAR_KEY);
  avatarImg.src = saved || 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
       <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop stop-color="#2a2a2a"/><stop offset="1" stop-color="#1b1b1b"/>
       </linearGradient></defs>
       <circle cx="50" cy="50" r="50" fill="url(#g)"/>
     </svg>`
  );
})();
