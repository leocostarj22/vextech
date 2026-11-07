import { redes } from "../data/redes";
import "./redes.css";

export const redesSociais = () =>
  `<ul class="redes" aria-label="Redes sociais da Vextech">${redes.map((rede) => `<li><a href="${rede.url}" target="_blank" rel="noopener noreferrer" aria-label="${rede.nome} da Vextech (abre num novo separador)" title="${rede.nome}"><img src="${rede.imagem}" alt="" width="28" height="28" loading="lazy" decoding="async"></a></li>`).join("")}</ul>`;
