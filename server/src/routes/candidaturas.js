import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { pool } from "../db.js";
import { lerFiltros, numero } from "../recrutamento.js";
import { exigirAutenticacao } from "../middleware/auth.js";
import {
  receberCurriculo,
  guardarCurriculo,
  apagarCurriculo,
  caminhoCurriculo,
} from "../curriculos.js";

const tratar = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
export const limitarCandidaturas = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    erro: "Foram feitas várias tentativas. Tenta novamente dentro de alguns minutos.",
  },
});

export const candidatar = [
  limitarCandidaturas,
  receberCurriculo,
  tratar(async (req, res) => {
    const {
      nome,
      email,
      telefone = "",
      mensagem = "",
      privacidade,
    } = req.body || {};
    if (
      typeof nome !== "string" ||
      !nome.trim() ||
      nome.length > 120 ||
      typeof email !== "string" ||
      email.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof telefone !== "string" ||
      telefone.length > 40 ||
      typeof mensagem !== "string" ||
      mensagem.length > 5000 ||
      privacidade !== "true"
    ) {
      return res
        .status(400)
        .json({
          erro: "Preenche nome e email válidos e confirma a leitura da Política de Privacidade.",
        });
    }
    const [vagas] = await pool.query(
      "SELECT id FROM vagas WHERE id = ? AND ativa = 1",
      [req.params.id],
    );
    if (!vagas.length)
      return res
        .status(404)
        .json({ erro: "Esta vaga já não está disponível para candidatura." });
    const ficheiro = await guardarCurriculo(req.file);
    try {
      // A condição é verificada também na gravação, caso a vaga seja fechada durante o upload.
      const [resultado] = await pool.query(
        "INSERT INTO candidaturas (vaga_id, vaga_titulo, vaga_localizacao, nome, email, telefone, mensagem, cv_ficheiro) SELECT id, titulo, localizacao, ?, ?, ?, ?, ? FROM vagas WHERE id = ? AND ativa = 1",
        [
          nome.trim(),
          email.trim(),
          telefone.trim(),
          mensagem.trim(),
          ficheiro,
          req.params.id,
        ],
      );
      if (resultado.affectedRows === 0) {
        await apagarCurriculo(ficheiro);
        return res
          .status(404)
          .json({ erro: "Esta vaga já não está disponível para candidatura." });
      }
      res
        .status(201)
        .json({
          mensagem:
            "Candidatura recebida. Obrigado pelo teu interesse na Vextech.",
        });
    } catch (erro) {
      await apagarCurriculo(ficheiro);
      throw erro;
    }
  }),
];

export const candidaturasRouter = Router();
candidaturasRouter.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d{0,9}$/.test(id))
    return res
      .status(400)
      .json({ erro: "Identificador de candidatura inválido." });
  next();
});
candidaturasRouter.use(exigirAutenticacao);
candidaturasRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});
candidaturasRouter.get(
  "/",
  tratar(async (req, res) => {
    // Compatibilidade com clientes anteriores; o novo painel usa sempre paginação.
    if (req.query.pagina === undefined) {
      const [linhas] = await pool.query(
        "SELECT id, vaga_id, vaga_titulo, vaga_localizacao, nome, email, telefone, mensagem, criado_em FROM candidaturas ORDER BY criado_em DESC, id DESC",
      );
      return res.json(linhas);
    }
    const filtro = lerFiltros(req.query);
    const pedida = numero(req.query.pagina, 1);
    const tamanho = numero(req.query.tamanho, 20, 100);
    const [contagem] = await pool.query(
      `SELECT COUNT(*) AS total, (SELECT COUNT(*) FROM candidaturas) AS total_geral FROM candidaturas${filtro.where}`,
      filtro.valores,
    );
    const total = Number(contagem[0].total),
      paginas = Math.max(1, Math.ceil(total / tamanho)),
      pagina = Math.min(pedida, paginas);
    const [items] = await pool.query(
      `SELECT id, vaga_id, vaga_titulo, vaga_localizacao, nome, email, telefone, criado_em FROM candidaturas${filtro.where} ORDER BY criado_em DESC, id DESC LIMIT ? OFFSET ?`,
      [...filtro.valores, tamanho, (pagina - 1) * tamanho],
    );
    res.json({
      items,
      total,
      total_geral: Number(contagem[0].total_geral),
      pagina,
      paginas,
      tamanho,
    });
  }),
);
candidaturasRouter.get(
  "/:id",
  tratar(async (req, res) => {
    const [linhas] = await pool.query(
      "SELECT id, vaga_id, vaga_titulo, vaga_localizacao, nome, email, telefone, mensagem, criado_em, privacidade_aceite_em FROM candidaturas WHERE id = ?",
      [req.params.id],
    );
    if (!linhas.length)
      return res.status(404).json({ erro: "Candidatura não encontrada." });
    res.json(linhas[0]);
  }),
);
candidaturasRouter.get(
  "/:id/curriculo",
  tratar(async (req, res, next) => {
    const [linhas] = await pool.query(
      "SELECT cv_ficheiro FROM candidaturas WHERE id = ?",
      [req.params.id],
    );
    if (!linhas.length)
      return res.status(404).json({ erro: "Candidatura não encontrada." });
    res.download(
      caminhoCurriculo(linhas[0].cv_ficheiro),
      `curriculo-${req.params.id}.pdf`,
      {
        headers: {
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, no-store",
        },
      },
      (erro) => {
        if (!erro) return;
        if (!res.headersSent && erro.code === "ENOENT")
          return res.status(404).json({ erro: "Currículo indisponível." });
        next(erro);
      },
    );
  }),
);
candidaturasRouter.delete(
  "/:id",
  tratar(async (req, res) => {
    const [linhas] = await pool.query(
      "SELECT cv_ficheiro FROM candidaturas WHERE id = ?",
      [req.params.id],
    );
    if (!linhas.length)
      return res.status(404).json({ erro: "Candidatura não encontrada." });
    await pool.query("DELETE FROM candidaturas WHERE id = ?", [req.params.id]);
    await apagarCurriculo(linhas[0].cv_ficheiro);
    res.status(204).end();
  }),
);
