import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export async function exigirAutenticacao(req, res, next) {
  const token = req.cookies?.sessao;
  if (!token) return res.status(401).json({ erro: "Sessão inválida." });
  let dados;
  try {
    dados = jwt.verify(token, process.env.JWT_SECRET);
    if (!Number.isInteger(dados.id) || dados.id < 1)
      throw new Error("Sessão inválida.");
  } catch {
    return res.status(401).json({ erro: "Sessão inválida." });
  }
  try {
    const [linhas] = await pool.query(
      "SELECT id, nome, email, versao_sessao FROM utilizadores WHERE id = ?",
      [dados.id],
    );
    const utilizador = linhas[0];
    // Tokens anteriores à migração equivalem à versão inicial da sessão.
    if (
      !utilizador ||
      (dados.versao_sessao ?? 0) !== utilizador.versao_sessao
    ) {
      return res
        .status(401)
        .json({ erro: "Sessão inválida. Entra novamente." });
    }
    req.utilizador = utilizador;
    next();
  } catch (erro) {
    next(erro);
  }
}
