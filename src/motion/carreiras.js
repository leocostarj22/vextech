const escapar = (texto) =>
  String(texto).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export async function animarCarreiras() {
  const url = import.meta.env.VITE_API_URL;
  if (!url) return;

  const lista = document.querySelector("#carreiras-lista");
  if (!lista) return;

  let vagas = [];
  try {
    const resposta = await fetch(`${url}/api/vagas`);
    if (resposta.ok) vagas = await resposta.json();
  } catch {
    return;
  }
  if (!Array.isArray(vagas) || vagas.length === 0) return;

  lista.innerHTML = vagas
    .map(
      (vaga) => `<li class="carreiras__vaga">
        <div class="carreiras__vaga-cabecalho">
          <h3>${escapar(vaga.titulo)}</h3>
          <span class="carreiras__local">${escapar(vaga.localizacao)}</span>
        </div>
        <ul class="carreiras__requisitos">${(vaga.requisitos || [])
          .map((r) => `<li>${escapar(r)}</li>`)
          .join("")}</ul>
        <button class="carreiras__candidatar" data-contacto="Candidatura — ${escapar(vaga.titulo)}"><span>Candidata-te</span><span class="seta" aria-hidden="true">→</span></button>
      </li>`,
    )
    .join("");
}
