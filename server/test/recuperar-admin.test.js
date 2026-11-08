import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redefinirPasswordAdmin } from "../src/recuperar-admin.js";
const executar = promisify(execFile),
  script = fileURLToPath(
    new URL("../src/scripts/reset-admin-password.js", import.meta.url),
  );
test("recuperação: recusa pipe e argumentos, sem mostrar passwords", async () => {
  for (const args of [[], ["--password=segredo-apenas-de-teste"]])
    await assert.rejects(
      executar(process.execPath, [script, ...args]),
      (e) =>
        e.code === 1 &&
        e.stderr.includes("terminal interativo") &&
        !e.stderr.includes("segredo-apenas-de-teste") &&
        !e.stdout.includes("segredo-apenas-de-teste"),
    );
});
test("recuperação: dados inválidos não iniciam consultas", async () => {
  const db = {
    query() {
      throw new Error("Não deve consultar");
    },
  };
  for (const body of [
    {
      email: "invalido",
      password: "Nova password 123",
      confirmacao: "Nova password 123",
    },
    { email: "teste@example.test", password: "curta", confirmacao: "curta" },
    {
      email: "teste@example.test",
      password: "á".repeat(40),
      confirmacao: "á".repeat(40),
    },
    {
      email: "teste@example.test",
      password: "Nova password 123",
      confirmacao: "outra",
    },
  ])
    await assert.rejects(
      redefinirPasswordAdmin(db, body),
      (e) => e.recuperacao === true,
    );
});
const db = process.env.VEXTECH_TEST_DB;
let pool, server, base;
const ids = [];
before(async () => {
  if (!db?.endsWith("_test")) return;
  process.env.DB_NAME = db;
  process.env.JWT_SECRET = "chave-de-teste-recuperacao";
  await executar(
    process.execPath,
    [fileURLToPath(new URL("../src/scripts/migrate.js", import.meta.url))],
    { env: process.env },
  );
  ({ pool } = await import("../src/db.js"));
  const { app } = await import("../src/app.js");
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
  if (pool) {
    for (const id of ids)
      await pool.query("DELETE FROM utilizadores WHERE id=?", [id]);
    await pool.end();
  }
});
test(
  "recuperação real: substitui apenas a password da conta indicada e invalida sessões antigas",
  { skip: !db?.endsWith("_test") && "Requer base dedicada _test." },
  async () => {
    const email = `recuperar-${randomUUID()}@example.test`,
      outra = `outra-${randomUUID()}@example.test`,
      antiga = "Password esquecida 123",
      nova = "Password recuperada 456",
      hash = await bcrypt.hash(antiga, 8);
    for (const e of [email, outra]) {
      const [r] = await pool.query(
        "INSERT INTO utilizadores (nome,email,password_hash) VALUES (?,?,?)",
        ["Admin de teste", e, hash],
      );
      ids.push(r.insertId);
    }
    const snapshot = async () => {
      const [r] = await pool.query("SELECT * FROM utilizadores WHERE id=?", [
        ids[0],
      ]);
      return r[0];
    };
    const antes = await snapshot();
    await assert.rejects(
      redefinirPasswordAdmin(pool, {
        email,
        password: nova,
        confirmacao: "outra",
      }),
    );
    assert.deepEqual(await snapshot(), antes);
    await assert.rejects(
      redefinirPasswordAdmin(pool, {
        email: "nao-existe@example.test",
        password: nova,
        confirmacao: nova,
      }),
      /Não existe/,
    );
    await redefinirPasswordAdmin(pool, {
      email,
      password: nova,
      confirmacao: nova,
    });
    const depois = await snapshot();
    assert.equal(depois.id, antes.id);
    assert.equal(depois.nome, antes.nome);
    assert.equal(depois.email, antes.email);
    assert.equal(depois.versao_sessao, antes.versao_sessao + 1);
    assert.equal(await bcrypt.compare(nova, depois.password_hash), true);
    assert.equal(await bcrypt.compare(antiga, depois.password_hash), false);
    const [outros] = await pool.query(
      "SELECT password_hash,versao_sessao FROM utilizadores WHERE id=?",
      [ids[1]],
    );
    assert.equal(outros[0].password_hash, hash);
    assert.equal(outros[0].versao_sessao, 0);
    const cookie = `sessao=${jwt.sign({ id: ids[0], versao_sessao: 0 }, process.env.JWT_SECRET)}`;
    assert.equal(
      (await fetch(base + "/api/auth/sessao", { headers: { Cookie: cookie } }))
        .status,
      401,
    );
    const login = (password) =>
      fetch(base + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    assert.equal((await login(antiga)).status, 401);
    assert.equal((await login(nova)).status, 200);
  },
);
