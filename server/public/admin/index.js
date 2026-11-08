const ICONS = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  people:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"/></svg>',
  brief:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12a24 24 0 0 0 18 0M12 12v4"/></svg>',
  layers:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 10 6-10 6L2 9Zm-10 12 10 6 10-6M2 12l10 6 10-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 11h18M8 15h2M14 15h2"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 18 12-12M6 6h12v12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8ZM14 2v6h6M8 13h8M8 17h6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>',
};
const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const numero = (v) => new Intl.NumberFormat("pt-PT").format(Number(v) || 0);
const data = (v, completa = false) =>
  v
    ? new Intl.DateTimeFormat("pt-PT", {
        timeZone: "Europe/Lisbon",
        day: "numeric",
        month: "short",
        ...(completa
          ? { year: "numeric", hour: "2-digit", minute: "2-digit" }
          : {}),
      }).format(new Date(v))
    : "Não registada";
const dia = (v) => data(`${v}T12:00:00Z`);
const op = (valor, rotulo, atual) =>
  `<option value="${esc(valor)}"${String(valor) === String(atual) ? " selected" : ""}>${esc(rotulo)}</option>`;
const vistas = {
  dashboard: "Visão geral",
  candidaturas: "Candidaturas",
  vagas: "Vagas",
  equipa: "Convites",
  perfil: "Meu perfil",
};
const estado = {
  vista: vistas[location.hash.slice(1)] ? location.hash.slice(1) : "dashboard",
  dias: "30",
  vaga: "todas",
  q: "",
  pagina: 1,
  intervalo: null,
};
let vagas = [],
  resumo,
  lista,
  controller,
  sequencia = 0,
  sessaoAtiva = false,
  perfilController,
  meuPerfil;
