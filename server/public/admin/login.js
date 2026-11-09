const form = document.querySelector("#form-login"),
  erro = document.querySelector("#erro");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  erro.textContent = "";
  const b = form.querySelector("button");
  b.disabled = true;
  try {
    const r = await fetch(new URL("../api/auth/login", location.href), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    if (!r.ok) {
      const c = await r.json().catch(() => ({}));
      throw new Error(c.erro || "Não foi possível entrar.");
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
