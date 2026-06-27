// Módulo responsável SOMENTE pela comunicação com o backend
// (Google Apps Script). Não sabe nada sobre DOM, formulário ou UI —
// recebe dados puros e retorna uma Promise.

import { CONFIG } from '../config.js';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove o prefixo "data:image/...;base64," antes de enviar
      const base64 = reader.result.split(',')[1];
      resolve({ name: file.name, type: file.type, data: base64 });
    };
    reader.onerror = () => reject(new Error('Falha ao ler ' + file.name));
    reader.readAsDataURL(file);
  });
}

export async function submitOrder({ orderCode, product, contact, files }) {
  const filesData = await Promise.all(files.map(fileToBase64));

  const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      orderCode,
      product,
      contact,
      files: filesData
    })
  });

  if (!response.ok) {
    throw new Error('Erro HTTP ' + response.status);
  }

  return response;
}