class SessaoTerminada extends Error {}
function icons(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((e) => (e.innerHTML = ICONS[e.dataset.icon] || ""));
}
icons();
function aviso(texto) {
  $("#toast").textContent = texto;
  $("#toast").hidden = false;
  clearTimeout(aviso.timer);
  aviso.timer = setTimeout(() => ($("#toast").hidden = true), 4500);
}
function fecharSessao() {
  sessaoAtiva = false;
  controller?.abort();
  perfilController?.abort();
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
  $("#app").hidden = true;
  $("#inicio-estado").hidden = false;
  $("#inicio-estado").innerHTML =
    'A sessão terminou. Entra novamente para continuar. <a class="btn" href="login.html">Entrar</a>';
}
async function api(url, options = {}) {
  let r;
  try {
    r = await fetch(url, { cache: "no-store", ...options });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("Não foi possível ligar ao servidor. Tenta novamente.");
  }
  if (r.status === 401) {
    fecharSessao();
    throw new SessaoTerminada();
  }
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new Error(
      corpo.erro || `Não foi possível concluir o pedido (${r.status}).`,
    );
  }
  return r.status === 204 ? null : r.json();
}
function parametros(incluirPesquisa = false) {
  const q = new URLSearchParams({ dias: estado.dias, vaga: estado.vaga });
  if (estado.intervalo) {
    q.set("de", estado.intervalo.de);
    q.set("ate", estado.intervalo.ate);
  }
  if (incluirPesquisa) {
    q.set("pagina", estado.pagina);
    q.set("tamanho", "20");
    if (estado.q) q.set("q", estado.q);
  }
  return q;
}
function cabecalho(titulo, sub, acao = "") {
  return `<div class="page-heading"><div><p class="eyebrow">Vextech / ${vistas[estado.vista]}</p><h1>${titulo}</h1><p class="intro">${sub}</p></div>${acao}</div>`;
}
function filtros(pesquisa = false) {
  return `<form id="filtros" class="filters" role="search" aria-label="Filtros de candidaturas"><label>${ICONS.calendar}<select name="dias" aria-label="Período">${[7, 30, 90].map((d) => op(d, `Últimos ${d} dias`, estado.dias)).join("")}${pesquisa ? op("todos", "Todo o histórico", estado.dias) : ""}</select></label><label>${ICONS.brief}<select name="vaga" aria-label="Vaga">${op("todas", "Todas as vagas", estado.vaga)}${vagas.map((v) => op(v.id, `${v.titulo}${v.ativa ? "" : " · inativa"}`, estado.vaga)).join("")}${op("removidas", "Vagas removidas", estado.vaga)}</select></label>${pesquisa ? `<label class="filter-search">${ICONS.search}<input name="q" type="search" maxlength="160" aria-label="Pesquisar candidaturas" placeholder="Nome, email, vaga ou ID…" value="${esc(estado.q)}"></label><button class="secundario" type="submit">Pesquisar</button>` : ""}${estado.intervalo ? '<button class="filter-clear" type="button" data-clear-range>Limpar intervalo ×</button>' : ""}<span class="explanation">${estado.intervalo ? `${dia(estado.intervalo.de)} · intervalo do gráfico` : "Datas em Europe/Lisbon"}</span></form>`;
}
function estrutura() {
  const acao =
    estado.vista === "vagas"
      ? `<button class="btn" id="nova-vaga">${ICONS.plus}Nova vaga</button>`
      : estado.vista === "dashboard"
        ? `<button class="btn" data-nav="candidaturas">Ver candidaturas ${ICONS.arrow}</button>`
        : estado.vista === "candidaturas"
          ? '<button class="btn secondary" id="atualizar-candidaturas">Atualizar</button>'
          : "";
  const textos = {
    dashboard: [
      "Talento para o próximo passo.",
      "Uma visão clara das oportunidades e das candidaturas recebidas.",
    ],
    candidaturas: [
      "Cada candidatura, um percurso.",
      "Pesquisa as candidaturas e consulta os currículos com acesso reservado.",
    ],
    vagas: [
      "As vagas que ligam talento.",
      "Publica e mantém cada oportunidade atualizada.",
    ],
    perfil: [
      "O teu espaço na Vextech.",
      "Mantém os teus dados atualizados e gere o acesso à tua conta.",
    ],
    equipa: [
      "Uma equipa, novas perspetivas.",
      "Convida outra pessoa para administrar o Centro de talento.",
    ],
  };
  $("#conteudo").innerHTML =
    cabecalho(...textos[estado.vista], acao) +
    (estado.vista === "dashboard" || estado.vista === "candidaturas"
      ? filtros(estado.vista === "candidaturas")
      : "") +
    '<div id="view-status" class="status" role="status"></div><div id="view-body"></div>';
  $("#crumb").textContent = vistas[estado.vista];
  document.title = `${vistas[estado.vista]} — Centro de talento Vextech`;
  document.querySelectorAll("[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === estado.vista);
    if (b.dataset.view === estado.vista) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  $("#filtros")?.addEventListener("submit", (e) => {
    e.preventDefault();
    lerFormulario();
    carregar();
  });
  $("#filtros")
    ?.querySelectorAll("select")
    .forEach((s) =>
      s.addEventListener("change", () => {
        lerFormulario();
        estado.intervalo = null;
        carregar();
      }),
    );
  $("[data-clear-range]")?.addEventListener("click", () => {
    estado.intervalo = null;
    estado.pagina = 1;
    carregar();
  });
  $("#atualizar-candidaturas")?.addEventListener("click", () => carregar(true));
  $("#nova-vaga")?.addEventListener("click", () => abrirVaga());
  $("#conteudo")
    .querySelectorAll("[data-nav]")
    .forEach((b) => b.addEventListener("click", () => ir(b.dataset.nav)));
}
function lerFormulario() {
  const f = new FormData($("#filtros"));
  estado.dias = f.get("dias");
  estado.vaga = f.get("vaga");
  estado.q = String(f.get("q") || "").trim();
  estado.pagina = 1;
}
function tabelaCandidaturas(items, completa = false) {
  return `<div class="table-wrap" tabindex="0" aria-label="Lista de candidaturas; desloca para consultar todas as colunas"><table><thead><tr><th>Candidatura</th><th>Vaga</th>${completa ? "<th>Email</th>" : ""}<th>Recebida</th><th><span class="sr">Ações</span></th></tr></thead><tbody id="lista-candidaturas">${items.map((c) => `<tr><td><h2>${esc(c.nome)}</h2><span class="user-label">#VT-${Number(c.id)}</span></td><td>${esc(c.vaga_titulo)}<br><span class="user-label">${esc(c.vaga_localizacao)}</span></td>${completa ? `<td>${esc(c.email)}</td>` : ""}<td>${esc(data(c.criado_em, completa))}</td><td><button class="row-link" data-perfil="${Number(c.id)}" aria-label="Abrir candidatura de ${esc(c.nome)}">Ver ficha ${ICONS.arrow}</button></td></tr>`).join("")}</tbody></table></div>`;
}
function dashboard() {
  const s = resumo,
    max = Math.max(1, ...s.serie.map((b) => b.total));
  return `<section class="metrics" aria-label="Indicadores de recrutamento"><button class="metric" data-nav="vagas"><span class="metric-top">Vagas ativas ${ICONS.brief}</span><strong>${numero(s.vagas_ativas)}</strong><small>Situação atual · todas as vagas</small></button><button class="metric" data-nav="candidaturas"><span class="metric-top">Candidaturas recebidas ${ICONS.people}</span><strong>${numero(s.recebidas)}</strong><small>No período e vaga selecionados</small></button><button class="metric" data-nav="candidaturas"><span class="metric-top">Vagas com candidaturas ${ICONS.layers}</span><strong>${numero(s.vagas_com_candidaturas)}</strong><small>Oportunidades existentes · no período</small></button></section><div class="grid-two"><section class="panel"><div class="panel-head"><div><h2>Candidaturas recebidas</h2><p>Clica numa coluna para consultar as entradas desse intervalo.</p></div><span class="small-tag">${estado.dias} dias</span></div><div class="chart">${s.serie.map((b, i) => `<button class="chart-column" data-bin="${i}"${b.total ? "" : " disabled"} aria-label="${b.total} candidaturas a partir de ${dia(b.de)}"><strong>${numero(b.total)}</strong><span class="chart-bar" style="--bar:${Math.max(2, (b.total / max) * 139)}px"></span></button>`).join("")}</div><div class="chart-labels">${s.serie.map((b) => `<span>${dia(b.de)}</span>`).join("")}</div></section><section class="panel"><div class="panel-head"><div><h2>O trabalho, num olhar.</h2><p>Acesso direto às áreas do Centro de talento.</p></div></div><div class="tasks"><button class="task" data-nav="candidaturas"><span class="task-marker">${ICONS.people}</span><span><strong>Conhecer as candidaturas</strong><small>Pesquisar, consultar mensagens e descarregar PDFs.</small></span>${ICONS.arrow}</button><button class="task" data-nav="vagas"><span class="task-marker">${ICONS.brief}</span><span><strong>Gerir oportunidades</strong><small>Descrição, requisitos, estado e capa de cada vaga.</small></span>${ICONS.arrow}</button><button class="task" data-nav="equipa"><span class="task-marker">${ICONS.plus}</span><span><strong>Convidar outro administrador</strong><small>Gerar um link de registo para partilhar.</small></span>${ICONS.arrow}</button></div></section></div><section class="panel"><div class="panel-head"><div><h2>As candidaturas mais recentes</h2><p>Até cinco entradas no período e vaga selecionados.</p></div><button data-nav="candidaturas">Ver todas →</button></div>${s.recentes.length ? tabelaCandidaturas(s.recentes) : '<div class="empty">Ainda não há candidaturas neste período. Experimenta outro filtro.</div>'}</section>`;
}
function candidaturas() {
  return `<section class="panel"><div class="panel-head"><div><h2>Candidaturas recebidas</h2><p id="candidaturas-estado" role="status">${numero(lista.total)} candidatura(s) · ${estado.dias === "todos" ? "todo o histórico" : "período selecionado"}</p></div></div>${lista.items.length ? tabelaCandidaturas(lista.items, true) : '<div class="empty">Nenhuma candidatura corresponde aos filtros. Experimenta outro período ou limpa a pesquisa.</div>'}<div class="pagination"><span>Página ${lista.pagina} de ${lista.paginas}</span><div><button data-page="${lista.pagina - 1}"${lista.pagina <= 1 ? " disabled" : ""}>Anterior</button><button data-page="${lista.pagina + 1}"${lista.pagina >= lista.paginas ? " disabled" : ""}>Seguinte</button></div></div></section>`;
}
function oportunidades() {
  return `<section class="panel"><div class="jobs-intro">As vagas ativas aparecem no site. Desativar uma vaga interrompe novas candidaturas.</div><div class="table-wrap" tabindex="0" aria-label="Lista de vagas"><table class="jobs-table"><thead><tr><th>Oportunidade</th><th>Estado</th><th>Ações</th></tr></thead><tbody id="lista-vagas">${vagas.map((v) => `<tr><td class="title"><strong>${esc(v.titulo)}</strong><span>${esc(v.localizacao)}</span></td><td><span class="stage ${v.ativa ? "s-contratado" : ""}">${v.ativa ? "Ativa" : "Inativa"}</span></td><td><div class="job-actions"><button class="row-link" data-editar="${Number(v.id)}">Editar</button><button class="row-link" data-vaga-apps="${Number(v.id)}">Ver candidaturas</button><button class="perigo" data-apagar="${Number(v.id)}">Apagar</button></div></td></tr>`).join("")}</tbody></table></div>${vagas.length ? "" : '<div class="empty">Ainda não existem vagas. Usa “Nova vaga” para criar a primeira oportunidade.</div>'}</section>`;
}
function convites() {
  return `<section class="panel invite-panel"><h2>Convidar novo admin</h2><p class="intro">Gera um link de registo de utilização única, válido por sete dias. Partilha-o diretamente com a pessoa; não existe envio automático de email.</p><form id="form-convite"><label>Email da pessoa a convidar<input name="email" type="email" maxlength="200" required autocomplete="email"></label><p class="erro" id="erro-convite" role="alert"></p><button class="btn" type="submit">Gerar convite ${ICONS.arrow}</button></form><div class="copiar" id="resultado-convite" hidden><label class="sr" for="link-convite">Link de registo</label><input id="link-convite" type="text" readonly><button type="button" class="secundario" id="copiar-convite">Copiar</button></div></section>`;
}
function atualizarIdentidade(p) {
  $("#sessao").textContent = `${p.nome} · ${p.email}`;
  $("#user-name").textContent = p.nome;
}
function campoPassword(id, name, label, autocomplete, nova = false) {
  return `<label for="${id}">${label}</label><div class="password-field"><input id="${id}" name="${name}" type="password" autocomplete="${autocomplete}" ${nova ? 'minlength="8" maxlength="72"' : 'maxlength="1024"'} required><button class="password-toggle" type="button" data-password-toggle="${id}" aria-label="Mostrar ${label.toLowerCase()}" aria-pressed="false">Mostrar</button></div>`;
}
function paginaPerfil() {
  return `<div class="profile-settings"><section class="panel account-panel" aria-labelledby="dados-titulo"><p class="eyebrow">Dados pessoais</p><h2 id="dados-titulo">Como te apresentas.</h2><p class="intro">Confirma as alterações com a tua password atual. Ao mudares o email de acesso, os outros acessos terão de iniciar sessão novamente.</p><form id="form-perfil" method="post"><label for="perfil-nome">Nome completo</label><input id="perfil-nome" name="nome" autocomplete="name" maxlength="120" value="${esc(meuPerfil.nome)}" required><label for="perfil-email">Email</label><input id="perfil-email" name="email" type="email" autocomplete="username" maxlength="200" value="${esc(meuPerfil.email)}" required>${campoPassword("perfil-password", "password_atual", "Password atual", "current-password")}<p class="account-status erro" id="perfil-estado" role="status" aria-live="polite"></p><button class="btn" type="submit">Guardar dados pessoais ${ICONS.arrow}</button></form></section><section class="panel account-panel" aria-labelledby="password-titulo"><p class="eyebrow">Segurança</p><h2 id="password-titulo">Um acesso só teu.</h2><p class="intro">Usa uma password única com pelo menos 8 caracteres. Os outros acessos serão terminados quando a alterares.</p><form id="form-password" method="post"><input class="sr" name="username" tabindex="-1" type="text" autocomplete="username" value="${esc(meuPerfil.email)}" readonly aria-label="Email da conta">${campoPassword("seguranca-atual", "password_atual", "Password atual", "current-password")}${campoPassword("seguranca-nova", "nova_password", "Nova password", "new-password", true)}${campoPassword("seguranca-confirmar", "confirmar_password", "Confirmar nova password", "new-password", true)}<p class="account-status erro" id="password-estado" role="status" aria-live="polite"></p><button class="btn" type="submit">Alterar password ${ICONS.arrow}</button></form></section></div>`;
}
function limparPasswords(form) {
  form.querySelectorAll(".password-field input").forEach((input) => {
    input.value = "";
    input.type = "password";
  });
  form.querySelectorAll("[data-password-toggle]").forEach((b) => {
    b.textContent = "Mostrar";
    b.setAttribute("aria-pressed", "false");
    b.setAttribute(
      "aria-label",
      `Mostrar ${form.querySelector(`label[for="${b.dataset.passwordToggle}"]`).textContent.toLowerCase()}`,
    );
  });
}
function ligarPerfil() {
  $("#view-body")
    .querySelectorAll("[data-password-toggle]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const input = document.getElementById(b.dataset.passwordToggle),
            mostrar = input.type === "password";
          input.type = mostrar ? "text" : "password";
          b.textContent = mostrar ? "Ocultar" : "Mostrar";
          b.setAttribute("aria-pressed", String(mostrar));
          b.setAttribute(
            "aria-label",
            `${mostrar ? "Ocultar" : "Mostrar"} ${document.querySelector(`label[for="${input.id}"]`).textContent.toLowerCase()}`,
          );
        }),
    );
  for (const [id, url, statusId] of [
    ["form-perfil", "/api/auth/perfil", "perfil-estado"],
    ["form-password", "/api/auth/password", "password-estado"],
  ]) {
    const form = document.getElementById(id);
    if (!form) continue;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = document.getElementById(statusId),
        botao = form.querySelector('[type="submit"]');
      const campos = Object.fromEntries(new FormData(form));
      delete campos.username;
      status.textContent = "";
      status.classList.remove("success");
      if (
        id === "form-password" &&
        campos.nova_password !== campos.confirmar_password
      ) {
        status.textContent = "A confirmação da nova password não coincide.";
        document.getElementById("seguranca-confirmar").focus();
        return;
      }
      botao.disabled = true;
      form.setAttribute("aria-busy", "true");
      try {
        const resultado = await api(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(campos),
        });
        if (id === "form-perfil") {
          meuPerfil = resultado;
          atualizarIdentidade(resultado);
          form.elements.nome.value = resultado.nome;
          form.elements.email.value = resultado.email;
          const conta = $('#form-password [name="username"]');
          if (conta) conta.value = resultado.email;
        }
        status.classList.add("success");
        status.textContent =
          id === "form-perfil"
            ? "Dados pessoais atualizados."
            : resultado.mensagem;
      } catch (erro) {
        if (!(erro instanceof SessaoTerminada))
          status.textContent = erro.message;
      } finally {
        limparPasswords(form);
        botao.disabled = false;
        form.removeAttribute("aria-busy");
      }
    });
  }
}

