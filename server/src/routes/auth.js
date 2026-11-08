import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { pool } from "../db.js";
import { exigirAutenticacao } from "../middleware/auth.js";

export const authRouter = Router();
const tratar = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
authRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});

const cookieOpcoes = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 12 * 60 * 60 * 1000,
};

function emitirSessao(res, utilizador) {
  const token = jwt.sign(
    {
      id: utilizador.id,
      nome: utilizador.nome,
      email: utilizador.email,
      versao_sessao: utilizador.versao_sessao ?? 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "12h" },
  );
  res.cookie("sessao", token, cookieOpcoes);
}

authRouter.post(
  "/login",
  tratar(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ erro: "Email e password são obrigatórios." });

    const [linhas] = await pool.query(
      "SELECT id, nome, email, password_hash, versao_sessao FROM utilizadores WHERE email = ?",
      [email],
    );
    const utilizador = linhas[0];
    if (
      !utilizador ||
      !(await bcrypt.compare(password, utilizador.password_hash))
    ) {
      return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    emitirSessao(res, utilizador);
    res.json({ nome: utilizador.nome, email: utilizador.email });
  }),
);

authRouter.post("/logout", (req, res) => {
  const opcoes = { ...cookieOpcoes };
  delete opcoes.maxAge;
  res.clearCookie("sessao", opcoes);
  res.status(204).end();
});

authRouter.get("/sessao", exigirAutenticacao, (req, res) => {
  res.json({ nome: req.utilizador.nome, email: req.utilizador.email });
});

// O perfil pertence sempre à sessão; nenhum ID enviado pelo browser é utilizado.
const limitarPerfil = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => String(req.utilizador.id),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    erro: "Foram feitas várias tentativas. Tenta novamente dentro de alguns minutos.",
  },
});
const passwordAtualValida = (p) =>
  typeof p === "string" && p.length > 0 && p.length <= 1024;
const novaPasswordValida = (p) =>
  typeof p === "string" && p.length >= 8 && Buffer.byteLength(p, "utf8") <= 72;

authRouter.get("/perfil", exigirAutenticacao, (req, res) => {
  res.json({ nome: req.utilizador.nome, email: req.utilizador.email });
});

authRouter.put(
  "/perfil",
  exigirAutenticacao,
  limitarPerfil,
  tratar(async (req, res) => {
    const { nome, email, password_atual } = req.body || {};
    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      nome.trim().length > 120 ||
      typeof email !== "string" ||
      email.trim().length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !passwordAtualValida(password_atual)
    ) {
      return res
        .status(400)
        .json({ erro: "Preenche o nome, um email válido e a password atual." });
    }
    const [linhas] = await pool.query(
      "SELECT password_hash, versao_sessao FROM utilizadores WHERE id = ?",
      [req.utilizador.id],
    );
    const anterior = linhas[0];
    if (
      !anterior ||
      !(await bcrypt.compare(password_atual, anterior.password_hash))
    )
      return res.status(400).json({ erro: "A password atual está incorreta." });
    const novo = {
      ...req.utilizador,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
    };
    const incremento = novo.email !== req.utilizador.email ? 1 : 0;
    novo.versao_sessao += incremento;
    try {
      const [resultado] = await pool.query(
        "UPDATE utilizadores SET nome = ?, email = ?, versao_sessao = versao_sessao + ? WHERE id = ? AND password_hash = ? AND versao_sessao = ?",
        [
          novo.nome,
          novo.email,
          incremento,
          novo.id,
          anterior.password_hash,
          req.utilizador.versao_sessao,
        ],
      );
      if (!resultado.affectedRows)
        return res.status(409).json({
          erro: "A conta foi alterada noutra sessão. Atualiza a página e tenta novamente.",
        });
    } catch (erro) {
      if (erro.code === "ER_DUP_ENTRY")
        return res
          .status(409)
          .json({ erro: "Este email já está associado a outra conta." });
      throw erro;
    }
    emitirSessao(res, novo);
    res.json({ nome: novo.nome, email: novo.email });
  }),
);

authRouter.put(
  "/password",
  exigirAutenticacao,
  limitarPerfil,
  tratar(async (req, res) => {
    const { password_atual, nova_password, confirmar_password } =
      req.body || {};
    if (
      !passwordAtualValida(password_atual) ||
      !novaPasswordValida(nova_password)
    )
      return res.status(400).json({
        erro: "Indica a password atual e uma nova password com pelo menos 8 caracteres. Se for muito longa, escolhe uma combinação mais curta.",
      });
    if (nova_password !== confirmar_password)
      return res
        .status(400)
        .json({ erro: "A confirmação da nova password não coincide." });
    const [linhas] = await pool.query(
      "SELECT password_hash FROM utilizadores WHERE id = ?",
      [req.utilizador.id],
    );
    const anterior = linhas[0];
    if (
      !anterior ||
      !(await bcrypt.compare(password_atual, anterior.password_hash))
    )
      return res.status(400).json({ erro: "A password atual está incorreta." });
    if (await bcrypt.compare(nova_password, anterior.password_hash))
      return res
        .status(400)
        .json({ erro: "Escolhe uma password diferente da atual." });
    const hash = await bcrypt.hash(nova_password, 12);
    const [resultado] = await pool.query(
      "UPDATE utilizadores SET password_hash = ?, versao_sessao = versao_sessao + 1 WHERE id = ? AND password_hash = ? AND versao_sessao = ?",
      [
        hash,
        req.utilizador.id,
        anterior.password_hash,
        req.utilizador.versao_sessao,
      ],
    );
    if (!resultado.affectedRows)
      return res.status(409).json({
        erro: "A conta foi alterada noutra sessão. Atualiza a página e tenta novamente.",
      });
    emitirSessao(res, {
      ...req.utilizador,
      versao_sessao: req.utilizador.versao_sessao + 1,
    });
    res.json({
      mensagem:
        "Password alterada. Os outros acessos desta conta terão de iniciar sessão novamente.",
    });
  }),
);

authRouter.post(
  "/convites",
  exigirAutenticacao,
  tratar(async (req, res) => {
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
  }),
);

authRouter.post(
  "/registar",
  tratar(async (req, res) => {
    const { token, nome, password } = req.body || {};
    if (!token || !nome || !password)
      return res
        .status(400)
        .json({ erro: "Token, nome e password são obrigatórios." });

    const [linhas] = await pool.query(
      "SELECT id, email, usado_em, expira_em FROM convites WHERE token = ?",
      [token],
    );
    const convite = linhas[0];
    if (!convite)
      return res.status(404).json({ erro: "Convite não encontrado." });
    if (convite.usado_em)
      return res.status(409).json({ erro: "Convite já foi utilizado." });
    if (new Date(convite.expira_em) < new Date())
      return res.status(410).json({ erro: "Convite expirado." });

    const password_hash = await bcrypt.hash(password, 12);
    const [resultado] = await pool.query(
      "INSERT INTO utilizadores (nome, email, password_hash) VALUES (?, ?, ?)",
      [nome, convite.email, password_hash],
    );
    await pool.query("UPDATE convites SET usado_em = NOW() WHERE id = ?", [
      convite.id,
    ]);

    emitirSessao(res, { id: resultado.insertId, nome, email: convite.email });
    res.status(201).json({ nome, email: convite.email });
  }),
);
