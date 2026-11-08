import { test, expect } from "@playwright/test";

const cenarios = [
  { nome: "sistema escuro", sistema: "dark", esperado: "escuro" },
  { nome: "sistema claro", sistema: "light", esperado: "claro" },
  { nome: "escolha guardada acima do sistema", sistema: "dark", guardado: "claro", esperado: "claro" },
  { nome: "URL acima da escolha guardada", sistema: "light", guardado: "claro", query: "?tema=escuro", esperado: "escuro" },
];

for (const c of cenarios) {
  test(`Abertura: ${c.nome}, antes do módulo e sem flash do link de salto`, async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: c.sistema });
    if (c.guardado) await page.addInitScript((tema) => localStorage.setItem("vextech-tema", tema), c.guardado);
    let soltar;
    const bloqueado = new Promise((resolve) => { soltar = resolve; });
    await page.route("**/src/main.js", async (route) => { await bloqueado; await route.continue(); });
    await page.route("**/api/vagas", (route) => route.fulfill({ json: [] }));
    await page.goto(`/${c.query || ""}`, { waitUntil: "commit" });
    await expect(page.locator("#abertura")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-tema", c.esperado);
    await expect(page.locator("#conteudo-site")).toHaveJSProperty("inert", true);
    expect(await page.locator("html").evaluate((el) => getComputedStyle(el).getPropertyValue("--abertura-fundo").trim())).toBe(c.esperado === "escuro" ? "#10111e" : "#f2f4f3");
    await expect(page.locator("#abertura svg")).toHaveCount(4);
    await expect(page.locator(".skip")).toHaveCSS("clip-path", "inset(50%)");
    expect(await page.locator(".abertura__centro").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return Math.abs(r.x + r.width / 2 - innerWidth / 2) < 2 && Math.abs(r.y + r.height / 2 - innerHeight / 2) < 2;
    })).toBe(true);
    if (testInfo.project.name === "reduced-motion") {
      await expect(page.locator(".abertura__revelada")).toHaveCSS("animation-name", "none");
    } else {
      await page.locator("#abertura").evaluate((el) => el.getAnimations({ subtree: true }).forEach((a) => { a.currentTime = 900; a.pause(); }));
    }
    if (!c.guardado) await page.screenshot({ path: `test-results/${testInfo.project.name}-abertura-${c.esperado}.png` });
    soltar();
    await expect(page.locator("#abertura")).toHaveCount(0, { timeout: 8000 });
    await expect(page.locator("#conteudo-site")).toHaveJSProperty("inert", false);
    await expect(page.locator("html")).toHaveAttribute("data-tema", c.esperado);
    await expect(page.locator("#abertura-falha")).toBeHidden();
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip")).toBeFocused();
    await expect(page.locator(".skip")).toHaveCSS("clip-path", "none");
  });
}

test("Abertura: falha no módulo não deixa a página bloqueada", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "A recuperação de arranque é comum aos layouts.");
  await page.route("**/src/main.js", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("#abertura")).toHaveCount(0, { timeout: 8000 });
  await expect(page.locator("#abertura-falha")).toBeVisible();
  await expect(page.locator("#conteudo-site")).toHaveJSProperty("inert", false);
});

test("Abertura: páginas legais continuam legíveis sem JavaScript", async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  try {
    await page.goto("http://127.0.0.1:5173/pt/termos-e-condicoes/");
    await expect(page.locator("#abertura")).toBeHidden();
    await expect(page.locator("#conteudo-site")).toHaveJSProperty("inert", false);
    await expect(page.locator("h1")).toHaveText("Termos e condições");
    await expect(page.locator(".legal__conteudo")).toContainText("Ao aceitar os Termos e Condições");
    await page.locator(".legal__lateral").getByRole("link", { name: "Política de privacidade" }).click();
    await expect(page.locator("h1")).toHaveText("Política de privacidade");
  } finally { await page.close(); }
});
