# Guia do projeto — Margem

(Salve como `CLAUDE.md` na raiz do projeto se você usa o Claude Code, ou como `AGENTS.md` se usa o Codex, o Cursor ou outro agente. O conteúdo é o mesmo.)

Site de um estúdio de design de marcas (Margem, Recife). Página única em Vite sem framework, com um túnel de trabalhos em Three.js preso ao scroll. O prompt descreve cada seção; este arquivo guarda as regras que valem para o projeto inteiro.

## Design system
- Cores (sempre pelas variáveis de `src/styles/tokens.css`, nunca hex solto no CSS das seções):
  - `--fundo #f2f0eb` · `--tinta #141414` · `--tinta-2 #5d5b56` · `--fio #dcd8cf` · `--pilula #ffffff`
  - acentos `--terracota #d9653b` e `--mata #2f4a3a`: no máximo um detalhe por seção. A cor do site vem das fotos.
- Tipo: Geist 400/500 (Google Fonts). Escala: micro 12 px, UI 13 px, corpo 15 px, frase do hero `clamp(24px, 2.9vw, 52px)`, títulos de seção 44–92 px com tracking negativo, nome de cliente até 150 px.
- Margem lateral: `clamp(16px, 2.6vw, 40px)`; no celular, 16 px.
- Pílulas: altura 32 px, raio total, 13 px 500. Branca na nav e nos filtros; preta (`.pilula--tinta`) para ação.
- Fios de 1 px. Sem sombras, exceto a foto que segue o cursor no índice. Sem cards, sem ícones de banco, sem gradiente decorativo.
- Wordmark só pelo SVG de `src/brand/margem.svg` (não redesenhar com fonte).

## Regras de qualidade
- Uma ideia de layout por seção: túnel, página com margem anotada, tira de filme, índice tipográfico, céu de fotos. Se uma seção virar grade de cards, refaça.
- Textos em português do Brasil, curtos e concretos. Não invente números além dos que estão no prompt (6 pessoas, 41 projetos, desde 2016, 9 cidades).
- O túnel precisa ser leve: planos simples, uma textura por arquivo, render só quando algo muda, pixel ratio ≤ 2. Nada de pós-processamento.
- Mobile não é versão reduzida: confira cada seção a 390 px de largura.
- `prefers-reduced-motion` respeitado em todos os módulos de motion.
- HTML semântico: `header`, `main`, `section` com `aria-labelledby`, `footer`; botões de filtro com `aria-pressed`; imagens decorativas com `alt=""`.

## Como conferir
- `npm run dev` e role a página inteira em desktop (1440 × 840) e celular (390 × 844).
- Se o Playwright estiver disponível, tire prints em pontos do scroll: hero, um destaque saindo da parede, um case aberto, o estúdio com os fios desenhados, o método no meio da tira, o índice com hover, o rodapé.
- `npm run build` precisa passar sem erro.

## Checklist de aceitação
- No primeiro quadro, a frase está no centro, legível, sem foto atrás dela; o wordmark ocupa metade da largura embaixo à esquerda; há fotos grandes nas bordas e pequenas e desbotadas no fundo do túnel.
- Rolando, a frase e o wordmark somem e a câmera anda para dentro; as fotos passam pelas bordas e somem antes de bater na lente.
- Antes de cada case, a foto em destaque está na parede como as outras e vai para o centro; parada, ela cobre a tela inteira sem mostrar borda nem fundo, mesmo mexendo o mouse.
- Com o case aberto aparecem "0N / 04", ano · disciplina · cidade, o nome do cliente enorme, o resumo e "Abrir o case →", legíveis sobre a foto.
- A câmera atravessa a foto e o túnel continua; depois do quarto case aparece "Quatro de 41." e "Ver todos os projetos".
- No celular, o case mostra a foto inteira na largura e o texto logo abaixo dela, sem fotos do túnel por cima do texto.
- No Estúdio, cada nota da margem está ligada por um fio curvo ao fim de uma linha do texto, e nenhum fio corta palavras.
- No Método, a tira desliza com o scroll e a régua marca a etapa do quadro do centro, com a frase dela embaixo.
- No Índice, o hover pinta a linha de terracota de ponta a ponta e a foto do projeto segue o cursor; os filtros escondem linhas e atualizam "N de 41 projetos".
- Rolando para baixo, a nav some e não cobre nenhum título, filtro ou nota; rolando para cima, ela volta com um véu claro atrás.
- "Role para entrar" e "Recife · 41 projetos desde 2016" ficam legíveis mesmo com foto passando atrás.
- No rodapé, o wordmark vai de margem a margem e o "g" mostra a cauda inteira.
- Com redução de movimento ligada no sistema, nada se move sozinho e a página continua inteira e navegável.

