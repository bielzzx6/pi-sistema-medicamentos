document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  // Campos
  const passwordInput =
    document.querySelector('input[type="password"]') ||
    document.getElementById("password");

  const loginInput =
    document.querySelector('input[placeholder="Digite seu e-mail ou CPF"]') ||
    document.getElementById("login");

  // Botão de submit
  const submitBtn = form.querySelector('button[type="submit"]');

  // Toggle de senha (pode ser .toggle ou #toggle-password, dependendo do HTML)
  const toggle =
    document.querySelector(".toggle") ||
    document.getElementById("toggle-password");

  // Feedback visual
  const feedbackEl = document.getElementById("login-feedback");

  // ===============================
  // Funções de feedback visual
  // ===============================
  function showFeedback(type, message) {
    if (!feedbackEl) return;

    feedbackEl.classList.remove(
      "hidden",
      "border-red-300",
      "bg-red-50",
      "text-red-700",
      "border-amber-300",
      "bg-amber-50",
      "text-amber-800",
      "border-emerald-300",
      "bg-emerald-50",
      "text-emerald-800"
    );

    const map = {
      error: ["border-red-300", "bg-red-50", "text-red-700"],
      warning: ["border-amber-300", "bg-amber-50", "text-amber-800"],
      success: ["border-emerald-300", "bg-emerald-50", "text-emerald-800"],
    };

    feedbackEl.classList.add(...(map[type] || map.error));
    feedbackEl.textContent = message;
  }

  function hideFeedback() {
    if (!feedbackEl) return;
    feedbackEl.classList.add("hidden");
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;

    if (isLoading) {
      submitBtn.classList.add("opacity-70", "cursor-not-allowed");
    } else {
      submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  }

  // ===============================
  // MOSTRAR / OCULTAR SENHA
  // ===============================
  if (toggle && passwordInput) {
    toggle.addEventListener("click", () => {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";

      // Se no novo HTML você estiver usando ícone (Material Icons), troca o texto
      const icon = toggle.querySelector(".material-symbols-outlined");
      if (icon) {
        icon.textContent = isPassword ? "visibility_off" : "visibility";
      }
    });
  }

  // ===============================
  // SUBMIT DO FORMULÁRIO
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideFeedback();

    const login = (loginInput?.value || "").trim();
    const senha = (passwordInput?.value || "").trim();

    if (!login || !senha) {
      showFeedback("warning", "Preencha e-mail/CPF e senha para continuar.");
      return;
    }

    const data = { email: login, senha };
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        credentials: "include",
        body: JSON.stringify(data),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (_) {
        responseData = null;
      }

      // Se o backend respondeu com erro HTTP (4xx / 5xx)
      if (!response.ok) {
        const msg =
          responseData?.error ||
          (response.status === 401
            ? "Credenciais inválidas. Verifique e tente novamente."
            : "Erro ao tentar realizar login.");
        showFeedback("error", msg);
        setLoading(false);
        return;
      }

      // HTTP 200 mas sucesso = false ou algo estranho
      if (!responseData || responseData.success !== true) {
        const msg =
          responseData?.error || "Não foi possível efetuar o login agora.";
        showFeedback("error", msg);
        setLoading(false);
        return;
      }

      // Sucesso!
      showFeedback("success", "Login realizado com sucesso! Redirecionando...");
      setTimeout(() => {
        window.location.href = "/pages/painel";
      }, 600);
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      showFeedback("error", "Erro ao conectar ao servidor. Tente novamente.");
      setLoading(false);
    }
  });
});
