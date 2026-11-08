# Centro de talento Vextech — desenho e plano

Proposta 01 · 8 de novembro de 2026 · Estado: desenho aprovado; fase 1 implementada.

O objetivo é transformar o painel de vagas num espaço de trabalho diário para recrutamento: perceber o que entrou, acompanhar cada candidatura e saber a próxima ação. O desenho original está preservado no protótipo autónomo. Após aprovação, a fase 1 foi implementada no painel real; consultar [implementação da fase 1](implementacao-fase-1.md). Os exemplos deste documento e do protótipo continuam separados dos dados reais.

## Desenho para experimentar

Abrir [prototipo.html](prototipo.html) diretamente num navegador. Não precisa de instalar dependências, iniciar a API ou configurar a base de dados. Fonte, logótipos e ícones estão incluídos no ficheiro; funciona sem internet.

- **Visão geral:** indicadores clicáveis, gráfico por período, distribuição pelas etapas, candidaturas recentes e próximas ações.
- **Candidaturas:** alternância entre funil e lista, pesquisa, filtros por vaga, etapa e responsável. Arrastar uma candidatura entre colunas ou alterar a etapa na ficha lateral.
- **Ficha da candidatura:** contacto ilustrativo, responsável, referência ao PDF, notas e histórico. A abertura lateral preserva o contexto da lista.
- **Vagas:** lista de oportunidades e antecipação do editor, com gravação apenas na memória da demonstração.
- **Temas e mobile:** claro e escuro, navegação recolhida e funil com deslocamento horizontal dentro da sua área.

Todos os perfis, números, etapas, competências e tarefas são exemplos fictícios, identificados na interface. Os títulos Java Developer / Porto e PHP Developer / Braga correspondem às oportunidades já usadas no projeto; as candidaturas apresentadas não são reais. Nenhum currículo está incluído. Notas, movimentos e edições desaparecem ao recarregar. Apenas o tema do protótipo é guardado no navegador, numa chave separada do site.

### Direção visual

Manter os SVG originais da marca e a tipografia Geist. Usar a cor #68d2df para ações e destaques; nos temas escuros, superfícies de azul profundo com base #10111e. Fundo claro suave, linhas finas, cantos moderados e espaço entre grupos. As cores das etapas têm sempre rótulo, para a informação não depender apenas da cor.

A linguagem visual aproxima o painel do site através da marca, tipografia e paleta. O trabalho de recrutamento pede tabelas legíveis, filtros persistentes e movimento discreto. As animações de scroll do site ficam fora deste espaço operacional. Respeitar movimento reduzido e permitir todas as mudanças de etapa por teclado/toque, sem depender de arrastar.

### Organização das telas

| Área | Objetivo | Interação principal |
| --- | --- | --- |
| Visão geral | Priorizar o trabalho do dia | Indicador ou coluna do gráfico abre a lista correspondente |
| Candidaturas | Acompanhar processos | Funil/lista → ficha lateral → próxima ação |
| Vagas | Gerir oportunidades | Publicar, editar, desativar e consultar candidaturas |
| Ficha | Reunir contexto da candidatura | PDF protegido, etapa, responsável, notas e histórico |
| Agenda — fase futura | Organizar entrevistas | Data, participantes, avaliação e lembrete |
| Equipa — fase futura | Controlar acesso | Utilizadores, convites, funções e âmbito de acesso |
| Banco de talentos — fase futura | Recuperar perfis autorizados | Pesquisa, disponibilidade e prazo de conservação |

## Base existente e dependências

A análise teve como referência o projeto no commit `a628a06`.

| Já existe | Pode alimentar o novo painel | Ainda precisa de desenvolvimento |
| --- | --- | --- |
| Vagas com título, localização, descrição, requisitos, estado e capa PNG/JPG | Gestão de oportunidades e contagem de vagas ativas | Novo layout e organização do editor |
| Candidaturas com vaga, nome, email, telefone, mensagem e data | Lista, pesquisa e evolução de entradas por período | Filtros/paginação no servidor para volumes maiores |
| PDF privado e descarga com autenticação | Acesso ao currículo na ficha | Novo desenho da ficha; manter descarga protegida |
| Autenticação e convites | Acesso da equipa ao painel | Funções e permissões com regras verificadas no servidor |
| Eliminação da candidatura e do ficheiro | Pedido de eliminação já suportado | Separar arquivo operacional de eliminação e conservação |
| Sem etapas, notas, tarefas, entrevistas ou histórico persistidos | Nenhuma estatística dessas áreas está disponível hoje | Novos registos, API, migrações e controlos de acesso |

