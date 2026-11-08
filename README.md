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
- As vagas em Carreiras (Java Developer no Porto, PHP Developer em Braga) são reais, vindas do site atual da Vextech, e vêm da API em `server/` — sem backend a correr, a secção mostra só a candidatura espontânea.
- As fotografias recebidas são ilustrativas; ver docs/media.md. A seleção final de imagens/vídeos externos e a validação de licenças ficam para a publicação.
- O formulário valida campos localmente, mas não envia mensagens. A interface indica esse estado. O destino de contacto e o fluxo de candidaturas precisam de ser ligados antes da publicação.
- A morada dos escritórios foi transcrita das capturas do site fornecidas pelo utilizador.
- Sem vagas, números ou testemunhos inventados.
- Conteúdo em português de Portugal; tradução inglesa não incluída.
- Proposta visual e pressupostos em docs/proposta-visual-01.md.

Estrutura: dados em src/data, secções em src/sections, animações em src/motion e identidade em src/brand. Os materiais originais da Margem continuam em arquivos e no histórico, mas não são exibidos no site Vextech.

## Versões clara e escura

A versão clara é a predefinida. O botão circular de sol/lua na navegação alterna as superfícies do túnel, método, diálogos e rodapé, incluindo o fundo e o nevoeiro do Three.js. O ícone indica o modo que será ativado; o nome acessível e a dica ao passar o rato descrevem essa ação. A preferência fica guardada no navegador. O controlo de tema fica sempre visível, ao lado do botão circular do menu.

Pode forçar uma versão por URL: `/?tema=claro` ou `/?tema=escuro`. A versão anterior exclusivamente escura está preservada na tag `vextech-escuro-v1`.

No rodapé, uma máscara suave acompanha o cursor para revelar o wordmark original da Vextech. Esta interpretação foi feita a partir das capturas e da descrição fornecidas pelo utilizador como referência da Affinity; não se conseguiu inspecionar diretamente o site externo. No teclado a marca revela-se por inteiro ao receber foco; no toque e com movimento reduzido mantém uma apresentação estática.

A versão escura usa um degradê de azuis escuros com base em `#10111E`. O túnel mantém fundo transparente sobre o degradê e nevoeiro na cor de base. O nome VEXTECH da primeira secção também usa a revelação pelo cursor. A experiência anterior com fundo ciano está preservada no commit `b694a4d`.

A navegação usa um painel compacto em desktop e telemóvel, com links para as secções e um submenu que abre as três soluções. O painel fecha por Escape, pelo botão, por um toque fora ou ao escolher um destino. O foco fica dentro da navegação enquanto está aberta, e o fundo fica temporariamente sem interação.

## Páginas legais

As páginas `/pt/termos-e-condicoes/`, `/pt/politica-de-privacidade/` e `/pt/politica-de-cookies/` são entradas HTML independentes, com o mesmo menu, temas e identidade visual. O build gera um `index.html` em cada diretório, servível por alojamento estático sem reescrever os pedidos para a página inicial. As versões sem a barra final também são reconhecidas pelo servidor de desenvolvimento e pelos servidores que normalizam diretórios.

Os textos foram mantidos conforme as capturas e a instrução expressa do utilizador. As expressões «Morada Empresa» e «Email Empresa» continuam no texto original. Ver docs/paginas-legais.md para a origem e as referências que ainda não foram confirmadas face à implementação atual.

## Vagas e painel de administração

A secção Carreiras lista vagas vindas de uma API própria (`server/`, Node.js + Express + MySQL), não de um ficheiro estático — assim a equipa da Vextech pode acrescentar ou retirar vagas sem alterar o código do site. Enquanto a variável `VITE_API_URL` não estiver definida, a secção mostra só o convite à candidatura espontânea.

Por agora isto corre apenas em local, até o site ser aprovado pelo CEO da Vextech; o VPS e o domínio já existem mas ainda não estão ligados a este backend.

### Preparar a base de dados (Docker)

```sh
docker compose up -d
```

Sobe um MySQL em `localhost:3306` com a base `vextech`. Para inspecionar os dados com o MySQL Workbench, liga uma nova conexão a `localhost:3306` com o utilizador e password definidos em `docker-compose.yml` (ou no `.env` da raiz, se os tiver sobreposto).

### Preparar e correr a API

```sh
cd server
npm install
cp .env.example .env
npm run migrate
npm run seed:admin -- --nome="O teu nome" --email="tu@vextech.pt" --password="escolhe-uma-password-forte"
npm run dev
```

A API fica em `http://localhost:3001`. O painel de administração está em `http://localhost:3001/admin/login.html` — entra com a conta criada pelo `seed:admin` para gerir vagas e para convidar outras pessoas (o convite gera um link de registo de uso único; não há envio automático de email, o link é copiado e partilhado manualmente).

### Ligar o site à API

Na raiz do projeto:

```sh
cp .env.example .env
npm run dev
```

Com `VITE_API_URL=http://localhost:3001` no `.env`, a secção Carreiras passa a mostrar as vagas criadas no painel.
