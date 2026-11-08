import { test, expect } from "@playwright/test";
import { servirAdmin } from "./fixtures/admin";
import { pdfExemplo } from "./fixtures/pdf";
const vaga = {
  id: 7,
  titulo: "Java Developer",
  localizacao: "Porto",
  ativa: 1,
  requisitos: ["Java"],
  descricao: "Descrição já guardada.",
};
const perfil = {
  id: 8,
  vaga_id: 7,
  vaga_titulo: "Java Developer",
  vaga_localizacao: "Porto",
  nome: "Perfil de teste <script>literal</script>",
  email: "perfil@example.test",
  telefone: "",
  mensagem: "Mensagem <b>literal</b>",
  criado_em: "2026-11-08T12:00:00Z",
  privacidade_aceite_em: "2026-11-08T12:00:00Z",
};
const resumo = {
  vagas_ativas: 1,
  candidaturas_total: 21,
  recebidas: 2,
  vagas_com_candidaturas: 1,
  serie: [
    { de: "2026-11-01", ate: "2026-11-05", total: 1 },
    { de: "2026-11-05", ate: "2026-11-09", total: 1 },
  ],
  recentes: [perfil],
};
async function preparar(page) {
  await servirAdmin(page);
  await page.route("**/api/auth/sessao", (r) =>
    r.fulfill({
      json: { nome: "Admin de teste", email: "admin@example.test" },
    }),
  );
  await page.route("**/api/vagas/admin", (r) => r.fulfill({ json: [vaga] }));
  await page.route("**/api/recrutamento/resumo?**", (r) =>
    r.fulfill({ json: resumo }),
  );
}
async function navegar(page, nome) {
  if (await page.locator("#mobile-menu").isVisible())
    await page.locator("#mobile-menu").click();
  await page.getByRole("button", { name: nome, exact: true }).click();
}

test("Recrutamento: indicadores e gráfico abrem dados filtrados; ficha, PDF privado e sessão expirada", async ({
  page,
}, testInfo) => {
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await preparar(page);
  let query;
  await page.route("**/api/candidaturas?**", (r) => {
    query = new URL(r.request().url()).searchParams;
    return r.fulfill({
      json: { items: [perfil], total: 1, pagina: 1, paginas: 1 },
    });
  });
  await page.route("**/api/candidaturas/8", (r) => r.fulfill({ json: perfil }));
  let tentativas = 0;
  await page.route("**/api/candidaturas/8/curriculo", (r) =>
    ++tentativas === 1
      ? r.fulfill({ status: 404, json: { erro: "Currículo indisponível." } })
      : r.fulfill({ body: pdfExemplo, contentType: "application/pdf" }),
  );
  await page.goto("/admin/index.html");
  await expect(page.locator(".metric strong")).toHaveText(["1", "2", "1"]);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Ativar tema escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-admin-dashboard.png`,
    fullPage: true,
  });
  await page.getByLabel("Período", { exact: true }).selectOption("7");
  await page.getByLabel("Vaga", { exact: true }).selectOption("7");
  await page.locator('[data-bin="0"]').click();
  await expect(page.locator("#lista-candidaturas h2")).toHaveText(perfil.nome);
  await expect.poll(() => query?.get("vaga")).toBe("7");
  expect(query.get("dias")).toBe("7");
  expect(query.get("de")).toBe("2026-11-01");
  expect(query.get("ate")).toBe("2026-11-05");
  expect(query.get("pagina")).toBe("1");
  await page.getByRole("button", { name: /Abrir candidatura/ }).click();
  await expect(page.locator(".profile-message")).toHaveText(perfil.mensagem);
  await expect(page.locator("#ficha script,#ficha b")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Descarregar currículo (PDF)" })
    .click();
  await expect(page.locator("#ficha-erro")).toHaveText(
    "Currículo indisponível.",
  );
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descarregar currículo (PDF)" })
    .click();
  expect((await download).suggestedFilename()).toBe("curriculo-8.pdf");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-admin-ficha.png`,
  });
  await page.keyboard.press("Escape");
  await expect(page.locator("#ficha")).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.route("**/api/candidaturas?**", (r) =>
    r.fulfill({ status: 401, json: { erro: "Sessão inválida." } }),
  );
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Entrar", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#app")).toBeHidden();
  expect(erros).toEqual([]);
});