## Personalizar

O site chega como a demo da Margem, um estúdio inventado, com um portfólio de trabalhos inventados (fotos geradas por IA). Esta seção vale sempre que a pessoa pedir uma mudança, hoje ou daqui a meses: trocar a marca, um texto, uma foto, um case, ou levar uma seção para outro site.

### Antes de mexer
- Se ainda não sabe o objetivo, pergunte qual destes é (uma pergunta por vez, em linguagem simples):
  1. **Ver a demo funcionando** como está, para trocar depois.
  2. **O site do meu estúdio (ou da minha marca)**, com esta estrutura e estas animações.
  3. **Só algumas peças** (uma animação ou seção) para um site que já existe.
- Para o caminho 2, pergunte o que ainda não sabe: nome, o que o estúdio faz e para quem, quantas pessoas, desde quando, quantos projetos, os quatro cases de destaque (cliente, ano, disciplina, cidade, resumo), a lista de projetos do índice, um depoimento real, contato e redes, logo e cores, e **que fotos de trabalhos a pessoa já tem**. Não peça tudo de uma vez.
- Para o caminho 3, pergunte quais peças e onde fica o site de destino. Leia o código do destino antes: se for React, Next ou outro framework, adapte o módulo de `src/motion/` (o túnel é `cena.js` + `percurso.js`) ao framework em vez de colar o HTML desta página.
- Diga com clareza o que muda só com texto e o que depende de material novo (tabela abaixo). O túnel, os cases, o índice e o céu do rodapé são feitos das fotos de trabalhos: o site só vira o portfólio da pessoa com as fotos dos trabalhos dela. Foto gerada por IA nunca entra como trabalho de cliente.

### O que muda e onde
| o quê | onde | precisa de material novo? |
|---|---|---|
| Frase do hero, "Recife · 41 projetos desde 2016", "Quatro de 41." | `src/sections/tunel.js` | não |
| Os quatro cases do túnel (cliente, ano, disciplina, cidade, resumo, foto, lugar na parede) | `casos` em `src/data/casos.js`; o "0N / 04" acompanha o tamanho da lista | fotos dos cases |
| Manifesto, notas da margem e cores da equipe | `src/sections/estudio.js` (as palavras com `data-ancora` são as que ganham fio; as duas fotos dentro da linha vêm de `foto(...)`) | não |
| Etapas do método (nomes e frases) | lista no topo de `src/sections/metodo.js`; o quadro 2 é o SVG da marca em código, no mesmo arquivo | fotos, se o método mudar |
| Índice de projetos e filtros | `projetos` e `filtros` em `src/data/projetos.js`; "de 41 projetos" em `src/sections/indice.js` | uma foto por projeto |
| Depoimento, contato, endereço, redes | `src/sections/contato.js` | não |
| Fotos que flutuam atrás do depoimento | `flutuantes` em `src/sections/contato.js` (`src`, posição, largura e profundidade) | não |
| Fotos das paredes do túnel | `public/trabalhos/t01.webp` a `t28.webp` + `src/data/pecas.json` (`id`, `src`, `w`, `h`); o túnel usa 78 planos e repete as fotos (`N` em `src/motion/cena.js`) | sim: fotos dos trabalhos |
| Cores | `src/styles/tokens.css` (`--fundo`, `--tinta`, `--terracota`, `--mata`...); o túnel tem a cor do fundo repetida em `FUNDO` (`src/motion/cena.js`), usada no fundo e no `Fog` | não |
| Fonte | link do Google Fonts no `index.html` + `--fonte` em `tokens.css` | não |
| Wordmark (nav, hero gigante, rodapé de borda a borda) | `src/brand/margem.svg`, importado com `?raw` em `nav.js`, `tunel.js` e `contato.js`; a altura do hero no celular usa a proporção 0,214 em `src/sections/tunel.css` | o logo da pessoa em SVG |
| Título e descrição da página | `<title>` e `<meta name="description">` no `index.html`; o `preload` da primeira foto também | não |
| Tirar uma seção | tire a seção da linha `innerHTML` e do import em `src/main.js`, e a chamada `animar...` dela no mesmo arquivo; o túnel e o método são pins, então rode a página inteira depois | não |

