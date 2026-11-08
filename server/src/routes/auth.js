import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { pool } from "../db.js";
import { exigirAutenticacao } from "../middleware/auth.js";

export const authRouter = Router();

const cookieOpcoes = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 12 * 60 * 60 * 1000,
};

function emitirSessao(res, utilizador) {
  const token = jwt.sign(
    { id: utilizador.id, nome: utilizador.nome, email: utilizador.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "12h" },
  );
  res.cookie("sessao", token, cookieOpcoes);
}

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ erro: "Email e password são obrigatórios." });

  const [linhas] = await pool.query(
    "SELECT id, nome, email, password_hash FROM utilizadores WHERE email = ?",
    [email],
  );
  const utilizador = linhas[0];
  if (!utilizador || !(await bcrypt.compare(password, utilizador.password_hash))) {
    return res.status(401).json({ erro: "Credenciais inválidas." });
  }

  emitirSessao(res, utilizador);
  res.json({ nome: utilizador.nome, email: utilizador.email });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("sessao", cookieOpcoes);
  res.status(204).end();
});

authRouter.get("/sessao", exigirAutenticacao, (req, res) => {
  res.json({ nome: req.utilizador.nome, email: req.utilizador.email });
});

authRouter.post("/convites", exigirAutenticacao, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ erro: "Email é obrigatório." });

  const token = randomBytes(24).toString("hex");
  const expiraEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO convites (email, token, criado_por, expira_em) VALUES (?, ?, ?, ?)",
    [email, token, req.utilizador.id, expiraEm],
  );

  res.status(201).json({
    link: `/admin/registar.html?token=${token}`,
    expira_em: expiraEm,
  });
});

authRouter.post("/registar", async (req, res) => {
  const { token, nome, password } = req.body || {};
  if (!token || !nome || !password)
    return res.status(400).json({ erro: "Token, nome e password são obrigatórios." });

  const [linhas] = await pool.query(
    "SELECT id, email, usado_em, expira_em FROM convites WHERE token = ?",
    [token],
  );
  const convite = linhas[0];
  if (!convite) return res.status(404).json({ erro: "Convite não encontrado." });
  if (convite.usado_em) return res.status(409).json({ erro: "Convite já foi utilizado." });
  if (new Date(convite.expira_em) < new Date())
    return res.status(410).json({ erro: "Convite expirado." });

  const password_hash = await bcrypt.hash(password, 12);
  const [resultado] = await pool.query(
    "INSERT INTO utilizadores (nome, email, password_hash) VALUES (?, ?, ?)",
    [nome, convite.email, password_hash],
  );
  await pool.query("UPDATE convites SET usado_em = NOW() WHERE id = ?", [convite.id]);

  emitirSessao(res, { id: resultado.insertId, nome, email: convite.email });
  res.status(201).json({ nome, email: convite.email });
});
