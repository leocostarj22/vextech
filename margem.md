# Margem — site de estúdio de marcas com túnel de projetos

## Antes de começar: pergunte

Antes de escrever qualquer código, faça estas perguntas, uma por vez e em linguagem simples (a pessoa pode não ser programadora):

1. **O que você quer fazer com este site?**
   - **Montar a demo como ela é**, para ver funcionando e trocar depois.
   - **Fazer o site do meu estúdio (ou da minha marca)** com esta estrutura e estas animações.
   - **Usar só algumas peças** (o túnel de trabalhos, o índice com a foto que segue o cursor ou outra seção) num site que já tenho.
2. Se for o seu estúdio: o nome, o que faz e para quem, e **que material já tem** (fotos dos trabalhos, logo, cores). Avise desde já que o túnel e os quatro cases mostram fotos de trabalhos de um estúdio inventado, geradas por IA: o site só vira o portfólio dela com fotos dos trabalhos dela (4 fotos de destaque em paisagem 3:2, com 1500 px de largura ou mais, e de preferência 20 a 28 fotos menores para as paredes do túnel). As receitas em `arquivos/receitas/LEIA.md` refazem as fotos de clima (o método, por exemplo), mas foto gerada não pode aparecer como trabalho de cliente. Sem fotos dela, o site roda com as da demo até ela mandar.
3. Se forem peças: quais, e onde está o site que vai recebê-las.

Depois, em qualquer caminho, **monte primeiro a demo completa como descrita abaixo** e confira que ela roda: é o caminho testado e fica de referência. Só então aplique a marca ou extraia as peças, seguindo a seção "Personalizar" do guia. Termine com uma lista curta do que ainda é da demo e do que falta a pessoa mandar.

## A demo

Construa o site de um estúdio de design de marcas. A peça principal é um **túnel de trabalhos em 3D**: o scroll leva a câmera para dentro de um corredor de fotos de projetos; quando ela se aproxima de um projeto em destaque, a foto sai da parede, cobre a tela e vira a abertura do case. O resto da página é calmo, tipográfico, off-white, com uma ideia de layout própria em cada seção (nada de grade de cards).

Leia o guia do projeto desta pasta antes de começar (`CLAUDE.md`, ou `AGENTS.md` no Codex e outros agentes): ele tem o design system, as regras de qualidade, como conferir o resultado e como personalizar. As fotos, o wordmark e a lista de peças estão em `arquivos/` (o que é cada foto está em `arquivos/trabalhos.md`).

---

## Parte A — o site

### A marca
- **Margem**, estúdio de design de marcas em Recife: seis pessoas numa casa no Poço da Panela, 41 projetos desde 2016. Tom calmo e concreto, frases curtas, sem jargão de agência.
- Paleta: fundo `#f2f0eb`, texto `#141414`, secundário `#5d5b56`, fios `#dcd8cf`, pílulas `#ffffff`. Acentos só em um detalhe por seção: terracota `#d9653b` e verde-mata `#2f4a3a`.
- Tipografia: **Geist** (Google Fonts) 400 e 500 em tudo. Nomes de cliente grandes com tracking negativo (−0,045em).
- Wordmark: `arquivos/margem.svg` (traço único de espessura constante; o "g" com cauda em esquadro, o segundo "m" mais largo). Use inline, com `stroke="currentColor"`. Proporção altura/largura 0,214.
- Nav fixa em todas as seções: wordmark pequeno (104 px de largura) no canto superior esquerdo; à direita três pílulas brancas separadas, 32 px de altura, 13 px: "Projetos" (→ índice), "Estúdio", "Contato". Hover da pílula: fundo `#141414`, texto off-white. A nav **some ao rolar para baixo** (depois de meia tela) e volta ao rolar para cima, com um véu off-white em gradiente atrás dela quando reaparece no meio da página; assim nunca cobre títulos, filtros ou notas.

### Seção 1 — Hero + túnel de trabalhos (a peça "uau")
A seção tem 100svh e fica presa (pin) por **11 alturas de tela** de scroll.

**O que aparece em cima do túnel no início:**
- No centro exato, a frase em duas linhas, 400, `clamp(24px, 2.9vw, 52px)`, entrelinha 1,12: "Marcas que ainda fazem sentido / daqui a dez anos." Atrás dela um halo radial na cor do fundo (para as fotos distantes não brigarem com o texto).
- Wordmark gigante embaixo à esquerda, 49vw de largura, encostado na margem.
- Em 13 px, na altura da base do wordmark: "Role para entrar" (começando em 53vw) e, à direita, "Recife · 41 projetos desde 2016". Os dois rótulos ficam numa pílula off-white a 82% com `backdrop-filter: blur(10px)`, para as fotos que passam perto não atrapalharem a leitura.
- Uma linha de progresso de 1 px no pé da tela que enche com o scroll do túnel.

