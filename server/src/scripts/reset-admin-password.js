import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { stdin, stdout } from "node:process";
import { pool } from "../db.js";
import { redefinirPasswordAdmin } from "../recuperar-admin.js";

// Saída do editor de linha silenciada durante as passwords, incluindo o eco.
class SaidaTerminal extends Writable {
  silenciada = false;
  columns = stdout.columns || 80;
  _write(chunk, encoding, callback) {
    if (!this.silenciada) stdout.write(chunk, encoding);
    callback();
  }
}
let rl;
const saida = new SaidaTerminal(),
  cancelamento = new AbortController();
try {
  if (process.argv.length > 2 || !stdin.isTTY || !stdout.isTTY) {
    throw Object.assign(
      new Error(
        "Executa npm run reset:admin num terminal interativo, sem argumentos. O comando pedirá o email e a nova password.",
      ),
      { recuperacao: true },
    );
  }
  rl = createInterface({
    input: stdin,
    output: saida,
    terminal: true,
    historySize: 0,
  });
  rl.on("SIGINT", () => cancelamento.abort());
  const perguntar = async (texto, segredo = false) => {
    saida.silenciada = segredo;
    if (segredo) stdout.write(texto);
    try {
      return await rl.question(segredo ? "" : texto, {
        signal: cancelamento.signal,
      });
    } finally {
      saida.silenciada = false;
      if (segredo) stdout.write("\n");
    }
  };
  console.log("Recuperar acesso ao admin. A password antiga não é necessária.");
  const email = await perguntar("Email do admin: ");
  const password = await perguntar("Nova password (não será mostrada): ", true);
  const confirmacao = await perguntar("Confirma a nova password: ", true);
  await redefinirPasswordAdmin(pool, { email, password, confirmacao });
  console.log(
    "Password redefinida. As sessões antigas foram terminadas. Entra no painel com a nova password.",
  );
} catch (erro) {
  if (erro.name === "AbortError") {
    console.error("Operação cancelada.");
    process.exitCode = 130;
  } else {
    console.error(
      erro.recuperacao
        ? erro.message
        : erro.code === "ER_BAD_FIELD_ERROR"
          ? "Atualiza o projeto e executa npm run migrate antes de repetir a recuperação."
          : "Não foi possível redefinir a password. Confirma a configuração e a ligação ao MySQL em server/.env.",
    );
    process.exitCode = 1;
  }
} finally {
  saida.silenciada = false;
  rl?.close();
  await pool.end();
}
