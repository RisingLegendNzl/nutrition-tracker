// js/menu.js
// Hamburger dropdown, avatar upload, simple routing, landing (header-only) state.

const menuBtn   = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
const avatarImg = document.getElementById('avatarImg');
const avatarIn  = document.getElementById('avatarInput');

const AVATAR_KEY = 'nutrify_avatar';
const LAST_PAGE  = 'nutrify_last_page';

// Page refs (must exist in your HTML)
const PAGES = {
  profile: document.getElementById('profilePage'),
  diet:    document.getElementById('dietPage'),
  supps:   document.getElementById('suppsPage'),
  hydro:   document.getElementById('hydroPage'),
};

// Utility: hide all page sections
function hideAllPages() {
  Object.values(PAGES).forEach(el => el && el.classList.add('hidden'));
}

// Public router so other modules can call it if needed
function showPage(page) {
  hideAllPages();
  if (PAGES[page]) PAGES[page].classList.remove('hidden');
  document.body.classList.toggle('is-diet', page === 'diet');
  document.body.classList.remove('empty');   // leave landing state
  sessionStorage.setItem(LAST_PAGE, page);
  closeMenu();
}
window.showPage = showPage; // expose globally (backward-compat)

// First visit: header-only landing state
(function initLanding() {
  const last = sessionStorage.getItem(LAST_PAGE);
  if (last && PAGES[last]) {
    showPage(last);
  } else {
    document.body.classList.add('empty');
    hideAllPages();
  }
})();

// Menu open/close
function openMenu()  { document.body.classList.add('menu-open');  menuBtn.setAttribute('aria-expanded','true');  menuPanel.hidden = false; }
function closeMenu() { document.body.classList.remove('menu-open');menuBtn.setAttribute('aria-expanded','false'); menuPanel.hidden = true;  }

menuBtn?.addEventListener('click', () => {
  document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
});
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', (e)=>{
  if (!document.body.classList.contains('menu-open')) return;
  const within = menuPanel.contains(e.target) || menuBtn.contains(e.target);
  if (!within) closeMenu();
});

// Menu item clicks → navigate
menuPanel?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.menu-item'); if (!btn) return;
  const page = btn.getAttribute('data-page');
  if (page) showPage(page);
});

// Avatar: open profile + allow upload
avatarImg?.addEventListener('click', ()=>{
  showPage('profile');
  avatarIn?.click();
});

// Avatar upload → preview + save (base64)
avatarIn?.addEventListener('change', () => {
  const f = avatarIn.files?.[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem(AVATAR_KEY, reader.result);
    avatarImg.src = reader.result;
  };
  reader.readAsDataURL(f);
});

// Init avatar (blank gradient circle if none)
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
