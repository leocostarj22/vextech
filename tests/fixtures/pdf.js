// PDF mínimo válido, com uma página; apenas para os testes.
const fluxo = "BT /F1 12 Tf 40 100 Td (Curriculo de teste) Tj ET";
const objetos = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 180] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${fluxo.length} >>\nstream\n${fluxo}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];
let conteudo = "%PDF-1.4\n";
const posicoes = [];
objetos.forEach((objeto, i) => { posicoes.push(Buffer.byteLength(conteudo)); conteudo += `${i + 1} 0 obj\n${objeto}\nendobj\n`; });
const xref = Buffer.byteLength(conteudo);
conteudo += `xref\n0 6\n0000000000 65535 f \n${posicoes.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
export const pdfExemplo = Buffer.from(conteudo);
