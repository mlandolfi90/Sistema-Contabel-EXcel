// v2/js/mapa.js — Lógica del grafo interactivo (Cytoscape)
// Usa github.js + schema-loader.js. El HTML solo provee los contenedores.

import { getToken, hasToken, setToken, createIssue } from './github.js';
import {
  loadSchemaAll, saveSchema, saveDraft, saveLayout,
  getEffectiveNodes, getEffectiveRelations, applyDraft, isDraftEmpty,
  EMPTY_DRAFT,
} from './schema-loader.js';

/* ========== ESTADO ========== */
let schema, schemaSha;
let draft, draftSha;
let layout, layoutSha;
let graph;
let linkMode = false;
let linkSource = null;
let pendingIdeaAnchor = null;
let pendingEditNodeId = null;
let pendingEditEdge = null;

/* ========== HELPERS UI ========== */
const $ = id => document.getElementById(id);
function setStatus(msg) { $('status').textContent = msg || ''; }
function openModal(id) { $(id).classList.add('show'); }
function closeModal(id) { $(id).classList.remove('show'); }
function truncate(s, n) { return s.length > n ? s.slice(0, n-1) + '…' : s; }

/* ========== ISSUES ========== */
async function loadIssuesForGraph() {
  // import dinámico solo cuando se necesita
  const { loadIssues } = await import('./github.js');
  return loadIssues();
}

/* ========== CONSTRUIR GRAFO ========== */
function buildGraphData(issues) {
  const nodes = [];
  const edges = [];

  getEffectiveNodes(schema, draft).forEach(n => {
    nodes.push({ data: { id: n.id, label: n.label || n.id, desc: n.desc || '', type: n.type, kind: n.kind }});
  });
  getEffectiveRelations(schema, draft).forEach((r, idx) => {
    const kind = (r.kind === 'draft-add' || r.kind === 'draft-edit') ? 'draft' : 'system';
    edges.push({ data: { id: `rel-${idx}-${r.from}-${r.to}`, source: r.from, target: r.to, label: r.label || '', kind }});
  });
  issues.forEach(iss => {
    nodes.push({ data: {
      id: 'issue:' + iss.number,
      label: '#' + iss.number + ' ' + truncate(iss.title, 40),
      desc: iss.title, type: 'issue', kind: 'issue', status: iss.status, url: iss.url,
    }});
    iss.anchors.forEach((a, i) => {
      if (nodes.some(n => n.data.id === a.id)) {
        edges.push({ data: { id: `issue-edge-${iss.number}-${i}`, source: 'issue:'+iss.number, target: a.id, kind: 'issue' }});
      }
    });
  });
  // posiciones guardadas
  nodes.forEach(n => { if (layout.positions[n.data.id]) n.position = layout.positions[n.data.id]; });
  return { nodes, edges };
}

