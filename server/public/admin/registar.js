const token = new URLSearchParams(location.search).get("token");
const form = document.querySelector("#form-registo");
const erro = document.querySelector("#erro");

if (!token) {
  erro.textContent = "Link de convite inválido — falta o token.";
  form.querySelector("button").disabled = true;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";
  const dados = { token, ...Object.fromEntries(new FormData(form)) };
  const resposta = await fetch("/api/auth/registar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    erro.textContent = corpo.erro || "Não foi possível criar a conta.";
    return;
  }
  location.href = "index.html";
});
