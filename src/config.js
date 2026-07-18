// Configurações centrais da aplicação.
// Mantenha aqui tudo que pode mudar entre ambientes (dev/produção)
// ou que é repetido em múltiplos arquivos.

export const CONFIG = {
  APPS_SCRIPT_URL:
    'https://script.google.com/macros/s/AKfycbxGlFNlWkDQDR49wIwIkw7PxjnkwikeRuO1YXG34DQjKc4aKhJSyd7LnAeqAQBiXW92hA/exec',

  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_MIME_PREFIX: 'image/',

  // Envio em lotes: necessário porque o Google Apps Script tem limite de
  // tamanho de requisição e de tempo de execução (~6min em contas grátis).
  // Com 50-100 fotos numa única requisição, o Apps Script trava/rejeita
  // silenciosamente (o front-end usa 'no-cors' e não consegue ler o erro).
  // Dividindo em lotes, cada requisição fica pequena e rápida.
  MAX_BATCH_BYTES: 15 * 1024 * 1024, // ~15MB "crus" por lote (~20MB em base64)
  MAX_BATCH_FILES: 15, // teto de arquivos por lote, mesmo se forem pequenos

  TOAST_DURATION_MS: 3500,

  PRODUCTS: [
    { value: '', label: 'Selecione o produto' },
    { value: 'pacote-basico-10', label: 'Mini Fotos' },
    { value: 'pacote-intermediario-15', label: 'Fotos 10x15' },
    { value: 'pacote-premium-20', label: 'Fotos 15x21' }
  ]
};
