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
- Em produção, o site e o painel de administração já estão publicados em https://leocostadeveloper.com/vextech/ — ver "Produção (VPS)" na secção seguinte.
- As fotografias recebidas são ilustrativas; ver docs/media.md. A seleção final de imagens/vídeos externos e a validação de licenças ficam para a publicação.
- O contacto geral e a candidatura espontânea validam campos localmente, mas não enviam mensagens; a interface indica esse estado. As candidaturas a vagas específicas já são guardadas pela API, com currículo PDF privado e consulta no painel. O destino do contacto geral ainda precisa de ser ligado antes da publicação.
- A morada dos escritórios foi transcrita das capturas do site fornecidas pelo utilizador.
- Sem vagas, números ou testemunhos inventados.
- Conteúdo em português de Portugal; tradução inglesa não incluída.
- Proposta visual e pressupostos em docs/proposta-visual-01.md.

Estrutura: dados em src/data, secções em src/sections, animações em src/motion e identidade em src/brand. Os materiais originais da Margem continuam em arquivos e no histórico, mas não são exibidos no site Vextech.

## Versões clara e escura

Na primeira visita, o site acompanha a preferência clara ou escura do sistema. Uma escolha guardada pelo botão de tema tem prioridade sobre o sistema; o parâmetro `?tema=` tem prioridade sobre ambos. O botão circular de sol/lua na navegação alterna as superfícies do túnel, método, diálogos e rodapé, incluindo o fundo e o nevoeiro do Three.js. O ícone indica o modo que será ativado; o nome acessível e a dica ao passar o rato descrevem essa ação. A preferência fica guardada no navegador. O controlo de tema fica sempre visível, ao lado do botão circular do menu.

Pode forçar uma versão por URL: `/?tema=claro` ou `/?tema=escuro`. A versão anterior exclusivamente escura está preservada na tag `vextech-escuro-v1`.

No rodapé, uma máscara suave acompanha o cursor para revelar o wordmark original da Vextech. Esta interpretação foi feita a partir das capturas e da descrição fornecidas pelo utilizador como referência da Affinity; não se conseguiu inspecionar diretamente o site externo. No teclado a marca revela-se por inteiro ao receber foco; no toque e com movimento reduzido mantém uma apresentação estática.

A versão escura usa um degradê de azuis escuros com base em `#10111E`. O túnel mantém fundo transparente sobre o degradê e nevoeiro na cor de base. O nome VEXTECH da primeira secção também usa a revelação pelo cursor. A experiência anterior com fundo ciano está preservada no commit `b694a4d`.

A navegação usa um painel compacto em desktop e telemóvel, com links para as secções e um submenu que abre as três soluções. O painel fecha por Escape, pelo botão, por um toque fora ou ao escolher um destino. O foco fica dentro da navegação enquanto está aberta, e o fundo fica temporariamente sem interação.

As páginas públicas apresentam uma abertura com a marca Vextech centralizada e uma revelação azul semelhante à do hero e rodapé. O fundo acompanha o tema desde o primeiro paint. O carregamento espera pelos recursos iniciais, com um limite de segurança; não mostra uma percentagem fictícia nem bloqueia à espera da API de vagas na home. Com movimento reduzido, a marca é estática. O link «Saltar para as soluções» continua disponível pelo teclado, sem aparecer no canto durante o reload. O painel administrativo mantém o seu arranque habitual. Ver `docs/abertura.md`.

## Páginas legais

As páginas `/pt/termos-e-condicoes/`, `/pt/politica-de-privacidade/` e `/pt/politica-de-cookies/` são entradas HTML independentes, com o mesmo menu, temas e identidade visual. O build gera um `index.html` em cada diretório, servível por alojamento estático sem reescrever os pedidos para a página inicial. As versões sem a barra final também são reconhecidas pelo servidor de desenvolvimento e pelos servidores que normalizam diretórios.

Os textos foram mantidos conforme as capturas e a instrução expressa do utilizador. As expressões «Morada Empresa» e «Email Empresa» continuam no texto original. Ver docs/paginas-legais.md para a origem e as referências que ainda não foram confirmadas face à implementação atual.

