import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "../db.js";

const caminho = fileURLToPath(
  new URL("../migrations/001_init.sql", import.meta.url),
);

const sql = await readFile(caminho, "utf8");
const comandos = sql
  .split(";")
  .map((c) => c.trim())
  .filter(Boolean);

for (const comando of comandos) {
  await pool.query(comando);
}

console.log(`Migração aplicada: ${comandos.length} instruções executadas.`);
await pool.end();
