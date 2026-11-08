// bcrypt só considera os primeiros 72 bytes; recusar evita passwords truncadas.
export const novaPasswordValida = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  Buffer.byteLength(password, "utf8") <= 72;