## Vagas e painel de administração

A secção Carreiras lista vagas vindas de uma API própria (`server/`, Node.js + Express + MySQL), não de um ficheiro estático — assim a equipa da Vextech pode acrescentar ou retirar vagas sem alterar o código do site. Em desenvolvimento, o Vite encaminha automaticamente `/api/vagas` para a API local em `http://127.0.0.1:3001`. Não é necessário criar `.env` na raiz para carregar as vagas. A API e o MySQL precisam de estar em execução, e as vagas devem estar ativas no painel.

Em produção, o site corre na VPS da Vextech em https://leocostadeveloper.com/vextech/ — ver "Produção (VPS)" mais abaixo.

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

Com a API a correr na porta 3001, na raiz do projeto basta executar:

```sh
npm run dev
```

O browser pede `/api/vagas` ao mesmo endereço do site e o Vite encaminha o pedido à API. Assim, o endereço do browser (`localhost` ou `127.0.0.1`) não provoca problemas de CORS. Para outra porta ou servidor, copie `.env.example` para `.env`, defina `API_PROXY_TARGET` e reinicie o Vite. `npm run preview` usa o mesmo encaminhamento local.

Se não aparecerem cards, confirme primeiro que `http://localhost:3001/api/vagas` devolve uma lista com vagas. `[]` significa que não existem vagas ativas na base de dados. Na versão local, `http://localhost:5173/api/vagas` deve devolver a mesma lista. Uma falha de ligação apresenta uma mensagem e «Tentar novamente», sem esconder silenciosamente a secção.

### Produção (VPS)

O site e o painel estão publicados em https://leocostadeveloper.com/vextech/ (painel em https://leocostadeveloper.com/vextech/admin/login.html), numa VPS cPanel/AlmaLinux com MariaDB. A raiz do domínio continua a servir outro site do utilizador — o Vextech fica isolado em `/vextech/`.

O build de produção usa um subcaminho, por isso o `base` do Vite é definido por variável de ambiente (sem ela, o build e o `npm run dev`/`npm test` locais continuam a servir a partir de `/`, sem qualquer alteração):

```sh
npm ci
PUBLIC_BASE_PATH=/vextech/ npm run build
rsync -a --delete dist/ ~/public_html/vextech/
```

`public/.htaccess` (ficheiro versionado, copiado para `dist/` em cada build) reencaminha `/vextech/api/`, `/vextech/admin/` e `/vextech/uploads/vagas/` para a API Node local (`http://127.0.0.1:4001`), via `mod_rewrite` com a flag `[P]` — funciona sem acesso root/WHM, só com o que o `.htaccess` de uma conta cPanel normal permite. O backend corre com `pm2` (`cd server && npx pm2 start ecosystem.config.cjs`), com `NODE_ENV=production` e `server/.env` criado manualmente na VPS (nunca commitado). Como a VPS não dá acesso a `pm2 startup` (sem `sudo`), a recuperação após um reinício é feita por um Cron Job do próprio cPanel (não pela `crontab` da shell, que não persiste nesta conta) a cada poucos minutos, a verificar se o processo está vivo e a correr `pm2 resurrect` se não estiver.

Atualizações: o workflow `.github/workflows/deploy.yml` builda e publica a cada push para `main`, mas só fica ativo depois de configurados os segredos `VPS_HOST`, `VPS_USER` e `VPS_SSH_KEY` em Settings → Secrets and variables → Actions do repositório no GitHub (usar uma chave SSH dedicada ao deploy, sem passphrase, nunca uma chave pessoal). Sem esses segredos, atualizar manualmente por SSH: `git pull`, os dois comandos de build acima, e em `server/`, `npm ci --omit=dev && npm run migrate && npx pm2 restart ecosystem.config.cjs`.

