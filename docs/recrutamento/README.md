# Proposta do painel de recrutamento Vextech

Desenho interativo aprovado e plano por fases. A [fase 1 já está implementada no painel real](implementacao-fase-1.md); este protótipo continua independente e ilustrativo.

## Abrir

Depois de atualizar o repositório, abrir `docs/recrutamento/prototipo.html` no navegador (duplo clique). O ficheiro inclui fonte, SVG originais e ícones; funciona offline e não precisa de API, login ou base de dados.

Também é possível servir a pasta a partir da raiz do projeto:

```sh
python3 -m http.server 4290 --directory docs/recrutamento
```

Abrir `http://localhost:4290/prototipo.html`.

## Explorar

1. Trocar claro/escuro no ícone do cabeçalho.
2. Alterar período e vaga na visão geral; clicar num indicador ou coluna do gráfico.
3. Em Candidaturas, alternar Funil/Lista, pesquisar e filtrar por etapa ou responsável.
4. Abrir um perfil; experimentar mudar a etapa, registar uma nota e consultar o histórico. Em desktop também é possível arrastar entre colunas.
5. Abrir Vagas para antecipar a gestão de oportunidades.
6. Usar “Desenho e planeamento” para consultar as fases dentro da proposta.

Perfis, números, competências, etapas e tarefas são fictícios e estão identificados como ilustrativos. Nenhum currículo está incluído. Todas as alterações desaparecem ao atualizar a página; apenas o tema é guardado numa chave própria do protótipo. Não há pedidos à API nem envios externos.

## Desenhos e planeamento

- [Plano completo e dependências](plano.md)
- [Visão geral — claro](dashboard-claro.png)
- [Visão geral — escuro](dashboard-escuro.png)
- [Funil de candidaturas](candidaturas-funil.png)
- [Ficha lateral](ficha-candidatura.png)
- [Visão geral — mobile](mobile-claro.png)
- [Ficha — mobile](mobile-ficha.png)

As imagens mostram estados do protótipo, não dados do serviço de recrutamento.

## Validação desta entrega

Verificado em Chromium com Playwright: 1440×840 e 390×844, temas, períodos, vagas, etapas, pesquisa, indicadores, gráfico, funil/lista, mudança por arrastar e por seletor, ficha, notas com texto escapado, histórico, editor em memória, reposição após reload e renderização do documento em modo offline. A navegação `file://` é bloqueada pelo Chromium gerido deste ambiente; foi verificado o conteúdo autónomo em contexto sem rede e a abertura por servidor local. Sem erros de JavaScript, sem pedidos à API e sem overflow horizontal da página; o funil/tabelas têm scroll interno quando necessário.

O protótipo demonstra a direção visual das fases 1 e 2; agenda, funções e banco de talentos estão marcados como planeados. Não substitui o painel de `/admin` nem foi acrescentado ao build público.

Verificação do projeto existente nesta entrega: `npm run build` concluído e `npm test` com 54 testes aprovados e 6 ignorados pelas condições já existentes da suite.
