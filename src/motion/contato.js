import gsap from "gsap";
export function animarContato(reduzido) {
  if (reduzido) return;
  gsap.from(".contato__marca", {
    y: 60,
    scrollTrigger: {
      trigger: ".contato",
      start: "top 90%",
      end: "bottom bottom",
      scrub: true,
    },
  });
}
