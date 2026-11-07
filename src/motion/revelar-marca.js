import gsap from "gsap";

export function revelarMarca(marca, reduzido) {
  if (
    !marca ||
    reduzido ||
    !matchMedia("(hover:hover) and (pointer:fine)").matches
  )
    return;
  gsap.set(marca, { "--reveal-x": "-200px", "--reveal-y": "0px" });
  const moverX = gsap.quickTo(marca, "--reveal-x", {
    duration: 0.35,
    ease: "power2.out",
  });
  const moverY = gsap.quickTo(marca, "--reveal-y", {
    duration: 0.35,
    ease: "power2.out",
  });
  function mover(evento) {
    if (evento.pointerType === "touch") return;
    const rect = marca.getBoundingClientRect();
    moverX(evento.clientX - rect.left);
    moverY(evento.clientY - rect.top);
  }
  marca.addEventListener("pointerenter", (evento) => {
    if (evento.pointerType === "touch") return;
    marca.classList.add("is-revealing");
    mover(evento);
  });
  marca.addEventListener("pointermove", mover);
  marca.addEventListener("pointerleave", () =>
    marca.classList.remove("is-revealing"),
  );
}
