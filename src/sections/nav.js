import { logo } from "../brand/logo";
import "./nav.css";
export const nav = () =>
  `<header class="nav"><a class="nav__marca" href="#inicio" aria-label="Vextech — início">${logo()}</a><button class="nav__toggle" aria-expanded="false" aria-controls="navegacao" aria-label="Abrir menu"><span></span><span></span></button><nav id="navegacao" aria-label="Principal"><a class="pilula" href="#solucoes">Soluções</a><a class="pilula" href="#vextech">Vextech</a><a class="pilula" href="#contacto">Contacto <span aria-hidden="true">→</span></a></nav></header>`;
