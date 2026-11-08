import jwt from "jsonwebtoken";

export function exigirAutenticacao(req, res, next) {
  const token = req.cookies?.sessao;
  if (!token) return res.status(401).json({ erro: "Sessão inválida." });
  try {
    req.utilizador = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "Sessão inválida." });
  }
}
