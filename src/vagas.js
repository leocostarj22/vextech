import { iniciarPaginaInterna } from "./pagina-interna";
import { carregarVagas } from "./data/vagas";
import { vagaCard } from "./sections/vaga-card";
import { ligarFallbackCapas } from "./data/capas-vagas";

iniciarPaginaInterna();

const lista = document.querySelector("#vagas-lista");
const estado = document.querySelector("#vagas-estado");
const resultado = await carregarVagas();
lista.innerHTML = resultado.vagas.map((vaga, i) => vagaCard(vaga, i)).join("");
ligarFallbackCapas(lista);
lista.setAttribute("aria-busy", "false");
estado.textContent = resultado.estado !== "ok"
  ? "Não foi possível carregar as vagas. Tenta novamente mais tarde."
  : resultado.vagas.length
    ? `${resultado.vagas.length} ${resultado.vagas.length === 1 ? "oportunidade disponível" : "oportunidades disponíveis"}`
    : "Neste momento não temos vagas publicadas. Podes enviar uma candidatura espontânea.";
window.__vextechAbertura?.pronto();
