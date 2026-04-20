// v2/js/mapa/actions-nodes.js — Agregar / editar / eliminar NODOS del borrador

import { state } from './state.js';
import { $, setStatus, openModal, closeModal } from './utils.js';
import { getEffectiveNodes } from '../schema-loader.js';
import { rerender } from './graph-build.js';

export function openAddNodeModal() { openModal('modal-node'); }

export function confirmAddNode() {
  const { schema, draft } = state;
  const type = $('node-type').value;
  const id = $('node-name').value.trim();
  const label = $('node-label').value.trim() || id;
  const desc = $('node-desc').value.trim();
  if (!id) return alert('Falta el ID');
  if (/[\s'"\\\/]/.test(id)) return alert('El ID no puede tener espacios ni caracteres especiales');
  if (getEffectiveNodes(schema, draft).some(n => n.id === id)) return alert('Ya existe un nodo con ese ID');
  draft.addNodes.push({ id, type, label, desc });
  $('node-name').value = ''; $('node-label').value = ''; $('node-desc').value = '';
  closeModal('modal-node');
  rerender();
  setStatus('Nodo agregado al BORRADOR: ' + id);
}

export function editSelected() {
  const { graph } = state;
  const sel = graph.$(':selected');
  if (sel.length === 0) return alert('Seleccioná primero un nodo o flecha');
  if (sel.length > 1) return alert('Seleccioná UNO solo para editar');
  editFromEvent({ target: sel[0] });
}

export function editFromEvent(evt) {
  const { schema, draft } = state;
  const el = evt.target;
  if (el.data('kind') === 'issue') return alert('Los Issues se editan desde GitHub.');

  if (el.isNode()) {
    state.pendingEditNodeId = el.id();
    const node = getEffectiveNodes(schema, draft).find(n => n.id === el.id());
    $('edit-node-id').textContent = node.id;
    $('edit-node-type').value = node.type;
    $('edit-node-label').value = node.label || '';
    $('edit-node-desc').value = node.desc || '';
    openModal('modal-edit-node');
  } else {
    state.pendingEditEdge = { from: el.data('source'), to: el.data('target'), origLabel: el.data('label') || '' };
    $('edit-edge-from').textContent = state.pendingEditEdge.from;
    $('edit-edge-to').textContent = state.pendingEditEdge.to;
    $('edit-edge-label').value = state.pendingEditEdge.origLabel;
    openModal('modal-edit-edge');
  }
}

export function confirmEditNode() {
  const { draft } = state;
  const id = state.pendingEditNodeId; if (!id) return;
  const type = $('edit-node-type').value;
  const label = $('edit-node-label').value.trim();
  const desc = $('edit-node-desc').value.trim();
  const addIdx = draft.addNodes.findIndex(n => n.id === id);
  if (addIdx >= 0) draft.addNodes[addIdx] = { ...draft.addNodes[addIdx], type, label, desc };
  else {
    const existing = draft.editNodes.findIndex(e => e.id === id);
    const entry = { id, type, label, desc };
    if (existing >= 0) draft.editNodes[existing] = entry;
    else draft.editNodes.push(entry);
  }
  state.pendingEditNodeId = null;
  closeModal('modal-edit-node');
  rerender();
  setStatus('Edición en BORRADOR: ' + id);
}

export function deleteSelected() {
  const { graph, draft } = state;
  const sel = graph.$(':selected');
  if (sel.length === 0) return alert('Seleccioná primero un nodo o flecha');
  if (!confirm(sel.length + ' elemento(s) se marcarán para eliminación en el borrador. ¿Continuar?')) return;

  sel.forEach(el => {
    if (el.isNode()) {
      if (el.data('kind') === 'issue') return alert('Los Issues se cierran desde el panel v2.');
      const id = el.id();
      if (el.data('kind') === 'draft-add') draft.addNodes = draft.addNodes.filter(n => n.id !== id);
      else {
        draft.editNodes = draft.editNodes.filter(e => e.id !== id);
        if (!draft.removeNodes.includes(id)) draft.removeNodes.push(id);
      }
    } else if (el.isEdge()) {
      if (el.data('kind') === 'issue') return alert('Las conexiones de Issues vienen de labels.');
      const s = el.data('source'), t = el.data('target'), l = el.data('label') || '';
      const addMatch = draft.addEdges.some(e => e.from === s && e.to === t && (e.label || '') === l);
      if (addMatch) draft.addEdges = draft.addEdges.filter(e => !(e.from === s && e.to === t && (e.label || '') === l));
      else {
        const edited = draft.editEdges.find(e => e.from === s && e.to === t && (e.label || '') === l);
        const origLabel = edited ? edited.origLabel : l;
        draft.editEdges = draft.editEdges.filter(e => !(e.from === s && e.to === t && (e.origLabel || '') === origLabel));
        if (!draft.removeEdges.some(e => e.from === s && e.to === t && (e.label || '') === origLabel))
          draft.removeEdges.push({ from: s, to: t, label: origLabel });
      }
    }
  });
  rerender();
  setStatus('Eliminación pendiente en BORRADOR');
}
