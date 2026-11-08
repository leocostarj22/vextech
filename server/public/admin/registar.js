const token = new URLSearchParams(location.search).get("token"),
  form = document.querySelector("#form-registo"),
  erro = document.querySelector("#erro");
if (!token) {
  erro.textContent = "Link de convite inválido — falta o token.";
  form.querySelector("button").disabled = true;
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";
  const b = form.querySelector("button");
  b.disabled = true;
  try {
    const r = await fetch("/api/auth/registar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        ...Object.fromEntries(new FormData(form)),
      }),
    });
    if (!r.ok) {
      const c = await r.json().catch(() => ({}));
      throw new Error(c.erro || "Não foi possível criar a conta.");
    }
    location.href = "index.html";
  } catch (e) {
    erro.textContent =
      e.message === "Failed to fetch"
        ? "Não foi possível ligar ao servidor. Tenta novamente."
        : e.message;
  } finally {
    b.disabled = false;
  }
});
