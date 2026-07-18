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

// Divide os arquivos em lotes menores antes de enviar. Necessário porque
// o Apps Script tem limite de tamanho de requisição e de tempo de
// execução — mandar 50-100 fotos numa chamada só facilmente estoura os
// dois. Cada lote respeita um teto de bytes (fotos variam de peso) e
// também um teto de quantidade (evita muitas requisições quando os
// arquivos são pequenos).
function makeBatches(files) {
  const batches = [];
  let current = [];
  let currentBytes = 0;

  files.forEach(file => {
    const excedeBytes = currentBytes + file.size > CONFIG.MAX_BATCH_BYTES;
    const excedeQtd = current.length >= CONFIG.MAX_BATCH_FILES;

    if (current.length > 0 && (excedeBytes || excedeQtd)) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }

    current.push(file);
    currentBytes += file.size;
  });

  if (current.length) batches.push(current);
  return batches;
}

async function sendBatch({ orderCode, product, contact, batch }) {
  const filesData = await Promise.all(batch.map(fileToBase64));

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
}

// onProgress(loteAtual, totalLotes) é opcional — usado pela UI para
// mostrar "Enviando lote 2/7..." em vez de travar sem feedback durante
// pedidos grandes.
export async function submitOrder({ orderCode, product, contact, files, onProgress }) {
  const batches = makeBatches(files);

  for (let i = 0; i < batches.length; i++) {
    await sendBatch({ orderCode, product, contact, batch: batches[i] });
    if (onProgress) onProgress(i + 1, batches.length);
  }

  // Como a resposta de cada lote é opaca, assumimos sucesso se nenhum
  // fetch lançou erro de rede (ex: sem internet, URL inválida, etc.).
  return true;
}