/* ========== INICIALIZAR CYTOSCAPE ========== */
function initGraph(nodes, edges) {
  const hasPositions = Object.keys(layout.positions).length > 0;
  const nodeTypes = schema.nodeTypes || {};

  graph = cytoscape({
    container: $('graph'),
    elements: [...nodes, ...edges],
    style: [
      { selector: 'node[kind = "system"], node[kind = "draft-add"], node[kind = "draft-edit"]', style: {
        'shape': ele => nodeTypes[ele.data('type')]?.shape || 'round-rectangle',
        'background-color': ele => nodeTypes[ele.data('type')]?.bg || '#eee',
        'border-color': ele => nodeTypes[ele.data('type')]?.border || '#888',
        'border-width': 1.5,
        'border-style': ele => (ele.data('kind') === 'draft-add' || ele.data('kind') === 'draft-edit') ? 'dotted' : 'solid',
        'label': 'data(label)',
        'color': ele => nodeTypes[ele.data('type')]?.text || '#333',
        'font-size': 11, 'font-weight': 500,
        'text-valign': 'center', 'text-halign': 'center',
        'width': 'label', 'height': 32, 'padding': '10px',
        'text-wrap': 'wrap', 'text-max-width': 140,
      }},
      { selector: 'node[type = "socio"]', style: { 'width': 60, 'height': 60 }},
      { selector: 'node[kind = "issue"]', style: {
        'shape': 'round-rectangle', 'background-color': '#FFF4D6', 'border-color': '#B08500',
        'border-width': 1.5, 'border-style': 'dashed', 'label': 'data(label)', 'color': '#5a3e00',
        'font-size': 10, 'text-valign': 'center', 'text-halign': 'center',
        'width': 'label', 'height': 26, 'padding': '6px', 'text-wrap': 'wrap', 'text-max-width': 180,
      }},
      { selector: 'edge[kind = "system"]', style: {
        'width': 1.2, 'line-color': '#888', 'target-arrow-color': '#888', 'target-arrow-shape': 'triangle',
        'curve-style': 'bezier', 'label': 'data(label)', 'font-size': 9, 'color': '#888',
        'text-background-color': '#fff', 'text-background-opacity': 0.85, 'text-background-padding': 2,
      }},
      { selector: 'edge[kind = "draft"]', style: {
        'width': 1.8, 'line-color': '#B08500', 'line-style': 'dashed',
        'target-arrow-color': '#B08500', 'target-arrow-shape': 'triangle',
        'curve-style': 'bezier', 'label': 'data(label)', 'font-size': 9, 'color': '#B08500',
        'text-background-color': '#fff', 'text-background-opacity': 0.85, 'text-background-padding': 2,
      }},
      { selector: 'edge[kind = "issue"]', style: {
        'width': 1, 'line-color': '#B08500', 'line-style': 'dashed',
        'target-arrow-color': '#B08500', 'target-arrow-shape': 'triangle',
        'curve-style': 'bezier', 'opacity': 0.5,
      }},
      { selector: ':selected', style: { 'border-width': 3, 'border-color': '#185FA5', 'line-color': '#185FA5' }},
    ],
    layout: hasPositions ? { name: 'preset' } : { name: 'cose', animate: false, nodeRepulsion: 8000, idealEdgeLength: 120, padding: 30 },
    wheelSensitivity: 0.2, minZoom: 0.2, maxZoom: 2.5,
  });

  graph.on('tap', 'node[kind = "issue"]', evt => {
    if (linkMode) return;
    const url = evt.target.data('url');
    if (url) window.open(url, '_blank');
  });
  graph.on('tap', 'node', evt => {
    if (!linkMode) return;
    const node = evt.target;
    if (node.data('kind') === 'issue') return;
    if (!linkSource) {
      linkSource = node;
      node.style({ 'border-color': '#0a0', 'border-width': 4 });
      setStatus('Origen: ' + node.data('label') + ' — click ahora en el destino');
    } else if (linkSource.id() !== node.id()) {
      createDraftEdge(linkSource.id(), node.id());
      linkSource.removeStyle(); linkSource = null; toggleLinkMode();
    }
  });
  graph.on('mouseover', 'node', evt => setStatus(evt.target.data('desc') || evt.target.data('label')));
  graph.on('mouseout', 'node', () => { if (!linkMode) setStatus(''); });
  graph.on('dblclick', 'node[kind != "issue"]', evt => editFromEvent(evt));
  graph.on('dblclick', 'edge[kind != "issue"]', evt => editFromEvent(evt));
}

