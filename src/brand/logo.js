import icon from "./vextech-icon.svg?raw";
import wordmark from "./vextech-wordmark.svg?raw";
export { icon, wordmark };
export const logo = () =>
  `<span class="marca"><span class="marca__icone" aria-hidden="true">${icon}</span><span class="marca__nome" aria-hidden="true">${wordmark}</span></span>`;
