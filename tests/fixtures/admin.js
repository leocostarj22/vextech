import { readFile } from "node:fs/promises";
export async function servirAdmin(page) {
  await page.route("**/admin/**", async (route) => {
    const nome =
      new URL(route.request().url()).pathname.slice("/admin/".length) ||
      "index.html";
    if (
      !/^(?:[\w-]+\.(?:html|js|css)|assets\/[\w.-]+\.(?:svg|woff2|txt))$/.test(
        nome,
      )
    )
      return route.abort();
    const tipo = nome.endsWith(".js")
      ? "text/javascript"
      : nome.endsWith(".css")
        ? "text/css"
        : nome.endsWith(".woff2")
          ? "font/woff2"
          : nome.endsWith(".svg")
            ? "image/svg+xml"
            : "text/html";
    return route.fulfill({
      body: await readFile(`server/public/admin/${nome}`),
      contentType: tipo,
    });
  });
}
export const resumoVazio = {
  vagas_ativas: 0,
  candidaturas_total: 0,
  recebidas: 0,
  vagas_com_candidaturas: 0,
  serie: [{ de: "2026-11-01", ate: "2026-11-09", total: 0 }],
  recentes: [],
};
