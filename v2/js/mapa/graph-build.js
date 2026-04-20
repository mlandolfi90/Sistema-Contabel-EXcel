// v2/js/mapa/graph-build.js — Construye datos + inicializa Cytoscape + estilos visuales

import { state } from './state.js';
import { $, setStatus, truncate } from './utils.js';
import { getEffectiveNodes, getEffectiveRelations } from '../schema-loader.js';
import { loadIssues } from '../github.js';
import { editFromEvent } from './actions-nodes.js';
import { onLinkModeTap, toggleLinkMode } from './actions-edges.js';

export async function loadIssuesForGraph() { return loadIssues(); }

export function buildGraphData(issues) {
  const { schema, draft, layout } = state;
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
  nodes.forEach(n => { if (layout.positions[n.data.id]) n.position = layout.positions[n.data.id]; });
  return { nodes, edges };
}

export function initGraph(nodes, edges) {
  const { schema, layout } = state;
  const hasPositions = Object.keys(layout.positions).length > 0;
  const nodeTypes = schema.nodeTypes || {};

  state.graph = cytoscape({
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
        'shape': 'cut-rectangle', 'background-color': '#FFF4D6', 'border-color': '#B08500',
        'border-width': 1.5, 'border-style': 'dashed', 'label': 'data(label)', 'color': '#5a3e00',
        'font-size': 10, 'text-valign': 'center', 'text-halign': 'center',
        'width': 'label', 'height': 30, 'padding': '8px', 'text-wrap': 'wrap', 'text-max-width': 180,
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

  const g = state.graph;
  g.on('tap', 'node[kind = "issue"]', evt => {
    if (state.linkMode) return;
    const url = evt.target.data('url');
    if (url) window.open(url, '_blank');
  });
  g.on('tap', 'node', evt => onLinkModeTap(evt));
  g.on('mouseover', 'node', evt => setStatus(evt.target.data('desc') || evt.target.data('label')));
  g.on('mouseout', 'node', () => { if (!state.linkMode) setStatus(''); });
  g.on('dblclick', 'node[kind != "issue"]', evt => editFromEvent(evt));
  g.on('dblclick', 'edge[kind != "issue"]', evt => editFromEvent(evt));
}

export async function rerender() {
  // re-render preservando posiciones visuales actuales
  const { graph } = state;
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
