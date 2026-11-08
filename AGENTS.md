# Vextech — guia do projeto

Site experimental da Vextech, baseado na demo Margem. O utilizador aprovou testar a direção visual 01 antes de decidir se a mantém. A referência está em docs/proposta-visual-01.md.

- Vite, JavaScript, Three.js, GSAP e Lenis, sem framework.
- Conteúdo em português de Portugal. Três serviços: consultoria especializada, projetos chave-na-mão e nearshore. Não inventar métricas, clientes, equipa ou testemunhos.
- Vagas em Carreiras vêm da API própria em server/ (Node/Express + MySQL), não de texto fixo no site; o admin insere-as pelo painel em /admin, não editando código. As duas vagas atuais (Java Developer no Porto, PHP Developer em Braga) foram copiadas do site real vextech.pt — só os campos lá publicados (título, localização, requisitos); nunca inventar contrato, descrição ou benefícios que não estejam na fonte. Sem VITE_API_URL definida, a secção mostra só a candidatura espontânea. Por agora corre só em local (Docker + server/), à espera da aprovação do CEO antes de ligar ao VPS/domínio já existentes. Ver README.md, secção "Vagas e painel de administração".
- Cores em src/styles/tokens.css: #11111f, #68d2df e branco. As superfícies seguem o tema claro (predefinido) ou escuro; o fundo e o nevoeiro Three.js acompanham --imersao-fundo também ao alternar de tema.
- Logótipos originais em SVG em src/brand/vextech-*.svg, convertidos dos vetores PDF enviados pelo utilizador. Nunca redesenhar o wordmark com uma fonte.
- Tipografia editorial, linhas finas, espaço generoso, sem grelhas de cartões ou decoração neon.
- Exceção aprovada para Carreiras: cards com imagens ilustrativas, cores da marca e movimento ligado ao scroll. Na home, apenas as duas vagas ativas mais recentes; todas as vagas e requisitos completos em `/pt/vagas/`. Não adicionar vagas de demonstração como fallback. Respeitar movimento reduzido e manter candidatura espontânea quando a API não estiver disponível.
- Túnel leve: texturas partilhadas, renderização quando necessário, pixel ratio máximo 2. Mobile com texto dos destaques abaixo da imagem. Respeitar prefers-reduced-motion.
- Imagens em public/media são ilustrativas, recebidas no pacote da marca; não representam projetos de clientes nem equipa real. Ver docs/media.md.
- Contacto em modo de demonstração até existir destino de envio confirmado; não simular uma mensagem enviada.
- Validar com npm run build e npm test. Conferir desktop 1440×840 e mobile 390×844.
- Cada tarefa já decorre num ambiente isolado. Usar o checkout existente, sem criar Git worktrees salvo pedido explícito.

## Versão anterior

A demo Margem está preservada na tag margem-demo-v1, commit 77ba3a4c178cbc8180e0d10be9b42e3f3348d862. Não fazer reset destrutivo para regressar: consultar README.md e preservar trabalho local.

- Revelação da marca no hero e no rodapé: preservar o SVG original e a máscara que segue o cursor. Teclado revela a marca completa; toque e movimento reduzido usam apresentação estática.

- Tema escuro atual: degradê de azuis com base #10111e. O canvas transparente deixa passar o fundo CSS; as fotos desvanecem com a distância por opacidade para evitar retângulos de cor sólida sobre o degradê.
