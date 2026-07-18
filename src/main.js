// Ponto de entrada da aplicação.
// Responsabilidade ÚNICA: pegar as referências do DOM e conectar
// os módulos entre si. Nenhuma regra de negócio deve viver aqui —
// se você está tentado a colocar um "if" de validação ou um
// "fetch" direto neste arquivo, esse código pertence a outro módulo.

import './styles/main.css';
import { CONFIG } from './config.js';
import { initToast } from './js/toast.js';
import { createFileManager } from './js/fileManager.js';
import { createFormValidator } from './js/formValidator.js';
import { submitOrder } from './js/api.js';

function populateProductOptions(selectEl) {
  CONFIG.PRODUCTS.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    selectEl.appendChild(option);
  });
}

function init() {
  const form = document.getElementById('uploadForm');
  const orderCodeInput = document.getElementById('orderCode');
  const productSelect = document.getElementById('productSelect');
  const contactInput = document.getElementById('contact');
  const fileInput = document.getElementById('fileInput');
  const dropZone = document.getElementById('dropZone');
  const fileListEl = document.getElementById('fileList');
  const submitBtn = document.getElementById('submitBtn');

  const toast = initToast();
  populateProductOptions(productSelect);

  const validator = createFormValidator({ orderCodeInput, productSelect, submitBtn });

  const fileManager = createFileManager({
    fileInput,
    dropZone,
    fileListEl,
    toast,
    onChange: files => validator.validate(files.length)
  });

  function revalidate() {
    validator.validate(fileManager.getFiles().length);
  }

  orderCodeInput.addEventListener('input', revalidate);
  productSelect.addEventListener('change', revalidate);

  async function handleSubmit(e) {
    e.preventDefault();

    const files = fileManager.getFiles();
    if (!validator.isValid(files.length)) {
      toast.show('Preencha os campos obrigatórios.', true);
      return;
    }

    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Enviando...';

    try {
      await submitOrder({
        orderCode: orderCodeInput.value.trim(),
        product: productSelect.value,
        contact: contactInput.value.trim(),
        files,
        onProgress: (loteAtual, totalLotes) => {
          // Só faz sentido mostrar progresso quando há mais de um lote
          // (pedidos pequenos continuam indo numa única requisição).
          if (totalLotes > 1) {
            submitBtn.innerHTML = `<span>⏳</span> Enviando ${loteAtual}/${totalLotes}...`;
          }
        }
      });

      toast.show('Imagens enviadas com sucesso!');
      form.reset();
      fileManager.reset();
    } catch (err) {
      console.error(err);
      toast.show('Não foi possível enviar. Tente novamente.', true);
    } finally {
      submitBtn.innerHTML = originalBtnHTML;
      revalidate();
    }
  }

  form.addEventListener('submit', handleSubmit);

  revalidate();
}

document.addEventListener('DOMContentLoaded', init);
