# Vextech — guia do projeto

Site experimental da Vextech, baseado na demo Margem. O utilizador aprovou testar a direção visual 01 antes de decidir se a mantém. A referência está em docs/proposta-visual-01.md.

- Vite, JavaScript, Three.js, GSAP e Lenis, sem framework.
- Conteúdo em português de Portugal. Três serviços: consultoria especializada, projetos chave-na-mão e nearshore. Não inventar métricas, clientes, equipa, testemunhos ou vagas atuais.
- Cores em src/styles/tokens.css: #11111f, #68d2df e branco. O fundo Three.js acompanha o token escuro do túnel.
- Logótipos originais em SVG em src/brand/vextech-*.svg, convertidos dos vetores PDF enviados pelo utilizador. Nunca redesenhar o wordmark com uma fonte.
- Tipografia editorial, linhas finas, espaço generoso, sem grelhas de cartões ou decoração neon.
- Túnel leve: texturas partilhadas, renderização quando necessário, pixel ratio máximo 2. Mobile com texto dos destaques abaixo da imagem. Respeitar prefers-reduced-motion.
- Imagens em public/media são ilustrativas, recebidas no pacote da marca; não representam projetos de clientes nem equipa real. Ver docs/media.md.
- Contacto em modo de demonstração até existir destino de envio confirmado; não simular uma mensagem enviada.
- Validar com npm run build e npm test. Conferir desktop 1440×840 e mobile 390×844.
- Cada tarefa já decorre num ambiente isolado. Usar o checkout existente, sem criar Git worktrees salvo pedido explícito.

## Versão anterior

A demo Margem está preservada na tag margem-demo-v1, commit 77ba3a4c178cbc8180e0d10be9b42e3f3348d862. Não fazer reset destrutivo para regressar: consultar README.md e preservar trabalho local.
