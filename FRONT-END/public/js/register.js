// FRONT-END/public/js/register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  if (!form) return;

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const cpfInput = document.getElementById("cpf");
  const telefoneInput = document.getElementById("telefone");
  const senhaInput = document.getElementById("senha");
  const confirmarInput = document.getElementById("confirmar");

  const feedbackEl = document.getElementById("register-feedback");
  const loadingEl = document.getElementById("register-loading");
  const submitBtn = document.getElementById("register-btn");
  const togglePassBtn = document.getElementById("toggle-pass");

  function showFeedback(type, message) {
    if (!feedbackEl) return;

    // Base classes
    feedbackEl.className = "mb-4 rounded-lg border px-3 py-2 text-sm";

    if (type === "error") {
      feedbackEl.classList.add("border-red-300", "bg-red-50", "text-red-700");
    } else if (type === "success") {
      feedbackEl.classList.add(
        "border-emerald-300",
        "bg-emerald-50",
        "text-emerald-800"
      );
    } else {
      feedbackEl.classList.add(
        "border-amber-300",
        "bg-amber-50",
        "text-amber-800"
      );
    }

    feedbackEl.textContent = message;
    feedbackEl.classList.remove("hidden");
  }

  function hideFeedback() {
    if (!feedbackEl) return;
    feedbackEl.classList.add("hidden");
    feedbackEl.textContent = "";
  }

  function setLoading(isLoading) {
    if (submitBtn) {
      submitBtn.disabled = isLoading;
      submitBtn.classList.toggle("opacity-70", isLoading);
      submitBtn.classList.toggle("cursor-not-allowed", isLoading);
    }
    if (loadingEl) {
      loadingEl.classList.toggle("hidden", !isLoading);
    }
  }

  // Mostrar / ocultar senha
  if (togglePassBtn && senhaInput) {
    const icon = togglePassBtn.querySelector(".material-symbols-outlined");
    togglePassBtn.addEventListener("click", () => {
      if (senhaInput.type === "password") {
        senhaInput.type = "text";
        if (icon) icon.textContent = "visibility";
      } else {
        senhaInput.type = "password";
        if (icon) icon.textContent = "visibility_off";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFeedback();

    const nome = nomeInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const cpf = cpfInput?.value.trim() || "";
    const telefone = telefoneInput?.value.trim() || "";
    const senha = senhaInput?.value.trim() || "";
    const confirmarSenha = confirmarInput?.value.trim() || "";

    if (!nome || !email || !cpf || !telefone || !senha || !confirmarSenha) {
      showFeedback("error", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      showFeedback("error", "As senhas não coincidem.");
      return;
    }

    const data = { nome, email, cpf, telefone, senha };

    try {
      setLoading(true);

      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok || body.success === false) {
        const msg =
          body.error ||
          body.message ||
          "Não foi possível criar a conta. Verifique os dados.";
        showFeedback("error", msg);
        setLoading(false);
        return;
      }

      showFeedback("success", "Conta criada com sucesso! Redirecionando...");
      setTimeout(() => {
        window.location.href = "/pages/login";
      }, 1200);
    } catch (err) {
      console.error(err);
      showFeedback(
        "error",
        "Erro ao conectar com o servidor. Tente novamente em instantes."
      );
      setLoading(false);
    }
  });
});
