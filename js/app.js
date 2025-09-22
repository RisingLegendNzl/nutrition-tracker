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

// Compress & normalize image (handles HEIC/large files). Returns a DataURL.
async function processAvatarFile(file, maxSize=512, quality=0.82){
  // Use createImageBitmap when available for speed
  const dataUrl = await new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } catch(e){ reject(e); }
  });

  const img = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = dataUrl;
  });

  // Compute target size
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  let tw = w, th = h;
  if (w > h && w > maxSize){ th = Math.round(h * (maxSize / w)); tw = maxSize; }
  else if (h >= w && h > maxSize){ tw = Math.round(w * (maxSize / h)); th = maxSize; }

  // Draw to canvas
  const c = document.createElement('canvas');
  c.width = Math.max(1, tw);
  c.height = Math.max(1, th);
  const g = c.getContext('2d', { alpha: false });
  g.drawImage(img, 0, 0, tw, th);

  // Export JPEG (works for HEIC too)
  const outUrl = c.toDataURL('image/jpeg', quality);
  return outUrl;
}
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
  else { showPage('diet'); }
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
avatarIn?.addEventListener('change', async () => {
  const f = avatarIn?.files?.[0];
  if (!f) return;
  if (!/^image\//.test(f.type)) { alert('Please select an image.'); avatarIn.value = ""; return; }

  // Instant preview via object URL (freed after full save)
  const tmpUrl = URL.createObjectURL(f);
  if (avatarImg) avatarImg.src = tmpUrl;

  try {
    const compressed = await processAvatarFile(f, 512, 0.82);
    localStorage.setItem(AVATAR_KEY, compressed);
    if (avatarImg) avatarImg.src = compressed;
  } catch (e) {
    console.warn('Avatar processing/save failed:', e);
    alert('Could not save photo. Try a smaller image.');
  } finally {
    URL.revokeObjectURL(tmpUrl);
    avatarIn.value = "";
  }
});
// ---------- init avatar ----------
(function initAvatar(){
  try{
    if (!avatarImg) return;
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) avatarImg.src = saved;
  }catch(e){ console.warn('initAvatar failed', e); }
})();