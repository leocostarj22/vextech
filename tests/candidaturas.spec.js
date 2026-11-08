import { servirAdmin, resumoVazio } from "./fixtures/admin";
import { test, expect } from "@playwright/test";
import { pdfExemplo } from "./fixtures/pdf";
import { readFile } from "node:fs/promises";

const vaga = {
  id: 7,
  titulo: "Java Developer",
  localizacao: "Porto",
  descricao:
    "Descrição de teste.\n\nTexto completo, apresentado como texto: <script>nunca executar</script>.",
  requisitos: [
    "Primeiro requisito",
    "Segundo requisito",
    "Terceiro requisito",
    "Quarto requisito",
    "Quinto requisito",
  ],
};

test("Detalhe: descrição completa, PDF obrigatório e envio confirmado apenas após sucesso", async ({
  page,
}, testInfo) => {
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.route("**/api/vagas/7", (route) => route.fulfill({ json: vaga }));
  let envios = 0;
  await page.route("**/api/vagas/7/candidaturas", (route) => {
    const pedido = route.request();
    expect(pedido.method()).toBe("POST");
    expect(pedido.headers()["content-type"]).toContain(
      "multipart/form-data; boundary=",
    );
    const dados = pedido.postDataBuffer();
    expect(dados.includes(pdfExemplo)).toBe(true);
    expect(dados.includes(Buffer.from('name="privacidade"\r\n\r\ntrue'))).toBe(
      true,
    );
    envios++;
    return envios === 1
      ? route.fulfill({
          status: 503,
          json: { erro: "Não foi possível enviar. Tenta novamente." },
        })
      : route.fulfill({
          status: 201,
          json: {
            mensagem:
              "Candidatura recebida. Obrigado pelo teu interesse na Vextech.",
          },
        });
  });
  await page.goto("/pt/vagas/detalhe?id=7");
  await expect(page).toHaveURL(/detalhe\/\?id=7/);
  await expect(page).toHaveTitle("Java Developer — Carreiras Vextech");
  await expect(page.locator("#vaga-descricao")).toHaveText(vaga.descricao);
  await expect(page.locator("#vaga-descricao script")).toHaveCount(0);
  await expect(page.locator("#vaga-requisitos li")).toHaveCount(5);
  const form = page.locator("#form-candidatura");
  await expect(form.locator('input[type="file"]')).toHaveAttribute(
    "accept",
    "application/pdf,.pdf",
  );
  await form.getByLabel("Nome completo").fill("Candidato de teste");
  await form
    .getByLabel("Email", { exact: true })
    .fill("candidato@example.test");
  await form
    .locator('input[type="file"]')
    .setInputFiles({
      name: "curriculo.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: Buffer.from("não é PDF"),
    });
  await expect(page.locator("#candidatura-estado")).toContainText(
    "deve ser um ficheiro PDF",
  );
  await form
    .locator('input[type="file"]')
    .setInputFiles({
      name: "curriculo.pdf",
      mimeType: "application/pdf",
      buffer: pdfExemplo,
    });
  await form.getByRole("button", { name: "Enviar candidatura" }).click();
  expect(envios).toBe(0); // Confirmação de privacidade ainda não selecionada.
  await form.locator('input[type="checkbox"]').check();
  await form.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(page.locator("#candidatura-estado")).toContainText(
    "Não foi possível enviar",
  );
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Nome completo")).toHaveValue(
    "Candidato de teste",
  );
  await expect(form.locator('input[type="file"]')).not.toHaveValue("");
  await form.getByRole("button", { name: "Enviar candidatura" }).click();
  await expect(page.locator("#candidatura-estado")).toContainText(
    "Candidatura recebida",
  );
  await expect(form).toBeHidden();
  expect(envios).toBe(2);
  await page.getByRole("button", { name: "Mudar para versão escura" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await page
    .locator("main")
    .screenshot({
      path: `test-results/${testInfo.project.name}-vaga-individual.png`,
      style: ".nav,.skip{visibility:hidden!important}",
    });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(erros).toEqual([]);
});

test("Detalhe: vaga fechada ou API indisponível não apresenta formulário de candidatura", async ({
  page,
}) => {
  await page.route("**/api/vagas/7", (route) =>
    route.fulfill({
      status: 404,
      json: { erro: "Esta vaga já não está disponível." },
    }),
  );
  await page.goto("/pt/vagas/detalhe/?id=7");
  await expect(page.locator("#vaga-titulo")).toHaveText("Vaga indisponível.");
  await expect(page.locator("#form-candidatura")).toBeHidden();
  await page.unroute("**/api/vagas/7");
  await page.route("**/api/vagas/7", (route) => route.abort());
  await page.reload();
  await expect(page.locator("#vaga-titulo")).toContainText(
    "Não foi possível carregar",
  );
  await expect(page.locator("#form-candidatura")).toBeHidden();
});

test("Admin: descrição editável e candidatura recebida com descarga autenticada", async ({
  page,
}) => {
  await servirAdmin(page);
  await page.route("**/api/recrutamento/resumo?**", (route) =>
    route.fulfill({ json: resumoVazio }),
  );
  await page.route("**/api/auth/sessao", (route) =>
    route.fulfill({ json: { nome: "Admin", email: "admin@example.test" } }),
  );
  await page.route("**/api/vagas/admin", (route) =>
    route.fulfill({ json: [{ ...vaga, ativa: 1 }] }),
  );
  const candidatura = {
    id: 8,
    vaga_id: 7,
    vaga_titulo: vaga.titulo,
    vaga_localizacao: vaga.localizacao,
    nome: "<img src=x onerror=alert(1)>",
    email: "teste@example.test",
    telefone: "",
    mensagem: "Texto da candidatura",
    criado_em: "2026-11-08T12:00:00Z",
  };
  await page.route("**/api/candidaturas?**", (route) =>
    route.fulfill({
      json: { items: [candidatura], total: 1, pagina: 1, paginas: 1 },
    }),
  );
  await page.route("**/api/candidaturas/8", (route) =>
    route.fulfill({ json: candidatura }),
  );
  await page.goto("/admin/index.html");
  if (await page.locator("#mobile-menu").isVisible())
    await page.locator("#mobile-menu").click();
  await page.getByRole("button", { name: "Vagas", exact: true }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(page.getByLabel("Descrição da vaga")).toHaveValue(
    vaga.descricao,
  );
  await page.getByRole("button", { name: "Fechar editor" }).click();
  if (await page.locator("#mobile-menu").isVisible())
    await page.locator("#mobile-menu").click();
  await page.getByRole("button", { name: "Candidaturas", exact: true }).click();
  await expect(page.locator("#lista-candidaturas h2")).toHaveText(
    "<img src=x onerror=alert(1)>",
  );
  await expect(page.locator("#lista-candidaturas img")).toHaveCount(0);
  await page.getByRole("button", { name: /Abrir candidatura/ }).click();
  await expect(page.locator(".profile-message")).toHaveText(
    "Texto da candidatura",
  );
  await expect(
    page.getByRole("button", { name: "Descarregar currículo (PDF)" }),
  ).toBeVisible();
});
