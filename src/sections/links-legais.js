import { paginasLegais } from "../data/legal";
import "./links-legais.css";

export const linksLegais = (atual = "") =>
  `<nav class="links-legais" aria-label="Informação legal">${paginasLegais.map((pagina) => `<a href="${pagina.caminho}"${atual === pagina.caminho ? ' aria-current="page"' : ""}>${pagina.titulo}</a>`).join("")}</nav>`;
