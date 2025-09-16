// js/app.js
import { mountDiet } from './diet.js';
import { mountSupps } from './supps.js';
import { mountHydration } from './hydration.js';
import { mountProfile, requireComplete as profileComplete, onProfileChange } from './profile.js';

// Tab buttons (static in index.html)
const tabButtons = {
  diet:  document.getElementById('tabDiet'),
  supps: document.getElementById('tabSupps'),
  hydro: document.getElementById('tabHydro'),
};

/**
 * Resolve current views on demand so dynamically inserted pages (e.g., #profilePage)
 * are correctly considered. Then hide all <main> elements except the requested one.
 */
function show(name){
  // Resolve commonly-used pages by id (if present)
  const map = {
    diet:   document.getElementById('dietPage'),
    supps:  document.getElementById('suppsPage'),
    hydro:  document.getElementById('hydroPage'),
    profile:document.getElementById('profilePage'),
  };
  const target = map[name] || null;

  // Hide every <main>, show only the target (if any)
  document.querySelectorAll('main').forEach(m => {
    m.classList.toggle('hidden', m !== target);
  });

  // Update tab active state
  Object.keys(tabButtons).forEach(k => {
    if (tabButtons[k]) tabButtons[k].classList.toggle('active', k === name);
  });
}

function wireTabs(){
  if (tabButtons.diet)  tabButtons.diet.addEventListener('click',  () => show('diet'));
  if (tabButtons.supps) tabButtons.supps.addEventListener('click', () => show('supps'));
  if (tabButtons.hydro) tabButtons.hydro.addEventListener('click', () => show('hydro'));
}

document.addEventListener('DOMContentLoaded', () => {
  wireTabs();

  // Mount Profile first; it will add #profilePage dynamically and handle first-run gating.
  mountProfile();

  // Mount feature modules
  mountDiet();
  mountSupps();
  mountHydration();

  // If profile exists, go to Diet by default; otherwise the profile module will show its gate.
  if (profileComplete()) show('diet');

  // After saving/updating profile, snap back to Diet cleanly (and ensure only one page is visible).
  onProfileChange(() => {
    show('diet');
  });
});

// Hamburger menu logic
const menuBtn    = document.getElementById('menuBtn');
const menuPanel  = document.getElementById('menuPanel');
const avatarImg  = document.getElementById('avatarImg');
const avatarIn   = document.getElementById('avatarInput');

// Placeholder avatar (blank circle) if none saved
const AVATAR_KEY = 'nutrify_avatar';
function setAvatar(src){ avatarImg.src = src; }
(function initAvatar(){
  const saved = localStorage.getItem(AVATAR_KEY);
  if (saved) setAvatar(saved);
  else setAvatar('data:image/svg+xml;utf8,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2a2a2a"/><stop offset="1" stop-color="#1b1b1b"/></linearGradient></defs>' +
      '<circle cx="50" cy="50" r="50" fill="url(#g)"/></svg>')
  );
})();

// open/close
function openMenu(){ document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded','true'); menuPanel.hidden = false; }
function closeMenu(){ document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded','false'); menuPanel.hidden = true; }

menuBtn?.addEventListener('click', () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()));
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });
document.addEventListener('click', (e)=>{
  if (!document.body.classList.contains('menu-open')) return;
  const within = menuPanel.contains(e.target) || menuBtn.contains(e.target);
  if (!within) closeMenu();
});

// avatar: clicking image opens profile AND file picker
avatarImg?.addEventListener('click', ()=>{
  showPage?.('profile'); // your existing router
  document.body.classList.add('is-diet', false);
  avatarIn?.click();     // open file chooser
});

// upload → save → show
avatarIn?.addEventListener('change', () => {
  const f = avatarIn.files?.[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(AVATAR_KEY, reader.result);
    setAvatar(reader.result);
    showPage?.('profile');
    closeMenu();
  };
  reader.readAsDataURL(f);
});

// panel nav buttons
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item'); if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (page) {
    showPage?.(page);
    // maintain your "Diet only" day nav state:
    document.body.classList.toggle('is-diet', page === 'diet');
    closeMenu();
  }
});

// ── HAMBURGER MENU + ROUTING ───────────────────────────────────────────────
const menuBtn    = document.getElementById('menuBtn');
const menuPanel  = document.getElementById('menuPanel');
const avatarImg  = document.getElementById('avatarImg');
const avatarIn   = document.getElementById('avatarInput');

const AVATAR_KEY = 'nutrify_avatar';

// pages (must exist in your HTML)
const PAGES = {
  profile: document.getElementById('profilePage'),
  diet:    document.getElementById('dietPage'),
  supps:   document.getElementById('suppsPage'),
  hydro:   document.getElementById('hydroPage')
};

// hide all pages
function hideAll() { Object.values(PAGES).forEach(el => el && el.classList.add('hidden')); }

export function showPage(page) {
  hideAll();
  if (PAGES[page]) PAGES[page].classList.remove('hidden');
  document.body.classList.toggle('is-diet', page === 'diet');
  document.body.classList.remove('empty');   // once a page is chosen, main shows
  closeMenu();
}

// first-visit state: show only header (brand + hamburger)
(function initFirstVisit(){
  // Only add empty state if no page is currently active in URL or storage
  if (!sessionStorage.getItem('nutrify_last_page')) {
    document.body.classList.add('empty');
    hideAll();
  } else {
    showPage(sessionStorage.getItem('nutrify_last_page'));
  }
})();

// persist last page
function remember(page){ sessionStorage.setItem('nutrify_last_page', page); }

// open/close menu
function openMenu(){ document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded','true'); menuPanel.hidden = false; }
function closeMenu(){ document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded','false'); menuPanel.hidden = true; }

menuBtn?.addEventListener('click', () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()));
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMenu(); });
document.addEventListener('click', (e)=>{
  if (!document.body.classList.contains('menu-open')) return;
  const within = menuPanel.contains(e.target) || menuBtn.contains(e.target);
  if (!within) closeMenu();
});

// menu item clicks → navigate
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item'); if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (page) { remember(page); showPage(page); }
});

// avatar image: open Profile editor
avatarImg?.addEventListener('click', ()=>{
  remember('profile'); showPage('profile');
  avatarIn?.click(); // optional: open picker immediately
});

// avatar upload → preview + save
avatarIn?.addEventListener('change', () => {
  const f = avatarIn.files?.[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => { localStorage.setItem(AVATAR_KEY, reader.result); avatarImg.src = reader.result; };
  reader.readAsDataURL(f);
});

// init avatar (blank gradient if none yet)
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