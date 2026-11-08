const sessaoResposta = await fetch("/api/auth/sessao");
if (!sessaoResposta.ok) {
  location.href = "login.html";
  throw new Error("sem sessão");
}
const sessao = await sessaoResposta.json();
document.querySelector("#sessao").textContent = `${sessao.nome} · ${sessao.email}`;

document.querySelector("#sair").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  location.href = "login.html";
});

const formVaga = document.querySelector("#form-vaga");
const erroVaga = document.querySelector("#erro-vaga");
const listaVagas = document.querySelector("#lista-vagas");
const botaoGuardar = document.querySelector("#guardar");
const botaoCancelar = document.querySelector("#cancelar-edicao");
const capaPreview = document.querySelector("#capa-preview");
const removerLinha = document.querySelector("#remover-capa-linha");
let capaAtual = null, previewLocal = null;
const escapar = (texto) => String(texto).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function mostrarCapa() {
  if (previewLocal) URL.revokeObjectURL(previewLocal);
  previewLocal = null;
  const ficheiro = formVaga.elements.capa.files[0];
  const titulo = formVaga.elements.titulo.value;
  const automatica = /\bphp\b/i.test(titulo) ? "php.png" : /\bjava\b/i.test(titulo) ? "java.png" : "default.jpg";
  if (ficheiro) previewLocal = URL.createObjectURL(ficheiro);
  capaPreview.src = previewLocal || (!formVaga.elements.remover_capa.checked && capaAtual) || `/media/vagas/${automatica}`;
  removerLinha.hidden = !capaAtual;
}

formVaga.elements.capa.addEventListener("change", () => {
  erroVaga.textContent = "";
  const ficheiro = formVaga.elements.capa.files[0];
  if (ficheiro && (!["image/png", "image/jpeg"].includes(ficheiro.type) || ficheiro.size > 5 * 1024 * 1024)) {
    erroVaga.textContent = "Escolhe uma imagem PNG ou JPG, até 5 MB.";
    formVaga.elements.capa.value = "";
  }
  formVaga.elements.remover_capa.checked = false;
  mostrarCapa();
});
formVaga.elements.titulo.addEventListener("input", mostrarCapa);
formVaga.elements.remover_capa.addEventListener("change", () => {
  if (formVaga.elements.remover_capa.checked) formVaga.elements.capa.value = "";
  mostrarCapa();
});
mostrarCapa();


function linhasParaLista(texto) {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function limparFormulario() {
  formVaga.reset();
  formVaga.elements.id.value = "";
  formVaga.elements.ativa.checked = true;
  botaoGuardar.textContent = "Adicionar vaga";
  botaoCancelar.hidden = true;
  capaAtual = null;
  erroVaga.textContent = "";
  mostrarCapa();
}

async function carregarVagas() {
  const resposta = await fetch("/api/vagas/admin");
  const vagas = await resposta.json();
  listaVagas.innerHTML = vagas
    .map(
      (v) => `<tr>
        <td>${escapar(v.titulo)}</td>
        <td>${escapar(v.localizacao)}</td>
        <td>${v.ativa ? "Ativa" : "Inativa"}</td>
        <td class="acoes">
          <button type="button" class="secundario" data-editar="${v.id}">Editar</button>
          <button type="button" class="perigo" data-apagar="${v.id}">Apagar</button>
        </td>
      </tr>`,
    )
    .join("");

  listaVagas.querySelectorAll("[data-editar]").forEach((botao) =>
    botao.addEventListener("click", () => {
      const vaga = vagas.find((v) => v.id === Number(botao.dataset.editar));
      limparFormulario();
      capaAtual = vaga.capa || null;
      formVaga.elements.id.value = vaga.id;
      formVaga.elements.titulo.value = vaga.titulo;
      formVaga.elements.localizacao.value = vaga.localizacao;
      formVaga.elements.requisitos.value = vaga.requisitos.join("\n");
      formVaga.elements.ativa.checked = Boolean(vaga.ativa);
      botaoGuardar.textContent = "Guardar alterações";
      botaoCancelar.hidden = false;
      mostrarCapa();
      formVaga.scrollIntoView({ behavior: "smooth" });
    }),
  );

  listaVagas.querySelectorAll("[data-apagar]").forEach((botao) =>
    botao.addEventListener("click", async () => {
      if (!confirm("Apagar esta vaga?")) return;
      await fetch(`/api/vagas/${botao.dataset.apagar}`, { method: "DELETE" });
      await carregarVagas();
    }),
  );
}

botaoCancelar.addEventListener("click", limparFormulario);

formVaga.addEventListener("submit", async (e) => {
  e.preventDefault();
  erroVaga.textContent = "";

  const id = formVaga.elements.id.value;
  const corpo = new FormData();
  corpo.set("titulo", formVaga.elements.titulo.value);
  corpo.set("localizacao", formVaga.elements.localizacao.value);
  corpo.set("requisitos", JSON.stringify(linhasParaLista(formVaga.elements.requisitos.value)));
  corpo.set("ativa", String(formVaga.elements.ativa.checked));
  corpo.set("remover_capa", String(formVaga.elements.remover_capa.checked));
  const ficheiro = formVaga.elements.capa.files[0];
  if (ficheiro) corpo.set("capa", ficheiro);
  botaoGuardar.disabled = true;
  try {
    const resposta = await fetch(id ? `/api/vagas/${id}` : "/api/vagas", {
      method: id ? "PUT" : "POST",
      body: corpo,
    });
    if (!resposta.ok) {
      const resultado = await resposta.json().catch(() => ({}));
      erroVaga.textContent = resultado.erro || "Não foi possível guardar a vaga.";
      return;
    }
    limparFormulario();
    await carregarVagas();
  } catch {
    erroVaga.textContent = "Não foi possível ligar ao servidor. Tenta novamente.";
  } finally {
    botaoGuardar.disabled = false;
  }
});

const formConvite = document.querySelector("#form-convite");
const erroConvite = document.querySelector("#erro-convite");
const resultadoConvite = document.querySelector("#resultado-convite");
const linkConvite = document.querySelector("#link-convite");

formConvite.addEventListener("submit", async (e) => {
  e.preventDefault();
  erroConvite.textContent = "";
  resultadoConvite.hidden = true;

  const dados = Object.fromEntries(new FormData(formConvite));
  const resposta = await fetch("/api/auth/convites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const resultado = await resposta.json().catch(() => ({}));
    erroConvite.textContent = resultado.erro || "Não foi possível gerar o convite.";
    return;
  }

  const { link } = await resposta.json();
  linkConvite.value = new URL(link, location.origin).toString();
  resultadoConvite.hidden = false;
  formConvite.reset();
});

document.querySelector("#copiar-convite").addEventListener("click", async () => {
  await navigator.clipboard.writeText(linkConvite.value);
});

await carregarVagas();
