import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { authRouter } from "./routes/auth.js";
import { vagasRouter } from "./routes/vagas.js";
import { pastaCapas } from "./capas.js";
import { candidaturasRouter } from "./routes/candidaturas.js";

const pastaAdmin = fileURLToPath(new URL("../public/admin", import.meta.url));
const capasAutomaticas = fileURLToPath(new URL("../../public/media/vagas", import.meta.url));
const origensPermitidas = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  "/api/vagas",
  cors({ origin: origensPermitidas.length ? origensPermitidas : false }),
);

app.use("/api/auth", authRouter);
app.use("/api/vagas", vagasRouter);
app.use("/api/candidaturas", candidaturasRouter);
app.use("/admin", express.static(pastaAdmin));
app.use("/media/vagas", express.static(capasAutomaticas, { index: false, dotfiles: "deny" }));
app.use("/uploads/vagas", express.static(pastaCapas, {
  index: false,
  dotfiles: "deny",
  setHeaders(res) { res.setHeader("X-Content-Type-Options", "nosniff"); },
}));

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  if (erro.code === "LIMIT_FILE_SIZE") return res.status(413).json({ erro: "A capa deve ter no máximo 5 MB." });
  if (erro.name === "MulterError") return res.status(400).json({ erro: "Envia apenas uma capa PNG ou JPG, até 5 MB." });
  if (erro.status === 400) return res.status(400).json({ erro: erro.message });
  console.error("Erro na API:", erro.code || erro.message);
  res.status(500).json({ erro: "Não foi possível concluir o pedido." });
});

app.use((req, res) => res.status(404).json({ erro: "Não encontrado." }));
