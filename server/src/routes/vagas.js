import { Router } from "express";
import { pool } from "../db.js";
import { exigirAutenticacao } from "../middleware/auth.js";
import { receberCapa, guardarCapa, apagarCapa } from "../capas.js";
import { candidatar } from "./candidaturas.js";

export const vagasRouter = Router();
vagasRouter.param("id", (req, res, next, id) => {
  if (!/^[1-9]\d{0,9}$/.test(id)) return res.status(400).json({ erro: "Identificador de vaga inválido." });
  next();
});
const tratar = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function lerCorpo(req) {
  const corpo = req.body || {};
  let requisitos = corpo.requisitos;
  if (req.is("multipart/form-data")) {
    try { requisitos = JSON.parse(requisitos); } catch { requisitos = null; }
  }
  const { titulo, localizacao } = corpo;
  if (corpo.descricao !== undefined && (typeof corpo.descricao !== "string" || corpo.descricao.length > 20000)) {
    throw Object.assign(new Error("A descrição deve ter no máximo 20 000 caracteres."), { status: 400 });
  }
  if (typeof titulo !== "string" || !titulo.trim() || titulo.length > 160 ||
      typeof localizacao !== "string" || !localizacao.trim() || localizacao.length > 120 ||
      !Array.isArray(requisitos) || !requisitos.every((r) => typeof r === "string")) {
    throw Object.assign(new Error("Título, localização e requisitos (lista de texto) são obrigatórios."), { status: 400 });
  }
  return {
    titulo: titulo.trim(), localizacao: localizacao.trim(), requisitos,
    descricao: corpo.descricao === undefined ? null : corpo.descricao.trim(),
    ativa: corpo.ativa === undefined || corpo.ativa === true || corpo.ativa === "true" || corpo.ativa === "1",
    removerCapa: corpo.remover_capa === true || corpo.remover_capa === "true",
  };
}

vagasRouter.get("/", tratar(async (req, res) => {
  const [linhas] = await pool.query(
    "SELECT id, titulo, localizacao, requisitos, capa FROM vagas WHERE ativa = 1 ORDER BY criado_em DESC, id DESC",
  );
  res.json(linhas);
}));

vagasRouter.get("/admin", exigirAutenticacao, tratar(async (req, res) => {
  const [linhas] = await pool.query(
    "SELECT id, titulo, localizacao, requisitos, descricao, capa, ativa, criado_em FROM vagas ORDER BY criado_em DESC, id DESC",
  );
  res.json(linhas);
}));

vagasRouter.get("/:id", tratar(async (req, res) => {
  const [linhas] = await pool.query("SELECT id, titulo, localizacao, descricao, requisitos, capa FROM vagas WHERE id = ? AND ativa = 1", [req.params.id]);
  if (!linhas.length) return res.status(404).json({ erro: "Esta vaga já não está disponível." });
  res.json(linhas[0]);
}));
vagasRouter.post("/:id/candidaturas", ...candidatar);

vagasRouter.post("/", exigirAutenticacao, receberCapa, tratar(async (req, res) => {
  const dados = lerCorpo(req);
  const capa = await guardarCapa(req.file);
  try {
    const [resultado] = await pool.query(
      "INSERT INTO vagas (titulo, localizacao, requisitos, ativa, capa, descricao) VALUES (?, ?, ?, ?, ?, ?)",
      [dados.titulo, dados.localizacao, JSON.stringify(dados.requisitos), dados.ativa ? 1 : 0, capa, dados.descricao],
    );
    res.status(201).json({ id: resultado.insertId, capa });
  } catch (erro) {
    await apagarCapa(capa);
    throw erro;
  }
}));

vagasRouter.put("/:id", exigirAutenticacao, receberCapa, tratar(async (req, res) => {
  const dados = lerCorpo(req);
  const [linhas] = await pool.query("SELECT capa FROM vagas WHERE id = ?", [req.params.id]);
  if (!linhas.length) return res.status(404).json({ erro: "Vaga não encontrada." });
  const antiga = linhas[0].capa;
  const nova = await guardarCapa(req.file);
  const capa = nova || (dados.removerCapa ? null : antiga);
  try {
    const [resultado] = await pool.query(
      "UPDATE vagas SET titulo = ?, localizacao = ?, requisitos = ?, ativa = ?, capa = ?, descricao = COALESCE(?, descricao) WHERE id = ?",
      [dados.titulo, dados.localizacao, JSON.stringify(dados.requisitos), dados.ativa ? 1 : 0, capa, dados.descricao, req.params.id],
    );
    if (resultado.affectedRows === 0) {
      await apagarCapa(nova);
      return res.status(404).json({ erro: "Vaga não encontrada." });
    }
  } catch (erro) {
    await apagarCapa(nova);
    throw erro;
  }
  if (antiga !== capa) await apagarCapa(antiga);
  res.status(204).end();
}));

vagasRouter.delete("/:id", exigirAutenticacao, tratar(async (req, res) => {
  const [linhas] = await pool.query("SELECT capa FROM vagas WHERE id = ?", [req.params.id]);
  const [resultado] = await pool.query("DELETE FROM vagas WHERE id = ?", [req.params.id]);
  if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Vaga não encontrada." });
  await apagarCapa(linhas[0]?.capa);
  res.status(204).end();
}));
