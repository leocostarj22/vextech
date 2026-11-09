import { apiUrl } from "./vagas";
export const capaPredefinida = `${import.meta.env.BASE_URL}media/vagas/default.jpg`;

export function capaVaga(vaga) {
  if (typeof vaga.capa === "string" && /^\/uploads\/vagas\/[a-f0-9-]+\.(png|jpg)$/.test(vaga.capa)) {
    return apiUrl(vaga.capa);
  }
  if (/\bphp\b/i.test(vaga.titulo)) return `${import.meta.env.BASE_URL}media/vagas/php.png`;
  if (/\bjava\b/i.test(vaga.titulo)) return `${import.meta.env.BASE_URL}media/vagas/java.png`;
  return capaPredefinida;
}

export function ligarFallbackCapas(lista) {
  lista.querySelectorAll(".vaga-card__imagem img, .vaga-detalhe__capa img").forEach((img) => {
    img.addEventListener("error", () => { img.src = capaPredefinida; }, { once: true });
  });
}
