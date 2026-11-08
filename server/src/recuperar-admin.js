import bcrypt from "bcrypt";
import { novaPasswordValida } from "./password.js";
const falhar = (mensagem) => {
  throw Object.assign(new Error(mensagem), { recuperacao: true });
};

export async function redefinirPasswordAdmin(
  pool,
  { email, password, confirmacao },
) {
  if (
    typeof email !== "string" ||
    email.trim().length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
    falhar("Indica um email válido.");
  if (!novaPasswordValida(password))
    falhar(
      "A nova password deve ter pelo menos 8 caracteres. Se for muito longa, escolhe uma combinação mais curta.",
    );
  if (password !== confirmacao)
    falhar("As passwords não coincidem. Nenhuma alteração foi feita.");
  const [contas] = await pool.query(
    "SELECT id, password_hash, versao_sessao FROM utilizadores WHERE email = ?",
    [email.trim()],
  );
  const conta = contas[0];
  if (!conta)
    falhar("Não existe uma conta com esse email. Nenhuma alteração foi feita.");
  const hash = await bcrypt.hash(password, 12);
  const [resultado] = await pool.query(
    "UPDATE utilizadores SET password_hash = ?, versao_sessao = versao_sessao + 1 WHERE id = ? AND password_hash = ? AND versao_sessao = ?",
    [hash, conta.id, conta.password_hash, conta.versao_sessao],
  );
  if (!resultado.affectedRows)
    falhar("A conta foi alterada durante a recuperação. Repete o comando.");
}
