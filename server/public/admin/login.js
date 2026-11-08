const form = document.querySelector("#form-login");
const erro = document.querySelector("#erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";
  const dados = Object.fromEntries(new FormData(form));
  const resposta = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    erro.textContent = corpo.erro || "Não foi possível entrar.";
    return;
  }
  location.href = "index.html";
});
