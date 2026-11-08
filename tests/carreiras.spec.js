import { test, expect } from "@playwright/test";

// Dados apenas dos testes: nunca são publicados nem usados como fallback.
const vagasMock = [
  { id: 1, titulo: "Java Developer", localizacao: "Porto", requisitos: ["Mín. 5 anos em Java", "Spring Boot"] },
  { id: 2, titulo: "PHP Developer", localizacao: "Braga", requisitos: ["Mín. 3 anos em PHP", "Symfony ou Laravel"] },
  { id: 3, titulo: "Vaga de teste anterior", localizacao: "Lisboa", requisitos: ["Requisito apenas do teste"] },
  { id: 4, titulo: "Outra vaga de teste", localizacao: "Porto", requisitos: ["Um", "Dois", "Três", "Quatro"] },
];

test("Carreiras: duas vagas recentes, todas as vagas e candidatura", async ({ page }, testInfo) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/vagas", (route) => route.fulfill({ json: vagasMock }));
  await page.route("**/api/vagas/*", (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    return route.fulfill({ json: { ...vagasMock.find((v) => v.id === id), descricao: "Descrição completa da vaga de teste." } });
  });
  await page.goto("/");
  const cards = page.locator(".carreiras__vaga");
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText("Java Developer");
  await expect(cards.nth(0)).toContainText("Porto");
  await expect(cards.nth(1)).toContainText("PHP Developer");
  await expect(cards.nth(1)).toContainText("Braga");
  await expect(cards.nth(0).locator("img")).toHaveAttribute("src", "/media/vagas/java.png");
  await expect(cards.nth(1).locator("img")).toHaveAttribute("src", "/media/vagas/php.png");
  await expect(page.locator("#carreiras")).not.toContainText("Vaga de teste anterior");
  // A rolagem acompanha a animação, sem interferir com o acesso às ações.
  await page.locator(".carreiras__todas").scrollIntoViewIfNeeded();
  await page.locator('.vaga-card img').evaluateAll((imagens) => Promise.all(imagens.map((img) => img.decode())));
  await page.locator("#carreiras").screenshot({ path: `test-results/${testInfo.project.name}-carreiras-cards.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  if (testInfo.project.name === "reduced-motion") {
    for (const card of await cards.all()) await expect(card).toHaveCSS("transform", "none");
  }
  await cards.first().getByRole("link", { name: /Ver vaga/ }).click();
  await expect(page).toHaveURL(/detalhe\/\?id=1/);
  await expect(page.locator("#vaga-titulo")).toHaveText("Java Developer");
  await expect(page.locator("#vaga-descricao")).toHaveText("Descrição completa da vaga de teste.");
  await expect(page.locator('input[name="curriculo"]')).toHaveAttribute("accept", "application/pdf,.pdf");
  await page.locator(".vagas__caminho").getByRole("link", { name: "Vagas", exact: true }).click();
  await expect(page).toHaveURL(/\/pt\/vagas\//);
  await expect(page).toHaveTitle("Vagas — Carreiras Vextech");
  await expect(page.locator("#vagas-lista .vaga-card")).toHaveCount(4);
  await expect(page.locator("#vagas-estado")).toHaveText("4 oportunidades disponíveis");
  await expect(page.locator("#vagas-lista")).not.toContainText("Quatro");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Mudar para versão escura" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page.locator("main").screenshot({ path: `test-results/${testInfo.project.name}-vagas-escuro.png` });
  await page.locator("#vagas-lista").getByRole("link", { name: /Ver vaga — PHP Developer/ }).click();
  await expect(page.locator("#vaga-titulo")).toHaveText("PHP Developer");
  await expect(page.locator("#vaga-requisitos")).toContainText("Symfony ou Laravel");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("Carreiras: sem backend mantém candidatura e explica indisponibilidade na página de vagas", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/vagas", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Candidatura espontânea" })).toBeVisible();
  await expect(page.locator(".carreiras__vaga")).toHaveCount(0);
  await expect(page.locator(".carreiras__todas")).toBeVisible();
  await expect(page.locator("#carreiras-estado")).toContainText("Não foi possível carregar");
  await page.goto("/pt/vagas");
  await expect(page.locator("#vagas-lista")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("#vagas-estado")).toContainText("Não foi possível carregar");
  await page.getByRole("button", { name: "Candidatura espontânea" }).click();
  await expect(page.locator("#contacto-formulario")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Vagas: estado vazio, uma única vaga e texto da API tratado como texto", async ({ page }) => {
  await page.route("**/api/vagas", (route) => route.fulfill({ json: [] }));
  await page.goto("/pt/vagas/");
  await expect(page.locator("#vagas-estado")).toContainText("não temos vagas publicadas");
  await expect(page.locator(".vaga-card")).toHaveCount(0);
  await page.unroute("**/api/vagas");
  await page.route("**/api/vagas", (route) => route.fulfill({ json: [{ id: 8, titulo: '<img src=x onerror="alert(1)">', localizacao: "Porto", requisitos: ['<script>alert(1)</script>'] }] }));
  await page.reload();
  await expect(page.locator("#vagas-estado")).toHaveText("1 oportunidade disponível");
  await expect(page.locator(".vaga-card h3")).toHaveText('<img src=x onerror="alert(1)">');
  await expect(page.locator(".vaga-card h3 img, .vaga-card script")).toHaveCount(0);
});
