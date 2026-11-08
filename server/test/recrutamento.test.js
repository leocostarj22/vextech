import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  diaLisboa,
  inicioDia,
  lerFiltros,
  intervalos,
} from "../src/recrutamento.js";
import jwt from "jsonwebtoken";
test("Lisboa: dias de 23/25 horas; gráfico e pesquisa partilham limites", () => {
  assert.equal(inicioDia("2026-03-30") - inicioDia("2026-03-29"), 23 * 3600000);
  assert.equal(inicioDia("2026-10-26") - inicioDia("2026-10-25"), 25 * 3600000);
  assert.equal(diaLisboa(new Date("2026-07-01T23:30:00Z")), "2026-07-02");
  for (const dias of ["7", "30", "90"]) {
    const f = lerFiltros({ dias }, new Date("2026-11-08T12:00:00Z")),
      bins = intervalos(f);
    assert.equal(bins[0].de, f.de);
    assert.equal(bins.at(-1).ate, f.ate);
    for (let i = 1; i < bins.length; i++)
      assert.equal(bins[i - 1].ate, bins[i].de);
    assert.equal(
      (Date.parse(f.ate) - Date.parse(f.de)) / 86400000,
      Number(dias),
    );
  }
});
test("filtros: valida parâmetros e mantém a pesquisa literal e parametrizada", () => {
  for (const q of [
    { dias: "5" },
    { dias: ["7", "30"] },
    { vaga: "0" },
    { de: "2026-02-30", ate: "2026-03-01" },
    { de: "2026-11-10", ate: "2026-11-09" },
    { de: "2026-01-01", ate: "2026-11-08" },
    { q: "a".repeat(161) },
  ])
    assert.throws(
      () => lerFiltros(q),
      (e) => e.status === 400,
    );
  const f = lerFiltros({ dias: "todos", q: "%_' OR 1=1 --" });
  assert.ok(!f.where.includes("OR 1=1"));
  assert.ok(f.valores.includes("%_' OR 1=1 --"));
  assert.equal(lerFiltros({ vaga: "removidas" }).vaga, "removidas");
});
const db = process.env.VEXTECH_TEST_DB;
let pool, server, base, cookie;
const ids = [],
  jobs = [];
before(async () => {
  if (!db?.endsWith("_test")) return;
  process.env.DB_NAME = db;
  process.env.JWT_SECRET = "teste-exclusivo-recrutamento";
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
  cookie = `sessao=${jwt.sign({ id: 1, nome: "Teste" }, process.env.JWT_SECRET)}`;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
  if (pool) {
    for (const id of ids)
      await pool.query("DELETE FROM candidaturas WHERE id = ?", [id]);
    for (const id of jobs)
      await pool.query("DELETE FROM vagas WHERE id = ?", [id]);
    await pool.end();
  }
});
test(
  "API: datas, estatísticas, pesquisa, paginação, detalhes privados e vaga removida",
  { skip: !db?.endsWith("_test") && "Requer base dedicada _test." },
  async () => {
    const get = (path, auth = true) =>
      fetch(base + path, { headers: auth ? { Cookie: cookie } : {} });
    for (const path of [
      "/api/recrutamento/resumo",
      "/api/candidaturas?pagina=1",
      "/api/candidaturas/1",
    ])
      assert.equal((await get(path, false)).status, 401);
    const [job] = await pool.query(
      "INSERT INTO vagas (titulo, localizacao, requisitos) VALUES (?, ?, ?)",
      ["Vaga estatística teste", "Porto", "[]"],
    );
    jobs.push(job.insertId);
    const f = lerFiltros({ dias: "7" }),
      datas = [
        new Date(inicioDia(f.de).getTime() - 1000),
        inicioDia(f.de),
        new Date(inicioDia(f.ate).getTime() - 1000),
        inicioDia(f.ate),
      ];
    for (let i = 0; i < datas.length; i++) {
      const [r] = await pool.query(
        "INSERT INTO candidaturas (vaga_id,vaga_titulo,vaga_localizacao,nome,email,mensagem,cv_ficheiro,criado_em) VALUES (?,?,?,?,?,?,?,?)",
        [
          job.insertId,
          "Vaga estatística teste",
          "Porto",
          i === 1 ? "Literal %_ teste" : `Perfil teste ${i}`,
          "teste@example.test",
          "Mensagem privada",
          "ficheiro-de-teste.pdf",
          datas[i],
        ],
      );
      ids.push(r.insertId);
    }
    const q = `dias=7&vaga=${job.insertId}`,
      r = await get("/api/recrutamento/resumo?" + q);
    assert.equal(r.status, 200);
    assert.match(r.headers.get("cache-control"), /no-store/);
    const s = await r.json();
    assert.equal(s.recebidas, 2);
    assert.equal(
      s.serie.reduce((n, b) => n + b.total, 0),
      2,
    );
    assert.equal(s.vagas_com_candidaturas, 1);
    assert.equal(s.recentes.length, 2);
    assert.equal(s.recentes[0].email, undefined);
    const list = await (
      await get("/api/candidaturas?pagina=2&tamanho=1&" + q)
    ).json();
    assert.equal(list.total, 2);
    assert.equal(list.items.length, 1);
    assert.equal(list.items[0].id, ids[1]);
    assert.equal(list.items[0].mensagem, undefined);
    assert.equal(list.items[0].cv_ficheiro, undefined);
    assert.equal(
      (await (await get("/api/candidaturas?pagina=1&q=%25_&" + q)).json())
        .total,
      1,
    );
    assert.equal(
      (await (await get("/api/candidaturas?pagina=99&tamanho=1&" + q)).json())
        .pagina,
      2,
    );
    const detalhe = await (await get(`/api/candidaturas/${ids[1]}`)).json();
    assert.equal(detalhe.mensagem, "Mensagem privada");
    assert.equal(detalhe.cv_ficheiro, undefined);
    assert.equal((await get("/api/candidaturas/99999999")).status, 404);
    assert.equal(
      (await get("/api/recrutamento/resumo?dias=todos")).status,
      400,
    );
    assert.equal((await get("/api/candidaturas?pagina=0")).status, 400);
    const [indexes] = await pool.query(
      "SHOW INDEX FROM candidaturas WHERE Key_name = 'idx_candidaturas_data'",
    );
    assert.ok(indexes.length);
    await pool.query("DELETE FROM vagas WHERE id = ?", [job.insertId]);
    const orfas = await (
      await get("/api/candidaturas?pagina=1&dias=todos&vaga=removidas")
    ).json();
    assert.ok(orfas.items.some((c) => ids.includes(c.id)));
    assert.equal(
      (await (await get(`/api/candidaturas/${ids[1]}`)).json()).vaga_titulo,
      "Vaga estatística teste",
    );
  },
);