async function carregar(relerVagas = false) {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal,
    seq = ++sequencia;
  const foco = document.activeElement?.closest("#filtros")
    ? document.activeElement.name
    : null;
  estrutura();
  if (foco) $("#filtros")?.elements.namedItem(foco)?.focus();
  $("#view-status").textContent = "A carregar…";
  $("#view-body").setAttribute("aria-busy", "true");
  try {
    if (relerVagas) {
      const atuais = await api("/api/vagas/admin", { signal });
      if (seq !== sequencia) return;
      vagas = atuais;
      estrutura();
      $("#view-status").textContent = "A carregar…";
    }
    if (estado.vista === "dashboard") {
      const atual = await api(`/api/recrutamento/resumo?${parametros()}`, {
        signal,
      });
      if (seq !== sequencia) return;
      resumo = atual;
    }
    if (estado.vista === "candidaturas") {
      const atual = await api(`/api/candidaturas?${parametros(true)}`, {
        signal,
      });
      if (seq !== sequencia) return;
      lista = atual;
      estado.pagina = lista.pagina;
    }
    if (estado.vista === "perfil") {
      const atual = await api("/api/auth/perfil", { signal });
      if (seq !== sequencia) return;
      meuPerfil = atual;
      atualizarIdentidade(atual);
    }
    if (seq !== sequencia || !sessaoAtiva) return;
    $("#view-body").innerHTML = {
      dashboard,
      candidaturas,
      vagas: oportunidades,
      equipa: convites,
      perfil: paginaPerfil,
    }[estado.vista]();
    $("#view-body").removeAttribute("aria-busy");
    $("#view-status").textContent = "";
    $("#view-status").classList.remove("error");
    $("#nav-jobs").textContent = vagas.filter((v) => v.ativa).length;
    if (estado.vista === "candidaturas" && lista.total_geral !== undefined)
      $("#nav-count").textContent = lista.total_geral;
    else if (resumo) $("#nav-count").textContent = resumo.candidaturas_total;
    ligarVista();
  } catch (e) {
    if (
      e.name === "AbortError" ||
      e instanceof SessaoTerminada ||
      seq !== sequencia
    )
      return;
    $("#view-body").removeAttribute("aria-busy");
    $("#view-status").classList.add("error");
    $("#view-status").innerHTML =
      `${esc(e.message || "Não foi possível ligar ao servidor.")} <button class="secundario" id="tentar-vista">Tentar novamente</button>`;
    $("#tentar-vista").onclick = () => carregar(true);
  }
}
function ligarVista() {
  ligarPerfil();
  $("#view-body")
    .querySelectorAll("[data-nav]")
    .forEach((b) => (b.onclick = () => ir(b.dataset.nav)));
  $("#view-body")
    .querySelectorAll("[data-perfil]")
    .forEach((b) => (b.onclick = () => abrirPerfil(b.dataset.perfil)));
  $("#view-body")
    .querySelectorAll("[data-bin]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          const bin = resumo.serie[Number(b.dataset.bin)];
          estado.intervalo = { de: bin.de, ate: bin.ate };
          estado.q = "";
          estado.pagina = 1;
          ir("candidaturas");
        }),
    );
  $("#view-body")
    .querySelectorAll("[data-page]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          estado.pagina = Number(b.dataset.page);
          carregar();
        }),
    );
  $("#view-body")
    .querySelectorAll("[data-editar]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          abrirVaga(vagas.find((v) => v.id === Number(b.dataset.editar)))),
    );
  $("#view-body")
    .querySelectorAll("[data-vaga-apps]")
    .forEach(
      (b) =>
        (b.onclick = () => {
          estado.vaga = b.dataset.vagaApps;
          estado.dias = "todos";
          estado.q = "";
          estado.intervalo = null;
          estado.pagina = 1;
          ir("candidaturas");
        }),
    );
  $("#view-body")
    .querySelectorAll("[data-apagar]")
    .forEach(
      (b) =>
        (b.onclick = async () => {
          if (
            !confirm(
              "Apagar esta vaga? As candidaturas e os currículos recebidos são conservados.",
            )
          )
            return;
          b.disabled = true;
          try {
            await api(`/api/vagas/${b.dataset.apagar}`, { method: "DELETE" });
            if (estado.vaga === b.dataset.apagar) estado.vaga = "todas";
            aviso("Vaga eliminada.");
            await carregar(true);
          } catch (e) {
            if (!(e instanceof SessaoTerminada)) {
              b.disabled = false;
              aviso(e.message);
            }
          }
        }),
    );
  $("#form-convite")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const botao = e.target.querySelector("button");
    botao.disabled = true;
    $("#erro-convite").textContent = "";
    $("#resultado-convite").hidden = true;
    try {
      const r = await api("/api/auth/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.target))),
      });
      $("#link-convite").value = new URL(r.link, location.origin).href;
      $("#resultado-convite").hidden = false;
      e.target.reset();
    } catch (e) {
      if (!(e instanceof SessaoTerminada))
        $("#erro-convite").textContent = e.message;
    } finally {
      botao.disabled = false;
    }
  });
  $("#copiar-convite")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("#link-convite").value);
      aviso("Link copiado.");
    } catch {
      $("#link-convite").select();
      aviso("Seleciona e copia o link com o teclado.");
    }
  });
}
function fecharMenu(foco = false) {
  $("#rail").classList.remove("is-open");
  $("#mobile-menu").setAttribute("aria-expanded", "false");
  if (foco) $("#mobile-menu").focus();
}
function ir(vista) {
  if (!vistas[vista]) return;
  fecharMenu();
  estado.vista = vista;
  if (vista === "dashboard") {
    estado.intervalo = null;
    estado.q = "";
    if (estado.dias === "todos") estado.dias = "30";
  }
  if (location.hash.slice(1) !== vista) {
    controller?.abort();
    location.hash = vista;
  } else carregar(vista === "vagas");
}
window.addEventListener("hashchange", () => {
  estado.vista = vistas[location.hash.slice(1)]
    ? location.hash.slice(1)
    : "dashboard";
  if (estado.vista === "dashboard") {
    estado.intervalo = null;
    if (estado.dias === "todos") estado.dias = "30";
  }
  if (sessaoAtiva) carregar(estado.vista === "vagas");
});
document
  .querySelectorAll("[data-view]")
  .forEach((b) => (b.onclick = () => ir(b.dataset.view)));
