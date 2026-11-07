import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { etapas } from "../sections/metodo";

export function animarMetodo() {
  const strip = document.querySelector(".metodo__tira");
  const quadros = [...strip.children],
    botoes = [...document.querySelectorAll("[data-etapa]")];
  let ativo = -1;
  function update(progress) {
    const distance = Math.max(0, strip.scrollWidth - innerWidth);
    gsap.set(strip, { x: -distance * progress });
    gsap.set(".metodo__linha", { scaleX: progress });
    const index = Math.round(progress * (etapas.length - 1));
    if (index === ativo) return;
    ativo = index;
    document.querySelector(".metodo__frase").textContent = etapas[index][1];
    botoes.forEach((b, i) => {
      b.classList.toggle("is-active", i === index);
      b.setAttribute("aria-pressed", String(i === index));
    });
    quadros.forEach((q, i) => gsap.set(q, { opacity: i === index ? 1 : 0.6 }));
  }
  const st = ScrollTrigger.create({
    trigger: ".metodo",
    start: "top top",
    end: () => "+=" + innerHeight * 2.2,
    pin: true,
    invalidateOnRefresh: true,
    onUpdate: (s) => update(s.progress),
    onRefresh: (s) => update(s.progress),
  });
  botoes.forEach((b, i) =>
    b.addEventListener("click", () =>
      window.scrollTo({
        top: st.start + ((st.end - st.start) * i) / (etapas.length - 1),
        behavior: "instant",
      }),
    ),
  );
  update(0);
}
