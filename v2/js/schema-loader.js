// v2/js/schema-loader.js — Carga y combina schema + draft + layout.
// Soporta dos modos de almacenamiento del schema:
//   - granular: v2/schema/index.json + archivos por tipo (preferido, diffs pequeños)
//   - monolítico: v2/schema.json (fallback legado)
// El contrato externo (loadSchemaAll, saveSchema, applyDraft, ...) se mantiene idéntico.

import { loadJsonFile, saveJsonFile } from './github.js';

export const SCHEMA_PATH = 'v2/schema.json';
export const SCHEMA_DIR  = 'v2/schema';
export const SCHEMA_INDEX_PATH = 'v2/schema/index.json';
export const DRAFT_PATH  = 'v2/draft.json';
export const LAYOUT_PATH = 'v2/layout.json';

export const EMPTY_SCHEMA = { nodeTypes: {}, nodes: [], relations: [] };
export const EMPTY_DRAFT  = { addNodes: [], addEdges: [], removeNodes: [], removeEdges: [], editNodes: [], editEdges: [] };
export const EMPTY_LAYOUT = { positions: {} };

/* ========== CARGA DEL SCHEMA (granular o monolítico) ========== */

async function loadGranularSchema() {
  const idx = await loadJsonFile(SCHEMA_INDEX_PATH, null);
  if (!idx.sha || !idx.data || idx.data.format !== 'granular') return null;

  const nodeFiles = (idx.data.files?.nodes || []);
  const relFiles  = (idx.data.files?.relations || []);

  const [nodeResults, relResults] = await Promise.all([
    Promise.all(nodeFiles.map(p => loadJsonFile(`${SCHEMA_DIR}/${p}`, []))),
    Promise.all(relFiles.map(p  => loadJsonFile(`${SCHEMA_DIR}/${p}`, []))),
  ]);

  const fragmentShas = {};
  const nodes = [];
  nodeFiles.forEach((p, i) => {
    fragmentShas[`nodes/${p.replace(/^nodes\//, '')}`] = nodeResults[i].sha;
    if (Array.isArray(nodeResults[i].data)) nodes.push(...nodeResults[i].data);
  });
  const relations = [];
  relFiles.forEach((p, i) => {
    fragmentShas[`relations/${p.replace(/^relations\//, '')}`] = relResults[i].sha;
    if (Array.isArray(relResults[i].data)) relations.push(...relResults[i].data);
  });

  return {
    data: {
      nodeTypes: idx.data.nodeTypes || {},
      nodes,
      relations,
      _meta: { version: idx.data.version, format: 'granular' },
    },
    sha: {
      mode: 'granular',
      indexSha: idx.sha,
      index: idx.data,
      fragments: fragmentShas,
    },
  };
}

async function loadMonolithicSchema() {
  const s = await loadJsonFile(SCHEMA_PATH, EMPTY_SCHEMA);
  return {
    data: s.data,
    sha: { mode: 'monolithic', schemaSha: s.sha },
  };
}

