# Receitas: como as fotos da Margem foram feitas

Todas as fotos do site (os quatro cases, as 28 peças das paredes do túnel e as fotos do método) foram geradas por IA para um estúdio inventado, a partir destes prompts. Não há vídeo nem 3D: o túnel é feito em código (Three.js) com essas fotos.

**Antes de tudo:** num site de estúdio, as fotos são o portfólio. Se o site vai ser do seu estúdio, os cases, o índice e o túnel precisam das fotos dos **seus** trabalhos. Foto gerada por IA não pode aparecer como trabalho de cliente. Use estas receitas para:
- as fotos de processo e de clima (o rascunho e a prancha do método, peças soltas do túnel que não sejam apresentadas como case);
- um rascunho do site enquanto as fotos reais não chegam;
- refazer a série inteira numa direção de arte nova, se você quiser outro clima para a demo.

Os prompts estão em inglês porque os geradores entendem melhor.

## Do que você precisa

- **Um gerador de imagem**: ChatGPT (imagens), Gemini, Midjourney ou outro. Se ele aceitar imagem de referência, anexe uma das fotos já feitas para a série manter a mesma luz.
- Custo: nos planos pagos dos geradores de imagem, as 13 imagens cabem na cota normal; por API, cada imagem sai por alguns centavos de dólar.
- Para cortar e converter: `ffmpeg` e `cwebp` (a IA do seu editor instala).

## Passo a passo

1. **Estilo** (`_estilo.txt`). É o parágrafo de direção de arte que vai no fim de todos os prompts: luz natural, parede off-white, concreto, madeira clara, paleta terracota e verde-mata, marcas geométricas de arcos e meias-luas. Reescreva se as cores ou o clima do seu estúdio forem outros, e cole a versão nova no lugar do bloco STYLE de cada prompt. Troque também a cidade, se quiser.
2. **Destaques** (`destaque-torra-alta`, `destaque-sol`, `destaque-restinga`, `destaque-preamar`). Uma foto grande por case, paisagem 1536 × 1024. Cada prompt descreve o produto do cliente inventado (sacos de café, caixa de cerâmica, livros, app). No seu caso, prefira a foto real do trabalho; se gerar, use só para rascunho.
3. **Folhas das paredes do túnel** (`folha-1` a `folha-7`). Cada imagem é uma folha 2 × 2 com quatro fotos diferentes, que viram as peças `t01` a `t28` (a ordem é alto-esquerda, alto-direita, baixo-esquerda, baixo-direita). Troque as quatro descrições (TOP-LEFT, TOP-RIGHT...) pelo que fizer sentido para o seu estúdio.
4. **Método** (`metodo-rascunho`, `metodo-sistema`). Retrato 1024 × 1536: o rascunho a lápis e a prancha do sistema da marca do primeiro case. A quarta foto do método (`metodo-rua`) não tem prompt: é um recorte do primeiro destaque.
5. **Cortar e converter**. Ponha as imagens numa pasta `imagens/` na raiz do projeto, com os nomes dos prompts (`folha-1.png`, `destaque-sol.png`, `metodo-rascunho.png`...) e rode `node arquivos/fonte/cortar.mjs imagens`. O script corta as folhas em 28 peças com proporções alternadas (3:2, 1:1, 4:5), converte tudo para WebP em `public/trabalhos/` e regrava `src/data/pecas.json` com as medidas. O recorte de `metodo-rua` foi medido na foto da demo: com outro destaque, ajuste o `crop` no fim do script. Se trocar o nome de um case, troque também o slug na lista de destaques do script.

## Usando as fotos dos seus trabalhos

Não precisa de script: converta para WebP e respeite o formato de cada vaga.
- **Destaques**: paisagem 3:2, 1500 px de largura ou mais. A foto cobre a tela inteira.
- **Paredes do túnel**: de 12 a 28 fotos com 700 a 800 px no lado maior, misturando 3:2, 1:1 e 4:5. Atualize `src/data/pecas.json` (`id`, `src`, `w`, `h`) com as medidas reais.
- **Método**: três fotos verticais, cerca de 1000 × 1500 (o quadro corta para 3:4).
- **Índice**: uma foto por projeto, com o assunto no meio (aparece cortada em retrato 4:5).

Fotos claras combinam com o fundo off-white e a névoa do túnel. Se as suas forem escuras, troque a cor de fundo do site e a do túnel juntas (o guia diz onde).
