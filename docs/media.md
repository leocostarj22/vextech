# Imagens da pré-visualização

As quatro imagens em public/media foram fornecidas pelo utilizador em package_watermark_frn71x16.zip, pasta demo-images. São imagens ilustrativas, não fotografias da equipa, dos clientes ou de projetos da Vextech.

| Ficheiro local | Original | Conteúdo |
|---|---|---|
| robot.jpg | 1.jpg | detalhe de robô |
| equipa.jpg | 2.jpg | reunião de profissionais |
| conexoes.jpg | 3.jpg | mapa noturno |
| infraestrutura.jpg | 4.jpg | servidores |

O pacote atribui a primeira a Possessed Photography: https://unsplash.com/@possessedphotography. Não inclui atribuição individual das restantes. Antes da publicação, confirmar os direitos destas imagens ou substituir por uma seleção de banco com licença documentada. Os bancos externos não estavam acessíveis pela política de rede durante esta implementação.

Os SVGs Vextech foram exportados das versões vetoriais PDF fornecidas pelo utilizador; apenas o preenchimento preto foi trocado por currentColor para acompanhar o contexto claro ou escuro. Não se redesenhou o logótipo.

Vídeo não foi adicionado nesta versão; mantém-se a renderização do túnel com fotografias para controlar peso e desempenho.

## Consultoria especializada

A imagem `public/media/consultoria.png` foi fornecida pelo utilizador em `consultoria.zip` (1672 × 941 px). Foi copiada sem alterações. Substitui a imagem da solução no destaque 3D, no detalhe, no hover do índice e nas paredes do túnel. A fotografia anterior `equipa.jpg` continua apenas na etapa Entender do método. As proporções do novo original são preservadas no plano 3D e no posicionamento do texto em telemóvel.

## Soluções e método — imagens.zip

Cinco fotografias fornecidas pelo utilizador em `imagens.zip`, copiadas sem alterações:

| Original no ZIP | Ficheiro local | Utilização |
|---|---|---|
| nearshore.jpg | public/media/nearshore.jpg | Nearshore: túnel, detalhe, índice e paredes |
| chave na mao2.jpg | public/media/chave-na-mao.jpg | Projetos chave-na-mão: túnel, detalhe, índice e paredes |
| entender.jpg | public/media/entender.jpg | Método: Entender |
| construir.jpg | public/media/construir.jpg | Método: Construir e paredes do túnel |
| evoluir.jpg | public/media/evoluir.jpg | Método: Evoluir |

As proporções originais das soluções constam dos dados e são respeitadas pelo Three.js. Os quadros do método mantêm o recorte responsivo da tira de filme. Os ficheiros anteriores continuam no histórico e nos materiais recebidos; a fotografia de Consultoria permanece inalterada.

## Padronização do enquadramento

A apresentação usa agora uma proporção comum de 16:9, definida em `--imagem-aspecto` nos tokens e lida também pelo Three.js. As paredes do túnel têm as mesmas dimensões físicas; a perspetiva continua a criar profundidade. O método, o detalhe e a pré-visualização do índice usam o mesmo formato, com recorte proporcional (`cover` / coordenadas UV) sem esticar as fotografias. Os originais e as suas resoluções permanecem inalterados. Os destaques em desktop continuam a cobrir o ecrã, e no telemóvel a área de texto acompanha a altura do enquadramento.

## Ícones das redes sociais

As imagens de LinkedIn e Instagram em `public/media/redes/` foram fornecidas em `sociais.zip` e copiadas sem alterações. São apresentadas com a mesma dimensão visual, preservando a proporção, nos links do menu e do rodapé. Os nomes acessíveis e os destinos dos perfis são mantidos.

## Capas das vagas — vagas.zip

Os três originais foram copiados sem alterações para `public/media/vagas/`: `java.png` e `php.png` (1672 × 941 px), e `default.jpg` (6000 × 3375 px). Sem capa personalizada, o título identifica Java ou PHP; os outros títulos usam a imagem predefinida. A escolha não depende da posição da vaga na lista. Uma capa enviada no painel tem prioridade e uma imagem indisponível volta à predefinida. O enquadramento mantém 16:9 com recorte proporcional.

As capas posteriormente enviadas no painel são validadas e normalizadas no backend (PNG/JPG, até 5 MB e 32 megapíxeis, orientação corrigida e metadados removidos). Os ficheiros recebem nomes aleatórios e são guardados fora do Git, em `server/uploads/vagas` ou no diretório `UPLOADS_DIR`.
