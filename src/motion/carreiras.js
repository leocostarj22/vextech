import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { carregarVagas } from "../data/vagas";
import { vagaCard } from "../sections/vaga-card";

export async function animarCarreiras(reduzido, atualizarLayout) {
  const lista = document.querySelector("#carreiras-lista");
  if (!lista) return;
  const { vagas } = await carregarVagas();
  if (!vagas.length) return;
  lista.innerHTML = vagas.slice(0, 2).map((vaga, i) => vagaCard(vaga, i)).join("");
  document.querySelector(".carreiras__recentes").hidden = false;
  document.querySelector(".carreiras__todas").hidden = false;
  if (!reduzido) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 801px)", () => {
      const cards = gsap.utils.toArray(lista.children);
      const animacao = gsap.from(cards, {
        xPercent: (i) => i ? -12 : 12,
        y: (i) => i ? 95 : 35,
        rotation: (i) => i ? 7 : -6,
        ease: "none",
        scrollTrigger: {
          trigger: lista,
          start: "top 95%",
          end: "center 60%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      // Ao navegar por teclado, apresentar as duas vagas sem sobreposição.
      const revelar = (evento) => {
        if (!evento.target.matches(":focus-visible")) return;
        animacao.scrollTrigger.kill();
        animacao.progress(1);
      };
      lista.addEventListener("focusin", revelar);
      return () => lista.removeEventListener("focusin", revelar);
    });
    mm.add("(max-width: 800px)", () => {
      gsap.from(lista.children, { y: 25, stagger: 0.1, duration: 0.65,
        scrollTrigger: { trigger: lista, start: "top 92%", once: true } });
    });
  }
  atualizarLayout();
  lista.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  });
}
