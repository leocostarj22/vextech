// Datas de calendário em Lisboa, sem depender das tabelas timezone do MySQL.
const calendario = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const relogio = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const invalido = (texto) => {
  throw Object.assign(new Error(texto), { status: 400 });
};
export function diaLisboa(data = new Date()) {
  return calendario.format(data);
}
export function somarDias(dia, n) {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function inicioDia(dia) {
  if (
    typeof dia !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dia) ||
    Number.isNaN(Date.parse(`${dia}T00:00:00Z`)) ||
    new Date(`${dia}T00:00:00Z`).toISOString().slice(0, 10) !== dia
  )
    invalido("Data inválida.");
  const alvo = Date.parse(`${dia}T00:00:00Z`);
  let instante = alvo;
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(
      relogio.formatToParts(new Date(instante)).map((p) => [p.type, p.value]),
    );
    const local = Date.UTC(
      +p.year,
      +p.month - 1,
      +p.day,
      +p.hour,
      +p.minute,
      +p.second,
    );
    instante += alvo - local;
  }
  return new Date(instante);
}
export function numero(valor, padrao, max = 100000) {
  if (valor === undefined) return padrao;
  if (
    typeof valor !== "string" ||
    !/^[1-9]\d{0,9}$/.test(valor) ||
    Number(valor) > max
  )
    invalido("Parâmetro numérico inválido.");
  return Number(valor);
}
export function lerFiltros(query, agora = new Date()) {
  const dias = query.dias === "todos" ? null : numero(query.dias, 30, 90);
  if (dias !== null && ![7, 30, 90].includes(dias))
    invalido("Escolhe um período de 7, 30 ou 90 dias.");
  let de = dias ? somarDias(diaLisboa(agora), 1 - dias) : null;
  let ate = dias ? somarDias(diaLisboa(agora), 1) : null;
  if (query.de !== undefined || query.ate !== undefined) {
    inicioDia(query.de);
    inicioDia(query.ate);
    const duracao = (Date.parse(query.ate) - Date.parse(query.de)) / 86400000;
    if (duracao < 1 || duracao > 90)
      invalido("O intervalo deve ter entre 1 e 90 dias.");
    de = query.de;
    ate = query.ate;
  }
  const vaga =
    query.vaga === undefined || query.vaga === "todas"
      ? null
      : query.vaga === "removidas"
        ? "removidas"
        : numero(query.vaga, null, 2147483647);
  if (
    query.q !== undefined &&
    (typeof query.q !== "string" || query.q.length > 160)
  )
    invalido("A pesquisa deve ter no máximo 160 caracteres.");
  const q = (query.q || "").trim();
  const partes = [],
    valores = [];
  if (de) {
    partes.push("criado_em >= ? AND criado_em < ?");
    valores.push(inicioDia(de), inicioDia(ate));
  }
  if (vaga === "removidas") partes.push("vaga_id IS NULL");
  else if (vaga) {
    partes.push("vaga_id = ?");
    valores.push(vaga);
  }
  if (q) {
    partes.push(
      "(LOCATE(?, nome) > 0 OR LOCATE(?, email) > 0 OR LOCATE(?, vaga_titulo) > 0 OR CAST(id AS CHAR) = ?)",
    );
    valores.push(q, q, q, q.replace(/^VT-/i, ""));
  }
  return {
    de,
    ate,
    dias,
    vaga,
    q,
    where: partes.length ? ` WHERE ${partes.join(" AND ")}` : "",
    valores,
  };
}
export function intervalos(filtro) {
  const dias = (Date.parse(filtro.ate) - Date.parse(filtro.de)) / 86400000,
    n = dias <= 7 ? dias : 6;
  return Array.from({ length: n }, (_, i) => ({
    de: somarDias(filtro.de, Math.floor((i * dias) / n)),
    ate: somarDias(filtro.de, Math.floor(((i + 1) * dias) / n)),
  }));
}
