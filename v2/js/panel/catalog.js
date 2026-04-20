// v2/js/panel/catalog.js — Agrupa nodos del schema por tipo

import { state } from './state.js';
import { getEffectiveNodes } from '../schema-loader.js';

export function getCatalog() {
  const nodes = getEffectiveNodes(state.schema, { addNodes:[], editNodes:[], removeNodes:[] });
  const cat = {};
  nodes.forEach(n => {
    if (!cat[n.type]) cat[n.type] = [];
    cat[n.type].push({ id: n.id, label: n.label || n.id, desc: n.desc || '' });
  });
  return cat;
}
