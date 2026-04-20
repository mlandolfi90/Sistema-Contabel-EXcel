// v2/js/github.js — Cliente mínimo de la API REST de GitHub
// Lee/escribe archivos JSON del repo + crea/edita/cierra Issues.

export const OWNER = 'mlandolfi90';
export const REPO  = 'Sistema-Contabel-EXcel';
export const API   = `https://api.github.com/repos/${OWNER}/${REPO}`;
export const TOKEN_KEY = 'gh-token-panel-v2';

export function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
export function setToken(t) { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); }
export function hasToken() { return !!getToken(); }

function headers(extra = {}) {
  const h = { 'Accept': 'application/vnd.github+json', ...extra };
  const t = getToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  return h;
}

export async function apiGet(path) {
  const r = await fetch(API + path, { headers: headers() });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}
export async function apiPost(path, body) {
  const r = await fetch(API + path, { method: 'POST', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status} ${await r.text()}`);
  return r.json();
}
export async function apiPatch(path, body) {
  const r = await fetch(API + path, { method: 'PATCH', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PATCH ${path} → ${r.status} ${await r.text()}`);
  return r.json();
}
export async function apiPut(path, body) {
  const r = await fetch(API + path, { method: 'PUT', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PUT ${path} → ${r.status} ${await r.text()}`);
  return r.json();
}

export async function loadJsonFile(path, defaultVal) {
  try {
    const r = await fetch(`${API}/contents/${path}?t=${Date.now()}`, { headers: headers() });
    if (r.status === 404) return { data: defaultVal, sha: null };
    if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
    const json = await r.json();
    const decoded = atob(json.content.replace(/\s/g, ''));
    const data = JSON.parse(decodeURIComponent(escape(decoded)));
    return { data, sha: json.sha };
  } catch (e) {
    console.warn(`${path} no disponible:`, e);
    return { data: defaultVal, sha: null };
  }
}

export async function saveJsonFile(path, data, sha, message) {
  const content = JSON.stringify(data, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(content)));
  const body = { message, content: encoded, branch: 'main' };
  if (sha) body.sha = sha;
  const r = await apiPut('/contents/' + path, body);
  return r.content.sha;
}

/* ----------------- Issues ----------------- */
// 4 estados: idea → diseño → listo → implementada (+ cerrar para archivar)
export const STATUS_LABELS = ['idea', 'diseño', 'listo', 'implementada'];
export const ANCHOR_TYPES = ['macro','hoja','tabla','rango','regla','socio','cuenta'];

export function issueToCard(issue) {
  const labels = (issue.labels || []).map(l => typeof l === 'string' ? l : l.name);
  let status = 'idea';
  for (const s of STATUS_LABELS) if (labels.includes(s)) { status = s; break; }
  const anchors = [];
  const anchorRe = new RegExp(`^(${ANCHOR_TYPES.join('|')}):(.+)$`);
  labels.forEach(l => {
    const m = l.match(anchorRe);
    if (m) anchors.push({ type: m[1], id: m[2] });
  });
  return { number: issue.number, title: issue.title, note: issue.body || '', status, anchors, labels, url: issue.html_url };
}

export function cardToLabels(status, anchors, existingLabels) {
  const anchorRe = new RegExp(`^(${ANCHOR_TYPES.join('|')}):`);
  const out = (existingLabels || []).filter(l => !STATUS_LABELS.includes(l) && !anchorRe.test(l));
  out.push(status);
  anchors.forEach(a => out.push(a.type + ':' + a.id));
  return out;
}

export async function loadIssues() {
  const issues = await apiGet('/issues?state=open&per_page=100');
  return issues.filter(i => !i.pull_request).map(issueToCard);
}

export async function createIssue(title, body, labels) { return apiPost('/issues', { title, body, labels }); }
export async function updateIssue(number, patch) { return apiPatch('/issues/' + number, patch); }
export async function closeIssue(number) { return apiPatch('/issues/' + number, { state: 'closed' }); }
