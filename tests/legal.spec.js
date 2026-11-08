import { test, expect } from "@playwright/test";

const paginas = [
  [
    "termos-e-condicoes",
    "Termos e condições",
    "Ao aceitar os Termos e Condições",
  ],
  [
    "politica-de-privacidade",
    "Política de privacidade",
    "Âmbito da nossa Política de Privacidade",
  ],
  ["politica-de-cookies", "Política de cookies", "Google Analytics"],
];

test("páginas legais independentes, navegação partilhada e tema", async ({
  page,
}, testInfo) => {
  const erros = [],
    falhas = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  page.on("response", (resposta) => {
    if (resposta.url().includes("127.0.0.1") && resposta.status() >= 400 && new URL(resposta.url()).pathname !== "/api/vagas")
      falhas.push(resposta.url());
  });
  for (const [slug, titulo, conteudo] of paginas) {
    const resposta = await page.goto(`/pt/${slug}`);
    expect(resposta.status()).toBe(200);
    await expect(page).toHaveTitle(`${titulo} — Vextech`);
    await expect(
      page.getByRole("heading", { name: titulo, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(page.locator(".legal__conteudo")).toContainText(conteudo);
    await expect(
      page.locator('.legal__lateral [aria-current="page"]'),
    ).toHaveText(titulo);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("footer .links-legais a")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Mudar para versão escura" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-legal-cookies.png`,
  });
  await page
    .locator(".legal__lateral")
    .getByRole("link", { name: "Termos e condições", exact: true })
    .click();
  await expect(page).toHaveTitle("Termos e condições — Vextech");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page.getByRole("button", { name: "Expandir soluções" }).click();
  await page
    .locator("#menu-solucoes")
    .getByRole("link", { name: "Nearshore", exact: false })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#detalhe-titulo")).toHaveText("Nearshore");
  await page.keyboard.press("Escape");
  await page
    .locator("footer .links-legais")
    .getByRole("link", { name: "Política de privacidade", exact: true })
    .click();
  await expect(page).toHaveTitle("Política de privacidade — Vextech");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-legal-privacidade.png`,
  });
  expect(erros).toEqual([]);
  expect(falhas).toEqual([]);
});
