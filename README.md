# Vextech — pré-visualização do novo site

Site baseado na experiência da demo Margem, adaptado à identidade e aos três serviços da Vextech. Vite, JavaScript, Three.js, GSAP e Lenis.

## Executar no PC

Use Node.js 24 (ou Node 22.12+).

```sh
npm ci
npm run dev
```

Abra o endereço mostrado no terminal, normalmente http://localhost:5173. Depois de receber novas alterações, execute git pull e npm ci antes de reiniciar o servidor.

```sh
npm run build
npm run preview
npm test
```

Os testes usam Chromium em /usr/bin/chromium; pode definir CHROMIUM_PATH com outro executável. Para usar o navegador instalado pelo Playwright, ajuste executablePath em playwright.config.js.

## Regressar à demo Margem

A versão original está guardada na tag `margem-demo-v1`, commit `77ba3a4`. Para a experimentar sem apagar alterações, comece com a árvore de trabalho limpa (guarde primeiro quaisquer mudanças locais):

```sh
git fetch origin --tags
git switch -c rever-margem margem-demo-v1
npm ci
npm run dev
```

Para voltar à Vextech, pare o servidor e execute `git switch main`, `npm ci` e `npm run dev`. Não é necessário reset nem force push.

## Estado desta experiência

- Os três destaques do túnel apresentam soluções, não casos de clientes.
- As fotografias recebidas são ilustrativas; ver docs/media.md. A seleção final de imagens/vídeos externos e a validação de licenças ficam para a publicação.
- O formulário valida campos localmente, mas não envia mensagens. A interface indica esse estado. O destino de contacto e o fluxo de candidaturas precisam de ser ligados antes da publicação.
- A morada dos escritórios foi transcrita das capturas do site fornecidas pelo utilizador.
- Sem vagas, números ou testemunhos inventados.
- Conteúdo em português de Portugal; tradução inglesa não incluída.
- Proposta visual e pressupostos em docs/proposta-visual-01.md.

Estrutura: dados em src/data, secções em src/sections, animações em src/motion e identidade em src/brand. Os materiais originais da Margem continuam em arquivos e no histórico, mas não são exibidos no site Vextech.
