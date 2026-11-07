import gsap from "gsap";
import { revelarMarca } from "./revelar-marca";

export function animarContato(reduzido) {
  const marca = document.querySelector(".contato__marca");
  revelarMarca(marca, reduzido);
  if (reduzido) return;
  gsap.from(marca, {
    y: 60,
    scrollTrigger: {
      trigger: ".contato",
      start: "top 90%",
      end: "bottom bottom",
      scrub: true,
    },
  });
}