/* ========== EDICIONES (agregar nodo/edge, editar, eliminar) ========== */
function confirmAddNode() {
  const type = $('node-type').value;
  const id = $('node-name').value.trim();
  const label = $('node-label').value.trim() || id;
  const desc = $('node-desc').value.trim();
  if (!id) return alert('Falta el ID');
  if (/[\s'"\\\/]/.test(id)) return alert('El ID no puede tener espacios ni caracteres especiales');
  if (getEffectiveNodes(schema, draft).some(n => n.id === id)) return alert('Ya existe un nodo con ese ID');
  draft.addNodes.push({ id, type, label, desc });
  $('node-name').value = ''; $('node-label').value = ''; $('node-desc').value = '';
  closeModal('modal-node'); rerender(); setStatus('Nodo agregado al BORRADOR: ' + id);
}

function toggleLinkMode() {
  linkMode = !linkMode;
  const btn = $('btn-link');
  if (linkMode) { btn.classList.add('active'); btn.textContent = '✕ Cancelar conexión'; setStatus('Modo conexión: click en nodo ORIGEN'); }
  else { btn.classList.remove('active'); btn.textContent = '+ Conexión'; if (linkSource) { linkSource.removeStyle(); linkSource = null; } setStatus(''); }
}

function createDraftEdge(sourceId, targetId) {
  const label = prompt('Etiqueta de la conexión (opcional):', '') || '';
  draft.addEdges.push({ from: sourceId, to: targetId, label });
  rerender(); setStatus('Conexión agregada al BORRADOR');
}

function editSelected() {
  const sel = graph.$(':selected');
  if (sel.length === 0) return alert('Seleccioná primero un nodo o flecha');
  if (sel.length > 1) return alert('Seleccioná UNO solo para editar');
  editFromEvent({ target: sel[0] });
}

function editFromEvent(evt) {
  const el = evt.target;
  if (el.data('kind') === 'issue') return alert('Los Issues se editan desde GitHub.');
  if (el.isNode()) {
    pendingEditNodeId = el.id();
    const node = getEffectiveNodes(schema, draft).find(n => n.id === el.id());
    $('edit-node-id').textContent = node.id;
    $('edit-node-type').value = node.type;
    $('edit-node-label').value = node.label || '';
    $('edit-node-desc').value = node.desc || '';
    openModal('modal-edit-node');
  } else {
    pendingEditEdge = { from: el.data('source'), to: el.data('target'), origLabel: el.data('label') || '' };
    $('edit-edge-from').textContent = pendingEditEdge.from;
    $('edit-edge-to').textContent = pendingEditEdge.to;
    $('edit-edge-label').value = pendingEditEdge.origLabel;
    openModal('modal-edit-edge');
  }
}

function confirmEditNode() {
  const id = pendingEditNodeId; if (!id) return;
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
  pendingEditNodeId = null; closeModal('modal-edit-node'); rerender();
  setStatus('Edición en BORRADOR: ' + id);
}

function confirmEditEdge() {
  const ed = pendingEditEdge; if (!ed) return;
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
  pendingEditEdge = null; closeModal('modal-edit-edge'); rerender();
  setStatus('Conexión editada en BORRADOR');
}

function deleteSelected() {
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
  rerender(); setStatus('Eliminación pendiente en BORRADOR');
}

/* ========== GUARDAR/APLICAR/DESCARTAR ========== */
async function saveDraftBtn() {
  if (!hasToken()) return alert('Necesitás token guardado en panel v2');
  try { setStatus('Guardando borrador...'); draftSha = await saveDraft(draft, draftSha); setStatus('Borrador guardado ✓'); updateDraftUI(); }
  catch (e) { setStatus('Error: ' + e.message); }
}

function openApplyModal() {
  const p = [];
  if (draft.addNodes.length) p.push(`<b>${draft.addNodes.length} nodos nuevos:</b><br>` + draft.addNodes.map(n => `&nbsp;&nbsp;+ ${n.type}:${n.id} (${n.label||n.id})`).join('<br>'));
  if (draft.editNodes.length) p.push(`<b>${draft.editNodes.length} nodos editados:</b><br>` + draft.editNodes.map(e => `&nbsp;&nbsp;✏️ ${e.id} → ${e.label||e.id} (${e.type})`).join('<br>'));
  if (draft.addEdges.length) p.push(`<b>${draft.addEdges.length} conexiones nuevas:</b><br>` + draft.addEdges.map(e => `&nbsp;&nbsp;+ ${e.from} → ${e.to}${e.label?' ('+e.label+')':''}`).join('<br>'));
  if (draft.editEdges.length) p.push(`<b>${draft.editEdges.length} conexiones editadas:</b><br>` + draft.editEdges.map(e => `&nbsp;&nbsp;✏️ ${e.from} → ${e.to}: "${e.origLabel||''}" → "${e.label||''}"`).join('<br>'));
  if (draft.removeNodes.length) p.push(`<b>${draft.removeNodes.length} nodos a eliminar:</b><br>` + draft.removeNodes.map(id => `&nbsp;&nbsp;− ${id}`).join('<br>'));
  if (draft.removeEdges.length) p.push(`<b>${draft.removeEdges.length} conexiones a eliminar:</b><br>` + draft.removeEdges.map(e => `&nbsp;&nbsp;− ${e.from} → ${e.to}`).join('<br>'));
  if (p.length === 0) return alert('El borrador está vacío');
  $('apply-preview').innerHTML = p.join('<br><br>');
  openModal('modal-apply');
}

async function confirmApplyDraft() {
  if (!hasToken()) return alert('Necesitás token');
  try {
    setStatus('Aplicando borrador al esquema...');
    const newSchema = applyDraft(schema, draft);
    schemaSha = await saveSchema(newSchema, schemaSha);
    schema = newSchema;
    draft = { ...EMPTY_DRAFT, addNodes:[], addEdges:[], removeNodes:[], removeEdges:[], editNodes:[], editEdges:[] };
    draftSha = await saveDraft(draft, draftSha);
    closeModal('modal-apply'); rerender(); setStatus('Borrador aplicado al esquema ✓');
  } catch (e) { setStatus('Error: ' + e.message); }
}

async function discardDraft() {
  if (!isDraftEmpty(draft) && !confirm('¿Descartar todos los cambios del borrador?')) return;
  draft = { addNodes:[], addEdges:[], removeNodes:[], removeEdges:[], editNodes:[], editEdges:[] };
  if (hasToken()) { try { draftSha = await saveDraft(draft, draftSha); } catch (e) { console.warn(e); } }
  rerender(); setStatus('Borrador descartado');
}

async function saveLayoutBtn() {
  if (!hasToken()) return alert('Necesitás token');
  graph.nodes().forEach(n => { const p = n.position(); layout.positions[n.id()] = { x: Math.round(p.x), y: Math.round(p.y) }; });
  try { setStatus('Guardando posiciones...'); layoutSha = await saveLayout(layout, layoutSha); setStatus('Posiciones guardadas ✓'); }
  catch (e) { setStatus('Error: ' + e.message); }
}

/* ========== IDEAS (Issues) ========== */
function openAddIdeaModal() {
  if (!hasToken()) return alert('Necesitás token para crear issues');
  const sel = graph.$('node[kind != "issue"]:selected');
  if (sel.length === 0) {
    if (!confirm('No hay nodo seleccionado. ¿Crear idea sin ancla?')) return;
    pendingIdeaAnchor = null;
    $('idea-anchor-info').textContent = 'Sin ancla (Issue suelto)';
  } else {
    const n = sel[0];
    pendingIdeaAnchor = { type: n.data('type'), id: n.id() };
    $('idea-anchor-info').textContent = `Ancla: ${pendingIdeaAnchor.type}:${pendingIdeaAnchor.id}`;
  }
  openModal('modal-idea');
}

async function confirmAddIdea() {
  const title = $('idea-title').value.trim();
  if (!title) return alert('Falta el título');
  const note = $('idea-note').value.trim();
  const status = $('idea-status').value;
  const labels = [status];
  if (pendingIdeaAnchor) labels.push(`${pendingIdeaAnchor.type}:${pendingIdeaAnchor.id}`);
  try {
    setStatus('Creando issue...');
    await createIssue(title, note, labels);
    $('idea-title').value = ''; $('idea-note').value = '';
    closeModal('modal-idea'); await loadAll(); setStatus('Issue creado ✓');
  } catch (e) { setStatus('Error: ' + e.message); }
}

/* ========== LAYOUT / UI ========== */
function runLayout(name) {
  if (!graph) return;
  const opts = name === 'grid' ? { name: 'grid', padding: 30, animate: true } : { name: 'cose', animate: true, nodeRepulsion: 8000, idealEdgeLength: 120, padding: 30 };
  graph.layout(opts).run();
}

function updateDraftUI() {
  const has = !isDraftEmpty(draft);
  $('draft-badge').style.display = has ? 'inline-block' : 'none';
  const sum = $('draft-summary');
  if (!has) { sum.style.display = 'none'; return; }
  const parts = [];
  if (draft.addNodes.length) parts.push(`+${draft.addNodes.length} nodos`);
  if (draft.editNodes.length) parts.push(`✏️${draft.editNodes.length} nodos editados`);
  if (draft.addEdges.length) parts.push(`+${draft.addEdges.length} conexiones`);
  if (draft.editEdges.length) parts.push(`✏️${draft.editEdges.length} conexiones editadas`);
  if (draft.removeNodes.length) parts.push(`−${draft.removeNodes.length} nodos`);
  if (draft.removeEdges.length) parts.push(`−${draft.removeEdges.length} conexiones`);
  sum.innerHTML = '<b>Borrador:</b> ' + parts.join(' · ') + ' pendientes de aplicar';
  sum.style.display = 'block';
}

async function rerender() {
  updateDraftUI();
  try {
    const issues = await loadIssuesForGraph();
    const { nodes, edges } = buildGraphData(issues);
    const positions = {};
    if (graph) graph.nodes().forEach(n => positions[n.id()] = n.position());
    if (graph) graph.destroy();
    nodes.forEach(n => { if (positions[n.data.id]) n.position = positions[n.data.id]; });
    initGraph(nodes, edges);
  } catch (e) { setStatus('Error rerender: ' + e.message); }
}

async function loadAll() {
  try {
    setStatus('Cargando schema, borrador, layout, issues...');
    if (!hasToken()) $('no-token-banner').style.display = 'block';
    const all = await loadSchemaAll();
    schema = all.schema; schemaSha = all.schemaSha;
    draft = all.draft; draftSha = all.draftSha;
    layout = all.layout; layoutSha = all.layoutSha;

    const issues = await loadIssuesForGraph();
    const { nodes, edges } = buildGraphData(issues);
    if (graph) graph.destroy();
    initGraph(nodes, edges);
    updateDraftUI();
    setStatus(`Listo: ${nodes.length} nodos · ${edges.length} conexiones · ${issues.length} issues`);
  } catch (e) { setStatus('Error: ' + e.message); }
}

/* ========== BINDING ========== */
export function init() {
  // Exponer funciones al onclick del HTML
  Object.assign(window, {
    openAddNodeModal: () => openModal('modal-node'),
    confirmAddNode, toggleLinkMode, editSelected, confirmEditNode, confirmEditEdge,
    deleteSelected, openAddIdeaModal, confirmAddIdea,
    saveDraftBtn, applyDraftToSchema: openApplyModal, confirmApplyDraft, discardDraft,
    saveLayoutBtn, runLayout, loadAll,
    closeModal, graphFit: () => graph.fit(null, 40),
  });
  document.querySelectorAll('.modal-bg').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });
  });
  loadAll();
}
