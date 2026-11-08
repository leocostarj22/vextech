export const capaPredefinida = "/media/vagas/default.jpg";

export function capaVaga(vaga) {
  if (typeof vaga.capa === "string" && /^\/uploads\/vagas\/[a-f0-9-]+\.(png|jpg)$/.test(vaga.capa)) {
    const api = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
    return `${api}${vaga.capa}`;
  }
  if (/\bphp\b/i.test(vaga.titulo)) return "/media/vagas/php.png";
  if (/\bjava\b/i.test(vaga.titulo)) return "/media/vagas/java.png";
  return capaPredefinida;
}

export function ligarFallbackCapas(lista) {
  lista.querySelectorAll(".vaga-card__imagem img").forEach((img) => {
    img.addEventListener("error", () => { img.src = capaPredefinida; }, { once: true });
  });
}
