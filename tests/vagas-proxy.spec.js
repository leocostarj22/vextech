import { test, expect } from "@playwright/test";
import { createServer as criarHttp } from "node:http";
import { createServer as criarVite } from "vite";
import { readFile } from "node:fs/promises";

test("Vagas: ligação HTTP pelo proxy, sem VITE_API_URL e sem CORS no backend", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "A ligação HTTP é comum aos três layouts.");
  const anteriores = { alvo: process.env.API_PROXY_TARGET, url: process.env.VITE_API_URL };
  let disponivel = false;
  let pedidos = 0;
  const capa = "/uploads/vagas/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png";
  const png = await readFile("public/media/vagas/java.png");
  const api = criarHttp((pedido, resposta) => {
    if (pedido.url === capa) { resposta.setHeader("Content-Type", "image/png"); resposta.end(png); return; }
    if (pedido.url !== "/api/vagas") { resposta.writeHead(404).end(); return; }
    pedidos++;
    resposta.setHeader("Content-Type", "application/json");
    // Propositadamente sem Access-Control-Allow-Origin.
    if (!disponivel) { resposta.writeHead(503).end('{"erro":"Temporariamente indisponível"}'); return; }
    resposta.end(JSON.stringify([
      { id: 2, titulo: "Java Developer", localizacao: "Porto", requisitos: ["Java"], capa },
      { id: 1, titulo: "PHP Developer", localizacao: "Braga", requisitos: ["PHP"] },
    ]));
  });
  let vite;
  try {
    await new Promise((resolve) => api.listen(0, "127.0.0.1", resolve));
    process.env.API_PROXY_TARGET = `http://127.0.0.1:${api.address().port}`;
    process.env.VITE_API_URL = "";
    vite = await criarVite({ mode: "test", server: { host: "127.0.0.1", port: 5274, strictPort: true } });
    await vite.listen();
    await page.goto("http://127.0.0.1:5274/");
    await expect(page.locator("#carreiras-estado")).toContainText("Não foi possível carregar");
    await expect(page.locator(".carreiras__todas")).toBeVisible();
    disponivel = true;
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.locator(".vaga-card")).toHaveCount(2);
    await expect(page.locator("#carreiras-estado")).toBeHidden();
    await page.getByRole("link", { name: "Ver todas as vagas" }).click();
    await expect(page.locator("#vagas-lista .vaga-card")).toHaveCount(2);
    await expect(page.locator("#vagas-estado")).toHaveText("2 oportunidades disponíveis");
    const imagem = page.locator(".vaga-card__imagem img").first();
    await imagem.scrollIntoViewIfNeeded();
    await expect(imagem).toHaveAttribute("src", capa);
    await expect.poll(() => imagem.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    expect(pedidos).toBe(3);
  } finally {
    await vite?.close();
    api.closeAllConnections();
    await new Promise((resolve) => api.close(resolve));
    if (anteriores.alvo === undefined) delete process.env.API_PROXY_TARGET;
    else process.env.API_PROXY_TARGET = anteriores.alvo;
    if (anteriores.url === undefined) delete process.env.VITE_API_URL;
    else process.env.VITE_API_URL = anteriores.url;
  }
});
