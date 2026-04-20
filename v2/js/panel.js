// v2/js/panel.js — Panel Kanban 100% dinámico desde config + schema

import { getToken, hasToken, setToken, createIssue, updateIssue, closeIssue, loadIssues, cardToLabels, addIssueComment } from './github.js';
import { loadSchemaAll, getEffectiveNodes } from './schema-loader.js';
import { loadConfig, getState } from './config-loader.js';

/* ========== ESTADO ========== */
let schema;
let config;
let cards = [];
let composerAnchors = [];
let currentFilter = 'all';

const $ = id => document.getElementById(id);
function setStatus(msg) {
  const el = $('save-status');
  if (el) { el.textContent = msg || ''; if (msg) setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, 3000); }
}

/* ========== TOKEN UI ========== */
function saveTokenBtn() {
  const v = $('token-input').value.trim();
  if (!v) return;
  setToken(v); $('token-input').value = '';
  updateAuthUI(); loadAll();
}
function clearTokenBtn() { setToken(''); updateAuthUI(); }
function updateAuthUI() {
  const dot = $('auth-dot'), st = $('auth-status');
  const banner = $('no-token-banner'), saveBtn = $('save-btn');
  if (hasToken()) {
    dot.classList.add('ok'); st.textContent = 'Token OK — escritura habilitada';
    banner.style.display = 'none'; saveBtn.disabled = false;
  } else {
    dot.classList.remove('ok'); st.textContent = 'Sin token — solo lectura';
    banner.style.display = 'block'; saveBtn.disabled = true;
  }
}

/* ========== CATÁLOGO DEL SCHEMA ========== */
function getCatalog() {
  const nodes = getEffectiveNodes(schema, { addNodes:[], editNodes:[], removeNodes:[] });
  const cat = {};
  nodes.forEach(n => {
    if (!cat[n.type]) cat[n.type] = [];
    cat[n.type].push({ id: n.id, label: n.label || n.id, desc: n.desc || '' });
  });
  return cat;
}

/* ========== RENDERIZADORES DINÁMICOS ========== */
// Select de estados en el composer
function renderStatusSelect() {
  const sel = $('new-status');
  sel.innerHTML = config.workflow.states.map(s => `<option value="${s.id}">${esc(s.label)}</option>`).join('');
}

// Columnas del Kanban
function renderKanbanColumns() {
  const k = $('kanban');
  k.innerHTML = config.workflow.states.map(s => `
    <div class="col ${s.colClass || ''}">
      <h3>${esc(s.label)} <span class="count" id="c-${s.id}">0</span></h3>
      <div id="col-${s.id}"></div>
    </div>`).join('');
  // Grid: cuántas columnas tiene
  k.style.gridTemplateColumns = `repeat(${config.workflow.states.length}, minmax(0,1fr))`;
}

// Filtros por tipo de ancla
function renderFilters() {
  const bar = $('filters-bar');
  const types = config.anchorTypes.types;
  bar.innerHTML =
    `<span style="font-size:12px;">Filtrar:</span>` +
    `<button class="filter-chip on" data-filter="all">Todas</button>` +
    types.map(t => `<button class="filter-chip" data-filter="${t.id}">${esc(t.filterLabel)}</button>`).join('') +
    `<div style="margin-left:auto;"><button class="btn" id="btn-vba-prompt">Copiar prompt VBA</button></div>`;
  bar.querySelectorAll('.filter-chip').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
  $('btn-vba-prompt').addEventListener('click', copyVBAPrompt);
}

/* ========== COMPOSER ========== */
function openNode(id, type) {
  switchView('ideas');
  composerAnchors = [{ id, type }];
  updateAnchorPreview();
  $('new-title').focus();
  if ($('anchor-picker').style.display === 'block') renderPicker();
}

function toggleAnchorPicker() {
  const p = $('anchor-picker');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
  if (p.style.display === 'block') renderPicker();
}

