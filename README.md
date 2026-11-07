# Margem — demo

Site demonstrativo de um estúdio fictício, feito com Vite, JavaScript, Three.js, GSAP e Lenis. As imagens, os clientes e o depoimento são fictícios. A adaptação para a Vextech ainda não foi feita.

## Desenvolvimento

Requer Node.js 22.12+ (validado com Node 24).

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

```sh
npm run build
npm run preview -- --host 0.0.0.0
npm test
```

Os testes usam Chromium em `/usr/bin/chromium`; defina `CHROMIUM_PATH` para outro executável. Em máquinas sem Chromium, execute `npx playwright install chromium` e retire a configuração `executablePath` ou indique o caminho instalado.

Dados em `src/data/`, secções em `src/sections/`, animações em `src/motion/`, tokens em `src/styles/tokens.css`. Materiais originais em `arquivos/`.

Os 15 projetos fornecidos aparecem no índice; 41 é o total fictício referido pelo briefing. Os cases abrem um painel demonstrativo. Links sociais apontam para as páginas gerais das plataformas até existirem perfis reais.
