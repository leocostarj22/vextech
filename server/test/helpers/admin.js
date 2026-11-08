import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
export async function criarAdminTeste(pool) {
  const [r] = await pool.query(
    "INSERT INTO utilizadores (nome,email,password_hash) VALUES (?,?,?)",
    ["Admin de teste", `${randomUUID()}@example.test`, "sem-login-neste-teste"],
  );
  return {
    id: r.insertId,
    cookie: `sessao=${jwt.sign({ id: r.insertId }, process.env.JWT_SECRET)}`,
  };
}
