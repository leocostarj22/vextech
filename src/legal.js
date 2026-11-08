import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/legal.css";
import "./styles/marca-interativa.css";
import "./sections/contato.css";
import { nav } from "./sections/nav";
import { wordmark } from "./brand/logo";
import { redesSociais } from "./sections/redes";
import { linksLegais } from "./sections/links-legais";
import { iniciarTema, ligarBotaoTema } from "./theme";
import { ligarMenu } from "./motion/menu";
import { revelarMarca } from "./motion/revelar-marca";

iniciarTema();
const caminho = location.pathname.replace(/\/?$/, "/");
document.querySelector("#legal-cabecalho").innerHTML = nav({
  paginaLegal: true,
});
document.querySelector("#legal-rodape").innerHTML =
  `<footer class="contato legal-footer" aria-label="Vextech — contactos e informação legal"><div class="legal-footer__topo"><a href="/#contacto">Vamos falar de tecnologia →</a>${redesSociais()}</div><a class="contato__marca marca-interativa" href="/#inicio" aria-label="Vextech — página inicial"><span class="contato__marca-base marca-interativa__base" aria-hidden="true">${wordmark}</span><span class="contato__marca-revelada marca-interativa__revelada" aria-hidden="true">${wordmark}</span></a><div class="contato__rodape"><span>Vextech · Porto · Lisboa</span>${linksLegais(caminho)}<a href="#conteudo-legal">Voltar ao topo ↑</a></div></footer>`;
ligarBotaoTema();
ligarMenu(null);
revelarMarca(
  document.querySelector(".contato__marca"),
  matchMedia("(prefers-reduced-motion: reduce)").matches,
);
window.__vextechAbertura?.pronto();
