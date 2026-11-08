import { Router } from "express";
import { pool } from "../db.js";
import { exigirAutenticacao } from "../middleware/auth.js";

export const vagasRouter = Router();

function validarCorpo(corpo) {
  const { titulo, localizacao, requisitos, ativa } = corpo || {};
  if (!titulo || !localizacao || !Array.isArray(requisitos)) {
    return "titulo, localizacao e requisitos (lista) são obrigatórios.";
  }
  return null;
}

vagasRouter.get("/", async (req, res) => {
  const [linhas] = await pool.query(
    "SELECT id, titulo, localizacao, requisitos FROM vagas WHERE ativa = 1 ORDER BY criado_em DESC, id DESC",
  );
  res.json(linhas);
});

vagasRouter.get("/admin", exigirAutenticacao, async (req, res) => {
  const [linhas] = await pool.query(
    "SELECT id, titulo, localizacao, requisitos, ativa, criado_em FROM vagas ORDER BY criado_em DESC, id DESC",
  );
  res.json(linhas);
});

vagasRouter.post("/", exigirAutenticacao, async (req, res) => {
  const erro = validarCorpo(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, localizacao, requisitos, ativa = true } = req.body;
  const [resultado] = await pool.query(
    "INSERT INTO vagas (titulo, localizacao, requisitos, ativa) VALUES (?, ?, ?, ?)",
    [titulo, localizacao, JSON.stringify(requisitos), ativa ? 1 : 0],
  );
  res.status(201).json({ id: resultado.insertId });
});

vagasRouter.put("/:id", exigirAutenticacao, async (req, res) => {
  const erro = validarCorpo(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, localizacao, requisitos, ativa = true } = req.body;
  const [resultado] = await pool.query(
    "UPDATE vagas SET titulo = ?, localizacao = ?, requisitos = ?, ativa = ? WHERE id = ?",
    [titulo, localizacao, JSON.stringify(requisitos), ativa ? 1 : 0, req.params.id],
  );
  if (resultado.affectedRows === 0)
    return res.status(404).json({ erro: "Vaga não encontrada." });
  res.status(204).end();
});

vagasRouter.delete("/:id", exigirAutenticacao, async (req, res) => {
  const [resultado] = await pool.query("DELETE FROM vagas WHERE id = ?", [
    req.params.id,
  ]);
  if (resultado.affectedRows === 0)
    return res.status(404).json({ erro: "Vaga não encontrada." });
  res.status(204).end();
});
