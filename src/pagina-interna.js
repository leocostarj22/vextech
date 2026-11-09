import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/vagas.css";
import "./styles/marca-interativa.css";
import { nav } from "./sections/nav";
import { contato } from "./sections/contato";
import { iniciarTema, ligarBotaoTema } from "./theme";
import { ligarMenu } from "./motion/menu";
import { ligarFormulario } from "./motion/formulario";
import { revelarMarca } from "./motion/revelar-marca";

export function iniciarPaginaInterna() {
  window.__vextechAbertura?.iniciado();
  iniciarTema();
  document.querySelector("#vagas-cabecalho").innerHTML = nav({ paginaLegal: true });
  document.querySelector("#vagas-rodape").innerHTML = contato();
  document.querySelector(".contato__marca").href = `${import.meta.env.BASE_URL}#inicio`;
  document.querySelector(".contato__rodape > a").href = `${import.meta.env.BASE_URL}#inicio`;
  document.querySelector(".contato__carreiras").href = `${import.meta.env.BASE_URL}pt/vagas/`;
  ligarBotaoTema();
  ligarMenu(null);
  ligarFormulario();
  revelarMarca(document.querySelector(".contato__marca"), matchMedia("(prefers-reduced-motion: reduce)").matches);
}
