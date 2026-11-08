import { test, expect } from "@playwright/test";

const vagasMock = [
  {
    id: 1,
    titulo: "Java Developer",
    localizacao: "Porto",
    requisitos: ["Mín. 5 anos em Java", "Spring Boot"],
  },
  {
    id: 2,
    titulo: "PHP Developer",
    localizacao: "Braga",
    requisitos: ["Mín. 3 anos em PHP", "Symfony ou Laravel"],
  },
];

test("Carreiras: lista vagas da API e abre o contacto pré-preenchido", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/vagas", (route) =>
    route.fulfill({ json: vagasMock }),
  );

  await page.goto("/");
  const linhas = page.locator(".carreiras__vaga");
  await expect(linhas).toHaveCount(2);
  await expect(linhas.nth(0)).toContainText("Java Developer");
  await expect(linhas.nth(0)).toContainText("Porto");
  await expect(linhas.nth(1)).toContainText("PHP Developer");
  await expect(linhas.nth(1)).toContainText("Braga");

  await linhas
    .nth(0)
    .getByRole("button", { name: "Candidata-te" })
    .click();
  await expect(page.locator("#contacto-formulario")).toBeVisible();
  await expect(page.locator("textarea[name=mensagem]")).toHaveValue(
    /Java Developer/,
  );

  expect(errors).toEqual([]);
});

test("Carreiras: sem backend mostra só a candidatura espontânea, sem erros", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/vagas", (route) => route.abort());

  await page.goto("/");
  await page.waitForTimeout(500);
  await expect(page.locator(".carreiras__vaga")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Candidatura espontânea" }),
  ).toBeVisible();

  expect(errors).toEqual([]);
});
