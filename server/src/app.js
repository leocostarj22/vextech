import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { authRouter } from "./routes/auth.js";
import { vagasRouter } from "./routes/vagas.js";

const pastaAdmin = fileURLToPath(new URL("../public/admin", import.meta.url));
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
app.use("/admin", express.static(pastaAdmin));

app.use((req, res) => res.status(404).json({ erro: "Não encontrado." }));
