const base = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "") || import.meta.env.BASE_URL.replace(/\/+$/, "");
export const apiUrl = (caminho) => `${base}${caminho}`;
export const urlVaga = (id) => `${import.meta.env.BASE_URL}pt/vagas/detalhe/?id=${encodeURIComponent(id)}`;
const normalizar = (vaga) => ({ ...vaga, requisitos: Array.isArray(vaga.requisitos) ? vaga.requisitos.filter((r) => typeof r === "string") : [] });
const valida = (vaga) => vaga && /^[1-9]\d*$/.test(String(vaga.id)) && typeof vaga.titulo === "string" && typeof vaga.localizacao === "string";

// A API devolve apenas vagas ativas, da mais recente para a mais antiga.
export async function carregarVagas() {
  try {
    const resposta = await fetch(apiUrl("/api/vagas"), { signal: AbortSignal.timeout(8000) });
    if (!resposta.ok) throw new Error("API indisponível");
    const dados = await resposta.json();
    if (!Array.isArray(dados)) throw new Error("Resposta inválida");
    const vagas = dados
      .filter(valida).map(normalizar);
    return { estado: "ok", vagas };
  } catch {
    return { estado: "indisponivel", vagas: [] };
  }
}

export async function carregarVaga(id) {
  if (!/^[1-9]\d{0,9}$/.test(id || "")) return { estado: "nao-encontrada" };
  try {
    const resposta = await fetch(apiUrl(`/api/vagas/${id}`), { signal: AbortSignal.timeout(8000) });
    if (resposta.status === 404) return { estado: "nao-encontrada" };
    if (!resposta.ok) throw new Error("API indisponível");
    const vaga = await resposta.json();
    if (!valida(vaga)) throw new Error("Resposta inválida");
    return { estado: "ok", vaga: normalizar(vaga) };
  } catch { return { estado: "indisponivel" }; }
}
