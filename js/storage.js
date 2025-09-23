// js/storage.js
// Single point of contact for localStorage JSON operations

export function getItem(key){
  try { return JSON.parse(localStorage.getItem(key) || 'null'); }
  catch { return null; }
}

export function setItem(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch {}
}

export function removeItem(key){
  try { localStorage.removeItem(key); }
  catch {}
}
