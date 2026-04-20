// v2/js/panel/utils.js — Helpers genéricos
export const $ = id => document.getElementById(id);
export function setStatus(msg) {
  const el = $('save-status');
  if (el) { el.textContent = msg || ''; if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000); }
}
export function esc(s) { return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
