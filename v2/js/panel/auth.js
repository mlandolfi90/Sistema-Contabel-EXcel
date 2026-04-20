// v2/js/panel/auth.js — Manejo del token GitHub y UI de autenticación

import { $ } from './utils.js';
import { getToken, hasToken, setToken } from '../github.js';

export function saveTokenBtn(reloadCallback) {
  const v = $('token-input').value.trim();
  if (!v) return;
  setToken(v); $('token-input').value = '';
  updateAuthUI();
  if (reloadCallback) reloadCallback();
}

export function clearTokenBtn() { setToken(''); updateAuthUI(); }

export function updateAuthUI() {
  const dot = $('auth-dot'), st = $('auth-status');
  const banner = $('no-token-banner'), saveBtn = $('save-btn');
  if (hasToken()) {
    dot.classList.add('ok'); st.textContent = 'Token OK — escritura habilitada';
    banner.style.display = 'none'; saveBtn.disabled = false;
  } else {
    dot.classList.remove('ok'); st.textContent = 'Sin token — solo lectura';
    banner.style.display = 'block'; saveBtn.disabled = true;
  }
}