function renderPicker() {
  const catalog = getCatalog();
  const container = $('anchor-picker-content');
  const types = config.anchorTypeIds;
  container.innerHTML = types.filter(t => catalog[t]?.length).map(type => {
    const tagClass = 'tag-' + type;
    return `<p style="font-size:11px;color:var(--text-secondary);margin:10px 0 6px;text-transform:capitalize;">${esc(type)}s</p>
      <div class="composer-anchors">` +
      catalog[type].map(n => {
        const on = composerAnchors.some(a => a.id === n.id);
        return `<span class="chip ${on ? 'on ' + tagClass : ''}" data-id="${esc(n.id)}" data-type="${type}">${esc(n.label)}</span>`;
      }).join('') + `</div>`;
  }).join('');
  container.querySelectorAll('.chip').forEach(el => el.addEventListener('click', () => toggleAnchor(el.dataset.id, el.dataset.type)));
}

function toggleAnchor(id, type) {
  const i = composerAnchors.findIndex(a => a.id === id);
  if (i >= 0) composerAnchors.splice(i, 1);
  else composerAnchors.push({ id, type });
  updateAnchorPreview(); renderPicker();
}

function updateAnchorPreview() {
  $('anchor-preview').textContent = composerAnchors.length === 0 ? 'ninguna' : composerAnchors.map(a => a.id).join(', ');
}

function resetComposer() {
  $('new-title').value = ''; $('new-note').value = ''; $('new-status').value = config.stateIds[0];
  composerAnchors = []; updateAnchorPreview();
}

async function saveCard() {
  if (!hasToken()) return alert('Necesitás un token para crear tarjetas');
  const title = $('new-title').value.trim();
  if (!title) return $('new-title').focus();
  const note = $('new-note').value.trim();
  const status = $('new-status').value;
  const labels = await cardToLabels(status, composerAnchors, [], config);
  try { setStatus('Creando issue...'); await createIssue(title, note, labels); resetComposer(); await loadAll(); setStatus('Issue creado ✓'); }
  catch (e) { setStatus('Error: ' + e.message); }
}

/* ========== MOVIMIENTO DE TARJETAS ========== */
async function moveCard(number, newStatus) {
  if (!hasToken()) return alert('Necesitás un token');
  const c = cards.find(x => x.number === number);
  if (!c) return;
  const targetState = getState(config, newStatus);

  // Si el estado destino requiere motivo, pedirlo antes de mover
  let reason = null;
  if (targetState.requiresReason) {
    reason = prompt(targetState.reasonPrompt || '¿Motivo?');
    if (reason === null) return;  // canceló
    if (!reason.trim()) return alert('El motivo es obligatorio');
  }

  const newLabels = await cardToLabels(newStatus, c.anchors, c.labels, config);
  try {
    setStatus('Moviendo...');
    await updateIssue(number, { labels: newLabels });
    if (reason) await addIssueComment(number, `**${targetState.short || newStatus}:** ${reason}`);
    await loadAll();
  } catch (e) { setStatus('Error: ' + e.message); }
}

async function rejectCard(number) {
  return moveCard(number, 'rechazada');
}

async function deleteCard(number) {
  if (!hasToken()) return alert('Necesitás un token');
  if (!confirm('¿Archivar este issue? (se cierra en GitHub)')) return;
  try { setStatus('Cerrando...'); await closeIssue(number); await loadAll(); }
  catch (e) { setStatus('Error: ' + e.message); }
}

/* ========== RENDER KANBAN ========== */
function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('on', c.dataset.filter === f));
  renderKanban();
}

function renderKanban() {
  const visible = cards.filter(c => currentFilter === 'all' || c.anchors.some(a => a.type === currentFilter));
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
  // bind botones
  document.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => moveCard(parseInt(b.dataset.number), b.dataset.move)));
  document.querySelectorAll('[data-reject]').forEach(b => b.addEventListener('click', () => rejectCard(parseInt(b.dataset.number))));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteCard(parseInt(b.dataset.number))));
}

