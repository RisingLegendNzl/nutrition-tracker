// js/app.js — hamburger dropdown, avatar upload, routing, landing state
// Robust version: reveals pages, emits events, and tries common global initializers.

const $  = (s) => document.querySelector(s);

// Header / menu elements
const menuBtn   = $('#menuBtn');
const menuPanel = $('#menuPanel');
const avatarImg = $('#avatarImg');
const avatarIn  = $('#avatarInput');

// Page containers (must exist in index.html)
const PAGES = {
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

// Try many possible initializers if they exist in the global scope
function tryInitializers(page){
  const candidates = {
    profile: [
      'mountProfile','renderProfile','initProfile',
      () => window.Profile && (window.Profile.mount?.() || window.Profile.render?.())
    ],
    diet: [
      'mountDiet','renderDiet','initDiet','renderDietPage',
      () => window.Diet && (window.Diet.mount?.() || window.Diet.render?.())
    ],
    supps: [
      'mountSupps','renderSupps','initSupps','renderSupplements',
      () => window.Supps && (window.Supps.mount?.() || window.Supps.render?.())
    ],
    hydro: [
      'mountHydration','renderHydro','initHydration','renderHydration',
      () => window.Hydration && (window.Hydration.mount?.() || window.Hydration.render?.())
    ]
  }[page] || [];

  for (const c of candidates) {
    try {
      if (typeof c === 'string' && typeof window[c] === 'function') { window[c](); return; }
      if (typeof c === 'function') { const r = c(); if (r !== undefined) return; }
    } catch (e) {
      // ignore and continue
      console.warn(`init ${page} skipped`, e);
    }
  }

  // Also emit a generic event any module can listen for:
  window.dispatchEvent(new CustomEvent('route:show', { detail: { page } }));
}

/* ---------- ROUTER: reveal + init ---------- */
async function showPage(page){
  if (!PAGES[page]) return;

  hideAllPages();
  PAGES[page].classList.remove('hidden');
  document.body.classList.remove('empty');                // leave landing
  document.body.classList.toggle('is-diet', page === 'diet');
  sessionStorage.setItem(LAST_PAGE, page);
  blurOff();

  // Call any available initializer(s) for this page
  tryInitializers(page);
}
window.showPage = showPage;  // expose if other modules want to route

/* ---------- first load / landing ---------- */
(function initLanding(){
  const last = sessionStorage.getItem(LAST_PAGE);
  if (last && PAGES[last]) showPage(last);
  else { document.body.classList.add('empty'); hideAllPages(); }  // header only until a choice
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

/* ---------- menu clicks ---------- */
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item');
  if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (page) showPage(page);
});

/* ---------- avatar upload ---------- */
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

/* ---------- init avatar ---------- */
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