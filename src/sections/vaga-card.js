import "./vaga-card.css";
import { capaVaga } from "../data/capas-vagas";

const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function vagaCard(vaga, index, { completa = false } = {}) {
  const requisitos = completa ? vaga.requisitos : vaga.requisitos.slice(0, 3);
  return `<li class="carreiras__vaga">
    <article class="vaga-card ${index % 2 ? "vaga-card--azul" : ""}">
      <div class="vaga-card__imagem" aria-hidden="true"><img src="${escapar(capaVaga(vaga))}" alt="" loading="lazy" width="800" height="450"><span class="vaga-card__numero">${String(index + 1).padStart(2, "0")}</span><span class="vaga-card__assinatura">VEXTECH / CARREIRAS</span></div>
      <div class="vaga-card__conteudo">
        <p class="vaga-card__local"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M16 8c0 4-6 10-6 10S4 12 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg>${escapar(vaga.localizacao)}</p>
        <h3>${escapar(vaga.titulo)}</h3>
        ${requisitos.length ? `<ul class="vaga-card__requisitos">${requisitos.map((r) => `<li>${escapar(r)}</li>`).join("")}</ul>` : ""}
        ${!completa && vaga.requisitos.length > requisitos.length ? `<a class="vaga-card__mais" href="/pt/vagas/">Ver todos os requisitos →</a>` : ""}
        <button type="button" class="carreiras__candidatar" data-contacto="Candidatura — ${escapar(vaga.titulo)}"><span>Candidata-te<span class="sr-only"> — ${escapar(vaga.titulo)}</span></span><span class="vaga-card__seta" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></span></button>
      </div>
    </article>
  </li>`;
}
