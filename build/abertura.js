import { readFileSync } from "node:fs";

export function abertura() {
  return {
    name: "vextech-abertura",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        // Apenas as páginas públicas; o painel da API tem o seu próprio arranque.
        if (!html.includes('src="/src/')) return html;
        const ler = (caminho) => readFileSync(new URL(caminho, import.meta.url), "utf8");
        const css = ler("../src/styles/abertura.css");
        const boot = ler("../src/abertura/boot.js");
        const icone = ler("../src/brand/vextech-icon.svg");
        const nome = ler("../src/brand/vextech-wordmark.svg");
        const marca = `<span class="abertura__icone">${icone}</span><span class="abertura__nome">${nome}</span>`;
        const ecra = `<div id="abertura" class="abertura" role="status" aria-label="A carregar Vextech" data-lenis-prevent><div class="abertura__centro"><div class="abertura__marca" aria-hidden="true"><div class="abertura__camada abertura__base">${marca}</div><div class="abertura__camada abertura__revelada">${marca}</div></div><p class="abertura__assinatura" aria-hidden="true">Visionary Engineering Experts</p><span class="abertura__linha" aria-hidden="true"></span></div></div>`;
        const falha = `<div id="abertura-falha" class="abertura-falha" hidden role="alert"><p>Não foi possível concluir o carregamento.</p><a href="">Atualizar a página →</a></div>`;
        return html
          .replace("</head>", `<style id="abertura-estilos">${css}</style><script>${boot}</script></head>`)
          .replace(/(<body\b[^>]*>)/, `$1${ecra}<div id="conteudo-site"><script>document.currentScript.parentElement.inert = document.documentElement.classList.contains("is-loading");</script>${falha}`)
          .replace("</body>", "</div></body>");
      },
    },
  };
}
