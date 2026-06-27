// Módulo responsável SOMENTE por notificações visuais (toast).
// Não sabe nada sobre formulário, arquivos ou API — só exibe mensagens.

import { CONFIG } from '../config.js';

let toastTimer = null;

export function initToast() {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = toast.querySelector('.toast-icon');

  function show(message, isError = false) {
    clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toastIcon.textContent = isError ? '⚠️' : '✅';
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION_MS);
  }

  return { show };
}