test("Recrutamento: paginação, pesquisa no servidor, vazio e recuperação após erro", async ({
  page,
}) => {
  await preparar(page);
  let falha = false,
    ultima;
  await page.route("**/api/candidaturas?**", (r) => {
    ultima = new URL(r.request().url()).searchParams;
    if (falha)
      return r.fulfill({
        status: 503,
        json: { erro: "Servidor indisponível." },
      });
    const p = Number(ultima.get("pagina"));
    return r.fulfill({
      json: {
        items: ultima.get("q") ? [] : [perfil],
        total: ultima.get("q") ? 0 : 21,
        pagina: p,
        paginas: ultima.get("q") ? 1 : 2,
      },
    });
  });
  await page.goto("/admin/index.html");
  await navegar(page, "Candidaturas");
  await page.getByRole("button", { name: "Seguinte", exact: true }).click();
  await expect(page.locator(".pagination")).toContainText("Página 2 de 2");
  expect(ultima.get("pagina")).toBe("2");
  await page.getByLabel("Pesquisar candidaturas", { exact: true }).fill("%_");
  await page.getByRole("button", { name: "Pesquisar", exact: true }).click();
  await expect(page.locator(".empty")).toContainText("Nenhuma candidatura");
  expect(ultima.get("q")).toBe("%_");
  expect(ultima.get("pagina")).toBe("1");
  falha = true;
  await page.getByRole("button", { name: "Atualizar", exact: true }).click();
  await expect(page.locator("#view-status")).toContainText(
    "Servidor indisponível.",
  );
  await expect(page.locator("#lista-candidaturas")).toHaveCount(0);
  falha = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".empty")).toBeVisible();
  await page.getByLabel("Período", { exact: true }).selectOption("todos");
  await expect.poll(() => ultima.get("dias")).toBe("todos");
});

test("Recrutamento: erros de gravação conservam a vaga e convites confirmam só após sucesso", async ({
  page,
}) => {
  await preparar(page);
  await page.route("**/api/vagas/7", (r) =>
    r.fulfill({ status: 500, json: { erro: "Não foi possível guardar." } }),
  );
  await page.goto("/admin/index.html");
  await navegar(page, "Vagas");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page
    .getByLabel("Descrição da vaga")
    .fill("Texto que deve ser conservado.");
  await page.getByRole("button", { name: "Guardar alterações" }).click();
  await expect(page.locator("#erro-vaga")).toHaveText(
    "Não foi possível guardar.",
  );
  await expect(page.getByLabel("Descrição da vaga")).toHaveValue(
    "Texto que deve ser conservado.",
  );
  await expect(page.locator("#editor")).toBeVisible();
  await page.getByRole("button", { name: "Fechar editor" }).click();
  await navegar(page, "Convites");
  let erro = true;
  await page.route("**/api/auth/convites", (r) =>
    erro
      ? r.fulfill({ status: 500, json: { erro: "Não foi possível gerar." } })
      : r.fulfill({
          status: 201,
          json: { link: "/admin/registar.html?token=exemplo" },
        }),
  );
  await page
    .getByLabel("Email da pessoa a convidar")
    .fill("admin@example.test");
  await page.getByRole("button", { name: /Gerar convite/ }).click();
  await expect(page.locator("#resultado-convite")).toBeHidden();
  await expect(page.locator("#erro-convite")).toHaveText(
    "Não foi possível gerar.",
  );
  erro = false;
  await page.getByRole("button", { name: /Gerar convite/ }).click();
  await expect(page.locator("#link-convite")).toHaveValue(
    /registar.html\?token=exemplo/,
  );
});