function renderCard(c) {
  const state = getState(config, c.status);
  const tags = c.anchors.map(a => `<span class="tag tag-${a.type}">${esc(a.id)}</span>`).join('');

  // ¿se puede rechazar desde este estado?
  const rejectAction = config.workflow.actions.find(a => a.id === 'reject');
  const canReject = rejectAction && rejectAction.fromStates.includes(c.status);

  const preview = (c.note || '').slice(0, 200);
  return `<div class="card ${state.cardClass || ''}">
    <div class="actions">
      ${canReject ? `<button data-reject data-number="${c.number}" title="Rechazar" class="btn-reject">✕</button>` : ''}
      <button data-move="${state.next}" data-number="${c.number}" title="Mover a ${esc(getState(config, state.next).short)}">${esc(state.arrow)}</button>
      <button data-delete data-number="${c.number}" title="Archivar (cerrar)">⌫</button>
    </div>
    <p class="title"><a href="${c.url}" target="_blank">${esc(c.title)}</a> <span class="issue-num">#${c.number}</span></p>
    ${preview ? `<p class="note">${esc(preview)}${c.note.length > 200 ? '...' : ''}</p>` : ''}
    <div class="tags">${tags}</div>
  </div>`;
}

function esc(s) { return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

/* ========== RENDER ESTRUCTURA ========== */
function renderStructure() {
  const catalog = getCatalog();
  const cont = $('structure-content');
  const sections = (config.ui.structureSections || []).filter(s => catalog[s.type]?.length);
  cont.innerHTML = sections.map(sec => `
    <p class="section-title">${esc(sec.title)}</p>
    <div class="node-grid">` +
    catalog[sec.type].map(n => {
      const count = cards.filter(c => c.anchors.some(a => a.id === n.id)).length;
      return `<div class="node-card ${count > 0 ? 'has-notes' : ''}" data-open="${esc(n.id)}" data-type="${sec.type}">
        <p class="nt">${esc(n.label)}</p><p class="ns">${esc(n.desc)}</p>
        ${count > 0 ? `<span class="nb">${count} nota${count > 1 ? 's' : ''}</span>` : ''}
      </div>`;
    }).join('') + `</div>`).join('');
  cont.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openNode(el.dataset.open, el.dataset.type)));
}

/* ========== VIEWS ========== */
function switchView(v) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-' + v));
}

/* ========== ARRANQUE ========== */
async function loadAll() {
  try {
    setStatus('Cargando config...');
    config = await loadConfig();
    const all = await loadSchemaAll();
    schema = all.schema;

    // Renderizar UI dinámica (solo primera vez)
    if (!$('kanban').innerHTML) {
      renderStatusSelect();
      renderKanbanColumns();
      renderFilters();
    }

    setStatus('Cargando issues...');
    cards = await loadIssues();
    renderKanban();
    renderStructure();
    setStatus('Cargadas ' + cards.length + ' ideas');
  } catch (e) { setStatus('Error: ' + e.message); }
}

function copyVBAPrompt() {
  const listas = cards.filter(c => c.status === 'listo');
  if (listas.length === 0) return alert('No hay ideas en "Listo" todavía');
  let txt = (config.ui.vbaPromptHeader || '') + '\n\n';
  listas.forEach((c, i) => {
    txt += `${i+1}. ${c.title} (Issue #${c.number})\n`;
    if (c.note) txt += '   Nota: ' + c.note.slice(0,500) + '\n';
    if (c.anchors.length) txt += '   Anclas: ' + c.anchors.map(a => `${a.id} (${a.type})`).join(', ') + '\n';
    txt += '\n';
  });
  navigator.clipboard.writeText(txt).then(() => setStatus('Prompt copiado ✓'));
}

/* ========== BINDING ========== */
export function init() {
  Object.assign(window, {
    saveTokenBtn, clearTokenBtn, reload: loadAll,
    switchView, toggleAnchorPicker, resetComposer, saveCard,
  });
  updateAuthUI(); loadAll();
}
