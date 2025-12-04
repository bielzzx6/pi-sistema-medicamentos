// Protege as páginas que precisam de autenticação
(function () {
  const token = localStorage.getItem("token");

  if (!token) {
    // Usuário não está logado -> manda para o login
    window.location.href = "/pages/login/login.html";
  }
})();
