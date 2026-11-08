import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import jwt from "jsonwebtoken";

const db = process.env.VEXTECH_TEST_DB;
const executar = promisify(execFile);
let pool, servidor, base, pasta, cookie;
const criadas = [];

before(async () => {
  if (!db?.endsWith("_test")) return;
  process.env.DB_NAME = db;
  process.env.JWT_SECRET = "chave-exclusiva-dos-testes-de-capas";
  pasta = await mkdtemp(join(tmpdir(), "vextech-capas-"));
  process.env.UPLOADS_DIR = pasta;
  ({ pool } = await import("../src/db.js"));
  // Simula uma instalação anterior: tabela existente e uma vaga já guardada.
  const inicial = await readFile(new URL("../src/migrations/001_init.sql", import.meta.url), "utf8");
  for (const sql of inicial.split(";").map((s) => s.trim()).filter(Boolean)) await pool.query(sql);
  const [antiga] = await pool.query("INSERT INTO vagas (titulo, localizacao, requisitos) VALUES (?, ?, ?)", ["Vaga anterior à migração", "Porto", "[]"]);
  criadas.push(antiga.insertId);
  const script = fileURLToPath(new URL("../src/scripts/migrate.js", import.meta.url));
  await executar(process.execPath, [script], { env: process.env });
  await executar(process.execPath, [script], { env: process.env });
  const [preservada] = await pool.query("SELECT titulo, capa FROM vagas WHERE id = ?", [antiga.insertId]);
  assert.equal(preservada[0].titulo, "Vaga anterior à migração");
  assert.equal(preservada[0].capa, null);
  const { app } = await import("../src/app.js");
  servidor = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => servidor.once("listening", resolve));
  base = `http://127.0.0.1:${servidor.address().port}`;
  cookie = `sessao=${jwt.sign({ id: 1, nome: "Teste", email: "teste@example.test" }, process.env.JWT_SECRET)}`;
});

after(async () => {
  if (servidor) {
    servidor.closeAllConnections();
    await new Promise((resolve) => servidor.close(resolve));
  }
  if (pool) {
    for (const id of criadas) await pool.query("DELETE FROM vagas WHERE id = ?", [id]);
    await pool.end();
  }
  if (pasta) await rm(pasta, { recursive: true, force: true });
});

function formulario(bytes, tipo = "image/png", extras = {}) {
  const form = new FormData();
  form.set("titulo", "Java Developer"); form.set("localizacao", "Porto");
  form.set("requisitos", JSON.stringify(["Java"])); form.set("ativa", "true");
  for (const [chave, valor] of Object.entries(extras)) form.set(chave, valor);
  if (bytes) form.set("capa", new Blob([bytes], { type: tipo }), tipo === "image/jpeg" ? "capa.jpg" : "capa.png");
  return form;
}
const pedido = (caminho, method, body, autenticado = true) => fetch(`${base}${caminho}`, {
  method, headers: autenticado ? { Cookie: cookie } : {}, body,
});

test("capas: migração preserva dados; criar, manter, substituir, remover e apagar por HTTP", { skip: !db?.endsWith("_test") && "Defina VEXTECH_TEST_DB com uma base dedicada terminada em _test." }, async () => {
  const png = await sharp({ create: { width: 32, height: 18, channels: 3, background: "#68d2df" } }).png().toBuffer();
  const jpg = await sharp(png).jpeg().toBuffer();
  assert.equal((await pedido("/api/vagas", "POST", formulario(png), false)).status, 401);
  assert.deepEqual(await readdir(pasta), []);
  const criar = await pedido("/api/vagas", "POST", formulario(png));
  assert.equal(criar.status, 201);
  const primeira = await criar.json(); criadas.push(primeira.id);
  assert.match(primeira.capa, /^\/uploads\/vagas\/[a-f0-9-]+\.png$/);
  let imagem = await fetch(`${base}${primeira.capa}`);
  assert.equal(imagem.status, 200);
  assert.equal(imagem.headers.get("content-type"), "image/png");
  assert.equal(imagem.headers.get("x-content-type-options"), "nosniff");
  assert.equal((await sharp(Buffer.from(await imagem.arrayBuffer())).metadata()).width, 32);
  const listar = async () => (await (await fetch(`${base}/api/vagas`)).json()).find((v) => v.id === primeira.id);
  assert.equal((await listar()).capa, primeira.capa);

  // Editar texto sem escolher outro ficheiro conserva a capa.
  assert.equal((await pedido(`/api/vagas/${primeira.id}`, "PUT", formulario())).status, 204);
  assert.equal((await listar()).capa, primeira.capa);
  assert.equal((await pedido(`/api/vagas/${primeira.id}`, "PUT", formulario(jpg, "image/jpeg"))).status, 204);
  const substituida = await listar();
  assert.match(substituida.capa, /\.jpg$/);
  assert.equal((await fetch(`${base}${primeira.capa}`)).status, 404);
  assert.equal((await fetch(`${base}${substituida.capa}`)).status, 200);

  assert.equal((await pedido(`/api/vagas/${primeira.id}`, "PUT", formulario(null, "image/png", { remover_capa: "true" }))).status, 204);
  assert.equal((await listar()).capa, null);
  assert.equal((await fetch(`${base}${substituida.capa}`)).status, 404);

  assert.equal((await pedido("/api/vagas", "POST", formulario(Buffer.from("<svg/>"), "image/svg+xml"))).status, 400);
  assert.equal((await pedido("/api/vagas", "POST", formulario(Buffer.from("isto não é PNG")))).status, 400);
  assert.equal((await pedido("/api/vagas", "POST", formulario(Buffer.alloc(5 * 1024 * 1024 + 1)))).status, 413);
  assert.equal((await pedido("/api/vagas/99999999", "PUT", formulario(png))).status, 404);
  assert.deepEqual(await readdir(pasta), []);

  assert.equal((await pedido(`/api/vagas/${primeira.id}`, "PUT", formulario(png))).status, 204);
  const antesDeApagar = await listar();
  assert.equal((await pedido(`/api/vagas/${primeira.id}`, "DELETE")).status, 204);
  assert.equal((await fetch(`${base}${antesDeApagar.capa}`)).status, 404);
  assert.deepEqual(await readdir(pasta), []);
});