Na página inicial, Carreiras apresenta apenas as duas vagas ativas mais recentes, em cards que se alinham durante o scroll. O botão «Ver todas as vagas» abre `/pt/vagas/`, com todas as oportunidades e os requisitos completos. O backend ordena por data de criação e, em caso de empate, pelo ID mais recente. Os cards reutilizam imagens ilustrativas do projeto, sem representar a equipa ou uma vaga específica.

No telemóvel, os cards ficam em coluna. Com movimento reduzido ficam estáticos. «Ver vaga» abre a página individual, com descrição, requisitos completos e formulário de candidatura com PDF. Sem API, a home mantém a candidatura espontânea; a página de vagas distingue indisponibilidade de ausência de vagas.

### Capas das vagas

Java e PHP usam as imagens fornecidas em `vagas.zip`. As restantes vagas usam `public/media/vagas/default.jpg`. No painel, o campo «Capa da vaga» permite enviar PNG/JPG até 5 MB (recomendado 16:9), com pré-visualização. A capa enviada tem prioridade. Editar o texto mantém a capa; a opção «Remover a capa enviada» repõe a imagem automática. Os uploads são validados pelo conteúdo, limitados a 32 megapíxeis e guardados com nomes aleatórios, depois de corrigir a orientação e remover metadados.

Depois de atualizar esta versão, pare a API e execute:

```sh
cd server
npm ci
npm run migrate
npm run dev
```

A migração acrescenta `vagas.capa` sem apagar vagas existentes e regista as migrações aplicadas para permitir repetir o comando. Os ficheiros enviados ficam em `server/uploads/vagas`, fora do Git; pode definir `UPLOADS_DIR` em `server/.env` para outro diretório persistente. Ao alojar ou copiar o backend, preserve tanto a base de dados como esse diretório. Em produção, encaminhe também `/uploads/vagas` para o backend; em desenvolvimento e preview, o Vite já o faz. O painel serve as capas automáticas a partir de `public/media/vagas`, que deve acompanhar o projeto.

Os testes do backend usam uma base MySQL dedicada cujo nome termina em `_test`. Execute em `server/` com `VEXTECH_TEST_DB` e as variáveis `DB_HOST`, `DB_PORT`, `DB_USER` e `DB_PASSWORD` da base de teste: `npm test`. O teste verifica migração com dados existentes, idempotência, autenticação, envio PNG/JPG, limites, manutenção, substituição, remoção e limpeza dos ficheiros. Sem `VEXTECH_TEST_DB`, este teste é ignorado para evitar usar a base normal.

### Página individual e candidaturas com PDF

Cada vaga tem um endereço `/pt/vagas/detalhe/?id=ID`. Esta entrada HTML faz parte do build estático; não exige reescrever URLs nem gerar uma página por vaga no build. O detalhe lê `GET /api/vagas/:id`, apresenta a descrição em texto simples e todos os requisitos guardados no painel. As listas mostram apenas um resumo de até três requisitos por card. No painel, «Descrição da vaga» permite acrescentar contexto e funções sem alterar os requisitos existentes. As fontes consultadas estão em `docs/vagas-origem.md`; não se inventam nem substituem automaticamente dados das vagas.

O formulário individual envia uma candidatura real para `POST /api/vagas/:id/candidaturas`, com nome e email obrigatórios, telefone e mensagem opcionais, currículo PDF obrigatório até 5 MB e confirmação da Política de Privacidade. A API verifica o conteúdo PDF, recusa documentos inválidos ou protegidos por palavra-passe, e só aceita vagas ativas. O limite é de 10 tentativas por IP em 15 minutos. A confirmação só aparece depois de gravar a candidatura. Não é enviado email nem é usada a demonstração do formulário geral.

Depois do pull, pare a API e execute em `server/`: `npm ci`, `npm run migrate` e `npm run dev`. A migração `003_candidaturas.sql` acrescenta a descrição e a tabela de candidaturas sem apagar vagas. Noutro terminal, na raiz, inicie o frontend com `npm run dev`.