export async function loadSchemaAll() {
  // 1) Intento granular; si no existe o falla, caigo al monolítico.
  let schemaWrap = null;
  try { schemaWrap = await loadGranularSchema(); } catch (e) { console.warn('schema granular no disponible:', e); }
  if (!schemaWrap) schemaWrap = await loadMonolithicSchema();

  const [d, l] = await Promise.all([
    loadJsonFile(DRAFT_PATH,  EMPTY_DRAFT),
    loadJsonFile(LAYOUT_PATH, EMPTY_LAYOUT),
  ]);
  ['addNodes','addEdges','removeNodes','removeEdges','editNodes','editEdges'].forEach(k => {
    d.data[k] = d.data[k] || [];
  });
  l.data.positions = l.data.positions || {};

  return {
    schema: schemaWrap.data, schemaSha: schemaWrap.sha,
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
  delete out._meta;

  const removeNodeIds = new Set(draft.removeNodes || []);
  out.nodes = out.nodes.filter(n => !removeNodeIds.has(n.id));
  out.relations = out.relations.filter(r => !removeNodeIds.has(r.from) && !removeNodeIds.has(r.to));

  const removeEdgeKeys = new Set((draft.removeEdges || []).map(keyOfEdge));
  out.relations = out.relations.filter(r => !removeEdgeKeys.has(keyOfEdge(r)));

  (draft.editNodes || []).forEach(e => {
    const n = out.nodes.find(x => x.id === e.id);
    if (n) { if (e.type) n.type = e.type; if (e.label !== undefined) n.label = e.label; if (e.desc !== undefined) n.desc = e.desc; }
  });

  (draft.editEdges || []).forEach(e => {
    const idx = out.relations.findIndex(r => r.from === e.from && r.to === e.to && (r.label || '') === (e.origLabel || ''));
    if (idx >= 0) out.relations[idx].label = e.label || '';
  });

  (draft.addNodes || []).forEach(n => {
    if (!out.nodes.some(x => x.id === n.id)) out.nodes.push(n);
  });

  (draft.addEdges || []).forEach(e => {
    if (!out.relations.some(r => r.from === e.from && r.to === e.to && (r.label || '') === (e.label || ''))) {
      out.relations.push({ from: e.from, to: e.to, label: e.label || '' });
    }
  });

  return out;
}

/* ========== HELPERS DE GUARDADO ========== */

// Enruta nodos por type → archivo granular. Si un type no está en writeRouting.nodes, va al primer archivo de nodos.
function routeNodes(schema, index) {
  const routing = index.writeRouting?.nodes || {};
  const files = index.files?.nodes || [];
  const fallback = files[0] || 'nodes/_misc.json';
  const buckets = Object.fromEntries(files.map(p => [p, []]));
  (schema.nodes || []).forEach(n => {
    const target = routing[n.type] || fallback;
    (buckets[target] ||= []).push(n);
  });
  return buckets;
}

// Enruta relaciones: preserva la distribución actual si cada relación ya vive en un archivo conocido; las nuevas van al default.
// Como no guardamos de qué archivo vino cada relación, agrupamos por heurística: si coincide from+to+label con una relación ya presente, queda donde estaba. Las nuevas caen en _default.
async function routeRelations(schema, index, existingByFile) {
  const files = index.files?.relations || [];
  const defFile = index.writeRouting?.relations?._default || files[0] || 'relations/_misc.json';
  // existingByFile: { 'relations/flujo-x.json': [relations...] } (si se pudo cargar)
  const buckets = Object.fromEntries(files.map(p => [p, []]));
  const assigned = new Set();

  if (existingByFile) {
    for (const [file, rels] of Object.entries(existingByFile)) {
      const keys = new Set((rels || []).map(keyOfEdge));
      (schema.relations || []).forEach(r => {
        const k = keyOfEdge(r);
        if (!assigned.has(k) && keys.has(k)) {
          (buckets[file] ||= []).push(r);
          assigned.add(k);
        }
      });
    }
  }
  // Las no asignadas (nuevas) → archivo default
  (schema.relations || []).forEach(r => {
    const k = keyOfEdge(r);
    if (!assigned.has(k)) {
      (buckets[defFile] ||= []).push(r);
      assigned.add(k);
    }
  });
  return buckets;
}

export async function saveSchema(schema, shaBlob) {
  // Modo granular: reparte nodes/relations a archivos según index.writeRouting.
  if (shaBlob && shaBlob.mode === 'granular') {
    const index = shaBlob.index;
    const nodeBuckets = routeNodes(schema, index);

    // Recargo relations existentes por archivo para poder mantener su ubicación.
    const relFiles = index.files?.relations || [];
    const existingRelsByFile = {};
    await Promise.all(relFiles.map(async p => {
      const res = await loadJsonFile(`${SCHEMA_DIR}/${p}`, []);
      existingRelsByFile[p] = Array.isArray(res.data) ? res.data : [];
    }));
    const relBuckets = await routeRelations(schema, index, existingRelsByFile);

    const newFragmentShas = { ...shaBlob.fragments };

    // Guardar cada archivo solo si cambió respecto al snapshot cargado.
    const writes = [];
    for (const [file, arr] of Object.entries(nodeBuckets)) {
      const key = file; // 'nodes/xxx.json'
      writes.push(saveJsonFile(`${SCHEMA_DIR}/${file}`, arr, newFragmentShas[key], `schema(nodes): ${file}`).then(sha => { newFragmentShas[key] = sha; }));
    }
    for (const [file, arr] of Object.entries(relBuckets)) {
      const key = file; // 'relations/xxx.json'
      writes.push(saveJsonFile(`${SCHEMA_DIR}/${file}`, arr, newFragmentShas[key], `schema(relations): ${file}`).then(sha => { newFragmentShas[key] = sha; }));
    }
    await Promise.all(writes);

    // Actualizar la nodeTypes en index si cambió.
    let newIndexSha = shaBlob.indexSha;
    const newIndex = { ...index, nodeTypes: schema.nodeTypes || index.nodeTypes };
    if (JSON.stringify(newIndex) !== JSON.stringify(index)) {
      newIndexSha = await saveJsonFile(SCHEMA_INDEX_PATH, newIndex, shaBlob.indexSha, 'schema(index): actualizar');
    }

    return { mode: 'granular', indexSha: newIndexSha, index: newIndex, fragments: newFragmentShas };
  }

  // Modo monolítico (legado): guarda schema.json entero.
  const monoSha = shaBlob && shaBlob.mode === 'monolithic' ? shaBlob.schemaSha : (typeof shaBlob === 'string' ? shaBlob : null);
  const sha = await saveJsonFile(SCHEMA_PATH, schema, monoSha, 'schema: actualizar');
  return { mode: 'monolithic', schemaSha: sha };
}

export async function saveDraft(draft, sha) {
  return saveJsonFile(DRAFT_PATH, draft, sha, 'draft: guardar borrador');
}
export async function saveLayout(layout, sha) {
  return saveJsonFile(LAYOUT_PATH, layout, sha, 'layout: actualizar posiciones');
}
