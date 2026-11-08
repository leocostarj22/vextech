# Centro de talento — fase 1

Implementação do desenho aprovado em 8 de novembro de 2026. O painel real continua disponível em `/admin/`, com as contas e sessões existentes.

## Incluído

- Navegação Visão geral, Candidaturas, Vagas e Convites; menu recolhido em mobile.
- Temas claro e escuro: escolha própria guardada no navegador, seguida da preferência do sistema quando não existe escolha.
- Dashboard com vagas ativas atuais, candidaturas recebidas e vagas existentes com candidaturas no período. Os dois últimos indicadores seguem os filtros de período/vaga; o primeiro é global.
- Gráfico com intervalos clicáveis e cinco candidaturas recentes. As consultas agregam no MySQL; o navegador não carrega todas as candidaturas para calcular os números.
- Pesquisa no servidor por nome, email, título da vaga ou ID, filtros de 7/30/90 dias ou todo o histórico, vagas removidas e páginas de 20 candidaturas.
- Ficha lateral com contactos, mensagem, data de receção e confirmação de privacidade, descarga PDF autenticada e eliminação explícita da candidatura e do ficheiro.
- Editor de vagas com descrição, requisitos completos, estado e capa PNG/JPG; mantém as capas automáticas e os fluxos públicos.
- Convites com link copiável; sem envio automático de email.
- Estados de carregamento, ausência de resultados, erro com nova tentativa e sessão expirada. Falhas ao guardar mantêm os campos preenchidos.

Funil, etapas, notas, responsáveis, tarefas e entrevistas pertencem às próximas fases. A interface real não apresenta os números fictícios do protótipo nem supõe que uma candidatura já foi analisada.

## Atualizar localmente

Na pasta `server`, parar a API e executar:

```sh
npm ci
npm run migrate
npm run dev
```

A migração `004_recrutamento_indices.sql` acrescenta índices de data e vaga/data. Não altera conteúdos, IDs nem referências dos currículos. Repetir `npm run migrate` não reaplica migrações já registadas.

Na raiz, iniciar o frontend com `npm run dev`. O painel abre diretamente em `http://localhost:3001/admin/`; também pode ser aberto no endereço do Vite seguido de `/admin/`, através do proxy de desenvolvimento. Login, sessões, estatísticas e ficheiros usam a API no mesmo destino configurado por `API_PROXY_TARGET`.

Os recursos do painel (Geist, licença e SVG originais) acompanham `server/public/admin/assets`; não dependem de serviços externos ou do build público. O build do site continua separado. Nenhuma destas alterações publica o projeto no VPS.

## Datas e consultas

As ligações MySQL usam UTC; a apresentação e os dias de calendário usam `Europe/Lisbon`, incluindo mudança de hora. O intervalo usa início inclusivo e fim exclusivo: uma entrada à meia-noite do fim pertence ao dia seguinte. O gráfico e a listagem usam a mesma função de limites. A migração não reescreve datas existentes. Numa instalação anterior com DATETIME gravado fora de UTC, confirmar a convenção histórica antes de converter quaisquer dados; o Docker padrão do projeto usa UTC.

Endpoints internos, sempre com sessão e `Cache-Control: private, no-store`:

- `GET /api/recrutamento/resumo?dias=30&vaga=todas`: totais, série e cinco entradas recentes, sem contactos ou mensagens.
- `GET /api/candidaturas?pagina=1&tamanho=20&dias=30&vaga=todas&q=...`: lista paginada, total filtrado e total geral. `dias=todos` permite consultar o histórico completo. `vaga=removidas` encontra candidaturas cuja vaga foi eliminada.
- O par opcional `de=YYYY-MM-DD&ate=YYYY-MM-DD` seleciona um intervalo de 1–90 dias; `ate` é exclusivo, tal como no gráfico.
- `GET /api/candidaturas/:id`: dados completos da candidatura, sem caminho privado do ficheiro.
- A descarga e a eliminação mantêm os endpoints anteriores. O painel trata falhas da descarga e só inicia o ficheiro após resposta válida.

A resposta antiga de `GET /api/candidaturas` sem `pagina` mantém-se para compatibilidade; o novo painel usa sempre paginação. Datas, paginação, tamanho e filtros são validados. A pesquisa é literal e parametrizada; `%` e `_` não atuam como curingas.

## Verificação

- Testes do backend com MySQL 8.4 numa base dedicada terminada em `_test`: dados anteriores preservados, migrações repetíveis, PDFs e capas, autenticação, estatísticas, fronteiras das datas, horários de verão/inverno, pesquisa literal, paginação e vaga removida.
- Testes no navegador: temas, mobile, filtros e gráfico, ficha, descarga bem-sucedida/indisponível, pesquisa e paginação, erro/recuperação, sessão expirada, editor e convites.
- Verificação integrada sem mocks, numa base isolada: login → criar vaga → candidatura pública PDF → dashboard → ficha/descarga → convite → logout. Os registos de teste foram removidos.
- Build público e suite completa do site.

O protótipo em `prototipo.html` fica preservado como referência visual e continua sem ligação aos dados reais.

Resultado desta entrega: build aprovado; 63 testes de navegador passaram e 6 foram ignorados pelas condições já existentes da suite; 5 testes do backend passaram com MySQL real, sem testes ignorados.