**O túnel (Three.js, leve):**
- Canvas cobrindo a seção, fundo `#f2f0eb`, `Fog` da mesma cor de 9 a 44 unidades. Câmera perspectiva, fov 50 (fov 62 quando a tela é retrato, aspecto < 0,8), começa em z = 6 olhando para −z.
- **78 planos** (`PlaneGeometry` 1×1 escalado, `MeshBasicMaterial` transparente, `depthWrite: false`) com as 28 fotos de `arquivos/trabalhos/t01–t28.webp` (cada uma repetida em ângulos diferentes; a proporção vem de `arquivos/pecas.json`). Uma textura por arquivo, compartilhada.
- Posição do plano i (sorteio com semente fixa, para o túnel ser sempre o mesmo): ângulo `i × 2,39996` (ângulo de ouro) ± 0,25; raio 3,5 a 5,6; z distribuído de 3,5 até −96; altura 1,05 a 2,2. O túnel é elíptico: x × 1,45 e y × 1 no desktop; x × 0,72 e y × 1,55 em retrato. Os 10 primeiros planos fogem do canto inferior esquerdo (onde fica o wordmark).
- Cada plano inclina para o eixo, como parede de túnel: `rotation.x = sin(ângulo) × 0,28`, `rotation.y = −cos(ângulo) × 0,32`.
- Opacidade pela distância d até a câmera: `smoothstep(0,4; 2,2; d)` (somem suavemente antes de bater na lente).
- Profundidade de campo barata: viés de mipmap por plano no `texture2D` (via `onBeforeCompile`): perto (d < 6) `(6 − d) × 0,45`, longe (d > 22) `min(3, (d − 22) × 0,12)`. As fotos de longe e as que passam rente ficam macias, as do meio nítidas.
- Câmera suavizada (lerp 0,14 por quadro em direção ao z do scroll). O cursor desloca a câmera de leve: x ± 0,55, y ± 0,35 (lerp 0,06), olhando para `(x × 0,3, y × 0,3, z − 12)`. Só com ponteiro fino.
- Desenhar só quando algo muda (scroll, cursor, textura carregada), não num loop eterno.

**Os quatro destaques (o "abrir o case"):**
- Planos 6 × 4 com `arquivos/trabalhos/torra-alta.webp`, `sol.webp`, `restinga.webp`, `preamar.webp`, em z = −14, −33, −52, −71.
- Cada um começa **na parede**, como os outros (ângulo e raio próprios, escala 0,36, inclinado). Com o scroll, um valor `puxar` de 0 a 1 leva o plano para o centro (x = y = 0), escala 1 e sem inclinação (interpolação com smoothstep).
- A câmera encosta até a distância em que a foto **cobre a tela**: `0,94 × min(4 / (2·tan(fov/2)), 6 / (2·tan(fov/2)·aspecto))`. Em retrato a foto não cobre: fica inteira na largura com 5% de folga de cada lado (`6 / (0,9 × 2·tan(fov/2)·aspecto)`).
- Enquanto um destaque está puxado, o resto do túnel recua (opacidade × `1 − puxar × 0,88`) e o cursor quase não mexe (força × `1 − puxar × 0,92`), para a foto não descobrir a borda.
- A abertura do case aparece por cima da foto, em `#141414`, sobre uma névoa clara no terço de baixo (gradiente do off-white a 92% para transparente): "01 / 04" no alto à esquerda; embaixo à esquerda a linha "ano · disciplina · cidade" (13 px), o nome do cliente enorme (`clamp(56px, 8.4vw, 150px)`, 500, entrelinha 0,9) e um resumo de duas linhas; embaixo à direita a pílula preta "Abrir o case →". Os itens entram de baixo em sequência (24 px, 0,45, stagger 0,06). Em retrato o texto fica logo abaixo da foto, sem névoa.
- Depois de segurar, o texto sai, e a câmera **atravessa a foto** (vai até 0,6 atrás do plano, `power2.in`), que some nos últimos centímetros. O `puxar` volta a 0 quando ela já ficou para trás.

| # | Cliente | Ano | Disciplina | Cidade | Resumo |
|---|---|---|---|---|---|
| 1 | Torra Alta | 2024 | Identidade e embalagem | Garanhuns | Café de altitude do Agreste. Uma marca que empilha a serra em três meias-luas. |
| 2 | Sól | 2023 | Identidade visual | Olinda | Cerâmica feita a quatro mãos. O nome em relevo, sem tinta, como a argila pede. |
| 3 | Restinga | 2022 | Design editorial | Recife | Editora de livros de natureza. Capas em tecido verde e um galho de traço só. |
| 4 | Preamar | 2025 | Produto digital | Recife | Tábua de marés para quem surfa cedo. A curva da maré virou a interface. |

