// v2/js/mapa/draft-ops.js — Guardar / Aplicar / Descartar borrador + UI de resumen

import { state } from './state.js';
import { $, setStatus, openModal, closeModal } from './utils.js';
import { hasToken } from '../github.js';
import { saveDraft as gSaveDraft, saveSchema, applyDraft, isDraftEmpty } from '../schema-loader.js';
import { rerender } from './graph-build.js';

export async function saveDraftBtn() {
  if (!hasToken()) return alert('Necesitás token guardado en panel v2');
  try {
    setStatus('Guardando borrador...');
    state.draftSha = await gSaveDraft(state.draft, state.draftSha);
    setStatus('Borrador guardado ✓');
    updateDraftUI();
  } catch (e) { setStatus('Error: ' + e.message); }
}

export function applyDraftToSchema() {
  const { draft } = state;
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

export async function confirmApplyDraft() {
  if (!hasToken()) return alert('Necesitás token');
  try {
    setStatus('Aplicando borrador al esquema...');
    const newSchema = applyDraft(state.schema, state.draft);
    state.schemaSha = await saveSchema(newSchema, state.schemaSha);
    state.schema = newSchema;
    state.draft = { addNodes:[], addEdges:[], removeNodes:[], removeEdges:[], editNodes:[], editEdges:[] };
    state.draftSha = await gSaveDraft(state.draft, state.draftSha);
    closeModal('modal-apply');
    rerender();
    setStatus('Borrador aplicado al esquema ✓');
  } catch (e) { setStatus('Error: ' + e.message); }
}

export async function discardDraft() {
  if (!isDraftEmpty(state.draft) && !confirm('¿Descartar todos los cambios del borrador?')) return;
  state.draft = { addNodes:[], addEdges:[], removeNodes:[], removeEdges:[], editNodes:[], editEdges:[] };
  if (hasToken()) {
    try { state.draftSha = await gSaveDraft(state.draft, state.draftSha); }
    catch (e) { console.warn(e); }
  }
  rerender();
  setStatus('Borrador descartado');
}

export function updateDraftUI() {
  const { draft } = state;
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
