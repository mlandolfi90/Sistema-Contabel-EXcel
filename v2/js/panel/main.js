// v2/js/panel/main.js — Orquestador del panel Kanban

import { state } from './state.js';
import { $, setStatus } from './utils.js';
import { loadIssues } from '../github.js';
import { loadSchemaAll } from '../schema-loader.js';
import { loadConfig } from '../config-loader.js';
import { saveTokenBtn, clearTokenBtn, updateAuthUI } from './auth.js';
import { openNode, toggleAnchorPicker, resetComposer, saveCard } from './composer.js';
import { renderStatusSelect, renderKanbanColumns, renderFilters, renderKanban } from './render-kanban.js';
import { renderStructure } from './render-structure.js';
import { switchView, copyVBAPrompt } from './views.js';

async function loadAll() {
  try {
    setStatus('Cargando config...');
    state.config = await loadConfig();
    const all = await loadSchemaAll();
    state.schema = all.schema;

    // Renderizar UI dinámica (solo primera vez)
    if (!$('kanban').innerHTML) {
      renderStatusSelect();
      renderKanbanColumns();
      renderFilters(copyVBAPrompt);
    }

    setStatus('Cargando issues...');
    state.cards = await loadIssues();
    renderKanban();
    renderStructure((id, type) => openNode(id, type, switchView));
    setStatus('Cargadas ' + state.cards.length + ' ideas');
  } catch (e) { setStatus('Error: ' + e.message); }
}

export function init() {
  // Inyectar el reload callback en state para que render-kanban lo use
  state._reloadCallback = loadAll;

  // Exponer al window para los onclick del HTML
  Object.assign(window, {
    saveTokenBtn: () => saveTokenBtn(loadAll),
    clearTokenBtn,
    reload: loadAll,
    switchView,
    toggleAnchorPicker,
    resetComposer,
    saveCard: () => saveCard(loadAll),
  });

  updateAuthUI();
  loadAll();
}
