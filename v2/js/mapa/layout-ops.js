// v2/js/mapa/layout-ops.js — Guardar posiciones + runLayout

import { state } from './state.js';
import { setStatus } from './utils.js';
import { hasToken } from '../github.js';
import { saveLayout as gSaveLayout } from '../schema-loader.js';

export async function saveLayoutBtn() {
  if (!hasToken()) return alert('Necesitás token');
  const { graph, layout } = state;
  graph.nodes().forEach(n => {
    const p = n.position();
    layout.positions[n.id()] = { x: Math.round(p.x), y: Math.round(p.y) };
  });
  try {
    setStatus('Guardando posiciones...');
    state.layoutSha = await gSaveLayout(layout, state.layoutSha);
    setStatus('Posiciones guardadas ✓');
  } catch (e) { setStatus('Error: ' + e.message); }
}

export function runLayout(name) {
  const { graph } = state;
  if (!graph) return;
  const opts = name === 'grid'
    ? { name: 'grid', padding: 30, animate: true }
    : { name: 'cose', animate: true, nodeRepulsion: 8000, idealEdgeLength: 120, padding: 30 };
  graph.layout(opts).run();
}

export function graphFit() { state.graph?.fit(null, 40); }
