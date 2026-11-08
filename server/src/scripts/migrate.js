import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { pool } from "../db.js";

const pasta = fileURLToPath(new URL("../migrations/", import.meta.url));
try {
  await pool.query("CREATE TABLE IF NOT EXISTS _migracoes (nome VARCHAR(160) PRIMARY KEY, aplicado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  const ficheiros = (await readdir(pasta)).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
  for (const ficheiro of ficheiros) {
    const [aplicadas] = await pool.query("SELECT nome FROM _migracoes WHERE nome = ?", [ficheiro]);
    if (aplicadas.length) continue;
    const comandos = (await readFile(join(pasta, ficheiro), "utf8")).split(";").map((c) => c.trim()).filter(Boolean);
    for (const comando of comandos) await pool.query(comando);
    await pool.query("INSERT INTO _migracoes (nome) VALUES (?)", [ficheiro]);
    console.log(`Migração aplicada: ${ficheiro}.`);
  }
} finally {
  await pool.end();
}
