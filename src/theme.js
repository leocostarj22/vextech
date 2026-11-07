const key = "vextech-tema";
const root = document.documentElement;
const icones = {
  escuro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/></svg>',
  claro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>',
};

function aplicarTema(tema, guardar = false) {
  root.dataset.tema = tema === "escuro" ? "escuro" : "claro";
  if (guardar) {
    try {
      localStorage.setItem(key, root.dataset.tema);
    } catch {
      /* Preferência local opcional. */
    }
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      getComputedStyle(root).getPropertyValue("--imersao-fundo").trim(),
    );
  window.dispatchEvent(new Event("vextech:tema"));
}

export function iniciarTema() {
  let guardado;
  try {
    guardado = localStorage.getItem(key);
  } catch {
    /* A versão clara continua disponível sem armazenamento. */
  }
  const pedido = new URLSearchParams(location.search).get("tema");
  aplicarTema(
    ["claro", "escuro"].includes(pedido) ? pedido : guardado || "claro",
  );
}

export function ligarBotaoTema() {
  const botao = document.querySelector("[data-tema-toggle]");
  function atualizar() {
    const proximo = root.dataset.tema === "claro" ? "escuro" : "claro";
    botao.innerHTML = icones[proximo];
    botao.setAttribute(
      "aria-label",
      `Mudar para versão ${proximo === "escuro" ? "escura" : "clara"}`,
    );
    botao.title = botao.getAttribute("aria-label");
  }
  botao.addEventListener("click", () => {
    aplicarTema(root.dataset.tema === "claro" ? "escuro" : "claro", true);
    atualizar();
  });
  atualizar();
}
