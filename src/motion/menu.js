export function ligarMenu(lenis, abrirSolucao) {
  const header = document.querySelector(".nav");
  const toggle = header.querySelector(".nav__toggle");
  const painel = header.querySelector("#navegacao");
  const fundo = header.querySelector(".nav__fundo");
  const expandir = header.querySelector(".nav__expandir");
  const solucoes = header.querySelector("#menu-solucoes");
  const conteudo = [
    document.querySelector("main"),
    document.querySelector("footer"),
  ];
  let inertes = [];

  function fecharMenu(devolverFoco = false) {
    if (!header.classList.contains("is-open")) return;
    header.classList.remove("is-open");
    document.documentElement.classList.remove("menu-aberto");
    painel.hidden = fundo.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    expandir.setAttribute("aria-expanded", "false");
    expandir.setAttribute("aria-label", "Expandir soluções");
    solucoes.hidden = true;
    conteudo.forEach((el, i) => {
      el.inert = inertes[i];
    });
    lenis?.start();
    if (devolverFoco) toggle.focus({ preventScroll: true });
  }

  function abrirMenu() {
    inertes = conteudo.map((el) => el.inert);
    conteudo.forEach((el) => {
      el.inert = true;
    });
    painel.hidden = fundo.hidden = false;
    painel.scrollTop = 0;
    header.classList.add("is-open");
    document.documentElement.classList.add("menu-aberto");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    lenis?.stop();
    painel.querySelector("a").focus({ preventScroll: true });
  }

  toggle.addEventListener("click", () => {
    if (header.classList.contains("is-open")) fecharMenu(true);
    else abrirMenu();
  });
  fundo.addEventListener("click", () => fecharMenu(true));
  header
    .querySelectorAll("a")
    .forEach((link) =>
      link.addEventListener("click", () =>
        fecharMenu(link.target === "_blank"),
      ),
    );
  expandir.addEventListener("click", () => {
    const abrir = solucoes.hidden;
    solucoes.hidden = !abrir;
    expandir.setAttribute("aria-expanded", String(abrir));
    expandir.setAttribute(
      "aria-label",
      abrir ? "Recolher soluções" : "Expandir soluções",
    );
  });
  header.querySelectorAll("[data-menu-solucao]").forEach((botao) => {
    botao.addEventListener("click", () => {
      fecharMenu(true);
      abrirSolucao(Number(botao.dataset.menuSolucao));
    });
  });
  document.addEventListener("keydown", (evento) => {
    if (!header.classList.contains("is-open")) return;
    if (evento.key === "Escape") {
      evento.preventDefault();
      fecharMenu(true);
    } else if (evento.key === "Tab") {
      const alvos = [
        ...header.querySelectorAll("a[href],button:not([disabled])"),
      ].filter((el) => el.getClientRects().length);
      const primeiro = alvos[0],
        ultimo = alvos[alvos.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
  });
}
