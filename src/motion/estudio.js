import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function animarEstudio(reduzido) {
  const root = document.querySelector(".estudio__pagina");
  const svg = root.querySelector("svg");
  let progress = reduzido ? 1 : 0;
  function pintar() {
    svg.querySelectorAll("path").forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length * (1 - progress);
    });
  }
  function fios() {
    svg.innerHTML = "";
    if (innerWidth <= 600) return;
    const bounds = root.getBoundingClientRect();
    root.querySelectorAll("[data-ancora]").forEach((anchor, i) => {
      const rects = anchor.getClientRects(),
        box = rects[rects.length - 1];
      let lineEnd = box.right;
      const walker = document.createTreeWalker(
        root.querySelector("h2"),
        NodeFilter.SHOW_TEXT,
      );
      let node;
      while ((node = walker.nextNode())) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects())
          if (Math.abs(rect.bottom - box.bottom) < 12)
            lineEnd = Math.max(lineEnd, rect.right);
      }
      const note = root.querySelector(`[data-nota="${i}"]`);
      const y = box.top - bounds.top + box.height * 0.55;
      note.style.top = y - note.offsetHeight / 2 + "px";
      const noteBox = note.getBoundingClientRect();
      const x = lineEnd - bounds.left + 12,
        endX = noteBox.left - bounds.left - 15;
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute(
        "d",
        `M${x},${y} C${x + 30},${y + 17} ${endX - 30},${y + 8} ${endX},${y}`,
      );
      svg.append(path);
    });
    pintar();
  }
  fios();
  window.addEventListener("resize", fios);
  ScrollTrigger.addEventListener("refresh", fios);
  if (!reduzido) {
    ScrollTrigger.create({
      trigger: root,
      start: "top 70%",
      end: "top 20%",
      onUpdate: (s) => {
        progress = s.progress;
        pintar();
      },
    });
    gsap.from(".estudio h2", {
      opacity: 0.5,
      scrollTrigger: {
        trigger: root,
        start: "top 85%",
        end: "top 30%",
        scrub: true,
      },
    });
  }
}
