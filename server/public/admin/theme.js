(() => {
  const sistema = matchMedia("(prefers-color-scheme: dark)");
  let escolha;
  try {
    escolha = localStorage.getItem("vextech-admin-tema");
  } catch {}
  const valido = (v) => ["light", "dark"].includes(v);
  const aplicar = () => {
    const tema = valido(escolha) ? escolha : sistema.matches ? "dark" : "light";
    document.documentElement.dataset.theme = tema;
    const b = document.getElementById("theme-toggle");
    if (!b) return;
    b.setAttribute(
      "aria-label",
      `Ativar tema ${tema === "light" ? "escuro" : "claro"}`,
    );
    b.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${tema === "light" ? '<path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/>' : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'}</svg>`;
  };
  aplicar();
  sistema.addEventListener("change", aplicar);
  document.addEventListener("DOMContentLoaded", () => {
    aplicar();
    document.getElementById("theme-toggle")?.addEventListener("click", () => {
      escolha =
        document.documentElement.dataset.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem("vextech-admin-tema", escolha);
      } catch {}
      aplicar();
    });
  });
})();