**A linha do tempo (uma timeline do GSAP com `scrub`, unidades relativas):**
1. Frase, wordmark e rótulos do hero sobem 30 px e somem (0,9).
2. Para cada destaque: viagem até 10 unidades antes dele (duração = distância / 9, linear) → `puxar` 0→1 e câmera até a distância de cobrir (1,3, `power2.inOut`) → texto do case entra → segura (1) → texto sai (0,3) → atravessa (0,9).
3. Depois do último: viagem até z = −88 e, no centro, "Quatro de 41." com a pílula preta "Ver todos os projetos" (→ índice).

### Seção 2 — Estúdio: manifesto com marginália
- Página de livro: coluna de texto à esquerda e uma **margem** estreita à direita (27% da largura), separada por um fio vertical de 1 px `#141414`.
- Rótulo "Estúdio" (13 px, cinza). Texto em `clamp(40px, 5.5vw, 92px)`, entrelinha 1,08, tracking −0,035em: "Somos seis pessoas numa casa no Poço da Panela. Desenhamos marcas para quem faz coisas com as [foto]: café, [foto], livro, cadeira, festa." As duas [foto] são fotos pequenas dentro da linha, no lugar das palavras "mãos" e "cerâmica" (2,5em × 0,82em, cantos 0,12em; use um recorte dos copos de `sol.webp` e o vaso `t24.webp`; a palavra fica para leitor de tela).
- Na margem, três notas (13–19 px) com um ponto antes: "desde 2016", "41 projetos", "9 cidades do Nordeste". Cada nota fica na altura de uma linha do texto ("pessoas", "Desenhamos", o ":" depois da primeira foto) e um **fio curvo de 1 px** sai do fim daquela linha até o ponto da nota (curva cúbica que desce um pouco e sobe). Os fios se desenham com o scroll (`stroke-dashoffset`) e a nota aparece quando o fio chega.
- As palavras do manifesto sobem e aparecem em sequência ao entrar na tela (45%, stagger 0,022).
- Embaixo do texto, seis bolinhas de 24 px nas cores da equipe (`#d9653b #2f4a3a #b9a888 #3a3a38 #cfc9bd #7d8467`), entrando com um pequeno salto.
- Celular: a margem vira uma lista abaixo do texto, sem fios.

### Seção 3 — Método: como uma marca nasce aqui
- Seção presa por 2,6 telas. Título "Como uma marca nasce aqui" (`clamp(32px, 3.3vw, 56px)`).
- Uma **tira de filme** com a mesma marca (a da Torra Alta: três meias-luas empilhadas, a de cima menor) em quatro estados, quadros 3:4 lado a lado, sem espaço entre eles: 1) `metodo-rascunho.webp` (lápis em papel manteiga); 2) **SVG em código**: a marca em verde-mata `#2f4a3a` sobre a grade de construção (linhas e círculos finos `#a9a49a`, fundo `#f7f5f0`); 3) `metodo-sistema.webp` (prancha do sistema); 4) `metodo-rua.webp` (o saco de café na prateleira).
- O scroll desliza a tira para a esquerda de forma que o quadro ativo passe pelo centro (sem deixar sobrar vazio nas pontas); os outros ficam com opacidade 0,72.
- Embaixo, uma régua: fio de 1 px que enche com o progresso, quatro marcas e os rótulos "01 Escuta", "02 Rascunho", "03 Sistema", "04 Rua" (o último alinhado à direita). A etapa ativa fica preta, com a marca mais alta e uma frase curta embaixo: "Antes de desenhar, três semanas ouvindo quem faz." / "Lápis até uma forma aguentar sozinha." / "Cor, letra e regra para a marca andar sem a gente." / "Prateleira, fachada, sacola: onde a marca trabalha."

