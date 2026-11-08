import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/vagas.css";
import "./styles/marca-interativa.css";
import { nav } from "./sections/nav";
import { contato } from "./sections/contato";
import { carregarVagas } from "./data/vagas";
import { vagaCard } from "./sections/vaga-card";
import { ligarFallbackCapas } from "./data/capas-vagas";
import { iniciarTema, ligarBotaoTema } from "./theme";
import { ligarMenu } from "./motion/menu";
import { ligarFormulario } from "./motion/formulario";
import { revelarMarca } from "./motion/revelar-marca";

iniciarTema();
document.querySelector("#vagas-cabecalho").innerHTML = nav({ paginaLegal: true });
document.querySelector("#vagas-rodape").innerHTML = contato();
// O rodapé reutilizado deve regressar à página inicial e abrir o formulário local.
document.querySelector('.contato__marca').href = "/#inicio";
document.querySelector('.contato__rodape > a').href = "/#inicio";
ligarBotaoTema();
ligarMenu(null);
ligarFormulario();
revelarMarca(document.querySelector(".contato__marca"), matchMedia("(prefers-reduced-motion: reduce)").matches);

const lista = document.querySelector("#vagas-lista");
const estado = document.querySelector("#vagas-estado");
const resultado = await carregarVagas();
lista.innerHTML = resultado.vagas.map((vaga, i) => vagaCard(vaga, i, { completa: true })).join("");
ligarFallbackCapas(lista);
lista.setAttribute("aria-busy", "false");
estado.textContent = resultado.estado !== "ok"
  ? "Não foi possível carregar as vagas. Tenta novamente mais tarde."
  : resultado.vagas.length
    ? `${resultado.vagas.length} ${resultado.vagas.length === 1 ? "oportunidade disponível" : "oportunidades disponíveis"}`
    : "Neste momento não temos vagas publicadas. Podes enviar uma candidatura espontânea.";
