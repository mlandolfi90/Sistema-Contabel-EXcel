// v2/js/panel/render-kanban.js — Columnas + filtros + búsqueda + highlight

import { state } from './state.js';
import { $, esc, setStatus } from './utils.js';
import { renderCard } from './render-card.js';
import { moveCard, rejectCard, backCard, deleteCard } from './actions.js';

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

  // Bind buscador (una sola vez)
  const input = $('search-input');
  const clearBtn = $('search-clear');
  if (input && !input.dataset.bound) {
    input.dataset.bound = '1';
    input.addEventListener('input', () => {
      state.currentSearch = input.value.trim().toLowerCase();
      clearBtn.style.display = state.currentSearch ? 'inline-block' : 'none';
      renderKanban();
    });
    clearBtn.addEventListener('click', () => {
      input.value = ''; state.currentSearch = '';
      clearBtn.style.display = 'none';
      renderKanban(); input.focus();
    });
  }
}

export function setFilter(f) {
  state.currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('on', c.dataset.filter === f));
  renderKanban();
}

function matchesSearch(card, q) {
  if (!q) return true;
  if (('#' + card.number).includes(q)) return true;
  if ((card.title || '').toLowerCase().includes(q)) return true;
  if ((card.note || '').toLowerCase().includes(q)) return true;
  if (card.anchors.some(a => (a.id || '').toLowerCase().includes(q))) return true;
  return false;
}

export function renderKanban() {
  const { cards, config, currentFilter, currentSearch } = state;
  const visible = cards
    .filter(c => currentFilter === 'all' || c.anchors.some(a => a.type === currentFilter))
    .filter(c => matchesSearch(c, currentSearch));
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

  // bind botones (reloadCallback inyectado desde main.js en state._reloadCallback)
  const rcb = state._reloadCallback;
  document.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => moveCard(parseInt(b.dataset.number), b.dataset.move, rcb)));
  document.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', () => rejectCard(parseInt(b.dataset.number), rcb)));
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => backCard(parseInt(b.dataset.number), rcb)));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteCard(parseInt(b.dataset.number), rcb)));

  // Highlight del issue indicado en ?issue=N (solo la primera vez tras carga)
  if (state.focusIssue) {
    const num = state.focusIssue;
    state.focusIssue = null;

    // ¿El issue existe en cards?
    const cardData = cards.find(c => c.number === num);
    if (!cardData) {
      setStatus(`⚠ Issue #${num} no encontrado (puede estar cerrado o no existir)`);
      return;
    }
    // ¿Está visible con filtros actuales?
    const isVisible = visible.some(c => c.number === num);
    if (!isVisible) {
      // Limpiar filtros y re-renderizar
      state.currentFilter = 'all';
      state.currentSearch = '';
      const si = $('search-input'); if (si) si.value = '';
      const sc = $('search-clear'); if (sc) sc.style.display = 'none';
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('on', c.dataset.filter === 'all'));
      state.focusIssue = num; // re-intenta en el próximo render
      renderKanban();
      return;
    }

    // Busca el DOM node con retry (hasta 500ms)
    let attempts = 0;
    const tryHighlight = () => {
      const btn = document.querySelector(`[data-number="${num}"]`);
      const cardEl = btn ? btn.closest('.card') : null;
      if (!cardEl && attempts++ < 10) {
        setTimeout(tryHighlight, 50);
        return;
      }
      if (!cardEl) {
        setStatus(`⚠ No pude resaltar la tarjeta #${num} (DOM no la encontró)`);
        return;
      }
      cardEl.classList.add('card-highlight');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setStatus(`→ Card #${num} resaltada`);
      setTimeout(() => cardEl.classList.remove('card-highlight'), 3000);
    };
    requestAnimationFrame(tryHighlight);
  }
}

/* Lee ?issue=N del URL y lo marca como foco antes del primer renderKanban */
export function readFocusFromURL() {
  const params = new URLSearchParams(window.location.search);
  const n = parseInt(params.get('issue'));
  if (n) state.focusIssue = n;
}
