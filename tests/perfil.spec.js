import { test, expect } from "@playwright/test";
import { servirAdmin, resumoVazio } from "./fixtures/admin";
async function preparar(page) {
  await servirAdmin(page);
  await page.route("**/api/auth/sessao", (r) =>
    r.fulfill({ json: { nome: "Admin", email: "admin@example.test" } }),
  );
  await page.route("**/api/vagas/admin", (r) => r.fulfill({ json: [] }));
  await page.route("**/api/recrutamento/resumo?**", (r) =>
    r.fulfill({ json: resumoVazio }),
  );
}
async function abrirPerfil(page) {
  if (await page.locator("#mobile-menu").isVisible()) {
    await page.locator("#mobile-menu").click();
    await page.getByRole("button", { name: "Meu perfil", exact: true }).click();
  } else await page.getByRole("button", { name: "Abrir meu perfil" }).click();
}

test("Perfil: carregar, guardar dados, conservar campos após erro e refletir identidade sem HTML", async ({
  page,
}, testInfo) => {
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await preparar(page);
  let dados = { nome: "Admin", email: "admin@example.test" },
    envios = 0;
  await page.route("**/api/auth/perfil", async (r) => {
    if (r.request().method() === "GET") return r.fulfill({ json: dados });
    const b = r.request().postDataJSON();
    expect(b.password_atual).toBe("Password atual 123");
    envios++;
    if (envios === 1)
      return r.fulfill({
        status: 409,
        json: { erro: "Este email já está associado a outra conta." },
      });
    dados = { nome: b.nome, email: b.email };
    return r.fulfill({ json: dados });
  });
  await page.goto("/admin/index.html");
  await abrirPerfil(page);
  const f = page.locator("#form-perfil");
  await expect(f.getByLabel("Nome completo", { exact: true })).toHaveValue(
    "Admin",
  );
  await f
    .getByLabel("Nome completo", { exact: true })
    .fill("Nome <b>literal</b>");
  await f.getByLabel("Email", { exact: true }).fill("novo@example.test");
  await f
    .getByLabel("Password atual", { exact: true })
    .fill("Password atual 123");
  await f
    .getByRole("button", { name: "Mostrar password atual", exact: true })
    .click();
  await expect(f.locator('input[name="password_atual"]')).toHaveAttribute(
    "type",
    "text",
  );
  await f.getByRole("button", { name: /Guardar dados pessoais/ }).click();
  await expect(page.locator("#perfil-estado")).toContainText(
    "já está associado",
  );
  await expect(f.getByLabel("Nome completo", { exact: true })).toHaveValue(
    "Nome <b>literal</b>",
  );
  await expect(f.getByLabel("Password atual", { exact: true })).toHaveValue("");
  await expect(f.getByLabel("Password atual", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await f
    .getByLabel("Password atual", { exact: true })
    .fill("Password atual 123");
  await f.getByRole("button", { name: /Guardar dados pessoais/ }).click();
  await expect(page.locator("#perfil-estado")).toHaveText(
    "Dados pessoais atualizados.",
  );
  await expect(page.locator("#user-name")).toHaveText(dados.nome);
  await expect(page.locator("#user-name b")).toHaveCount(0);
  await expect(page.locator("#sessao")).toContainText("novo@example.test");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-admin-perfil.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator('#form-perfil input[name="email"]')).toHaveValue(
    "novo@example.test",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(erros).toEqual([]);
});

test("Perfil: confirmação de password, falha, sucesso, limpeza e tema", async ({
  page,
}) => {
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await preparar(page);
  await page.route("**/api/auth/perfil", (r) =>
    r.fulfill({ json: { nome: "Admin", email: "admin@example.test" } }),
  );
  let envios = 0;
  await page.route("**/api/auth/password", (r) => {
    envios++;
    const b = r.request().postDataJSON();
    expect(b.nova_password).toBe("Nova password 456");
    expect(b.confirmar_password).toBe("Nova password 456");
    return envios === 1
      ? r.fulfill({
          status: 400,
          json: { erro: "A password atual está incorreta." },
        })
      : r.fulfill({
          json: {
            mensagem:
              "Password alterada. Os outros acessos desta conta terão de iniciar sessão novamente.",
          },
        });
  });
  await page.goto("/admin/index.html#perfil");
  const f = page.locator("#form-password");
  await f
    .getByLabel("Password atual", { exact: true })
    .fill("Password atual 123");
  await f
    .getByLabel("Nova password", { exact: true })
    .fill("Nova password 456");
  await f
    .getByLabel("Confirmar nova password", { exact: true })
    .fill("Outra password 789");
  await f.getByRole("button", { name: /Alterar password/ }).click();
  await expect(page.locator("#password-estado")).toContainText("não coincide");
  expect(envios).toBe(0);
  await f
    .getByLabel("Confirmar nova password", { exact: true })
    .fill("Nova password 456");
  await f.getByRole("button", { name: /Alterar password/ }).click();
  await expect(page.locator("#password-estado")).toContainText("incorreta");
  for (const input of await f.locator(".password-field input").all())
    await expect(input).toHaveValue("");
  await f
    .getByLabel("Password atual", { exact: true })
    .fill("Password atual 123");
  await f
    .getByLabel("Nova password", { exact: true })
    .fill("Nova password 456");
  await f
    .getByLabel("Confirmar nova password", { exact: true })
    .fill("Nova password 456");
  await f.getByRole("button", { name: /Alterar password/ }).click();
  await expect(page.locator("#password-estado")).toContainText(
    "Password alterada.",
  );
  for (const input of await f.locator(".password-field input").all())
    await expect(input).toHaveValue("");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(erros).toEqual([]);
});
