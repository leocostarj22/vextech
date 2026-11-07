import { redes } from "../data/redes";
import "./redes.css";

export const redesSociais = () =>
  `<ul class="redes" aria-label="Redes sociais da Vextech">${redes.map((rede) => `<li><a href="${rede.url}" target="_blank" rel="noopener noreferrer" aria-label="${rede.nome} da Vextech (abre num novo separador)">${rede.nome}<span aria-hidden="true">→</span></a></li>`).join("")}</ul>`;
