// v2/js/mapa/state.js — Estado global compartido entre módulos del mapa
// Los módulos importan state y leen/escriben sobre sus propiedades.

export const state = {
  schema: null,
  schemaSha: null,
  draft: null,
  draftSha: null,
  layout: null,
  layoutSha: null,
  graph: null,
  linkMode: false,
  linkSource: null,
  pendingIdeaAnchor: null,
  pendingEditNodeId: null,
  pendingEditEdge: null,
};
