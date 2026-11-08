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
}

async function carregarVagas() {
  const resposta = await fetch("/api/vagas/admin");
  const vagas = await resposta.json();
  listaVagas.innerHTML = vagas
    .map(
      (v) => `<tr>
        <td>${v.titulo}</td>
        <td>${v.localizacao}</td>
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
      formVaga.elements.id.value = vaga.id;
      formVaga.elements.titulo.value = vaga.titulo;
      formVaga.elements.localizacao.value = vaga.localizacao;
      formVaga.elements.requisitos.value = vaga.requisitos.join("\n");
      formVaga.elements.ativa.checked = Boolean(vaga.ativa);
      botaoGuardar.textContent = "Guardar alterações";
      botaoCancelar.hidden = false;
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
  const corpo = {
    titulo: formVaga.elements.titulo.value,
    localizacao: formVaga.elements.localizacao.value,
    requisitos: linhasParaLista(formVaga.elements.requisitos.value),
    ativa: formVaga.elements.ativa.checked,
  };

  const resposta = await fetch(id ? `/api/vagas/${id}` : "/api/vagas", {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    const resultado = await resposta.json().catch(() => ({}));
    erroVaga.textContent = resultado.erro || "Não foi possível guardar a vaga.";
    return;
  }

  limparFormulario();
  await carregarVagas();
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