O estado pertence à **candidatura a uma vaga**, não à pessoa: alguém pode estar em triagem numa vaga e em entrevista noutra. Nesta primeira evolução mantém-se `candidaturas` como unidade de trabalho. A eventual entidade `candidatos` e a associação de várias candidaturas ao mesmo perfil ficam para uma fase posterior, com associação explícita e revisão de duplicados.

## Plano por fases

### Fase 1 — painel moderno com dados existentes

Entregar a nova estrutura visual, temas, navegação, vagas, lista pesquisável de candidaturas e ficha com PDF. Reutilizar Node/Express, MySQL, autenticação e os fluxos públicos atuais. Não é necessária uma mudança de framework para obter este desenho.

A visão geral começa com vagas ativas, candidaturas recebidas e entradas por período/vaga. Os blocos de etapas e próximas ações só entram quando houver dados reais da fase 2. O protótipo mostra essa visão futura para permitir a revisão do conjunto.

Trabalho previsto:

1. Criar estrutura do painel com componentes e estilos próprios, sem carregar Three.js nem os efeitos pesados do site.
2. Extrair a apresentação atual das vagas/candidaturas para as novas áreas, mantendo edição, requisitos, capas e PDF privado.
3. Criar consultas autenticadas de contagem e agrupamento por data; pesquisa e paginação no servidor. Não descarregar todas as candidaturas para calcular o dashboard no navegador.
4. Definir timezone de apresentação `Europe/Lisbon`, guardar instantes de forma consistente e aplicar os mesmos limites de período nos totais e nas listas.
5. Desenhar estados de carregamento, vazio, erro, sessão expirada e ausência de resultados. Nunca usar exemplos como fallback na aplicação real.

**Critério de conclusão:** contagens coincidem com os registos reais e filtros; editar/desativar vagas e descarregar PDFs continuam a funcionar; testes em desktop e mobile, temas e teclado; sem perda de dados e sem alterações ao fluxo público de candidatura.

### Fase 2 — acompanhamento da seleção

Introduzir etapas: Recebida → Triagem → Entrevista → Proposta → Contratado. “Não selecionado” é um desfecho alternativo; prever também desistência/arquivo na implementação, com motivo. O fluxo orienta o trabalho e permite correções humanas, sem rejeição automática.

Trabalho previsto:

1. Adicionar etapa, responsável e datas relevantes à candidatura; criar registos próprios para notas, tarefas e eventos.
2. Atualizar etapa e respetivo evento numa única transação. Validar etapa, utilizador e permissão no servidor. Evitar que duas alterações simultâneas apaguem trabalho, com controlo de versão e aviso de conflito.
3. Disponibilizar funil/lista, alteração por seletor e arrastar, atribuição de responsável, notas internas e próxima ação com prazo.
4. Guardar autor, instante, estado anterior/novo e motivo quando aplicável no histórico; não expor este conteúdo na API pública.
5. Definir funções antes de abrir acesso: administrador gere utilizadores/configurações; recrutador gere os processos autorizados; avaliador consulta apenas os processos atribuídos e regista a avaliação. Cada operação deve ser autorizada no servidor.

**Migração:** preservar IDs, contactos, snapshots da vaga e referências aos PDFs. As candidaturas antigas entram num estado inicial explicitamente indicado como “Por rever · importada do painel anterior”, sem presumir triagem, entrevista ou contratação. Registar a migração na data real; não inventar eventos retroativos. Testar com uma cópia da base e verificar contagens antes/depois. Manter recuperação através de backup e mudanças aditivas.

**Critério de conclusão:** etapa, responsável, notas e tarefa persistem após recarregar; movimentos aparecem no histórico; alterações concorrentes e acessos indevidos são tratados; registos anteriores mantêm PDFs acessíveis.

### Fase 3 — entrevistas e colaboração

Adicionar agenda interna, entrevistas ligadas à candidatura, participantes, roteiro de avaliação e lembretes. Usar critérios relacionados com a função, comentários objetivos e decisão humana.

Modelos de resposta podem começar como rascunhos copiáveis. Integrações de calendário e email exigem configuração própria; não serão consideradas disponíveis pelo simples desenho da agenda. Qualquer envio futuro deve ter pré-visualização de destinatários, assunto e mensagem, ação explícita do recrutador e registo do resultado. Não enviar mensagens nesta proposta.

