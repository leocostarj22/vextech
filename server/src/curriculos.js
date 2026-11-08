import multer from "multer";
import { PDFDocument } from "pdf-lib";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";

export const pastaCurriculos = resolve(process.env.CURRICULOS_DIR || fileURLToPath(new URL("../private/curriculos", import.meta.url)));
const erroPdf = (mensagem) => Object.assign(new Error(mensagem), { status: 400 });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 6, fieldSize: 24 * 1024 },
  fileFilter(req, ficheiro, cb) {
    if (ficheiro.mimetype !== "application/pdf" || !/\.pdf$/i.test(ficheiro.originalname)) {
      return cb(erroPdf("O currículo deve ser um ficheiro PDF."));
    }
    cb(null, true);
  },
}).single("curriculo");

export function receberCurriculo(req, res, next) {
  upload(req, res, (erro) => {
    if (erro?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ erro: "O currículo deve ter no máximo 5 MB." });
    if (erro?.name === "MulterError") return res.status(400).json({ erro: "Envia apenas um currículo em PDF, até 5 MB." });
    next(erro);
  });
}

export async function guardarCurriculo(ficheiro) {
  if (!ficheiro) throw erroPdf("Anexa o teu currículo em PDF.");
  try {
    if (ficheiro.buffer.subarray(0, 5).toString() !== "%PDF-") throw new Error("Formato inválido");
    const pdf = await PDFDocument.load(ficheiro.buffer, { updateMetadata: false });
    if (pdf.getPageCount() < 1) throw new Error("Sem páginas");
  } catch {
    throw erroPdf("O currículo não é um PDF válido ou está protegido por palavra-passe.");
  }
  const nome = `${randomUUID()}.pdf`;
  await mkdir(pastaCurriculos, { recursive: true, mode: 0o700 });
  await writeFile(join(pastaCurriculos, nome), ficheiro.buffer, { flag: "wx", mode: 0o600 });
  return nome;
}

export function caminhoCurriculo(nome) {
  if (typeof nome !== "string" || !/^[a-f0-9-]+\.pdf$/.test(nome)) throw new Error("Nome de currículo inválido");
  return join(pastaCurriculos, nome);
}

export async function apagarCurriculo(nome) {
  if (!nome) return;
  try { await unlink(caminhoCurriculo(nome)); }
  catch (erro) { if (erro.code !== "ENOENT") console.error("Não foi possível remover o currículo:", erro.code || erro.message); }
}
