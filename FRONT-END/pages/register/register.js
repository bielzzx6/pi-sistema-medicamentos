// Aguarda o DOM carregar
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Pegando os inputs (na ordem em que aparecem no HTML)
    const nome = form[0].value.trim();
    const email = form[1].value.trim();
    const cpf = form[2].value.trim();
    const telefone = form[3].value.trim();
    const senha = form[4].value.trim();
    const confirmarSenha = form[5].value.trim();

    // Validação básica
    if (!nome || !email || !cpf || !telefone || !senha || !confirmarSenha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    // Criando o objeto a ser enviado para o backend
    const data = {
      nome,
      email,
      cpf,
      telefone,
      senha,
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/admin/register",
        data
      );

      alert("Conta criada com sucesso!");

      // Redireciona para login
      window.location.href = "/pages/login/login.html";

    } catch (error) {
      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("Erro ao conectar com o servidor.");
      }
    }
  });

  // Mostrar / ocultar senha
  const toggle = document.querySelector(".password-field .toggle");
  const inputSenha = document.querySelector(".password-field input");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const type = inputSenha.type === "password" ? "text" : "password";
      inputSenha.type = type;
    });
  }
});
