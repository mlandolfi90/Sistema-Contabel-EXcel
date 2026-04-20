// v2/js/mapa/actions-edges.js — Modo enlace + edición de aristas

import { state } from './state.js';
import { $, setStatus, closeModal } from './utils.js';
import { rerender } from './graph-build.js';

export function toggleLinkMode() {
  state.linkMode = !state.linkMode;
  const btn = $('btn-link');
  if (state.linkMode) {
    btn.classList.add('active'); btn.textContent = '✕ Cancelar conexión';
    setStatus('Modo conexión: click en nodo ORIGEN');
  } else {
    btn.classList.remove('active'); btn.textContent = '+ Conexión';
    if (state.linkSource) { state.linkSource.removeStyle(); state.linkSource = null; }
    setStatus('');
  }
}

export function onLinkModeTap(evt) {
  if (!state.linkMode) return;
  const node = evt.target;
  if (!state.linkSource) {
    state.linkSource = node;
    node.style({ 'border-color': '#0a0', 'border-width': 4 });
    setStatus('Origen: ' + node.data('label') + ' — click ahora en el destino');
  } else if (state.linkSource.id() !== node.id()) {
    createDraftEdge(state.linkSource.id(), node.id());
    state.linkSource.removeStyle(); state.linkSource = null;
    toggleLinkMode();
  }
}

export function createDraftEdge(sourceId, targetId) {
  const label = prompt('Etiqueta de la conexión (opcional):', '');
  if (label === null) { setStatus('Conexión cancelada'); return; }
  state.draft.addEdges.push({ from: sourceId, to: targetId, label });
  rerender();
  setStatus('Conexión agregada al BORRADOR');
}

export function confirmEditEdge() {
  const { draft } = state;
  const ed = state.pendingEditEdge; if (!ed) return;
  const newLabel = $('edit-edge-label').value.trim();
  const addIdx = draft.addEdges.findIndex(e => e.from === ed.from && e.to === ed.to && (e.label || '') === ed.origLabel);
  if (addIdx >= 0) draft.addEdges[addIdx].label = newLabel;
  else {
    const key = `${ed.from}|${ed.to}|${ed.origLabel}`;
    const existing = draft.editEdges.findIndex(e => `${e.from}|${e.to}|${(e.origLabel||'')}` === key);
    const entry = { from: ed.from, to: ed.to, origLabel: ed.origLabel, label: newLabel };
    if (existing >= 0) draft.editEdges[existing] = entry;
    else draft.editEdges.push(entry);
  }
  state.pendingEditEdge = null;
  closeModal('modal-edit-edge');
  rerender();
  setStatus('Conexión editada en BORRADOR');
}
