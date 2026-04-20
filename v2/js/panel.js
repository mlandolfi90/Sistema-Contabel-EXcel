// v2/js/panel.js — Lógica del panel Kanban que lee desde schema.json
// Reemplaza el CATALOG hardcodeado del viejo index.html.

import { getToken, hasToken, setToken, createIssue, updateIssue, closeIssue, loadIssues, cardToLabels } from './github.js';
import { loadSchemaAll, getEffectiveNodes } from './schema-loader.js';

const STATUS_LABELS = ['idea', 'diseño', 'listo'];

/* ========== ESTADO ========== */
let schema;
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

/* ========== CATEGORIZAR NODOS DEL SCHEMA ========== */
function getCatalog() {
  const nodes = getEffectiveNodes(schema, { addNodes:[], editNodes:[], removeNodes:[] });
  const cat = {};
  nodes.forEach(n => {
    if (!cat[n.type]) cat[n.type] = [];
    cat[n.type].push({ id: n.id, label: n.label || n.id, desc: n.desc || '' });
  });
  return cat;
}

/* ========== VIEWS ========== */
function switchView(v) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-' + v));
}

/* ========== COMPOSER (crear idea) ========== */
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
  const types = ['macro','hoja','tabla','rango','regla','socio','cuenta'];
  container.innerHTML = types.filter(t => catalog[t]?.length).map(type => {
    const tagClass = 'tag-' + type;
    return `<p style="font-size:11px;color:var(--text-secondary);margin:10px 0 6px;text-transform:capitalize;">${type}s</p>
      <div class="composer-anchors">` +
      catalog[type].map(n => {
        const on = composerAnchors.some(a => a.id === n.id);
        return `<span class="chip ${on ? 'on ' + tagClass : ''}" data-id="${n.id}" data-type="${type}">${n.label}</span>`;
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
  $('new-title').value = ''; $('new-note').value = ''; $('new-status').value = 'idea';
  composerAnchors = []; updateAnchorPreview();
}

async function saveCard() {
  if (!hasToken()) return alert('Necesitás un token para crear tarjetas');
  const title = $('new-title').value.trim();
  if (!title) return $('new-title').focus();
  const note = $('new-note').value.trim();
  const status = $('new-status').value;
  const labels = cardToLabels(status, composerAnchors, []);
  try { setStatus('Creando issue...'); await createIssue(title, note, labels); resetComposer(); await loadAll(); setStatus('Issue creado ✓'); }
  catch (e) { setStatus('Error: ' + e.message); }
}

async function moveCard(number, newStatus) {
  if (!hasToken()) return alert('Necesitás un token');
  const c = cards.find(x => x.number === number);
  if (!c) return;
  const newLabels = cardToLabels(newStatus, c.anchors, c.labels);
  try { setStatus('Moviendo...'); await updateIssue(number, { labels: newLabels }); await loadAll(); }
  catch (e) { setStatus('Error: ' + e.message); }
}

async function deleteCard(number) {
  if (!hasToken()) return alert('Necesitás un token');
  if (!confirm('¿Cerrar este issue?')) return;
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
  const cols = { idea: [], 'diseño': [], listo: [] };
  visible.forEach(c => { if (cols[c.status]) cols[c.status].push(c); });
  Object.keys(cols).forEach(k => {
    const el = $('col-' + k);
    $('c-' + k).textContent = cols[k].length;
    if (cols[k].length === 0) { el.innerHTML = '<p class="empty">Sin tarjetas</p>'; return; }
    el.innerHTML = cols[k].map(c => renderCard(c)).join('');
  });
  $('ideas-count').textContent = cards.length;
  // re-bind handlers
  document.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => moveCard(parseInt(b.dataset.number), b.dataset.move)));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => deleteCard(parseInt(b.dataset.number))));
}

function renderCard(c) {
  const tags = c.anchors.map(a => `<span class="tag tag-${a.type}">${esc(a.id)}</span>`).join('');
  const nextStatus = { idea: 'diseño', 'diseño': 'listo', listo: 'idea' }[c.status];
  const nextLabel = c.status === 'listo' ? '↻' : '→';
  const preview = (c.note || '').slice(0, 200);
  return `<div class="card">
    <div class="actions">
      <button data-move="${nextStatus}" data-number="${c.number}" title="Mover">${nextLabel}</button>
      <button data-delete data-number="${c.number}" title="Cerrar">×</button>
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
  const sections = [
    { type: 'hoja', title: 'Hojas operativas' },
    { type: 'tabla', title: 'Tablas estructuradas (ListObjects)' },
    { type: 'rango', title: 'Rangos con nombre' },
    { type: 'macro', title: 'Macros' },
    { type: 'regla', title: 'Reglas' },
    { type: 'socio', title: 'Socios' },
    { type: 'cuenta', title: 'Cuentas contables' },
  ].filter(s => catalog[s.type]?.length);
  cont.innerHTML = sections.map(sec => `
    <p class="section-title">${sec.title}</p>
    <div class="node-grid">` +
    catalog[sec.type].map(n => {
      const count = cards.filter(c => c.anchors.some(a => a.id === n.id)).length;
      return `<div class="node-card ${count > 0 ? 'has-notes' : ''}" data-open="${n.id}" data-type="${sec.type}">
        <p class="nt">${esc(n.label)}</p><p class="ns">${esc(n.desc)}</p>
        ${count > 0 ? `<span class="nb">${count} nota${count > 1 ? 's' : ''}</span>` : ''}
      </div>`;
    }).join('') + `</div>`).join('');
  cont.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openNode(el.dataset.open, el.dataset.type)));
}

/* ========== ARRANQUE ========== */
async function loadAll() {
  try {
    setStatus('Cargando...');
    const all = await loadSchemaAll();
    schema = all.schema;
    cards = await loadIssues();
    renderKanban();
    renderStructure();
    setStatus('Cargadas ' + cards.length + ' ideas');
  } catch (e) { setStatus('Error: ' + e.message); }
}

function copyVBAPrompt() {
  const listas = cards.filter(c => c.status === 'listo');
  if (listas.length === 0) return alert('No hay ideas en "Listo" todavía');
  let txt = 'Convertí estas ideas de mi Kanban en instrucciones VBA concretas. Por cada una dame: (a) macro afectada, (b) diff de código, (c) validaciones nuevas.\n\n';
  listas.forEach((c, i) => {
    txt += `${i+1}. ${c.title} (Issue #${c.number})\n`;
    if (c.note) txt += '   Nota: ' + c.note.slice(0,500) + '\n';
    if (c.anchors.length) txt += '   Anclas: ' + c.anchors.map(a => `${a.id} (${a.type})`).join(', ') + '\n';
    txt += '\n';
  });
  navigator.clipboard.writeText(txt).then(() => setStatus('Prompt copiado al portapapeles ✓'));
}

/* ========== BINDING ========== */
export function init() {
  Object.assign(window, {
    saveTokenBtn, clearTokenBtn, reload: loadAll,
    switchView, toggleAnchorPicker, resetComposer, saveCard,
    setFilter, copyVBAPrompt,
  });
  updateAuthUI(); loadAll();
}
