// v2/js/panel/actions.js — Mover / rechazar / archivar tarjetas

import { state } from './state.js';
import { setStatus } from './utils.js';
import { hasToken, updateIssue, closeIssue, cardToLabels, addIssueComment } from '../github.js';
import { getState } from '../config-loader.js';

export async function moveCard(number, newStatus, reloadCallback) {
  if (!hasToken()) return alert('Necesitás un token');
  const c = state.cards.find(x => x.number === number);
  if (!c) return;
  const targetState = getState(state.config, newStatus);

  // Si el estado destino requiere motivo, pedirlo antes
  let reason = null;
  if (targetState.requiresReason) {
    reason = prompt(targetState.reasonPrompt || '¿Motivo?');
    if (reason === null) return;
    if (!reason.trim()) return alert('El motivo es obligatorio');
  }

  const newLabels = await cardToLabels(newStatus, c.anchors, c.labels, state.config);
  try {
    setStatus('Moviendo...');
    await updateIssue(number, { labels: newLabels });
    if (reason) await addIssueComment(number, `**${targetState.short || newStatus}:** ${reason}`);
    if (reloadCallback) await reloadCallback();
  } catch (e) { setStatus('Error: ' + e.message); }
}

export async function rejectCard(number, reloadCallback) {
  return moveCard(number, 'rechazada', reloadCallback);
}

export async function deleteCard(number, reloadCallback) {
  if (!hasToken()) return alert('Necesitás un token');
  if (!confirm('¿Archivar este issue? (se cierra en GitHub)')) return;
  try {
    setStatus('Cerrando...');
    await closeIssue(number);
    if (reloadCallback) await reloadCallback();
  } catch (e) { setStatus('Error: ' + e.message); }
}
