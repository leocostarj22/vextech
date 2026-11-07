import gsap from "gsap";
export function animarIndice(reduzido) {
  if (reduzido || !matchMedia("(pointer:fine)").matches) return;
  const rows = [...document.querySelectorAll(".projeto")],
    floating = document.querySelector(".indice__foto"),
    img = floating.querySelector("img");
  const x = gsap.quickTo(floating, "x", { duration: 0.55 }),
    y = gsap.quickTo(floating, "y", { duration: 0.55 });
  const position = (px, py) => ({
    x: Math.max(20, Math.min(innerWidth - floating.offsetWidth - 20, px + 110)),
    y: Math.max(
      20,
      Math.min(
        innerHeight - floating.offsetHeight - 20,
        py - floating.offsetHeight / 2,
      ),
    ),
  });
  const hide = () =>
    gsap.to(floating, { autoAlpha: 0, scale: 0.6, duration: 0.2 });
  rows.forEach((row, i) => {
    const show = (e) => {
      img.src = row.dataset.src;
      const box = row.getBoundingClientRect();
      gsap.set(
        floating,
        position(e.clientX || box.left + box.width * 0.6, e.clientY || box.top),
      );
      gsap.to(floating, {
        autoAlpha: 1,
        scale: 1,
        rotation: (i % 2 ? 1 : -1) * 3,
        duration: 0.2,
      });
    };
    row.addEventListener("pointerenter", show);
    row.addEventListener("focus", show);
    row.addEventListener("pointermove", (e) => {
      const p = position(e.clientX, e.clientY);
      x(p.x);
      y(p.y);
    });
    for (const name of ["pointerleave", "blur", "click"])
      row.addEventListener(name, hide);
  });
  window.addEventListener("scroll", hide, { passive: true });
}
