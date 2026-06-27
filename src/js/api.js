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

  // IMPORTANTE: o Google Apps Script, quando implantado como Web App,
  // não envia o cabeçalho 'Access-Control-Allow-Origin' nas respostas.
  // Isso significa que o navegador bloqueia a LEITURA da resposta
  // (mesmo que o servidor já tenha processado tudo com sucesso).
  //
  // Por isso usamos mode: 'no-cors' aqui: a requisição é enviada e o
  // Apps Script roda normalmente do lado do Google, mas não temos
  // acesso ao conteúdo da resposta (nem ao status real) — o navegador
  // sempre devolve um objeto "opaco". Por isso não dá para checar
  // response.ok ou ler response.json() aqui.
  //
  // Trade-off aceito: perdemos a confirmação granular de erros vindos
  // do Apps Script (ex: "orderCode ausente"), mas ganhamos o envio
  // funcionando sem precisar de um proxy/backend intermediário.
  await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      orderCode,
      product,
      contact,
      files: filesData
    })
  });

  // Como a resposta é opaca, assumimos sucesso se o fetch não lançou
  // erro de rede (ex: sem internet, URL inválida, etc.).
  return true;
}