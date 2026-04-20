// v2/js/panel/render-structure.js — Vista Estructura del sistema

import { state } from './state.js';
import { $, esc } from './utils.js';
import { getCatalog } from './catalog.js';

export function renderStructure(openNodeFn) {
  const catalog = getCatalog();
  const cont = $('structure-content');
  const sections = (state.config.ui.structureSections || []).filter(s => catalog[s.type]?.length);
  cont.innerHTML = sections.map(sec => `
    <p class="section-title">${esc(sec.title)}</p>
    <div class="node-grid">` +
    catalog[sec.type].map(n => {
      const count = state.cards.filter(c => c.anchors.some(a => a.id === n.id)).length;
      return `<div class="node-card ${count > 0 ? 'has-notes' : ''}" data-open="${esc(n.id)}" data-type="${sec.type}">
        <p class="nt">${esc(n.label)}</p><p class="ns">${esc(n.desc)}</p>
        ${count > 0 ? `<span class="nb">${count} nota${count > 1 ? 's' : ''}</span>` : ''}
      </div>`;
    }).join('') + `</div>`).join('');
  cont.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openNodeFn(el.dataset.open, el.dataset.type)));
}
