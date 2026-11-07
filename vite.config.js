import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { paginasLegais } from "./src/data/legal.js";

const pagina = (caminho) => fileURLToPath(new URL(caminho, import.meta.url));
const normalizarPaginasLegais = (servidor) => {
  servidor.middlewares.use((pedido, resposta, seguinte) => {
    const url = new URL(pedido.url, "http://localhost");
    if (paginasLegais.some(({ caminho }) => caminho === `${url.pathname}/`)) {
      resposta.writeHead(308, { Location: `${url.pathname}/${url.search}` });
      resposta.end();
      return;
    }
    seguinte();
  });
};
export default defineConfig({
  appType: "mpa",
  plugins: [{
    name: "enderecos-legais",
    configureServer: normalizarPaginasLegais,
    configurePreviewServer: normalizarPaginasLegais,
  }],
  build: {
    rolldownOptions: {
      input: {
        inicio: pagina("./index.html"),
        termos: pagina("./pt/termos-e-condicoes/index.html"),
        privacidade: pagina("./pt/politica-de-privacidade/index.html"),
        cookies: pagina("./pt/politica-de-cookies/index.html"),
      },
    },
  },
});
