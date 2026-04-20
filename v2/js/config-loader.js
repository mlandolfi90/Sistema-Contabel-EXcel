// v2/js/config-loader.js — Carga los archivos de config (workflow, anchor-types, ui)
// y los expone como un objeto único. Los demás módulos importan de acá.

import { loadJsonFile } from './github.js';

export const CONFIG_PATHS = {
  workflow:    'v2/config/workflow.json',
  anchorTypes: 'v2/config/anchor-types.json',
  ui:          'v2/config/ui.json',
};

const FALLBACK = {
  workflow: { states: [{ id: 'idea', label: 'Idea', short: 'Idea', next: 'idea', arrow: '→' }], actions: [] },
  anchorTypes: { types: [] },
  ui: { structureSections: [], vbaPromptHeader: '' },
};

let cache = null;

export async function loadConfig() {
  if (cache) return cache;
  const [wf, at, ui] = await Promise.all([
    loadJsonFile(CONFIG_PATHS.workflow, FALLBACK.workflow),
    loadJsonFile(CONFIG_PATHS.anchorTypes, FALLBACK.anchorTypes),
    loadJsonFile(CONFIG_PATHS.ui, FALLBACK.ui),
  ]);
  cache = {
    workflow: wf.data,
    anchorTypes: at.data,
    ui: ui.data,
    // Índices rápidos
    stateById: Object.fromEntries(wf.data.states.map(s => [s.id, s])),
    stateIds: wf.data.states.map(s => s.id),
    anchorTypeIds: at.data.types.map(t => t.id),
  };
  return cache;
}

// Utilidades que dependen del config cargado
export function getStateIds(config) { return config.stateIds; }
export function getState(config, id) { return config.stateById[id] || config.stateById[config.stateIds[0]]; }
export function getAnchorTypeIds(config) { return config.anchorTypeIds; }
