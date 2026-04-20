// v2/js/mapa/ideas.js — Crear Issue anclada a UNO o VARIOS nodos seleccionados

import { state } from './state.js';
import { $, setStatus, openModal, closeModal } from './utils.js';
import { hasToken, createIssue } from '../github.js';

export function openAddIdeaModal() {
  if (!hasToken()) return alert('Necesitás token para crear issues');
  const { graph } = state;
  const sel = graph.$('node[kind != "issue"]:selected');

  if (sel.length === 0) {
    if (!confirm('No hay nodo seleccionado. ¿Crear idea sin ancla?')) return;
    state.pendingIdeaAnchors = [];
    $('idea-anchor-info').textContent = 'Sin ancla (Issue suelto)';
  } else {
    // Multi-ancla: recorremos TODOS los nodos seleccionados.
    // Cada uno se convertirá en una label tipo "type:id" y en una arista en el mapa
    // (graph-build.js ya dibuja una arista por cada ancla de un issue).
    const anchors = sel.map(n => ({ type: n.data('type'), id: n.id() }));
    state.pendingIdeaAnchors = anchors;
    const resumen = anchors.map(a => `${a.type}:${a.id}`).join(', ');
    const prefijo = anchors.length === 1 ? 'Ancla' : `Anclas (${anchors.length})`;
    $('idea-anchor-info').textContent = `${prefijo}: ${resumen}`;
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

  // Una label por cada ancla seleccionada -> issueToCard en github.js las
  // reconstruye todas al recargar, y graph-build.js dibuja una arista por cada una.
  const anchors = state.pendingIdeaAnchors || [];
  anchors.forEach(a => labels.push(`${a.type}:${a.id}`));

  // Bloquea doble click + feedback visual
  if (btn) { btn.disabled = true; btn.textContent = 'Creando...'; }
  if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }

  try {
    setStatus('Creando issue...');
    await createIssue(title, note, labels);
    $('idea-title').value = ''; $('idea-note').value = '';
    closeModal('modal-idea');
    if (reloadCallback) await reloadCallback();
    setStatus(anchors.length > 1
      ? `Issue creado ✓ (${anchors.length} anclas)`
      : 'Issue creado ✓');
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
