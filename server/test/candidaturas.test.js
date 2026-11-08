import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PDFDocument } from "pdf-lib";
import { criarAdminTeste } from "./helpers/admin.js";
let adminTeste;

const db = process.env.VEXTECH_TEST_DB;
let pool, servidor, base, pasta, cookie, vagaId, pdf;
const executar = promisify(execFile);
const candidaturas = [];

before(async () => {
  if (!db?.endsWith("_test")) return;
  process.env.DB_NAME = db;
  process.env.JWT_SECRET = "chave-apenas-dos-testes-de-candidaturas";
  pasta = await mkdtemp(join(tmpdir(), "vextech-curriculos-"));
  process.env.CURRICULOS_DIR = pasta;
  ({ pool } = await import("../src/db.js"));
  await executar(process.execPath, [fileURLToPath(new URL("../src/scripts/migrate.js", import.meta.url))], { env: process.env });
  const [criada] = await pool.query("INSERT INTO vagas (titulo, localizacao, descricao, requisitos) VALUES (?, ?, ?, ?)", ["Java Developer", "Porto", "Descrição completa da vaga de teste.", JSON.stringify(["Requisito 1", "Requisito 2", "Requisito 3", "Requisito 4"])]);
  vagaId = criada.insertId;
  const doc = await PDFDocument.create(); doc.addPage(); pdf = await doc.save();
  const { app } = await import("../src/app.js");
  servidor = app.listen(0, "127.0.0.1"); await new Promise((r) => servidor.once("listening", r));
  base = `http://127.0.0.1:${servidor.address().port}`;
  adminTeste = await criarAdminTeste(pool);
  cookie = adminTeste.cookie;
});

after(async () => {
  if (servidor) { servidor.closeAllConnections(); await new Promise((r) => servidor.close(r)); }
  if (pool) {
    for (const id of candidaturas) await pool.query("DELETE FROM candidaturas WHERE id = ?", [id]);
    if (vagaId) await pool.query("DELETE FROM vagas WHERE id = ?", [vagaId]);
    if (adminTeste) await pool.query("DELETE FROM utilizadores WHERE id = ?", [adminTeste.id]);
    await pool.end();
  }
  if (pasta) await rm(pasta, { recursive: true, force: true });
});

function form({ bytes = pdf, mime = "application/pdf", nome = "cv.pdf", privacidade = "true", email = "candidato@example.test" } = {}) {
  const dados = new FormData();
  dados.set("nome", "Candidato de teste"); dados.set("email", email);
  dados.set("telefone", "+351 900000000"); dados.set("mensagem", "Mensagem de teste"); dados.set("privacidade", privacidade);
  if (bytes) dados.set("curriculo", new Blob([bytes], { type: mime }), nome);
  return dados;
}
const admin = (caminho, method = "GET") => fetch(`${base}${caminho}`, { method, headers: { Cookie: cookie } });
const enviar = (dados, id = vagaId) => fetch(`${base}/api/vagas/${id}/candidaturas`, { method: "POST", body: dados });

test("candidaturas reais: detalhe, PDF validado, armazenamento privado e acesso apenas com sessão", { skip: !db?.endsWith("_test") && "Defina VEXTECH_TEST_DB com uma base dedicada terminada em _test." }, async () => {
  const detalhe = await (await fetch(`${base}/api/vagas/${vagaId}`)).json();
  assert.equal(detalhe.descricao, "Descrição completa da vaga de teste.");
  assert.equal(detalhe.requisitos.length, 4);
  assert.equal((await fetch(`${base}/api/vagas/99999999`)).status, 404);
  const resposta = await enviar(form());
  assert.equal(resposta.status, 201);
  assert.match((await resposta.json()).mensagem, /Candidatura recebida/);
  const [guardadas] = await pool.query("SELECT * FROM candidaturas WHERE vaga_id = ?", [vagaId]);
  const candidatura = guardadas[0]; candidaturas.push(candidatura.id);
  assert.equal(candidatura.nome, "Candidato de teste"); assert.ok(candidatura.privacidade_aceite_em);
  assert.deepEqual(await readdir(pasta), [candidatura.cv_ficheiro]);
  assert.equal((await fetch(`${base}/api/candidaturas`)).status, 401);
  assert.equal((await fetch(`${base}/api/candidaturas/${candidatura.id}/curriculo`)).status, 401);
  assert.equal((await fetch(`${base}/private/curriculos/${candidatura.cv_ficheiro}`)).status, 404);
  assert.equal((await fetch(`${base}/uploads/vagas/${candidatura.cv_ficheiro}`)).status, 404);
  const listagem = await (await admin("/api/candidaturas")).json();
  assert.equal(listagem.find((c) => c.id === candidatura.id).cv_ficheiro, undefined);
  const descarga = await admin(`/api/candidaturas/${candidatura.id}/curriculo`);
  assert.equal(descarga.status, 200);
  assert.match(descarga.headers.get("content-disposition"), /attachment/);
  assert.match(descarga.headers.get("cache-control"), /no-store/);
  assert.equal(descarga.headers.get("content-type"), "application/pdf");
  assert.deepEqual(Buffer.from(await descarga.arrayBuffer()), Buffer.from(pdf));

  assert.equal((await enviar(form({ bytes: null }))).status, 400);
  assert.equal((await enviar(form({ bytes: Buffer.from("imagem"), mime: "image/png", nome: "cv.png" }))).status, 400);
  assert.equal((await enviar(form({ bytes: Buffer.from("ficheiro falsamente renomeado para pdf") }))).status, 400);
  assert.equal((await enviar(form({ bytes: Buffer.from("%PDF-1.7\nSem um documento PDF válido.") }))).status, 400);
  assert.equal((await enviar(form({ bytes: Buffer.alloc(5 * 1024 * 1024 + 1) }))).status, 413);
  assert.equal((await enviar(form({ privacidade: "false" }))).status, 400);
  assert.equal((await enviar(form({ email: "email inválido" }))).status, 400);
  await pool.query("UPDATE vagas SET ativa = 0 WHERE id = ?", [vagaId]);
  assert.equal((await fetch(`${base}/api/vagas/${vagaId}`)).status, 404);
  assert.equal((await enviar(form())).status, 404);
  assert.equal((await enviar(form(), 99999999)).status, 404);
  assert.equal((await enviar(form())).status, 429);
  assert.deepEqual(await readdir(pasta), [candidatura.cv_ficheiro]);

  // Remover a vaga mantém o histórico e o PDF no painel até o admin eliminar a candidatura.
  await pool.query("DELETE FROM vagas WHERE id = ?", [vagaId]);
  const historico = await (await admin("/api/candidaturas")).json();
  assert.equal(historico.find((c) => c.id === candidatura.id).vaga_id, null);
  assert.equal(historico.find((c) => c.id === candidatura.id).vaga_titulo, "Java Developer");
  assert.equal((await admin(`/api/candidaturas/${candidatura.id}/curriculo`)).status, 200);
  assert.equal((await admin(`/api/candidaturas/${candidatura.id}`, "DELETE")).status, 204);
  assert.equal((await admin(`/api/candidaturas/${candidatura.id}/curriculo`)).status, 404);
  assert.deepEqual(await readdir(pasta), []);
});
