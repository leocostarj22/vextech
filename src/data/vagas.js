// A API devolve apenas vagas ativas, da mais recente para a mais antiga.
export async function carregarVagas() {
  const url = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
  if (!url) return { estado: "indisponivel", vagas: [] };
  try {
    const resposta = await fetch(`${url}/api/vagas`);
    if (!resposta.ok) throw new Error("API indisponível");
    const dados = await resposta.json();
    if (!Array.isArray(dados)) throw new Error("Resposta inválida");
    const vagas = dados
      .filter((vaga) => vaga && typeof vaga.titulo === "string" && typeof vaga.localizacao === "string")
      .map((vaga) => ({ ...vaga, requisitos: Array.isArray(vaga.requisitos) ? vaga.requisitos.filter((r) => typeof r === "string") : [] }));
    return { estado: "ok", vagas };
  } catch {
    return { estado: "indisponivel", vagas: [] };
  }
}