### Seção 4 — Índice: todos os projetos
- Título "Todos os projetos" (`clamp(44px, 5.4vw, 92px)`, tracking −0,045em) e, à direita, pílulas de filtro: "Todos" (preta, ativa), "Identidade", "Embalagem", "Editorial", "Digital". Os filtros funcionam e mostram "N de 41 projetos" embaixo à direita.
- Tabela tipográfica de linhas com fio `#dcd8cf`: ano · cliente (`clamp(26px, 2.9vw, 46px)`) · disciplina · cidade, colunas 9% / 37% / resto / 15%.
- Hover (e foco pelo teclado): a linha inteira vira terracota `#d9653b` de borda a borda da página (a faixa cresce do centro, `scaleY`), texto branco, e **a foto do projeto segue o cursor** (retrato 4:5, ~19vw, girada ±5° ao acaso, sombra suave, 140 px à direita do cursor, `gsap.quickTo` 0,55 s). Sai da lista, a foto encolhe e some.
- Linhas (ano, cliente, disciplina, cidade, filtro, foto): 2025 Preamar, Produto digital, Recife, digital, preamar · 2025 Prato Raso, Produto digital, João Pessoa, digital, t18 · 2024 Torra Alta, Identidade e embalagem, Garanhuns, embalagem, torra-alta · 2024 Engenho Vau, Rótulo, Pombos, embalagem, t10 · 2024 Jandaíra, Embalagem, Mossoró, embalagem, t20 · 2023 Sól, Identidade visual, Olinda, identidade, sol · 2023 Cine Ladeira, Festival, Olinda, identidade, t28 · 2023 Âmbar Botica, Embalagem, Natal, embalagem, t05 · 2022 Restinga, Design editorial, Recife, editorial, restinga · 2022 Taipa, Identidade, Caruaru, identidade, t06 · 2022 Quadrante, Revista, Recife, editorial, t23 · 2021 Sururu, Restaurante, Maceió, identidade, t07 · 2021 Feira Aurora, Sinalização, Recife, identidade, t21 · 2020 Maré Mansa, Cartaz e programa, Recife, editorial, t17 · 2019 Casa Cajá, Identidade, Fortaleza, identidade, t25.
- Celular: sem foto flutuante; cada linha mostra ano, cliente grande, disciplina embaixo em cinza e uma miniatura quadrada de 64 px à direita.

### Seção 5 — Depoimento, contato e rodapé
- Uma frase de cliente no centro (`clamp(28px, 2.7vw, 46px)`, entrelinha 1,18, com halo na cor do fundo): "Eles passaram três semanas só ouvindo. A marca saiu em dez dias e nunca mais mexemos." e embaixo "Lúcia Amaral, Torra Alta".
- Em volta, 14 fotos de trabalhos **flutuando em profundidade** (eco do túnel): as "perto" maiores, nítidas e opacas; as "longe" pequenas, com `filter: blur` de até 6 px e opacidade 0,45. Cada uma anda com o scroll na proporção da sua profundidade (parallax de ±160 px × profundidade).
- Rodapé em três colunas: "Tem uma marca para desenhar?" com a pílula preta grande "Escrever para o estúdio" (mailto); "ola@margem.studio" e "Rua da Harmonia, Recife"; "Instagram", "Behance", "LinkedIn" (sublinhado que cresce no hover).
- Embaixo, o **wordmark de borda a borda** (largura da página menos as margens), subindo por baixo com o scroll.

### Movimento e acessibilidade
- Lenis para o scroll suave, ligado ao ticker do GSAP (`lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `lagSmoothing(0)`), com `anchors: true` para os links da nav.
- `prefers-reduced-motion: reduce`: sem Lenis, sem cursor, sem suavização da câmera e sem entradas animadas; o túnel continua respondendo ao scroll.
- Mobile tão cuidado quanto o desktop: o túnel em retrato com o case embaixo da foto, wordmark do hero de margem a margem com "Role para entrar" e a cidade numa linha acima dele, pílulas da nav com 30 px.

---

## Parte B — stack e organização

- **Vite sem framework**: HTML, CSS e JS puros. Dependências pelo npm com versão exata: `three`, `gsap` (com ScrollTrigger), `lenis`, e `vite` como dev. `npm run dev` na porta padrão; `npm run build` gera `dist/` estático.
- Copie `arquivos/trabalhos/*.webp` para `public/trabalhos/`, `arquivos/margem.svg` para `src/brand/` (importe com `?raw` para usar inline) e `arquivos/favicon.svg` para `public/`. `arquivos/pecas.json` vira `src/data/pecas.json`.
- Organização: `src/styles/tokens.css` (todas as cores, fontes, tamanhos e margens em variáveis CSS) e `base.css`; uma seção por arquivo em `src/sections/` (cada uma exporta o HTML e importa o próprio CSS); motion em módulos próprios em `src/motion/` (`cena.js` para o Three, `percurso.js` para a timeline do túnel, um módulo por seção, `suave.js` para o Lenis); dados em `src/data/` (casos, projetos, peças).
- **Ordem de inicialização:** criar os pins (túnel e método) antes do Lenis, ou chamar `lenis.resize()` depois. Se o Lenis nascer antes do pin, ele guarda a altura antiga e a página trava no meio. Rode `ScrollTrigger.refresh()` quando as fontes carregarem.
- Valores que dependem da tela (distância do destaque, fim do pin) como funções, com `invalidateOnRefresh: true`.
- Pixel ratio do renderer limitado a 2. Imagens fora do túnel com `loading="lazy"`.
- No fim, confira com prints de tela (ver o guia do projeto) e passe pelo checklist de aceitação de lá.
