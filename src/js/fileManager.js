// Módulo responsável SOMENTE pelo gerenciamento de arquivos:
// seleção, validação, remoção, renderização da lista e drag-and-drop.
// Não sabe nada sobre envio à API — apenas mantém o estado dos arquivos
// e notifica quem estiver escutando (via callback onChange).

import { CONFIG } from '../config.js';

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function createFileManager({ fileInput, dropZone, fileListEl, toast, onChange }) {
  let selectedFiles = [];

  function render() {
    fileListEl.innerHTML = '';

    if (selectedFiles.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = 'Nenhuma imagem selecionada';
      empty.className = 'file-list-empty';
      fileListEl.appendChild(empty);
      return;
    }

    selectedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';

      const name = document.createElement('span');
      name.className = 'file-name';
      name.textContent = file.name;

      const size = document.createElement('span');
      size.className = 'file-size';
      size.textContent = formatBytes(file.size);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'remove-file';
      removeBtn.innerHTML = '&times;';
      removeBtn.setAttribute('aria-label', 'Remover ' + file.name);
      removeBtn.addEventListener('click', () => removeFile(index));

      item.append(name, size, removeBtn);
      fileListEl.appendChild(item);
    });
  }

  // Sincroniza o input[type=file] real com o array selectedFiles.
  // Necessário porque permitimos remoção individual e acumulação
  // de múltiplas seleções/arrastos, o que o input nativo não suporta.
  function syncInput() {
    const dt = new DataTransfer();
    selectedFiles.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
  }

  function notify() {
    syncInput();
    render();
    onChange(selectedFiles);
  }

  function addFiles(fileArray) {
    const incoming = Array.from(fileArray);
    const accepted = [];
    let rejectedType = false;

    incoming.forEach(file => {
      if (!file.type.startsWith(CONFIG.ACCEPTED_MIME_PREFIX)) {
        rejectedType = true;
        return;
      }
      const isDuplicate = selectedFiles.some(
        f => f.name === file.name && f.size === file.size
      );
      if (!isDuplicate) accepted.push(file);
    });

    selectedFiles = selectedFiles.concat(accepted);
    notify();

    if (rejectedType) {
      toast.show('Apenas arquivos de imagem são aceitos.', true);
    }
  }

  function removeFile(index) {
    selectedFiles.splice(index, 1);
    notify();
  }

  function reset() {
    selectedFiles = [];
    notify();
  }

  function getFiles() {
    return selectedFiles;
  }

  // ----- Eventos de DOM -----
  fileInput.addEventListener('change', e => addFiles(e.target.files));

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
  });

  render();

  return { addFiles, removeFile, reset, getFiles };
}
