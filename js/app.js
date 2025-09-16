// js/app.js — simple SPA router + menu wiring

import * as Diet from './diet.js';
import * as Supps from './supps.js';
import { mountHydration } from './hydration.js';
import * as Profile from './profile.js';

// Utility
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const PAGES = ['home', 'diet', 'supps', 'hydration', 'profile'];

function showPage(id) {
  // Guard
  if (!PAGES.includes(id)) id = 'home';

  // Toggle visibility
  $$('.page').forEach(el => el.classList.add('hidden'));
  const pageEl = $(`#page-${id}`);
  if (pageEl) pageEl.classList.remove('hidden');

  // Mount the module for this page
  const mounts = {
    diet:      () => Diet?.mountDiet?.(),
    supps:     () => Supps?.mountSupps?.(),
    hydration: () => mountHydration?.(),
    profile:   () => Profile?.mountProfile?.()
  };
  mounts[id]?.();

  // Let feature files optionally respond
  window.dispatchEvent(new CustomEvent('route:show', { detail: { page: id }}));
}

function navigate(id) {
  // Make URLs like #/diet, blank hash is home
  const hash = id === 'home' ? '' : `#/${id}`;
  if (location.hash !== hash) {
    location.hash = hash;
  } else {
    // same route; still ensure page mounts (important on first render)
    showPage(id);
  }
}

function currentRouteFromHash() {
  const match = location.hash.match(/^#\/?([^?]+)/);
  const id = match ? match[1] : 'home';
  return PAGES.includes(id) ? id : 'home';
}

function wireMenu() {
  // Menu links use data-route="diet" etc.
  $$('[data-route]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.dataset.route);
    });
  });

  // Brand title navigates home
  $('#brand')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('home');
  });

  // Burger open/close (if you added these ids)
  $('#menuBtn')?.addEventListener('click', () => {
    $('#menuSheet')?.classList.toggle('open');
    $('#scrim')?.classList.toggle('open');
    document.body.classList.toggle('blurred', $('#menuSheet')?.classList.contains('open'));
  });
  $('#scrim')?.addEventListener('click', () => {
    $('#menuSheet')?.classList.remove('open');
    $('#scrim')?.classList.remove('open');
    document.body.classList.remove('blurred');
  });
}

function boot() {
  wireMenu();
  showPage(currentRouteFromHash());
}

window.addEventListener('hashchange', () => showPage(currentRouteFromHash()));
document.addEventListener('DOMContentLoaded', boot);

// Expose navigate if needed elsewhere
export { navigate, showPage };