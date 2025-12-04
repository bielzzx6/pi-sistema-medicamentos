document.addEventListener("DOMContentLoaded", async () => {
  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const cpfInput = document.getElementById("cpf");
  const telefoneInput = document.getElementById("telefone");

  const sidebarName = document.getElementById("sidebar-name");
  const sidebarEmail = document.getElementById("sidebar-email");

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");

  const form = document.getElementById("profile-form");

  // =============================
  // 1️⃣ BUSCAR INFORMAÇÕES DO ADMIN
  // =============================
  async function loadAdmin() {
    try {
      const res = await axios.get("http://localhost:3000/api/admin/me");
      const admin = res.data;

      // Preenche campos do formulário
      nomeInput.value = admin.nome;
      emailInput.value = admin.email;
      cpfInput.value = admin.cpf;
      telefoneInput.value = admin.telefone;

      // Preenche sidebar
      sidebarName.textContent = admin.nome;
      sidebarEmail.textContent = admin.email;

      // Preenche card do topo
      profileName.textContent = admin.nome;
      profileEmail.textContent = admin.email;

    } catch (error) {
      console.error("Erro ao carregar admin:", error);
      alert("Erro ao carregar dados do perfil.");
    }
  }

  await loadAdmin();

  // =============================
  // 2️⃣ ATUALIZAR PERFIL
  // =============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const senhaAtual = document.getElementById("senha-atual").value;
    const novaSenha = document.getElementById("nova-senha").value;
    const confirmSenha = document.getElementById("confirmar-nova-senha").value;

    if (novaSenha && novaSenha !== confirmSenha) {
      alert("A nova senha e a confirmação não correspondem!");
      return;
    }

    try {
      const body = {
        nome: nomeInput.value,
        email: emailInput.value,
        cpf: cpfInput.value,
        telefone: telefoneInput.value,
        senhaAtual,
        novaSenha,
      };

      await axios.put("http://localhost:3000/api/admin/update", body);

      alert("Perfil atualizado com sucesso!");
      loadAdmin(); // Atualiza na tela

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar perfil.");
    }
  });

  // =============================
  // 3️⃣ CANCELAR
  // =============================
  document.getElementById("cancelar-btn").addEventListener("click", () => {
    window.location.reload();
  });
});
