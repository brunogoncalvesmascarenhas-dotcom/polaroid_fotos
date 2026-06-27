# Polaroid Upload

Formulário de upload de fotos Polaroid, organizado por código de compra,
com envio para Google Drive via Google Apps Script.

## Estrutura do projeto

```
polaroid-upload/
├── index.html              # HTML limpo, sem CSS/JS embutido
├── package.json
├── vite.config.js          # Configurado para publicar em GitHub Pages
├── .github/workflows/
│   └── deploy.yml          # Deploy automático a cada push na main
└── src/
    ├── main.js              # Orquestrador: só conecta os módulos
    ├── config.js            # URL do Apps Script, lista de produtos, limites
    ├── styles/
    │   └── main.css
    └── js/
        ├── fileManager.js   # Seleção, validação e lista de arquivos
        ├── toast.js         # Notificações visuais
        ├── formValidator.js # Habilita/desabilita o botão de envio
        └── api.js           # Comunicação com o Apps Script
```

### Por que separado assim?

Cada módulo tem uma responsabilidade só. Se um dia o botão de envio
"travar" de novo, você sabe exatamente onde procurar:

- Arquivo não aparece na lista? → `fileManager.js`
- Botão não habilita? → `formValidator.js`
- Erro no envio? → `api.js`
- Mensagem de toast não aparece? → `toast.js`

Isso é o oposto do arquivo único anterior, onde um bug em qualquer
parte exigia ler o arquivo inteiro para encontrar o problema.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173` com hot-reload — qualquer alteração
no código atualiza a página automaticamente.

## Como buildar para produção

```bash
npm run build
```

Gera a versão otimizada (minificada) em `dist/`. Você pode testar
essa versão final com:

```bash
npm run preview
```

## Como publicar no GitHub Pages

### 1. Ajuste o `base` no `vite.config.js`

Troque `/polaroid-upload/` pelo nome exato do seu repositório no GitHub:

```js
base: '/nome-do-seu-repo/',
```

Se o repositório for `usuario.github.io` (página principal), use `base: '/'`.

### 2. Habilite o GitHub Pages via Actions

No repositório no GitHub: **Settings → Pages → Source → GitHub Actions**.

### 3. Suba o código

```bash
git add .
git commit -m "Estrutura profissional com Vite"
git push origin main
```

O workflow em `.github/workflows/deploy.yml` builda e publica
automaticamente a cada push na branch `main`. Acompanhe o progresso
na aba **Actions** do repositório.

## Configuração

Toda configuração fica em `src/config.js`:

- `APPS_SCRIPT_URL`: endpoint do Google Apps Script que recebe o upload
- `MAX_FILE_SIZE`: tamanho máximo por imagem (atualmente 10MB)
- `PRODUCTS`: lista de produtos exibida no `<select>`

Se o link do Apps Script mudar, edite só esse arquivo — não precisa
caçar a URL espalhada em outros lugares.
