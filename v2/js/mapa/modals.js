// v2/js/mapa/modals.js — Bindings mínimos para cerrar modales con click fuera
export function bindModalCloseOnBackdrop() {
  document.querySelectorAll('.modal-bg').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });
  });
}
