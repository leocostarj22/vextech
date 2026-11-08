# Abertura Vextech

A abertura usa os SVG originais da marca em duas camadas: uma base discreta e a camada azul `#68d2df`, revelada por uma máscara radial em movimento. O monograma, o wordmark e a assinatura ficam centrados no ecrã. A passagem para o site termina com a marca azul completa e um desvanecimento curto. Não há contagem nem percentagem artificial de carregamento.

O plugin `build/abertura.js` insere a marca, o CSS crítico de `src/styles/abertura.css` e o script clássico `src/abertura/boot.js` no HTML das seis páginas públicas. Assim, a abertura e o CSS que esconde o link de salto existem antes de o JavaScript principal ou as fontes chegarem. O painel administrativo da API não é alterado. Os ficheiros HTML de origem não precisam de duplicar o desenho do loading.

O tema inicial é escolhido nesta ordem: URL `?tema=claro|escuro`, escolha válida guardada em `vextech-tema` e preferência do sistema. A abertura e `src/theme.js` aplicam a mesma prioridade. O fundo claro usa `#f2f4f3`; o escuro usa os azuis existentes com base `#10111e`. O site mantém a escolha ao desaparecer a abertura.

A home regista a promessa de carregamento das texturas Three.js e sinaliza prontidão depois de ligar as interações. Fontes e texturas são aguardadas antes da saída. A API de vagas continua independente do arranque da home. Listagem e detalhe de vagas sinalizam prontidão após a sua consulta; páginas legais fazem-no após renderizar o cabeçalho e o rodapé. Uma falha ou demora de recursos tem um limite de seis segundos para libertar o conteúdo. Se o módulo da página não arrancar, fica disponível uma mensagem com ligação para atualizar a página.

No modo normal existe um mínimo de 850 ms para tornar a abertura legível, seguido pela conclusão azul e saída de 560 ms. Com `prefers-reduced-motion: reduce`, não há varrimento, transições nem demora mínima. O conteúdo fica temporariamente `inert` dentro de `#conteudo-site`, sem capturar o foco nem deslocar a página para o início. O wrapper usa `display: contents` para preservar o layout. Restauros pela cache de navegação libertam imediatamente a abertura. As ligações diretas às soluções só abrem o diálogo depois da saída.

O link de salto não foi eliminado: permanece escondido por CSS crítico até receber `:focus-visible`, evitando o flash do texto no canto no reload. Sem JavaScript, a abertura não aparece, o conteúdo não fica `inert` e as páginas legais continuam legíveis e navegáveis.

Os testes de `tests/abertura.spec.js` atrasam o módulo principal para verificar o primeiro paint, os dois temas, prioridades, centro da marca, teclado, movimento reduzido, recuperação de falhas e leitura legal sem JavaScript. A mesma transformação é aplicada no desenvolvimento e no build estático.
