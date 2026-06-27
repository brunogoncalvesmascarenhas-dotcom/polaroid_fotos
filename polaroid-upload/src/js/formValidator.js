// Módulo responsável SOMENTE pela validação do formulário.
// Decide se o botão de envio deve estar habilitado, mas não sabe
// nada sobre arquivos (recebe a contagem de arquivos via parâmetro)
// nem sobre como enviar os dados.

export function createFormValidator({ orderCodeInput, productSelect, submitBtn }) {
  function isValid(fileCount) {
    const orderOk = orderCodeInput.value.trim().length > 0;
    const productOk = productSelect.value !== '';
    const filesOk = fileCount > 0;
    return orderOk && productOk && filesOk;
  }

  function validate(fileCount) {
    const valid = isValid(fileCount);
    submitBtn.disabled = !valid;
    return valid;
  }

  return { validate, isValid };
}
