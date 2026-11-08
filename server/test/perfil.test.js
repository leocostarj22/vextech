import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
const db = process.env.VEXTECH_TEST_DB;
let pool, server, base;
const ids = [];
before(async () => {
  if (!db?.endsWith("_test")) return;
  process.env.DB_NAME = db;
  process.env.JWT_SECRET = "chave-dedicada-aos-testes-de-perfil";
  await promisify(execFile)(
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
  "Perfil real: dados pessoais, conflitos, password, isolamento e revogação das sessões",
  { skip: !db?.endsWith("_test") && "Requer base dedicada _test." },
  async () => {
    const email = `perfil-${randomUUID()}@example.test`,
      outroEmail = `outro-${randomUUID()}@example.test`,
      password = "Password inicial 123";
    for (const e of [email, outroEmail]) {
      const [r] = await pool.query(
        "INSERT INTO utilizadores (nome,email,password_hash) VALUES (?,?,?)",
        ["Admin de teste", e, await bcrypt.hash(password, 8)],
      );
      ids.push(r.insertId);
    }
    const pedido = (path, body, cookie, method = body ? "PUT" : "GET") =>
      fetch(base + path, {
        method,
        headers: {
          ...(cookie ? { Cookie: cookie } : {}),
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    const cookieDe = (r) => r.headers.get("set-cookie").split(";")[0];
    const login = (e, p) =>
      pedido("/api/auth/login", { email: e, password: p }, null, "POST");
    const inicial = await login(email, password);
    assert.equal(inicial.status, 200);
    let cookie = cookieDe(inicial),
      antiga = cookie;
    for (const path of ["/api/auth/perfil", "/api/auth/password"])
      assert.equal(
        (await pedido(path, path.endsWith("password") ? {} : null)).status,
        401,
      );
    const perfil = await pedido("/api/auth/perfil", null, cookie);
    assert.match(perfil.headers.get("cache-control"), /no-store/);
    assert.deepEqual(await perfil.json(), { nome: "Admin de teste", email });
    const alterar = (body) => pedido("/api/auth/perfil", body, cookie);
    assert.equal(
      (await alterar({ nome: "Nome novo", email, password_atual: "errada" }))
        .status,
      400,
    );
    for (const body of [
      { nome: "", email, password_atual: password },
      { nome: "Nome", email: "invalido", password_atual: password },
      { nome: { a: 1 }, email, password_atual: password },
    ])
      assert.equal((await alterar(body)).status, 400);
    assert.equal(
      (
        await alterar({
          nome: "Nome novo",
          email: outroEmail,
          password_atual: password,
        })
      ).status,
      409,
    );
    const guardado = await alterar({
      id: ids[1],
      nome: "  Nome atualizado  ",
      email,
      password_atual: password,
    });
    assert.equal(guardado.status, 200);
    cookie = cookieDe(guardado);
    assert.deepEqual(await guardado.json(), { nome: "Nome atualizado", email });
    assert.equal(
      (await (await pedido("/api/auth/sessao", null, antiga)).json()).nome,
      "Nome atualizado",
    );
    assert.equal(
      (
        await alterar({
          nome: "Nome atualizado",
          email,
          password_atual: password,
        })
      ).status,
      200,
    );
    const [outraConta] = await pool.query(
      "SELECT nome FROM utilizadores WHERE id=?",
      [ids[1]],
    );
    assert.equal(outraConta[0].nome, "Admin de teste");
    const trocar = (body) => pedido("/api/auth/password", body, cookie);
    for (const body of [
      {
        password_atual: "errada",
        nova_password: "Nova password 456",
        confirmar_password: "Nova password 456",
      },
      {
        password_atual: password,
        nova_password: "curta",
        confirmar_password: "curta",
      },
      {
        password_atual: password,
        nova_password: "Nova password 456",
        confirmar_password: "outra",
      },
      {
        password_atual: password,
        nova_password: password,
        confirmar_password: password,
      },
      {
        password_atual: password,
        nova_password: "á".repeat(40),
        confirmar_password: "á".repeat(40),
      },
    ])
      assert.equal((await trocar(body)).status, 400);
    const nova = "Nova password 456";
    antiga = cookie;
    const trocada = await trocar({
      password_atual: password,
      nova_password: nova,
      confirmar_password: nova,
    });
    assert.equal(trocada.status, 200);
    cookie = cookieDe(trocada);
    const [utilizadores] = await pool.query(
      "SELECT password_hash,versao_sessao FROM utilizadores WHERE id=?",
      [ids[0]],
    );
    assert.equal(
      await bcrypt.compare(nova, utilizadores[0].password_hash),
      true,
    );
    assert.equal(utilizadores[0].versao_sessao, 1);
    for (const path of [
      "/api/auth/perfil",
      "/api/auth/sessao",
      "/api/vagas/admin",
      "/api/recrutamento/resumo",
      "/api/candidaturas?pagina=1",
      "/api/candidaturas/1/curriculo",
    ])
      assert.equal((await pedido(path, null, antiga)).status, 401);
    assert.equal((await pedido("/api/auth/perfil", null, cookie)).status, 200);
    assert.equal((await login(email, password)).status, 401);
    assert.equal((await login(email, nova)).status, 200);
    const novoEmail = `novo-${randomUUID()}@example.test`;
    const emailGuardado = await alterar({
      nome: "Nome atualizado",
      email: novoEmail,
      password_atual: nova,
    });
    assert.equal(emailGuardado.status, 200);
    const emailCookie = cookieDe(emailGuardado);
    assert.equal((await pedido("/api/auth/perfil", null, cookie)).status, 401);
    cookie = emailCookie;
    assert.equal((await login(email, nova)).status, 401);
    assert.equal((await login(novoEmail, nova)).status, 200);
    // Duas mudanças simultâneas não podem sobrepor a password uma da outra.
    const senhas = ["Concorrente password A", "Concorrente password B"];
    const concorrentes = await Promise.all(
      senhas.map((p) =>
        trocar({
          password_atual: nova,
          nova_password: p,
          confirmar_password: p,
        }),
      ),
    );
    assert.equal(concorrentes.filter((r) => r.status === 200).length, 1);
    assert.ok(concorrentes.every((r) => [200, 409, 401].includes(r.status)));
    const vencedora = concorrentes.findIndex((r) => r.status === 200);
    const acessoFinal = await login(novoEmail, senhas[vencedora]);
    assert.equal(acessoFinal.status, 200);
    const logout = await pedido(
      "/api/auth/logout",
      null,
      cookieDe(acessoFinal),
      "POST",
    );
    assert.equal(logout.status, 204);
    assert.match(logout.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/);
    assert.equal((await pedido("/api/auth/perfil", null, cookie)).status, 401);
  },
);
