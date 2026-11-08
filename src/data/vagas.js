// A API devolve apenas vagas ativas, da mais recente para a mais antiga.
export async function carregarVagas() {
  // Em desenvolvimento, o Vite encaminha o pedido para a API local.
  // Em produção, admite API no mesmo domínio ou um endereço explícito.
  const url = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
  try {
    const resposta = await fetch(`${url}/api/vagas`, { signal: AbortSignal.timeout(8000) });
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
