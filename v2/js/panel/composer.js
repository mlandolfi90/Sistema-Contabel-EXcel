// v2/js/panel/composer.js — Crear Issue + picker de anclas

import { state } from './state.js';
import { $, setStatus, esc } from './utils.js';
import { hasToken, createIssue, cardToLabels } from '../github.js';
import { getCatalog } from './catalog.js';

export function openNode(id, type, switchViewFn) {
  switchViewFn('ideas');
  state.composerAnchors = [{ id, type }];
  updateAnchorPreview();
  $('new-title').focus();
  if ($('anchor-picker').style.display === 'block') renderPicker();
}

export function toggleAnchorPicker() {
  const p = $('anchor-picker');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
  if (p.style.display === 'block') renderPicker();
}

export function renderPicker() {
  const catalog = getCatalog();
  const container = $('anchor-picker-content');
  const types = state.config.anchorTypeIds;
  container.innerHTML = types.filter(t => catalog[t]?.length).map(type => {
    const tagClass = 'tag-' + type;
    return `<p style="font-size:11px;color:var(--text-secondary);margin:10px 0 6px;text-transform:capitalize;">${esc(type)}s</p>
      <div class="composer-anchors">` +
      catalog[type].map(n => {
        const on = state.composerAnchors.some(a => a.id === n.id);
        return `<span class="chip ${on ? 'on ' + tagClass : ''}" data-id="${esc(n.id)}" data-type="${type}">${esc(n.label)}</span>`;
      }).join('') + `</div>`;
  }).join('');
  container.querySelectorAll('.chip').forEach(el => el.addEventListener('click', () => toggleAnchor(el.dataset.id, el.dataset.type)));
}

function toggleAnchor(id, type) {
  const i = state.composerAnchors.findIndex(a => a.id === id);
  if (i >= 0) state.composerAnchors.splice(i, 1);
  else state.composerAnchors.push({ id, type });
  updateAnchorPreview(); renderPicker();
}

export function updateAnchorPreview() {
  $('anchor-preview').textContent = state.composerAnchors.length === 0 ? 'ninguna' : state.composerAnchors.map(a => a.id).join(', ');
}

export function resetComposer() {
  $('new-title').value = ''; $('new-note').value = ''; $('new-status').value = state.config.stateIds[0];
  state.composerAnchors = []; updateAnchorPreview();
}

export async function saveCard(reloadCallback) {
  if (!hasToken()) return alert('Necesitás un token para crear tarjetas');
  const title = $('new-title').value.trim();
  if (!title) return $('new-title').focus();
  const note = $('new-note').value.trim();
  const status = $('new-status').value;
  const labels = await cardToLabels(status, state.composerAnchors, [], state.config);
  try {
    setStatus('Creando issue...');
    await createIssue(title, note, labels);
    resetComposer();
    if (reloadCallback) await reloadCallback();
    setStatus('Issue creado ✓');
  } catch (e) { setStatus('Error: ' + e.message); }
}
