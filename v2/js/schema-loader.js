// v2/js/schema-loader.js — Carga y combina schema.json + draft.json + layout.json
// Cualquier parte de la app puede llamar loadAll() y obtener todo junto.

import { loadJsonFile, saveJsonFile } from './github.js';

export const SCHEMA_PATH = 'v2/schema.json';
export const DRAFT_PATH  = 'v2/draft.json';
export const LAYOUT_PATH = 'v2/layout.json';

export const EMPTY_SCHEMA = { nodeTypes: {}, nodes: [], relations: [] };
export const EMPTY_DRAFT  = { addNodes: [], addEdges: [], removeNodes: [], removeEdges: [], editNodes: [], editEdges: [] };
export const EMPTY_LAYOUT = { positions: {} };

export async function loadSchemaAll() {
  const [s, d, l] = await Promise.all([
    loadJsonFile(SCHEMA_PATH, EMPTY_SCHEMA),
    loadJsonFile(DRAFT_PATH,  EMPTY_DRAFT),
    loadJsonFile(LAYOUT_PATH, EMPTY_LAYOUT),
  ]);
  // normalizar draft (por si falta alguna lista)
  ['addNodes','addEdges','removeNodes','removeEdges','editNodes','editEdges'].forEach(k => {
    d.data[k] = d.data[k] || [];
  });
  l.data.positions = l.data.positions || {};
  return {
    schema: s.data, schemaSha: s.sha,
    draft:  d.data, draftSha:  d.sha,
    layout: l.data, layoutSha: l.sha,
  };
}

/* ========== RESOLUCIÓN: combinar schema + draft ========== */
export function keyOfEdge(e) {
  return (e.from || e.source) + '|' + (e.to || e.target) + '|' + (e.label || '');
}

export function getEffectiveNodes(schema, draft) {
  const removed = new Set(draft.removeNodes || []);
  const edits = Object.fromEntries((draft.editNodes || []).map(e => [e.id, e]));
  const base = schema.nodes
    .filter(n => !removed.has(n.id))
    .map(n => {
      const e = edits[n.id];
      if (e) return { ...n, label: e.label ?? n.label, desc: e.desc ?? n.desc, type: e.type ?? n.type, kind: 'draft-edit' };
      return { ...n, kind: 'system' };
    });
  const added = (draft.addNodes || []).map(n => ({ ...n, kind: 'draft-add' }));
  return [...base, ...added];
}

export function getEffectiveRelations(schema, draft) {
  const removedKeys = new Set((draft.removeEdges || []).map(keyOfEdge));
  const editMap = {};
  (draft.editEdges || []).forEach(e => {
    const origKey = e.from + '|' + e.to + '|' + (e.origLabel || '');
    editMap[origKey] = e;
  });
  const base = schema.relations
    .filter(r => !removedKeys.has(keyOfEdge(r)))
    .map(r => {
      const k = keyOfEdge(r);
      const e = editMap[k];
      if (e) return { ...r, label: e.label ?? r.label, kind: 'draft-edit' };
      return { ...r, kind: 'system' };
    });
  const added = (draft.addEdges || []).map(e => ({ ...e, kind: 'draft-add' }));
  return [...base, ...added];
}

export function isDraftEmpty(draft) {
  return !(draft.addNodes?.length || draft.addEdges?.length || draft.removeNodes?.length || draft.removeEdges?.length || draft.editNodes?.length || draft.editEdges?.length);
}

/* ========== APLICAR DRAFT AL SCHEMA ========== */
export function applyDraft(schema, draft) {
  const out = JSON.parse(JSON.stringify(schema));

  // remove nodes + aristas dependientes
  const removeNodeIds = new Set(draft.removeNodes || []);
  out.nodes = out.nodes.filter(n => !removeNodeIds.has(n.id));
  out.relations = out.relations.filter(r => !removeNodeIds.has(r.from) && !removeNodeIds.has(r.to));

  // remove edges
  const removeEdgeKeys = new Set((draft.removeEdges || []).map(keyOfEdge));
  out.relations = out.relations.filter(r => !removeEdgeKeys.has(keyOfEdge(r)));

  // edit nodes
  (draft.editNodes || []).forEach(e => {
    const n = out.nodes.find(x => x.id === e.id);
    if (n) { if (e.type) n.type = e.type; if (e.label !== undefined) n.label = e.label; if (e.desc !== undefined) n.desc = e.desc; }
  });

  // edit edges
  (draft.editEdges || []).forEach(e => {
    const idx = out.relations.findIndex(r => r.from === e.from && r.to === e.to && (r.label || '') === (e.origLabel || ''));
    if (idx >= 0) out.relations[idx].label = e.label || '';
  });

  // add nodes
  (draft.addNodes || []).forEach(n => {
    if (!out.nodes.some(x => x.id === n.id)) out.nodes.push(n);
  });

  // add edges
  (draft.addEdges || []).forEach(e => {
    if (!out.relations.some(r => r.from === e.from && r.to === e.to && (r.label || '') === (e.label || ''))) {
      out.relations.push({ from: e.from, to: e.to, label: e.label || '' });
    }
  });

  return out;
}

/* ========== HELPERS DE GUARDADO ========== */
export async function saveSchema(schema, sha) {
  return saveJsonFile(SCHEMA_PATH, schema, sha, 'schema: actualizar');
}
export async function saveDraft(draft, sha) {
  return saveJsonFile(DRAFT_PATH, draft, sha, 'draft: guardar borrador');
}
export async function saveLayout(layout, sha) {
  return saveJsonFile(LAYOUT_PATH, layout, sha, 'layout: actualizar posiciones');
}
