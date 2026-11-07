import "./metodo.css";
export const etapas = [
  ["Entender", "Começamos pelo seu contexto, pelos objetivos e pelo desafio."],
  ["Construir", "Juntamos as competências e a solução certas para avançar."],
  ["Evoluir", "Acompanhamos a entrega e os próximos passos do seu negócio."],
];
export const metodo = () =>
  `<section id="metodo" class="metodo" data-theme="dark" aria-labelledby="metodo-titulo"><div class="metodo__cabecalho"><p class="rotulo">Como trabalhamos</p><h2 id="metodo-titulo">Da visão à entrega.</h2></div><div class="metodo__janela"><div class="metodo__tira">${["equipa", "robot", "infraestrutura"].map((f, i) => `<figure class="metodo__quadro"><img src="/media/${f}.jpg" alt="${["Imagem ilustrativa de colaboração profissional", "Detalhe ilustrativo de engenharia robótica", "Imagem ilustrativa de infraestrutura tecnológica"][i]}" loading="lazy"><figcaption><span>0${i + 1}</span> ${etapas[i][0]}</figcaption></figure>`).join("")}</div></div><div class="metodo__regua"><div class="metodo__linha"></div>${etapas.map((e, i) => `<button data-etapa="${i}" aria-pressed="${i === 0}" aria-label="Etapa ${i + 1}: ${e[0]}"><span>0${i + 1}</span> ${e[0]}</button>`).join("")}</div><p class="metodo__frase">${etapas[0][1]}</p></section>`;
