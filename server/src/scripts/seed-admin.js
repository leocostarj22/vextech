import bcrypt from "bcrypt";
import { pool } from "../db.js";

function lerArgumentos() {
  const args = {};
  for (const parte of process.argv.slice(2)) {
    const [, chave, valor] = parte.match(/^--([^=]+)=(.*)$/) || [];
    if (chave) args[chave] = valor;
  }
  return args;
}

const { nome, email, password } = lerArgumentos();

if (!nome || !email || !password) {
  console.error(
    'Uso: npm run seed:admin -- --nome="Nome" --email="email@vextech.pt" --password="senha-forte"',
  );
  process.exit(1);
}

const [existentes] = await pool.query(
  "SELECT id FROM utilizadores WHERE email = ?",
  [email],
);
if (existentes.length > 0) {
  console.error(`Já existe um utilizador com o email ${email}.`);
  process.exit(1);
}

const password_hash = await bcrypt.hash(password, 12);
await pool.query(
  "INSERT INTO utilizadores (nome, email, password_hash) VALUES (?, ?, ?)",
  [nome, email, password_hash],
);

console.log(`Admin criado: ${email}. Pode agora fazer login em /admin/login.html.`);
await pool.end();
