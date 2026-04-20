// v2/js/panel/render-kanban.js — Columnas + filtros + render completo

import { state } from './state.js';
import { $, esc } from './utils.js';
import { renderCard } from './render-card.js';
import { moveCard, rejectCard, deleteCard } from './actions.js';

/* Render inicial (sólo primera vez) del HTML estático dinámico */
export function renderStatusSelect() {
  $('new-status').innerHTML = state.config.workflow.states.map(s =>
    `<option value="${s.id}">${esc(s.label)}</option>`
  ).join('');
}

export function renderKanbanColumns() {
  const k = $('kanban');
  k.innerHTML = state.config.workflow.states.map(s => `
    <div class="col ${s.colClass || ''}">
      <h3>${esc(s.label)} <span class="count" id="c-${s.id}">0</span></h3>
      <div id="col-${s.id}"></div>
    </div>`).join('');
  k.style.gridTemplateColumns = `repeat(${state.config.workflow.states.length}, minmax(0,1fr))`;
}

export function renderFilters(copyVBAPromptFn) {
  const bar = $('filters-bar');
  const types = state.config.anchorTypes.types;
  bar.innerHTML =
    `<span style="font-size:12px;">Filtrar:</span>` +
    `<button class="filter-chip on" data-filter="all">Todas</button>` +
    types.map(t => `<button class="filter-chip" data-filter="${t.id}">${esc(t.filterLabel)}</button>`).join('') +
    `<div style="margin-left:auto;"><button class="btn" id="btn-vba-prompt">Copiar prompt VBA</button></div>`;
  bar.querySelectorAll('.filter-chip').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  $('btn-vba-prompt').addEventListener('click', copyVBAPromptFn);
}

export function setFilter(f) {
  state.currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('on', c.dataset.filter === f));
  renderKanban();
}

export function renderKanban(reloadCallback) {
  const { cards, config, currentFilter } = state;
  const visible = cards.filter(c => currentFilter === 'all' || c.anchors.some(a => a.type === currentFilter));
  const cols = Object.fromEntries(config.stateIds.map(id => [id, []]));
  visible.forEach(c => { if (cols[c.status]) cols[c.status].push(c); });

  config.stateIds.forEach(k => {
    const el = $('col-' + k), countEl = $('c-' + k);
    if (!el || !countEl) return;
    countEl.textContent = cols[k].length;
    if (cols[k].length === 0) { el.innerHTML = '<p class="empty">Sin tarjetas</p>'; return; }
    el.innerHTML = cols[k].map(c => renderCard(c)).join('');
  });
  $('ideas-count').textContent = cards.length;

  // bind botones (reloadCallback se inyecta desde main)
  const rcb = state._reloadCallback;
  document.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => moveCard(parseInt(b.dataset.number), b.dataset.move, rcb)));
  document.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', () => rejectCard(parseInt(b.dataset.number), rcb)));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteCard(parseInt(b.dataset.number), rcb)));
}
