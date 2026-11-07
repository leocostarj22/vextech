import { test, expect } from "@playwright/test";

test("Vextech: túnel, soluções, método, contacto e navegação", async ({
  page,
}, testInfo) => {
  const errors = [],
    failed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.url().includes("127.0.0.1") && r.status() >= 400)
      failed.push(r.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveTitle("Vextech — Tecnologia com visão");
  await expect(page.locator("h1")).toContainText("Tecnologia com visão.");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".nav__marca svg")).toHaveCount(2);
  await page.waitForTimeout(1200);
  const shot = async (name) =>
    page.screenshot({
      path: `test-results/${testInfo.project.name}-${name}.png`,
    });
  const scrollTo = async (y) => {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      y,
    );
    await page.waitForTimeout(650);
  };
  await shot("hero");
  const observed = new Set();
  for (let y = 900; y < 7000; y += 300) {
    await scrollTo(y);
    for (const item of await page.locator(".case.is-active").all()) {
      const index = await item.getAttribute("data-case");
      if (!observed.has(index)) {
        observed.add(index);
        await shot(`solucao-${Number(index) + 1}`);
      }
    }
  }
  expect([...observed].sort()).toEqual(["0", "1", "2"]);
  // Scrubbing backwards must restore interactive and accessible service overlays.
  await scrollTo(2400);
  const active = page.locator(".case.is-active");
  if (await active.count())
    await expect(active.first()).not.toHaveAttribute("inert", "");
  await page.locator("#vextech").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await shot("vextech");
  await page.locator("#solucoes").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await expect(page.locator(".projeto")).toHaveCount(3);
  await shot("solucoes");
  for (let i = 0; i < 3; i++) {
    await page.locator(".projeto").nth(i).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#detalhe-titulo")).toHaveText(
      ["Consultoria especializada", "Projetos chave-na-mão", "Nearshore"][i],
    );
    if (i === 0) await shot("detalhe");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  await page.locator("#metodo").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page
    .getByRole("button", { name: "Etapa 2: Construir", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Etapa 2: Construir", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".metodo__frase")).toContainText("competências");
  await shot("metodo");
  await page.locator("[data-contacto]").click();
  await expect(page.locator("#contacto-formulario")).toBeVisible();
  await expect(page.locator('select[name="assunto"]')).toHaveValue(
    "Candidatura espontânea",
  );
  await page
    .getByRole("textbox", { name: "Nome", exact: true })
    .fill("Pessoa de Teste");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("teste@example.com");
  await page
    .getByRole("textbox", { name: "Mensagem", exact: true })
    .fill("Quero conhecer a Vextech.");
  await page.getByRole("button", { name: "Testar formulário" }).click();
  await expect(page.getByRole("status")).toContainText(
    "A mensagem não foi enviada",
  );
  await page.getByRole("button", { name: "Fechar formulário" }).click();
  await expect(page.locator("#contacto-formulario")).toBeHidden();
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await shot("contacto");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  if (testInfo.project.name === "mobile") {
    await scrollTo(0);
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.locator("#navegacao")).toBeVisible();
    await page
      .locator("#navegacao")
      .getByRole("link", { name: "Soluções", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Abrir menu" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#navegacao")).toBeHidden();
  }
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});

test('as soluções continuam disponíveis sem WebGL', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Validação do fallback estático no desktop');
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto('/');
  await expect(page.locator('.tunel--fallback')).toHaveCount(1);
  await expect(page.locator('.fallback-cases article')).toHaveCount(3);
  await page.locator('.fallback-cases [data-abrir]').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#detalhe-titulo')).toHaveText('Consultoria especializada');
});
