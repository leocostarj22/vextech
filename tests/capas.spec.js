import { servirAdmin, resumoVazio } from "./fixtures/admin";
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const capa = "/uploads/vagas/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png";

test("Vagas: capa enviada tem prioridade; JavaScript e outras vagas usam a predefinida", async ({
  page,
}) => {
  await page.route("**/api/vagas", (route) =>
    route.fulfill({
      json: [
        {
          id: 1,
          titulo: "JavaScript Developer",
          localizacao: "Porto",
          requisitos: [],
        },
        {
          id: 2,
          titulo: "PHP Developer",
          localizacao: "Porto",
          requisitos: [],
          capa,
        },
        {
          id: 3,
          titulo: "Java Developer",
          localizacao: "Lisboa",
          requisitos: [],
        },
      ],
    }),
  );
  await page.route(`**${capa}`, async (route) =>
    route.fulfill({
      body: await readFile("public/media/vagas/php.png"),
      contentType: "image/png",
    }),
  );
  await page.goto("/pt/vagas/");
  const imagens = page.locator(".vaga-card__imagem img");
  await expect(imagens).toHaveCount(3);
  await expect(imagens.nth(0)).toHaveAttribute(
    "src",
    "/media/vagas/default.jpg",
  );
  await expect(imagens.nth(1)).toHaveAttribute("src", capa);
  await expect(imagens.nth(2)).toHaveAttribute("src", "/media/vagas/java.png");
  await imagens.nth(1).scrollIntoViewIfNeeded();
  await expect
    .poll(() => imagens.nth(1).evaluate((img) => img.naturalWidth))
    .toBeGreaterThan(0);
  // Uma capa que deixe de existir volta à imagem predefinida.
  await page.unroute(`**${capa}`);
  await page.route(`**${capa}`, (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await page.reload();
  await imagens.nth(1).scrollIntoViewIfNeeded();
  await expect(imagens.nth(1)).toHaveAttribute(
    "src",
    "/media/vagas/default.jpg",
  );
});

test("Admin: enviar capa com pré-visualização e remover ao editar", async ({
  page,
}) => {
  let vagas = [],
    enviado = false,
    removido = false;
  const png = await readFile("public/media/vagas/java.png");
  await servirAdmin(page);
  await page.route("**/api/recrutamento/resumo?**", (route) =>
    route.fulfill({ json: resumoVazio }),
  );
  await page.route("**/api/auth/sessao", (route) =>
    route.fulfill({ json: { nome: "Teste", email: "teste@example.test" } }),
  );
  await page.route("**/api/vagas/admin", (route) =>
    route.fulfill({ json: vagas }),
  );
  await page.route(`**${capa}`, (route) =>
    route.fulfill({ body: png, contentType: "image/png" }),
  );
  await page.route("**/api/vagas", (route) => {
    const req = route.request();
    expect(req.method()).toBe("POST");
    expect(req.headers()["content-type"]).toContain(
      "multipart/form-data; boundary=",
    );
    expect(
      req.postDataBuffer().includes(Buffer.from('filename="java.png"')),
    ).toBe(true);
    enviado = true;
    vagas = [
      {
        id: 9,
        titulo: "Frontend Developer",
        localizacao: "Porto",
        requisitos: ["Requisito de teste"],
        ativa: 1,
        capa,
      },
    ];
    return route.fulfill({ status: 201, json: { id: 9, capa } });
  });
  await page.route("**/api/vagas/9", (route) => {
    expect(route.request().method()).toBe("PUT");
    expect(route.request().postData()).toMatch(
      /name="remover_capa"\r\n\r\ntrue/,
    );
    vagas[0].capa = null;
    removido = true;
    return route.fulfill({ status: 204 });
  });
  await page.goto("/admin/index.html");
  if (await page.locator("#mobile-menu").isVisible())
    await page.locator("#mobile-menu").click();
  await page.getByRole("button", { name: "Vagas", exact: true }).click();
  await page.getByRole("button", { name: "Nova vaga", exact: true }).click();
  await page.getByLabel("Título", { exact: true }).fill("Frontend Developer");
  await page.getByLabel("Localização", { exact: true }).fill("Porto");
  await page.getByLabel("Requisitos (um por linha)").fill("Requisito de teste");
  await page
    .locator('input[name="capa"]')
    .setInputFiles("public/media/vagas/java.png");
  await expect(page.locator("#capa-preview")).toHaveAttribute("src", /^blob:/);
  await page.getByRole("button", { name: "Adicionar vaga" }).click();
  await expect(page.locator("#lista-vagas tr")).toHaveCount(1);
  expect(enviado).toBe(true);
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(page.locator("#capa-preview")).toHaveAttribute("src", capa);
  await page
    .getByLabel("Remover a capa enviada e usar a capa automática")
    .check();
  await expect(page.locator("#capa-preview")).toHaveAttribute(
    "src",
    "/media/vagas/default.jpg",
  );
  await page.getByRole("button", { name: "Guardar alterações" }).click();
  await expect(page.locator("#editor")).not.toBeVisible();
  expect(removido).toBe(true);
});
