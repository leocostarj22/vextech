import { paginasLegais } from "../data/legal";
import "./links-legais.css";

export const linksLegais = (atual = "") =>
  `<nav class="links-legais" aria-label="Informação legal">${paginasLegais.map((pagina) => {
    const href = `${import.meta.env.BASE_URL}${pagina.caminho.replace(/^\//, "")}`;
    return `<a href="${href}"${atual === href ? ' aria-current="page"' : ""}>${pagina.titulo}</a>`;
  }).join("")}</nav>`;
