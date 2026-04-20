// v2/js/mapa/layout-seed.js — Posiciones iniciales deterministas por hash del id
// Se usa cuando un nodo no tiene entrada en layout.json (nodo nuevo, issue recien creado, etc.)
// Objetivo: evitar que nodos sin posicion caigan todos a (0,0) y queden apilados.

// Hash simple y estable (djb2). Mismo id -> mismo numero siempre.
function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h |= 0; // fuerza int32
  }
  return Math.abs(h);
}

// Devuelve {x,y} determinista dentro de una grilla alrededor del origen.
// Usa el hash del id para elegir celda -> reproducible entre sesiones.
export function seedPosition(id, opts = {}) {
  const {
    cols = 8,          // columnas de la grilla virtual
    cellW = 220,       // ancho de celda
    cellH = 140,       // alto de celda
    originX = 100,     // desplazamiento global
    originY = 100,
  } = opts;
  const h = hash(id);
  const col = h % cols;
  const row = Math.floor(h / cols) % cols; // limitado para no alejar mucho
  return {
    x: originX + col * cellW,
    y: originY + row * cellH,
  };
}

// Rellena posiciones faltantes en un array de nodos de cytoscape (formato buildGraphData).
// No pisa las que ya tienen posicion cargada desde layout.json.
export function fillMissingPositions(nodes, opts = {}) {
  nodes.forEach(n => {
    if (!n.position) {
      n.position = seedPosition(n.data.id, opts);
    }
  });
  return nodes;
}
