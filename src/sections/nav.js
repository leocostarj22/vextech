import { redesSociais } from "./redes";
import { logo } from "../brand/logo";
import { casos } from "../data/casos";
import "./nav.css";

export const nav = ({ paginaLegal = false } = {}) => {
  const raiz = paginaLegal ? import.meta.env.BASE_URL : "";
  return `
<header class="nav">
  <div class="nav__fundo" aria-hidden="true" hidden></div>
  <a class="nav__marca" href="${raiz}#inicio" aria-label="Vextech — início">${logo()}</a>
  <div class="nav__acoes">
    <button type="button" class="nav__tema" data-tema-toggle aria-label="Mudar para versão escura"></button>
    <button type="button" class="nav__toggle" aria-expanded="false" aria-controls="navegacao" aria-label="Abrir menu"><span></span><span></span></button>
  </div>
  <nav id="navegacao" class="nav__painel" aria-label="Principal" data-lenis-prevent hidden>
    <div class="nav__links">
      <a class="nav__link" href="${raiz}#inicio">Início</a>
      <a class="nav__link" href="${raiz}#vextech">A Vextech</a>
      <div class="nav__solucoes">
        <div class="nav__linha">
          <a class="nav__link" href="${raiz}#solucoes">Soluções</a>
          <button type="button" class="nav__expandir" aria-expanded="false" aria-controls="menu-solucoes" aria-label="Expandir soluções"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg></button>
        </div>
        <div id="menu-solucoes" class="nav__submenu" hidden>
          ${casos.map((c, i) => (paginaLegal ? `<a class="nav__sub-link" href="${raiz}?solucao=${c.foto}#solucoes">${c.nome}<span aria-hidden="true">→</span></a>` : `<button type="button" data-menu-solucao="${i}">${c.nome}<span aria-hidden="true">→</span></button>`)).join("")}
        </div>
      </div>
      <a class="nav__link" href="${raiz}#metodo">Como trabalhamos</a>
      <a class="nav__link" href="${raiz}#carreiras">Carreiras</a>
      <a class="nav__link" href="${raiz}#contacto">Contacto</a>
    </div>
    <div class="nav__rodape"><p>Tecnologia com visão.<br>Pessoas que fazem acontecer.</p><span>Porto · Lisboa</span>${redesSociais()}<span class="nav__assinatura">Visionary Engineering Experts</span></div>
  </nav>
</header>`;
};
