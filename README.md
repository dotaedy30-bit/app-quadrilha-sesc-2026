# Quadrilha do Sesc 2026

PWA front-end para controlar, em ordem cronológica, o roteiro sonoro oficial da apresentação. Cada disco mantém sua própria posição, somente uma música principal toca por vez e a próxima faixa disponível começa automaticamente ao término. O aplicativo funciona offline após o primeiro carregamento e pode ser instalado no celular.

## Executar no VS Code

Requer Node.js 22 (Node 20.19+ também é compatível).

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. Para conferir tipos, qualidade e produção:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

O preview fica em `http://localhost:4173`.

## Adicionar músicas

1. Copie o arquivo para `public/audios` sem remover os existentes.
2. Execute `npm run audio-manifest` (isso também ocorre automaticamente antes de dev, build e preview).
3. Confira no terminal as associações, faixas ausentes e eventuais conflitos.

O script aceita MP3, MPEG, WAV, M4A, AAC e OGG, gera `src/generated/audioManifest.ts` e os caminhos usam `import.meta.env.BASE_URL`. O efeito de tiro usa um canal persistente separado, pausa a música principal sem perder sua posição e nunca a retoma automaticamente.

## PWA, instalação e offline

- Android/Chrome/Edge: abra o app e toque em **Baixar aplicativo** quando o navegador disponibilizar a instalação.
- iPhone/iPad: abra no Safari, toque em **Instalar no iPhone/iPad**, depois em Compartilhar → Adicionar à Tela de Início → Adicionar.
- Offline: visite o app uma vez com internet, aguarde “Pronto para uso offline”, reproduza/carregue os áudios e depois teste em modo avião. Arquivos de áudio possuem cache dedicado e suporte a requisições por faixa de bytes.
- Atualizar: abra o app conectado; o service worker busca e ativa a versão nova automaticamente. Feche e reabra se a tela já estava aberta.
- Limpar cache: nas ferramentas do navegador use Application → Storage → Clear site data. No celular, apague os dados do site ou desinstale o PWA.

O PWA exige HTTPS fora de `localhost`. Para validar a instalação, use `npm run build && npm run preview`; o service worker também fica habilitado em desenvolvimento para testes locais.

## GitHub Pages

1. Crie um repositório e envie este projeto para a branch `main`.
2. Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**.
3. Faça push. `.github/workflows/deploy.yml` executará instalação, TypeScript, lint e build e publicará `dist`.

Durante o Actions, o Vite lê `GITHUB_REPOSITORY` e configura automaticamente a base como `/nome-do-repositorio/`, incluindo manifest, service worker, ícones e áudios.

## Render (Static Site)

O `render.yaml` já descreve um site estático. Alternativamente, crie-o pelo painel com **Build Command** `npm ci && npm run build`, **Publish Directory** `dist` e variável `VITE_BASE_PATH=/`. O Render fornece HTTPS; a base, o manifesto, o service worker, os ícones e os áudios funcionarão na raiz do domínio.

## Docker (opcional)

```bash
docker build -t quadrilha-sesc-2026 .
docker run --rm -p 8080:80 quadrilha-sesc-2026
```

Acesse `http://localhost:8080`.

## Autoria

- Professor responsável: Professor Júlio Rangel
- Autor do aplicativo: Edy Marques Freelancer
