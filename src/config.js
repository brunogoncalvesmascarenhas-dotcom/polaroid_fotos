// Configurações centrais da aplicação.
// Mantenha aqui tudo que pode mudar entre ambientes (dev/produção)
// ou que é repetido em múltiplos arquivos.

export const CONFIG = {
  APPS_SCRIPT_URL:
    'https://script.google.com/macros/s/AKfycbzGASyIeR8iy6GsTHSfsEulghKAXrW1ew_Wx7NIhQt3HOcMrt2iId6TfpTA9A68WSg/exec',

  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_MIME_PREFIX: 'image/',

  TOAST_DURATION_MS: 3500,

  PRODUCTS: [
    { value: '', label: 'Selecione o produto' },
    { value: 'pacote-basico-10', label: 'Mini Fotos' },
    { value: 'pacote-intermediario-15', label: 'Fotos 10x15' },
    { value: 'pacote-premium-20', label: 'Fotos 15x21' }
  ]
};