**Critério de conclusão:** criar/reagendar/cancelar entrevista, apresentar fuso horário, restringir avaliações e distinguir mensagem preparada de mensagem efetivamente enviada. Falhas de envio não podem aparecer como sucesso.

### Fase 4 — banco de talentos e análise

Adicionar perfis reutilizáveis, competências confirmadas pelo recrutador, disponibilidade, pesquisa e controlo de conservação. Um banco de talentos exige finalidade e autorização próprias; a aceitação da política para uma candidatura não deve ser automaticamente tratada como autorização ilimitada para usos futuros.

Depois de existir histórico suficiente, calcular conversão entre etapas, tempo de resposta e tempo de processo. Mostrar a janela e o tamanho da amostra; distinguir candidaturas de pessoas e vagas. Se um dado não existe, mostrar “Sem dados suficientes”.

**Critério de conclusão:** duplicados sujeitos a revisão; conservação e eliminação aplicadas a ficheiros e registos associados; indicadores reproduzíveis a partir dos eventos disponíveis.

## Definições dos indicadores

| Indicador | Regra | Disponibilidade |
| --- | --- | --- |
| Vagas ativas | Total atual com `ativa = true`; o rótulo indica que é global, independente do período | Fase 1 |
| Candidaturas recebidas | Entradas pela data de receção no intervalo e vaga escolhidos | Fase 1 |
| Gráfico de entradas | As mesmas entradas, agrupadas em intervalos não sobrepostos; clicar aplica esse intervalo à lista | Fase 1 |
| Por analisar | Etapa atual Recebida ou Triagem entre as candidaturas recebidas no período/vaga selecionados | Fase 2 |
| Em entrevista | Etapa atual Entrevista na mesma população filtrada | Fase 2 |
| Distribuição por etapas | Fotografia atual das etapas das candidaturas recebidas no período; não representa conversões históricas | Fase 2 |
| Próximas ações | Tarefas pendentes por prazo e responsável; âmbito próprio, explicitamente rotulado | Fase 2 |
| Tempo de processo/conversão | Calculado com eventos reais desde a introdução do histórico, sem atribuir tempos aos processos antigos | Fase 4 |

No desenho, os filtros de período e vaga afetam os indicadores de candidaturas e o gráfico. As próximas ações são exemplos fixos de organização e não seguem esse filtro; a implementação deve indicar claramente o seu âmbito. As contagens laterais são totais gerais. O funil de seleção apresenta uma distribuição por etapas, sem presumir que todas as pessoas passaram por todas elas.

## Modelo técnico proposto

Não implementado nesta entrega:

- Evolução aditiva de `candidaturas`: etapa, responsável, versão de edição e datas de atualização; notas, eventos e tarefas em tabelas relacionadas. A vaga de origem e respetivos snapshots continuam preservados.
- Endpoints autenticados para estatísticas, pesquisa paginada, detalhes, transições, notas e tarefas. Não misturar dados internos com `/api/vagas`, que é público.
- Entrevistas e avaliações como entidades separadas na fase 3. Candidato reutilizável e finalidades de conservação como evolução posterior.
- PDF continua fora do diretório público, com sessão e autorização a cada descarga. Não incluir o ficheiro em listas ou estatísticas.
- Acesso por função e âmbito em cada operação, não apenas em botões escondidos. Notas e currículo devem ser acessíveis apenas a quem precisa deles.
- Arquivar/fechar um processo não elimina o PDF. Eliminar dados é uma operação distinta, com apresentação do alcance e cumprimento da política definida para ficheiros, registos e backups.
- Eventos de auditoria permitem acompanhar operações; não duplicar o texto integral de notas ou dados pessoais em logs gerais.

## Verificação e passagem a implementação

O desenho foi aprovado e a fase 1 passou à implementação. A referência operacional está em [implementacao-fase-1.md](implementacao-fase-1.md). As fases seguintes acrescentam capacidades à base já implementada.

A implementação terá verificações de autenticação/permissões, validação da API e migração, contagens e filtros, PDFs e persistência. No navegador: desktop 1440×840 e mobile 390×844, teclado, foco/restauro ao fechar a ficha, contraste, movimento reduzido, estados vazio/erro e sessão expirada. Emails, calendários e serviços externos ficam fora da primeira fase.

A aprovação visual não significa que o funil, as notas, a agenda ou os indicadores simulados já estejam implementados no painel real.
