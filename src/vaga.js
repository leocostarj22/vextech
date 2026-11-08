import { iniciarPaginaInterna } from "./pagina-interna";
import { apiUrl, carregarVaga } from "./data/vagas";
import { capaVaga, ligarFallbackCapas } from "./data/capas-vagas";
import "./styles/vaga.css";

iniciarPaginaInterna();
const resultado = await carregarVaga(new URLSearchParams(location.search).get("id"));
const estado = document.querySelector("#vaga-estado");
const titulo = document.querySelector("#vaga-titulo");

if (resultado.estado !== "ok") {
  titulo.textContent = resultado.estado === "nao-encontrada" ? "Vaga indisponível." : "Não foi possível carregar esta vaga.";
  document.title = "Vaga indisponível — Vextech";
  estado.textContent = resultado.estado === "nao-encontrada"
    ? "Esta oportunidade já não está disponível. Consulta as outras vagas." : "Tenta novamente mais tarde ou consulta as outras vagas.";
  document.querySelector("#vaga-voltar").hidden = false;
} else {
  const vaga = resultado.vaga;
  estado.hidden = true;
  titulo.textContent = vaga.titulo;
  document.title = `${vaga.titulo} — Carreiras Vextech`;
  document.querySelector("#vaga-caminho").textContent = vaga.titulo;
  document.querySelector("#vaga-local").textContent = vaga.localizacao;
  document.querySelector("#vaga-capa").src = capaVaga(vaga);
  document.querySelector(".vaga-detalhe__capa").hidden = false;
  ligarFallbackCapas(document.querySelector("main"));
  if (typeof vaga.descricao === "string" && vaga.descricao.trim()) {
    document.querySelector("#vaga-descricao").textContent = vaga.descricao;
    document.querySelector("#vaga-descricao-bloco").hidden = false;
  }
  const lista = document.querySelector("#vaga-requisitos");
  vaga.requisitos.forEach((texto) => {
    const li = document.createElement("li"); li.textContent = texto; lista.append(li);
  });
  document.querySelector("#vaga-requisitos-bloco").hidden = !vaga.requisitos.length;
  document.querySelector("#vaga-conteudo").hidden = false;
  document.querySelector("#vaga-cta").hidden = false;

  const form = document.querySelector("#form-candidatura");
  const ficheiro = form.elements.curriculo;
  const mensagem = document.querySelector("#candidatura-estado");
  const botao = form.querySelector('button[type="submit"]');
  form.action = apiUrl(`/api/vagas/${vaga.id}/candidaturas`);
  function validarPdf() {
    const cv = ficheiro.files[0];
    const erro = !cv ? "Anexa o teu currículo em PDF."
      : !/\.pdf$/i.test(cv.name) || cv.type !== "application/pdf" ? "O currículo deve ser um ficheiro PDF."
      : cv.size > 5 * 1024 * 1024 ? "O currículo deve ter no máximo 5 MB." : "";
    ficheiro.setCustomValidity(erro);
    return erro;
  }
  ficheiro.addEventListener("change", () => { mensagem.textContent = validarPdf(); });
  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (validarPdf() || !form.reportValidity()) { form.reportValidity(); return; }
    const dados = new FormData(form);
    dados.set("privacidade", String(form.elements.privacidade.checked));
    botao.disabled = true;
    form.setAttribute("aria-busy", "true");
    mensagem.textContent = "A enviar a candidatura…";
    try {
      const resposta = await fetch(form.action, { method: "POST", body: dados, signal: AbortSignal.timeout(30000) });
      const retorno = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(retorno.erro || "Não foi possível enviar a candidatura. Tenta novamente.");
      form.reset(); form.hidden = true;
      mensagem.textContent = retorno.mensagem || "Candidatura recebida. Obrigado pelo teu interesse na Vextech.";
      mensagem.classList.add("is-success"); mensagem.focus();
    } catch (erro) {
      mensagem.textContent = erro.name === "TimeoutError" || erro.name === "TypeError"
        ? "Não foi possível confirmar o envio. Tenta novamente mais tarde." : erro.message;
    } finally {
      botao.disabled = false; form.setAttribute("aria-busy", "false");
    }
  });
}
window.__vextechAbertura?.pronto();