Os currículos ficam em `server/private/curriculos`, fora do Git e de todas as pastas públicas. `CURRICULOS_DIR` permite escolher outro diretório privado persistente; preserve-o juntamente com a base de dados. O painel mostra «Candidaturas recebidas», com mensagens e descarga PDF autenticada (`/api/candidaturas/:id/curriculo`, como anexo, sem cache). Eliminar uma candidatura também elimina o respetivo ficheiro. Eliminar uma vaga conserva o histórico das candidaturas com o título/localização originais, até o administrador eliminar essas candidaturas.

Em produção, mantenha estes diretórios privados fora do servidor de ficheiros estáticos e configure o proxy de confiança de acordo com o alojamento antes de expor a API, para o limite por IP refletir os candidatos. Estes passos não ligam automaticamente o VPS. Os testes com base dedicada também verificam PDF obrigatório/validado, confirmação de privacidade, vagas fechadas, limite de tentativas, privacidade dos ficheiros, descarga e eliminação autenticadas.

### Desenho do futuro painel de recrutamento

A proposta visual e o planeamento do Centro de talento estão em [docs/recrutamento](docs/recrutamento/README.md). Abra `docs/recrutamento/prototipo.html` no navegador para experimentar dashboard, funil/lista, ficha lateral, vagas e temas. Os dados são ilustrativos e as alterações ficam apenas na memória da demonstração; esta proposta não substitui `/admin`. O [plano por fases](docs/recrutamento/plano.md) distingue os recursos atuais das funcionalidades a implementar.

### Centro de talento — painel implementado (fase 1)

O painel `/admin/` usa agora o desenho aprovado: dashboard com dados reais e gráfico clicável, temas claro/escuro, candidaturas pesquisáveis e paginadas, ficha com PDF privado, editor de vagas e convites. Os números são calculados pela API e não incluem os exemplos do protótipo. Etapas de seleção, funil, notas e agenda entram nas fases seguintes.

Depois do pull, pare a API e execute em `server/`: `npm ci`, `npm run migrate` e `npm run dev`. A migração `004_recrutamento_indices.sql` acrescenta índices sem alterar as candidaturas. Abra `http://localhost:3001/admin/` e entre com a conta existente. Também pode abrir `/admin/` no endereço do Vite; os proxies de desenvolvimento encaminham o painel e as APIs para o backend.

Consulte [implementação e validação da fase 1](docs/recrutamento/implementacao-fase-1.md). O protótipo anterior continua disponível como referência visual independente.

### Perfil do administrador

No menu **Meu perfil** (também acessível pelo nome no cabeçalho), cada administrador pode alterar o nome, o email de acesso e a password. Os dois formulários exigem a password atual. A nova password tem confirmação e pelo menos 8 caracteres; os campos de password são limpos depois de cada pedido. O email não pode coincidir com o de outra conta.

Para atualizar, pare a API no terminal onde está em execução, faça pull e execute em `server/`: `npm run migrate` e `npm run dev`. A migração `005_perfil_admin.sql` acrescenta uma versão de sessão a cada conta, sem alterar os dados existentes. Ao alterar email ou password, a sessão atual é renovada e os restantes acessos dessa conta têm de iniciar sessão novamente. As sessões passam a consultar a conta na base de dados, para mostrar os dados atuais e recusar versões antigas. Vagas, candidaturas e currículos permanecem associados aos registos existentes.

### Recuperar a password esquecida do admin

Com acesso ao servidor e ao MySQL configurado em `server/.env`, não é necessário saber a password antiga. Na pasta `server/`, execute:

```sh
npm run reset:admin
```

O comando pede o email da conta, a nova password e a confirmação. A password não aparece enquanto escreve e não é passada como argumento nem guardada no histórico do terminal. Pode cancelar com `Ctrl+C`. São aceites apenas terminais interativos.

A recuperação atualiza apenas a password da conta indicada, mantém os seus dados e termina as sessões antigas. Depois, entre em `/admin/login.html` com o mesmo email e a nova password. Não é necessário iniciar outra instância da API nem ocupar novamente a porta 3001. Se ainda não aplicou a migração do perfil, execute primeiro `npm run migrate`. A recuperação é um comando local de manutenção; não existe um endpoint público para redefinir passwords sem autenticação.
