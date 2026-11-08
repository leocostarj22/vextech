export function ligarFormulario({ lenis = null, atualizarLayout = () => {} } = {}) {
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
    atualizarLayout();
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
    atualizarLayout();
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

  return abrirContacto;
}