$("#mobile-menu").onclick = () => {
  const aberto = $("#rail").classList.toggle("is-open");
  $("#mobile-menu").setAttribute("aria-expanded", String(aberto));
  if (aberto) $("#rail-close").focus();
};
$("#rail-close").onclick = () => fecharMenu(true);
$("#rail-shade").onclick = () => fecharMenu(true);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#rail").classList.contains("is-open"))
    fecharMenu(true);
});
// Limita o foco à navegação aberta no ecrã pequeno.
$("#rail").addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || !$("#rail").classList.contains("is-open")) return;
  const els = [...$("#rail").querySelectorAll("button,a")].filter(
    (e) => e.getClientRects().length,
  );
  const primeiro = els[0],
    ultimo = els.at(-1);
  if (e.shiftKey && document.activeElement === primeiro) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primeiro.focus();
  }
});
$("#user-name").onclick = () => ir("perfil");
$("#sair").onclick = async () => {
  const b = $("#sair");
  b.disabled = true;
  try {
    await api("/api/auth/logout", { method: "POST" });
    location.href = "login.html";
  } catch (e) {
    if (!(e instanceof SessaoTerminada)) {
      b.disabled = false;
      aviso("Não foi possível terminar a sessão. Tenta novamente.");
    }
  }
};
function fecharAoFundo(d) {
  d.addEventListener("click", (e) => {
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      d.close();
  });
}
document.querySelectorAll("dialog").forEach(fecharAoFundo);
$("#editor [data-close]").onclick = () => $("#editor").close();
const form = $("#form-vaga");
let capaAtual = null,
  previewLocal = null;
