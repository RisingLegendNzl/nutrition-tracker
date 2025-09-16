// js/app.js — routing + hamburger + avatar + home link
// Default route is #home → #homePage. Clicking "Nutrify" returns to Home.
// Dynamic-import page modules from the SAME /js/ folder.

const $ = (s) => document.querySelector(s);

// Header / menu elements
const menuBtn   = $('#menuBtn');
const menuPanel = $('#menuPanel');
const avatarImg = $('#avatarImg');
const avatarIn  = $('#avatarInput');
const homeLink  = $('#homeLink');

// Page containers (must exist in index.html)
const PAGES = {
  home:   $('#homePage'),
  profile: $('#profilePage'),
  diet:    $('#dietPage'),
  supps:   $('#suppsPage'),
  hydro:   $('#hydroPage'),
};

const AVATAR_KEY = 'nutrify_avatar';
const LAST_PAGE  = 'nutrify_last_page';

/* ---------- helpers ---------- */
function hideAllPages(){ Object.values(PAGES).forEach(el => el && el.classList.add('hidden')); }
function blurOn(){  document.body.classList.add('menu-open');  menuBtn?.setAttribute('aria-expanded','true');  menuPanel.hidden = false; }
function blurOff(){ document.body.classList.remove('menu-open'); menuBtn?.setAttribute('aria-expanded','false'); menuPanel.hidden = true;  }
function pageIdFromHash(){
  const hash = (location.hash || '').replace('#','').trim();
  if (!hash) return 'home';
  return ['home','profile','diet','supps','hydro'].includes(hash) ? hash : 'home';
}

// Try a list of possible initializer names from an imported module
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

/* ---------- ROUTER (imports from ./<file>.js) ---------- */
async function showPage(page){
  if (!PAGES[page]) return;

  // Reveal selected page
  hideAllPages();
  PAGES[page].classList.remove('hidden');
  document.body.classList.remove('empty');
  document.body.classList.toggle('is-diet', page === 'diet');
  sessionStorage.setItem(LAST_PAGE, page);
  blurOff();

  // Import & init module for non-home pages
  switch(page){
    case 'profile': {
      const m = await import('./profile.js');
      if (typeof m.show === 'function') m.show(false);
      else if (typeof m.mountProfile === 'function') m.mountProfile();
      else if (typeof m.renderProfile === 'function') m.renderProfile();
      else if (typeof m.initProfile === 'function') m.initProfile();
      break;
    }
    case 'diet':
      await callAny(import('./diet.js'),      ['mountDiet','renderDiet','initDiet']);
      break;
    case 'supps':
      await callAny(import('./supps.js'),     ['mountSupps','renderSupps','initSupps']);
      break;
    case 'hydro':
      await callAny(import('./hydration.js'), ['mountHydration','renderHydro','initHydration']);
      break;
    case 'home':
    default:
      // nothing to mount for the blank home
      break;
  }

  // Notify any listeners
  window.dispatchEvent(new CustomEvent('route:show', { detail: { page } }));
}
window.showPage = showPage;

/* ---------- initial route ---------- */
function routeFromHash(){
  const page = pageIdFromHash();
  showPage(page);
}
window.addEventListener('hashchange', routeFromHash);

// On first load: go to last visited if hash is empty, otherwise respect hash;
// but if neither, land on home.
(function initLanding(){
  const hashPage = pageIdFromHash();
  if (hashPage === 'home') {
    const last = sessionStorage.getItem(LAST_PAGE);
    showPage(last && PAGES[last] ? last : 'home');
  } else {
    showPage(hashPage);
  }
})();

/* ---------- hamburger ---------- */
menuBtn?.addEventListener('click', () => {
  document.body.classList.contains('menu-open') ? blurOff() : blurOn();
});
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') blurOff(); });
document.addEventListener('click', (e)=>{
  if (!document.body.classList.contains('menu-open')) return;
  const within = menuPanel.contains(e.target) || menuBtn.contains(e.target);
  if (!within) blurOff();
});

/* ---------- menu clicks (set hash for deep-linking) ---------- */
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item');
  if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (!page) return;
  location.hash = `#${page}`;   // triggers hashchange → routeFromHash
});

/* ---------- "Nutrify" → Home ---------- */
homeLink?.addEventListener('click', () => {
  location.hash = '';           // clears to home
  showPage('home');
});

/* ---------- avatar upload ---------- */
avatarImg?.addEventListener('click', ()=>{
  location.hash = '#profile';
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
(function initAvatar(){
  const saved = localStorage.getItem(AVATAR_KEY);
  avatarImg.src = saved || 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0" stop-color="#2a2a2a"/>
           <stop offset="1" stop-color="#1b1b1b"/>
         </linearGradient>
       </defs>
       <circle cx="50" cy="50" r="50" fill="url(#g)"/>
     </svg>`
  );
})();