import gsap from "gsap";
import { PROF_DESTAQUES } from "./cena";

export function animarTunel(cena, reduzido) {
  const root = document.querySelector(".tunel");
  const cases = [...root.querySelectorAll(".case")];
  gsap.set(cases, { autoAlpha: 0 });
  const sync = () => {
    cases.forEach((item) => {
      const ativo = Number(gsap.getProperty(item, "opacity")) > 0.35;
      item.classList.toggle("is-active", ativo);
      item.inert = !ativo;
      item.setAttribute("aria-hidden", String(!ativo));
    });
    cena.render();
  };
  const tl = gsap.timeline({
    onUpdate: sync,
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => "+=" + innerHeight * 8.5,
      pin: true,
      scrub: reduzido ? true : 0.3,
      invalidateOnRefresh: true,
      onUpdate: (s) => gsap.set(".tunel__progresso", { scaleX: s.progress }),
    },
  });
  tl.to(".tunel__hero", { autoAlpha: 0, y: reduzido ? 0 : -30, duration: 0.9 });
  let prev = 6;
  PROF_DESTAQUES.forEach((z, i) => {
    const travel = Math.abs(prev - (z + 10)) / 9;
    tl.to(cena.estado, { z: z + 10, puxar: 0, duration: travel, ease: "none" })
      .set(cena.estado, { ativo: i })
      .to(cena.estado, {
        z: () => z + cena.distancia(),
        puxar: 1,
        duration: 1.3,
        ease: "power2.inOut",
      })
      .to(cases[i], { autoAlpha: 1, duration: 0.35 })
      .fromTo(
        cases[i].querySelectorAll(".case__base>*"),
        { y: reduzido ? 0 : 24 },
        { y: 0, duration: 0.45, stagger: 0.06 },
        "<",
      )
      .to({}, { duration: 1.2 })
      .to(cases[i], { autoAlpha: 0, duration: 0.3 })
      .to(cena.estado, { z: z - 0.6, duration: 0.9, ease: "power2.in" })
      .set(cena.estado, { puxar: 0 });
    prev = z - 0.6;
  });
  tl.to(cena.estado, { z: -84, duration: 1.7, ease: "none" }).to(
    ".tunel__fim",
    { autoAlpha: 1, duration: 0.5 },
  );
  return tl;
}
