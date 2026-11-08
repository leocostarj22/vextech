import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { paginasLegais } from "./src/data/legal.js";

const pagina = (caminho) => fileURLToPath(new URL(caminho, import.meta.url));
const normalizarPaginasLegais = (servidor) => {
  servidor.middlewares.use((pedido, resposta, seguinte) => {
    const url = new URL(pedido.url, "http://localhost");
    if ([...paginasLegais.map(({ caminho }) => caminho), "/pt/vagas/"].includes(`${url.pathname}/`)) {
      resposta.writeHead(308, { Location: `${url.pathname}/${url.search}` });
      resposta.end();
      return;
    }
    seguinte();
  });
};
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const destino = env.API_PROXY_TARGET?.trim() || env.VITE_API_URL?.trim() || "http://127.0.0.1:3001";
  const proxy = { "/api/vagas": { target: destino, changeOrigin: true } };
  return {
  appType: "mpa",
  server: { proxy },
  preview: { proxy },
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
        vagas: pagina("./pt/vagas/index.html"),
      },
    },
  },
  };
});
