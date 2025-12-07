// Protege as páginas que precisam de autenticação

(async function () {
  await fetch("/api/system/verify-auth", {
    method: "GET",
    credentials: "include",
  }).then(async (response) => {
    const data = await response.json();
    if (!data.success) {
      return (window.location.href = "/pages/login");
    }
    if (window.location.pathname == "/") {
      window.location.href = "/pages/painel";
    }
  });
})();
