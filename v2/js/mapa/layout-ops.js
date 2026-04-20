// v2/js/mapa/layout-ops.js — Guardar posiciones + runLayout (determinista)

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

// Guarda posiciones actuales en state.layout (NO hace push a GitHub).
// Sirve para que un auto-organizar quede reflejado si luego el usuario
// pulsa "Guardar posiciones" manualmente.
function snapshotPositionsToState() {
  const { graph, layout } = state;
  if (!graph) return;
  graph.nodes().forEach(n => {
    const p = n.position();
    layout.positions[n.id()] = { x: Math.round(p.x), y: Math.round(p.y) };
  });
}

export function runLayout(name) {
  const { graph } = state;
  if (!graph) return;

  const opts = name === 'grid'
    ? { name: 'grid', padding: 30, animate: true }
    : {
        name: 'cose',
        animate: true,
        // Clave para resultado estable entre ejecuciones:
        // - randomize:false    -> usa posiciones actuales como punto de partida
        // - numIter fijo       -> misma cantidad de iteraciones siempre
        // - initialTemp fijo   -> enfriamiento identico
        randomize: false,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        edgeElasticity: 100,
        gravity: 80,
        componentSpacing: 100,
        padding: 30,
        fit: true,
      };

  const l = graph.layout(opts);
  // Al terminar, dejamos las nuevas posiciones en state.layout para que
  // si el usuario pulsa "Guardar posiciones" no tenga que reorganizar otra vez.
  l.one('layoutstop', () => {
    snapshotPositionsToState();
    if (hasToken()) {
      setStatus('Auto-organizado ✓ (pulsá 📍 Guardar posiciones para persistir)');
    } else {
      setStatus('Auto-organizado ✓');
    }
  });
  l.run();
}

export function graphFit() { state.graph?.fit(null, 40); }
