// Este ficheiro é inserido como script clássico no HTML pelo plugin do Vite.
(() => {
  const root = document.documentElement;
  const validos = ["claro", "escuro"];
  const pedido = new URLSearchParams(location.search).get("tema");
  let guardado;
  try { guardado = localStorage.getItem("vextech-tema"); } catch { /* Preferência opcional. */ }
  const sistema = matchMedia("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
  root.dataset.tema = validos.includes(pedido) ? pedido : validos.includes(guardado) ? guardado : sistema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", root.dataset.tema === "escuro" ? "#10111e" : "#f2f4f3");
  root.classList.add("is-loading");
  const inicio = performance.now();
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const recursos = [];
  let moduloDisponivel = false, inicializado = false, aFechar = false, concluida = false, libertar;
  const terminada = new Promise((resolve) => { libertar = resolve; });

  function limpar() {
    if (concluida) return;
    concluida = true;
    clearTimeout(limite);
    document.querySelector("#abertura")?.remove();
    root.classList.remove("is-loading");
    const conteudo = document.querySelector("#conteudo-site");
    if (conteudo) conteudo.inert = false;
    libertar();
  }
  function fechar(imediato = false) {
    if (aFechar || concluida) return;
    aFechar = true;
    clearTimeout(limite);
    const ecra = document.querySelector("#abertura");
    if (!moduloDisponivel) {
      const aviso = document.querySelector("#abertura-falha");
      if (aviso) aviso.hidden = false;
    }
    if (imediato || reduzido || !ecra) { limpar(); return; }
    ecra.classList.add("abertura--pronta");
    setTimeout(() => {
      ecra.classList.add("abertura--sair");
      setTimeout(limpar, 420);
    }, 140);
  }
  // Recursos lentos ou um módulo indisponível nunca deixam o site bloqueado.
  const limite = setTimeout(() => fechar(true), 6000);
  window.__vextechAbertura = {
    terminada,
    iniciado() { moduloDisponivel = true; },
    aguardar(promessa) { if (!inicializado && !aFechar) recursos.push(Promise.resolve(promessa)); },
    pronto() {
      if (inicializado || aFechar || concluida) return;
      moduloDisponivel = true;
      inicializado = true;
      requestAnimationFrame(() => {
        Promise.allSettled([document.fonts.ready, ...recursos]).then(() => {
          const restante = reduzido ? 0 : Math.max(0, 850 - (performance.now() - inicio));
          setTimeout(() => requestAnimationFrame(() => fechar()), restante);
        });
      });
    },
  };
  window.addEventListener("pageshow", (evento) => { if (evento.persisted) limpar(); });
})();
