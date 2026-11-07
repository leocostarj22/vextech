const key = "vextech-tema";
const root = document.documentElement;

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
      root.dataset.tema === "escuro" ? "#11111f" : "#f2f4f3",
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
    botao.textContent = proximo === "escuro" ? "Escuro" : "Claro";
    botao.setAttribute(
      "aria-label",
      `Mudar para versão ${proximo === "escuro" ? "escura" : "clara"}`,
    );
  }
  botao.addEventListener("click", () => {
    aplicarTema(root.dataset.tema === "claro" ? "escuro" : "claro", true);
    atualizar();
  });
  atualizar();
}
