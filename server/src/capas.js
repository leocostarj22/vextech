import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";

export const pastaCapas = resolve(process.env.UPLOADS_DIR || fileURLToPath(new URL("../uploads/vagas", import.meta.url)));
export const receberCapa = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 8, fieldSize: 64 * 1024 },
  fileFilter(req, ficheiro, cb) {
    if (!["image/png", "image/jpeg"].includes(ficheiro.mimetype)) {
      return cb(Object.assign(new Error("A capa deve ser uma imagem PNG ou JPG."), { status: 400 }));
    }
    cb(null, true);
  },
}).single("capa");

export async function guardarCapa(ficheiro) {
  if (!ficheiro) return null;
  let dados, extensao;
  try {
    const imagem = sharp(ficheiro.buffer, { limitInputPixels: 32_000_000, failOn: "warning" });
    const metadata = await imagem.metadata();
    if (!["png", "jpeg"].includes(metadata.format) || metadata.pages > 1) throw new Error("Formato inválido");
    extensao = metadata.format === "jpeg" ? "jpg" : "png";
    // Força a descodificação e remove metadados antes de publicar a imagem.
    dados = await imagem.rotate().toFormat(metadata.format).toBuffer();
  } catch {
    throw Object.assign(new Error("O ficheiro não é uma imagem PNG ou JPG válida (máximo de 32 megapíxeis)."), { status: 400 });
  }
  const nome = `${randomUUID()}.${extensao}`;
  await mkdir(pastaCapas, { recursive: true });
  await writeFile(join(pastaCapas, nome), dados, { flag: "wx" });
  return `/uploads/vagas/${nome}`;
}

export async function apagarCapa(capa) {
  if (typeof capa !== "string" || !/^\/uploads\/vagas\/[a-f0-9-]+\.(png|jpg)$/.test(capa)) return;
  try { await unlink(join(pastaCapas, capa.split("/").pop())); }
  catch (erro) { if (erro.code !== "ENOENT") console.error("Não foi possível remover a capa antiga:", erro.code); }
}
