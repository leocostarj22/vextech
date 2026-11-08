import { ligarMenu } from "./motion/menu";
import { revelarMarca } from "./motion/revelar-marca";
import "./styles/marca-interativa.css";
import { iniciarTema, ligarBotaoTema } from "./theme";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./sections/dialog.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nav } from "./sections/nav";
import { tunel } from "./sections/tunel";
import { estudio } from "./sections/estudio";
import { metodo } from "./sections/metodo";
import { indice } from "./sections/indice";
import { carreiras } from "./sections/carreiras";
import { contato } from "./sections/contato";
import { criarCena } from "./motion/cena";
import { animarTunel } from "./motion/percurso";
import { animarEstudio } from "./motion/estudio";
import { animarMetodo } from "./motion/metodo";
import { animarIndice } from "./motion/indice";
import { animarContato } from "./motion/contato";
import { animarCarreiras } from "./motion/carreiras";
import { scrollSuave } from "./motion/suave";
import { casos } from "./data/casos";

iniciarTema();
gsap.registerPlugin(ScrollTrigger);
const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelector("#app").innerHTML =
  nav() +
  `<main>${tunel() + estudio() + indice() + metodo() + carreiras()}</main>` +
  contato() +
  `<dialog class="detalhe" aria-labelledby="detalhe-titulo" data-lenis-prevent><button class="pilula detalhe__fechar" aria-label="Fechar solução">Fechar ×</button><div class="detalhe__conteudo"></div></dialog>`;

try {
  const cena = criarCena(document.querySelector(".tunel__canvas"), reduzido);
  animarTunel(cena, reduzido);
} catch (error) {
  console.warn("WebGL indisponível; apresentação estática ativada.", error);
  document.querySelector(".tunel").classList.add("tunel--fallback");
  const fallback = document.createElement("div");
  fallback.className = "fallback-cases";
  fallback.innerHTML = casos
    .map(
      (c, i) =>
        `<article><img src="${c.src}" alt="Imagem ilustrativa de ${c.nome.toLowerCase()}"><h2>${c.nome}</h2><p>${c.resumo}</p><button class="pilula pilula--ciano" data-abrir="${i}">Conhecer a solução →</button></article>`,
    )
    .join("");
  document.querySelector(".tunel").after(fallback);
}
ligarBotaoTema();
animarMetodo();
animarEstudio(reduzido);
animarIndice(reduzido);
animarContato(reduzido);
animarCarreiras();
revelarMarca(document.querySelector(".tunel__marca"), reduzido);
const lenis = scrollSuave(reduzido);
const header = document.querySelector(".nav");
ligarMenu(lenis, abrirSolucao);
let lastY = scrollY;
function atualizarNav() {
  const y = scrollY;
  header.classList.toggle(
    "nav--oculta",
    y > innerHeight * 0.5 && y > lastY + 1,
  );
  lastY = y;
  const section = [...document.querySelectorAll("[data-theme]")].find((s) => {
    const r = s.getBoundingClientRect();
    return r.top <= 80 && r.bottom > 80;
  });
  header.classList.toggle("nav--clara", section?.dataset.theme === "light");
  header.classList.toggle(
    "nav--escura",
    section?.dataset.theme === "dark" && y > innerHeight * 0.5,
  );
}
window.addEventListener("scroll", atualizarNav, { passive: true });
atualizarNav();

const dialog = document.querySelector("dialog");
function abrirSolucao(index) {
  const c = casos[index];
  document.querySelector(".detalhe__conteudo").innerHTML =
    `<img src="${c.src}" style="object-position:${c.posicao || "center"}" alt="Imagem ilustrativa de ${c.nome.toLowerCase()}"><div><p class="rotulo">0${index + 1} / 0${casos.length} — ${c.categoria}</p><h2 id="detalhe-titulo">${c.nome}</h2><p class="detalhe__descricao">${c.detalhe}</p><ul class="detalhe__pontos">${c.pontos.map((p) => `<li>${p}</li>`).join("")}</ul><button class="pilula pilula--ciano" data-interesse="${index}">Falar sobre esta solução →</button></div>`;
  dialog.scrollTop = 0;
  dialog.showModal();
  lenis?.stop();
  dialog.querySelector("[data-interesse]").addEventListener("click", () => {
    dialog.close();
    abrirContacto(c.nome);
  });
}
document
  .querySelectorAll("[data-abrir]")
  .forEach((b) =>
    b.addEventListener("click", () => abrirSolucao(Number(b.dataset.abrir))),
  );
document
  .querySelector(".detalhe__fechar")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  const r = dialog.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () => lenis?.start());

const formPanel = document.querySelector("#contacto-formulario"),
  form = formPanel.querySelector("form"),
  formToggle = document.querySelector("[data-formulario]");
function abrirContacto(assunto) {
  formPanel.hidden = false;
  formToggle.setAttribute("aria-expanded", "true");
  if (assunto) {
    const opcoes = [...form.elements.assunto.options].map((o) => o.value);
    if (opcoes.includes(assunto)) {
      form.elements.assunto.value = assunto;
    } else {
      form.elements.assunto.value = "Candidatura espontânea";
      form.elements.mensagem.value =
        `Tenho interesse nesta vaga: ${assunto.replace(/^Candidatura — /, "")}.`;
    }
  }
  ScrollTrigger.refresh();
  lenis?.resize();
  const top = formPanel.getBoundingClientRect().top + scrollY - 100;
  if (lenis) lenis.scrollTo(top, { immediate: true });
  else window.scrollTo({ top, behavior: "instant" });
  form.elements.nome.focus({ preventScroll: true });
}
formToggle.addEventListener("click", () => {
  if (formPanel.hidden) abrirContacto();
  else fecharContacto();
});
function fecharContacto() {
  formPanel.hidden = true;
  formToggle.setAttribute("aria-expanded", "false");
  ScrollTrigger.refresh();
  lenis?.resize();
  formToggle.focus();
}
formPanel
  .querySelector(".form__fechar")
  .addEventListener("click", fecharContacto);
document.addEventListener("click", (e) => {
  const botao = e.target.closest("[data-contacto]");
  if (botao) abrirContacto(botao.dataset.contacto);
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.querySelector(".form__resultado").textContent =
    `Obrigado, ${form.elements.nome.value.trim()}. O formulário foi testado. A mensagem não foi enviada: esta versão é uma demonstração.`;
});

function atualizarLayout() {
  ScrollTrigger.refresh();
  lenis?.resize();
  atualizarNav();
}
document.fonts.ready.then(atualizarLayout);
const pedido = new URLSearchParams(location.search).get("solucao");
const index = casos.findIndex((c) => c.foto === pedido);
if (index >= 0) abrirSolucao(index);
window.addEventListener("load", atualizarLayout);
