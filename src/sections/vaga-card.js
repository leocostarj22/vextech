import "./vaga-card.css";
import { capaVaga } from "../data/capas-vagas";
import { urlVaga } from "../data/vagas";

const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function vagaCard(vaga, index) {
  const requisitos = vaga.requisitos.slice(0, 3);
  const href = escapar(urlVaga(vaga.id));
  return `<li class="carreiras__vaga">
    <article class="vaga-card ${index % 2 ? "vaga-card--azul" : ""}">
      <div class="vaga-card__imagem" aria-hidden="true"><img src="${escapar(capaVaga(vaga))}" alt="" loading="lazy" width="800" height="450"><span class="vaga-card__numero">${String(index + 1).padStart(2, "0")}</span><span class="vaga-card__assinatura">VEXTECH / CARREIRAS</span></div>
      <div class="vaga-card__conteudo">
        <p class="vaga-card__local"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M16 8c0 4-6 10-6 10S4 12 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg>${escapar(vaga.localizacao)}</p>
        <h3><a href="${href}">${escapar(vaga.titulo)}</a></h3>
        ${requisitos.length ? `<ul class="vaga-card__requisitos">${requisitos.map((r) => `<li>${escapar(r)}</li>`).join("")}</ul>` : ""}
        <a class="carreiras__candidatar" href="${href}"><span>Ver vaga<span class="sr-only"> — ${escapar(vaga.titulo)}</span></span><span class="vaga-card__seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></span></a>
      </div>
    </article>
  </li>`;
}