function mostrarCapa() {
  if (previewLocal) URL.revokeObjectURL(previewLocal);
  previewLocal = null;
  const ficheiro = form.elements.capa.files[0],
    titulo = form.elements.titulo.value;
  const auto = /\bphp\b/i.test(titulo)
    ? "php.png"
    : /\bjava\b/i.test(titulo)
      ? "java.png"
      : "default.jpg";
  if (ficheiro) previewLocal = URL.createObjectURL(ficheiro);
  $("#capa-preview").src =
    previewLocal ||
    (!form.elements.remover_capa.checked && capaAtual) ||
    `/media/vagas/${auto}`;
  $("#remover-capa-linha").hidden = !capaAtual;
}
function abrirVaga(vaga) {
  form.reset();
  $("#erro-vaga").textContent = "";
  form.elements.id.value = vaga?.id || "";
  form.elements.titulo.value = vaga?.titulo || "";
  form.elements.localizacao.value = vaga?.localizacao || "";
  form.elements.descricao.value = vaga?.descricao || "";
  form.elements.requisitos.value = vaga?.requisitos?.join("\n") || "";
  form.elements.ativa.checked = vaga ? Boolean(vaga.ativa) : true;
  capaAtual = vaga?.capa || null;
  $("#editor-titulo").textContent = vaga
    ? "Editar oportunidade."
    : "Nova oportunidade.";
  $("#guardar").textContent = vaga ? "Guardar alterações" : "Adicionar vaga";
  $("#cancelar-edicao").hidden = false;
  mostrarCapa();
  $("#editor").showModal();
}
$("#cancelar-edicao").onclick = () => $("#editor").close();
form.elements.capa.onchange = () => {
  const f = form.elements.capa.files[0];
  $("#erro-vaga").textContent = "";
  if (
    f &&
    (!["image/png", "image/jpeg"].includes(f.type) || f.size > 5 * 1024 * 1024)
  ) {
    $("#erro-vaga").textContent = "Escolhe uma imagem PNG ou JPG, até 5 MB.";
    form.elements.capa.value = "";
  }
  form.elements.remover_capa.checked = false;
  mostrarCapa();
};
form.elements.titulo.oninput = mostrarCapa;
form.elements.remover_capa.onchange = () => {
  if (form.elements.remover_capa.checked) form.elements.capa.value = "";
  mostrarCapa();
};
form.onsubmit = async (e) => {
  e.preventDefault();
  $("#erro-vaga").textContent = "";
  const id = form.elements.id.value,
    corpo = new FormData();
  for (const n of ["titulo", "localizacao", "descricao"])
    corpo.set(n, form.elements[n].value);
  corpo.set(
    "requisitos",
    JSON.stringify(
      form.elements.requisitos.value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  );
  corpo.set("ativa", String(form.elements.ativa.checked));
  corpo.set("remover_capa", String(form.elements.remover_capa.checked));
  if (form.elements.capa.files[0])
    corpo.set("capa", form.elements.capa.files[0]);
  $("#guardar").disabled = true;
  try {
    await api(id ? `/api/vagas/${id}` : "/api/vagas", {
      method: id ? "PUT" : "POST",
      body: corpo,
    });
    $("#editor").close();
    aviso(id ? "Alterações guardadas." : "Vaga adicionada.");
    await carregar(true);
  } catch (e) {
    if (!(e instanceof SessaoTerminada))
      $("#erro-vaga").textContent = e.message;
  } finally {
    $("#guardar").disabled = false;
  }
};
$("#editor").addEventListener("close", () => {
  if (previewLocal) URL.revokeObjectURL(previewLocal);
  previewLocal = null;
  form.elements.capa.value = "";
});
async function abrirPerfil(id) {
  perfilController?.abort();
  perfilController = new AbortController();
  const signal = perfilController.signal,
    d = $("#ficha");
  const topo = `<div class="drawer-top"><span>Candidatura #VT-${Number(id)}</span><button class="drawer-close" id="fechar-ficha" aria-label="Fechar ficha">${ICONS.close}</button></div>`;
  $("#ficha-conteudo").innerHTML =
    topo +
    '<h2 id="ficha-titulo">A carregar candidatura…</h2><p class="status" role="status">A consultar os dados.</p>';
  $("#fechar-ficha").onclick = () => d.close();
  if (!d.open) d.showModal();
  try {
    const c = await api(`/api/candidaturas/${Number(id)}`, { signal });
    if (signal.aborted || !d.open) return;
    $("#ficha-conteudo").innerHTML =
      topo +
      `<div class="profile-header"><span class="person-icon">${ICONS.people}</span><div><h2 id="ficha-titulo">${esc(c.nome)}</h2><p>${esc(c.vaga_titulo)} · ${esc(c.vaga_localizacao)}${c.vaga_id === null ? " · vaga removida" : ""}</p></div></div><dl class="profile-grid"><div><dt>Email</dt><dd>${esc(c.email)}</dd></div><div><dt>Telefone</dt><dd>${esc(c.telefone) || "Não indicado"}</dd></div><div><dt>Recebida</dt><dd>${esc(data(c.criado_em, true))}</dd></div><div><dt>Política de Privacidade aceite em</dt><dd>${esc(data(c.privacidade_aceite_em, true))}</dd></div></dl><div class="doc-box"><div><strong>Currículo em PDF</strong><small>Acesso privado com sessão de administrador.</small></div><button class="btn small" id="descarregar-cv">${ICONS.file}Descarregar currículo (PDF)</button></div><h3>Mensagem do candidato</h3><p class="profile-message">${esc(c.mensagem) || "Não foi enviada uma mensagem."}</p><p id="ficha-erro" class="erro" role="alert"></p><div class="acoes" style="margin-top:28px"><button class="perigo" id="eliminar-candidatura">Eliminar candidatura</button></div>`;
    $("#fechar-ficha").onclick = () => d.close();
    $("#descarregar-cv").onclick = () => descarregar(id);
    $("#eliminar-candidatura").onclick = async () => {
      if (
        !confirm(
          "Eliminar definitivamente esta candidatura e o respetivo currículo?",
        )
      )
        return;
      $("#eliminar-candidatura").disabled = true;
      try {
        await api(`/api/candidaturas/${Number(id)}`, { method: "DELETE" });
        d.close();
        aviso("Candidatura e currículo eliminados.");
        await carregar();
      } catch (e) {
        if (!(e instanceof SessaoTerminada)) {
          $("#ficha-erro").textContent = e.message;
          $("#eliminar-candidatura").disabled = false;
        }
      }
    };
  } catch (e) {
    if (e.name === "AbortError" || e instanceof SessaoTerminada || !d.open)
      return;
    $("#ficha-conteudo").innerHTML =
      topo +
      `<h2 id="ficha-titulo">Candidatura indisponível.</h2><p class="status error" role="alert">${esc(e.message)}</p><button class="btn" id="repetir-ficha">Tentar novamente</button>`;
    $("#fechar-ficha").onclick = () => d.close();
    $("#repetir-ficha").onclick = () => abrirPerfil(id);
  }
}
$("#ficha").addEventListener("close", () => perfilController?.abort());
async function descarregar(id) {
  const botao = $("#descarregar-cv");
  botao.disabled = true;
  $("#ficha-erro").textContent = "";
  try {
    const r = await fetch(`/api/candidaturas/${Number(id)}/curriculo`, {
      cache: "no-store",
    });
    if (r.status === 401) {
      fecharSessao();
      throw new SessaoTerminada();
    }
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.erro || "Não foi possível descarregar o currículo.");
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `curriculo-${Number(id)}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    if (!(e instanceof SessaoTerminada) && $("#ficha-erro"))
      $("#ficha-erro").textContent = e.message;
  } finally {
    if (botao.isConnected) botao.disabled = false;
  }
}
async function iniciar() {
  try {
    const s = await api("/api/auth/sessao");
    sessaoAtiva = true;
    atualizarIdentidade(s);
    vagas = await api("/api/vagas/admin");
    $("#inicio-estado").hidden = true;
    $("#app").hidden = false;
    await carregar();
  } catch (e) {
    if (e instanceof SessaoTerminada) {
      location.replace("login.html");
      return;
    }
    $("#inicio-estado").innerHTML =
      'Não foi possível ligar ao servidor. <button class="secundario" id="repetir-inicio">Tentar novamente</button>';
    $("#repetir-inicio").onclick = iniciar;
  }
}
await iniciar();
