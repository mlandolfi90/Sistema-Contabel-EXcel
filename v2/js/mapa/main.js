// v2/js/mapa/main.js — Orquestador del mapa. Carga datos, enlaza funciones al window.

import { state } from './state.js';
import { $, setStatus } from './utils.js';
import { hasToken } from '../github.js';
import { loadSchemaAll } from '../schema-loader.js';
import { bindModalCloseOnBackdrop } from './modals.js';
import { buildGraphData, initGraph, loadIssuesForGraph } from './graph-build.js';
import { openAddNodeModal, confirmAddNode, editSelected, confirmEditNode, deleteSelected } from './actions-nodes.js';
import { toggleLinkMode, confirmEditEdge } from './actions-edges.js';
import { saveDraftBtn, applyDraftToSchema, confirmApplyDraft, discardDraft, updateDraftUI } from './draft-ops.js';
import { saveLayoutBtn, runLayout, graphFit } from './layout-ops.js';
import { openAddIdeaModal, confirmAddIdea } from './ideas.js';

async function loadAll() {
  try {
    setStatus('Cargando schema, borrador, layout, issues...');
    if (!hasToken()) $('no-token-banner').style.display = 'block';
    const all = await loadSchemaAll();
    state.schema = all.schema; state.schemaSha = all.schemaSha;
    state.draft = all.draft; state.draftSha = all.draftSha;
    state.layout = all.layout; state.layoutSha = all.layoutSha;

    const issues = await loadIssuesForGraph();
    const { nodes, edges } = buildGraphData(issues);
    if (state.graph) state.graph.destroy();
    initGraph(nodes, edges);
    updateDraftUI();
    setStatus(`Listo: ${nodes.length} nodos · ${edges.length} conexiones · ${issues.length} issues`);
  } catch (e) { setStatus('Error: ' + e.message); }
}

export function init() {
  // Exponer al window para los onclick del HTML
  Object.assign(window, {
    openAddNodeModal, confirmAddNode,
    toggleLinkMode, confirmEditEdge,
    editSelected, confirmEditNode, deleteSelected,
    openAddIdeaModal,
    confirmAddIdea: () => confirmAddIdea(loadAll),
    saveDraftBtn,
    applyDraftToSchema, confirmApplyDraft, discardDraft,
    saveLayoutBtn, runLayout, graphFit, loadAll,
    closeModal: id => document.getElementById(id).classList.remove('show'),
  });
  bindModalCloseOnBackdrop();
  loadAll();
}
