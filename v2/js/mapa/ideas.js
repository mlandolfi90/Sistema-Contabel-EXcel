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
  // Reset UI del modal
  const err = $('idea-error'); if (err) { err.textContent = ''; err.style.display = 'none'; }
  const btn = $('idea-submit-btn'); if (btn) { btn.disabled = false; btn.textContent = 'Crear Issue'; }
  openModal('modal-idea');
}

export async function confirmAddIdea(reloadCallback) {
  const title = $('idea-title').value.trim();
  const errEl = $('idea-error');
  const btn = $('idea-submit-btn');
  const showErr = msg => {
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    else alert(msg);
  };

  if (!title) { showErr('Falta el título'); return; }
  const note = $('idea-note').value.trim();
  const status = $('idea-status').value;
  const labels = [status];
  if (state.pendingIdeaAnchor) labels.push(`${state.pendingIdeaAnchor.type}:${state.pendingIdeaAnchor.id}`);

  // Bloquea doble click + feedback visual
  if (btn) { btn.disabled = true; btn.textContent = 'Creando...'; }
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }

  try {
    setStatus('Creando issue...');
    await createIssue(title, note, labels);
    $('idea-title').value = ''; $('idea-note').value = '';
    closeModal('modal-idea');
    if (reloadCallback) await reloadCallback();
    setStatus('Issue creado ✓');
  } catch (e) {
    console.error('[confirmAddIdea] error:', e);
    const msg = e.message || String(e);
    // Errores típicos: 422 = label inexistente, 401 = token inválido, 403 = permisos
    let hint = '';
    if (msg.includes('422')) hint = ' — alguna label (estado/ancla) no existe en el repo.';
    else if (msg.includes('401')) hint = ' — token inválido o expirado.';
    else if (msg.includes('403')) hint = ' — el token no tiene permiso Issues: Write.';
    showErr('❌ ' + msg + hint);
    setStatus('Error al crear issue');
    if (btn) { btn.disabled = false; btn.textContent = 'Crear Issue'; }
  }
}
