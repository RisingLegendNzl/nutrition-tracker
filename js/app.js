// js/app.js — hamburger dropdown, avatar upload, routing, landing state
// This version dynamically imports each page module (from the same /js/ folder),
// calls common init names, and also emits a 'route:show' event.

// Shorthand
const $ = (s) => document.querySelector(s);

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

// ---------- helpers ----------
function hideAllPages(){ Object.values(PAGES).forEach(el => el && el.classList.add('hidden')); }
function blurOn(){  document.body.classList.add('menu-open');  menuBtn?.setAttribute('aria-expanded','true');  menuPanel.hidden = false; }
function blurOff(){ document.body.classList.remove('menu-open'); menuBtn?.setAttribute('aria-expanded','false'); menuPanel.hidden = true;  }

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

// ---------- ROUTER (app.js is in /js/, so imports are "./<file>.js") ----------
async function showPage(page){
  if (!PAGES[page]) return;

  // Reveal selected page
  hideAllPages();
  PAGES[page].classList.remove('hidden');
  document.body.classList.remove('empty');                // leave landing
  document.body.classList.toggle('is-diet', page === 'diet');
  sessionStorage.setItem(LAST_PAGE, page);
  blurOff();

  // Import the module and call its init/render
  switch(page){
    case 'profile':
      await callAny(import('./profile.js'),   ['mountProfile','renderProfile','initProfile']);
      break;
    case 'diet':
      await callAny(import('./diet.js'),      ['mountDiet','renderDiet','initDiet']);
      break;
    case 'supps':
      await callAny(import('./supps.js'),     ['mountSupps','renderSupps','initSupps']);
      break;
    case 'hydro':
      await callAny(import('./hydration.js'), ['mountHydration','renderHydro','initHydration']);
      break;
  }

  // Also notify any listeners
  window.dispatchEvent(new CustomEvent('route:show', { detail: { page } }));
}
window.showPage = showPage;  // if other modules want to route

// ---------- first load / landing ----------
(function initLanding(){
  const last = sessionStorage.getItem(LAST_PAGE);
  if (last && PAGES[last]) showPage(last);
  else { document.body.classList.add('empty'); hideAllPages(); }  // header only
})();

// ---------- hamburger ----------
menuBtn?.addEventListener('click', () => {
  document.body.classList.contains('menu-open') ? blurOff() : blurOn();
});
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') blurOff(); });
document.addEventListener('click', (e)=>{
  if (!document.body.classList.contains('menu-open')) return;
  const within = menuPanel.contains(e.target) || menuBtn.contains(e.target);
  if (!within) blurOff();
});

// ---------- menu clicks ----------
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item');
  if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (page) showPage(page);
});

// ---------- avatar upload ----------
// Let the <label for="avatarInput"> open the picker on tap.
// Just handle the file once it's selected.
avatarIn?.addEventListener('change', () => {
  const f = avatarIn?.files?.[0];
  if (!f) return;
  if (!/^image\//.test(f.type)) { console.warn('Selected file is not an image'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      localStorage.setItem(AVATAR_KEY, reader.result);
      if (avatarImg) avatarImg.src = reader.result;
      // Reset the input so picking the same file again fires 'change'
      avatarIn.value = "";
    } catch (e) {
      console.warn('Failed to save avatar:', e);
    }
  };
  reader.onerror = (e) => console.warn('FileReader error:', e);
  reader.readAsDataURL(f);
});
// ---------- init avatar ----------
(function initAvatar(){
  if (!avatarImg) return;
  const saved = localStorage.getItem(AVATAR_KEY);
  if (saved) avatarImg.src = saved;
})();