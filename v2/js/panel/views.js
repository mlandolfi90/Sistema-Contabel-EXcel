// v2/js/panel/views.js — Tabs (Ideas / Estructura) + prompt VBA

import { state } from './state.js';
import { setStatus } from './utils.js';

export function switchView(v) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-' + v));
}

export function copyVBAPrompt() {
  const listas = state.cards.filter(c => c.status === 'listo');
  if (listas.length === 0) return alert('No hay ideas en "Listo" todavía');
  let txt = (state.config.ui.vbaPromptHeader || '') + '\n\n';
  listas.forEach((c, i) => {
    txt += `${i+1}. ${c.title} (Issue #${c.number})\n`;
    if (c.note) txt += '   Nota: ' + c.note.slice(0,500) + '\n';
    if (c.anchors.length) txt += '   Anclas: ' + c.anchors.map(a => `${a.id} (${a.type})`).join(', ') + '\n';
    txt += '\n';
  });
  navigator.clipboard.writeText(txt).then(() => setStatus('Prompt copiado ✓'));
}
