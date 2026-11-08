import { Router } from "express";
import { pool } from "../db.js";
import { exigirAutenticacao } from "../middleware/auth.js";
import { lerFiltros, intervalos, inicioDia } from "../recrutamento.js";
export const recrutamentoRouter = Router();
recrutamentoRouter.use(exigirAutenticacao);
recrutamentoRouter.use((req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  next();
});
recrutamentoRouter.get("/resumo", async (req, res, next) => {
  try {
    const filtro = lerFiltros(req.query);
    if (!filtro.de)
      return res
        .status(400)
        .json({ erro: "O dashboard precisa de um período definido." });
    const bins = intervalos(filtro);
    // Cada soma usa exatamente os mesmos limites da listagem clicável.
    const expressoes = bins.map(
      (b, i) => `COALESCE(SUM(criado_em >= ? AND criado_em < ?),0) AS b${i}`,
    );
    const valores = bins.flatMap((b) => [inicioDia(b.de), inicioDia(b.ate)]);
    const [[contagem], [globais], [recentes]] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS recebidas, COUNT(DISTINCT vaga_id) AS vagas_com_candidaturas, ${expressoes.join(", ")} FROM candidaturas${filtro.where}`,
        [...valores, ...filtro.valores],
      ),
      pool.query(
        "SELECT (SELECT COUNT(*) FROM vagas WHERE ativa = 1) AS vagas_ativas, (SELECT COUNT(*) FROM candidaturas) AS candidaturas_total",
      ),
      pool.query(
        `SELECT id, nome, vaga_titulo, vaga_localizacao, criado_em FROM candidaturas${filtro.where} ORDER BY criado_em DESC, id DESC LIMIT 5`,
        filtro.valores,
      ),
    ]);
    const c = contagem[0];
    res.json({
      periodo: { de: filtro.de, ate: filtro.ate, timezone: "Europe/Lisbon" },
      vagas_ativas: Number(globais[0].vagas_ativas),
      candidaturas_total: Number(globais[0].candidaturas_total),
      recebidas: Number(c.recebidas),
      vagas_com_candidaturas: Number(c.vagas_com_candidaturas),
      serie: bins.map((b, i) => ({ ...b, total: Number(c[`b${i}`]) })),
      recentes,
    });
  } catch (e) {
    next(e);
  }
});
