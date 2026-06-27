import { defineConfig } from 'vite';

// IMPORTANTE: troque 'polaroid-upload' pelo nome exato do seu repositório
// no GitHub. O GitHub Pages serve o projeto em:
// https://<seu-usuario>.github.io/<nome-do-repo>/
// então o "base" precisa bater com o nome do repo, senão os arquivos
// CSS/JS não vão carregar (erro 404 silencioso é o sintoma clássico).
export default defineConfig({
  base: '/polaroid_fotos/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
