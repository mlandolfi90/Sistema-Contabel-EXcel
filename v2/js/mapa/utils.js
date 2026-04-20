// v2/js/mapa/utils.js — Helpers genéricos
export const $ = id => document.getElementById(id);
export function setStatus(msg) { const el = $('status'); if (el) el.textContent = msg || ''; }
export function openModal(id) { $(id).classList.add('show'); }
export function closeModal(id) { $(id).classList.remove('show'); }
export function truncate(s, n) { return s.length > n ? s.slice(0, n-1) + '…' : s; }