### Material da pessoa
Para cada peça visual, ofereça estes caminhos, do mais simples para o mais trabalhoso, e deixe a pessoa escolher:
1. **Manter as fotos da demo por enquanto** e trocar o resto. O site fica pronto hoje, mas como vitrine de teste: não publique o portfólio inventado como se fosse do estúdio dela, e ponha isso na lista do fim.
2. **Usar as fotos dos trabalhos dela** (o caminho certo para este site). O que cada vaga espera:
   - **Destaques do túnel** (os 4 cases): paisagem **3:2**, 1500 px de largura ou mais (os da demo têm 1536 × 1024). A foto cobre a tela inteira, então precisa de resolução e de nada importante colado nas bordas.
   - **Paredes do túnel** (`t01`–`t28`): de 12 a 28 fotos, com 700 a 800 px no lado maior, misturando 3:2, 1:1 e 4:5 (como na demo); depois de trocar, atualize `w` e `h` em `pecas.json` com as medidas reais de cada arquivo.
   - **Método**: três fotos verticais (a demo usa 1000 × 1500; o quadro corta para 3:4).
   - **Índice**: uma foto por projeto; aparece em retrato 4:5 seguindo o cursor (corte central), então o assunto precisa estar no meio.
   - Converta tudo para WebP. Foto que não serve (escura, de celular torta, com moldura ou com texto de apresentação por cima) quebra o clima calmo do túnel: diga isso e proponha refazer a foto.
   - A luz e o fundo claros da demo combinam com o `Fog` off-white do túnel. Se as fotos dela forem escuras, troque `--fundo` e `FUNDO` em `cena.js` juntos.
3. **Gerar com IA** seguindo `arquivos/receitas/LEIA.md`: são os prompts das fotos da demo, num estilo comum (`_estilo.txt`). Servem para as fotos de processo e de clima (método, céu do rodapé) e para um rascunho do site antes das fotos reais chegarem. Nunca para inventar trabalho de cliente.
4. O site não tem versão sem fotos: o túnel é feito delas. Movimento reduzido mantém o túnel respondendo ao scroll.

### Regras ao trocar
- As regras de qualidade acima continuam valendo: uma ideia de layout por seção, nada de grade de cards, a foto do destaque cobre a tela sem mostrar borda.
- Wordmark novo: SVG com `stroke` ou `fill` em `currentColor`, sem texto vivo (converter para contorno), largo e baixo. Se a proporção altura/largura não for 0,214, ajuste o cálculo de `.tunel__dica, .tunel__local` em `tunel.css` e confira o hero no celular e o rodapé de borda a borda.
- Mudou o número de cases? A profundidade de cada um fica em `PROF_DESTAQUES` (`src/motion/cena.js`: −14, −33, −52, −71, com o túnel indo até `Z_FIM` −96); acrescente ou tire uma profundidade por case, e reescreva a frase "Quatro de 41." em `tunel.js`. O "0N / 04" se ajusta sozinho.
- Nada de número, cliente, depoimento ou cidade inventado como se fosse do estúdio: o que a pessoa não informou fica marcado como `[preencher]` e entra na lista do fim.
- Depois de cada troca, rode o "Como conferir" e o "Checklist de aceitação" de novo nos trechos que mudaram, e no fim liste para a pessoa o que ficou da demo (fotos, textos, wordmark) e o que falta ela mandar.
