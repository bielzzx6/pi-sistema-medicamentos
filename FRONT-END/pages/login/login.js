document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const toggle = document.querySelector(".toggle");
  const passwordInput = document.querySelector('input[type="password"]');
  const loginInput = document.querySelector('input[placeholder="Digite seu e-mail ou CPF"]');

  // ===============================
  // MOSTRAR / OCULTAR SENHA
  // ===============================
  toggle.addEventListener("click", function () {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
  });

  // ===============================
  // SUBMIT DO FORMULÁRIO
  // ===============================
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const login = loginInput.value.trim();
    const senha = passwordInput.value.trim();

    if (!login || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    const data = { email: login, senha };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/admin/login",
        data
      );

      // Salvando o token e os dados do usuário
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("admin", JSON.stringify(response.data.admin));

      alert("Login realizado com sucesso!");

      // Redirecionar para o painel
      window.location.href = "/pages/painel/painel.html";

    } catch (error) {
      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("Erro ao conectar ao servidor.");
      }
    }
  });
});
