// v2/js/panel/render-card.js — Renderiza UNA tarjeta con sus botones

import { state } from './state.js';
import { esc } from './utils.js';
import { getState } from '../config-loader.js';

export function renderCard(c) {
  const cfg = state.config;
  const stateDef = getState(cfg, c.status);
  const tags = c.anchors.map(a => `<span class="tag tag-${a.type}">${esc(a.id)}</span>`).join('');

  // ¿Se pueden aplicar las acciones back/reject desde este estado?
  const backAction = cfg.workflow.actions.find(a => a.id === 'back');
  const rejectAction = cfg.workflow.actions.find(a => a.id === 'reject');
  const canBack = backAction && backAction.fromStates.includes(c.status) && stateDef.prev;
  const canReject = rejectAction && rejectAction.fromStates.includes(c.status);

  const prevState = stateDef.prev ? getState(cfg, stateDef.prev) : null;
  const nextState = getState(cfg, stateDef.next);
  const preview = (c.note || '').slice(0, 200);

  return `<div class="card ${stateDef.cardClass || ''}">
    <div class="actions">
      ${canBack ? `<button data-back data-number="${c.number}" title="Retroceder a ${esc(prevState.short)}" class="btn-back">←</button>` : ''}
      ${canReject ? `<button data-reject data-number="${c.number}" title="Rechazar" class="btn-reject">✕</button>` : ''}
      <button data-move="${stateDef.next}" data-number="${c.number}" title="Mover a ${esc(nextState.short)}">${esc(stateDef.arrow)}</button>
      <button data-delete data-number="${c.number}" title="Archivar (cerrar)">⌫</button>
    </div>
    <p class="title"><a href="${c.url}" target="_blank">${esc(c.title)}</a> <span class="issue-num">#${c.number}</span></p>
    ${preview ? `<p class="note">${esc(preview)}${c.note.length > 200 ? '...' : ''}</p>` : ''}
    <div class="tags">${tags}</div>
  </div>`;
}
