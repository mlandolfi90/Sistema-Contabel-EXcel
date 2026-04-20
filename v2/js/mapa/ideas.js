// v2/js/mapa/ideas.js — Crear Issue anclada al nodo seleccionado

import { state } from './state.js';
import { $, setStatus, openModal, closeModal } from './utils.js';
import { hasToken, createIssue } from '../github.js';

export function openAddIdeaModal() {
  if (!hasToken()) return alert('Necesitás token para crear issues');
  const { graph } = state;
  const sel = graph.$('node[kind != "issue"]:selected');
  if (sel.length === 0) {
    if (!confirm('No hay nodo seleccionado. ¿Crear idea sin ancla?')) return;
    state.pendingIdeaAnchor = null;
    $('idea-anchor-info').textContent = 'Sin ancla (Issue suelto)';
  } else {
    const n = sel[0];
    state.pendingIdeaAnchor = { type: n.data('type'), id: n.id() };
    $('idea-anchor-info').textContent = `Ancla: ${state.pendingIdeaAnchor.type}:${state.pendingIdeaAnchor.id}`;
  }
  openModal('modal-idea');
}

export async function confirmAddIdea(reloadCallback) {
  const title = $('idea-title').value.trim();
  if (!title) return alert('Falta el título');
  const note = $('idea-note').value.trim();
  const status = $('idea-status').value;
  const labels = [status];
  if (state.pendingIdeaAnchor) labels.push(`${state.pendingIdeaAnchor.type}:${state.pendingIdeaAnchor.id}`);
  try {
    setStatus('Creando issue...');
    await createIssue(title, note, labels);
    $('idea-title').value = ''; $('idea-note').value = '';
    closeModal('modal-idea');
    if (reloadCallback) await reloadCallback();
    setStatus('Issue creado ✓');
  } catch (e) { setStatus('Error: ' + e.message); }
}
