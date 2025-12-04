// painel.js
document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.querySelector(".cards");
  const sidebarName = document.getElementById("sidebar-name");
  const sidebarEmail = document.getElementById("sidebar-email");

  // ==================================================
  // 1. Exibe dados do admin logado
  // ==================================================
  const adminStr = localStorage.getItem("admin");
  if (adminStr) {
    try {
      const admin = JSON.parse(adminStr);
      sidebarName.textContent = admin.nome;
      sidebarEmail.textContent = admin.email;
    } catch (_) {}
  }

  // ==================================================
  // 2. Constrói URL da imagem
  // ==================================================
  function getPhotoUrl(foto) {
    if (!foto) return "https://i.pravatar.cc/100"; // fallback
    return `${window.location.origin}${foto}`;
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));
  }

  // ==================================================
  // 3. Carrega os idosos mais recentes
  // ==================================================
  async function loadLatestIdosos() {
    try {
      const res = await axios.get("/api/idosos");
      const idosos = res.data;

      if (!Array.isArray(idosos)) return;

      // Ordena por data de criação (decrescente)
      const sorted = idosos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pega os 4 mais novos
      const latest = sorted.slice(0, 4);

      cardsContainer.innerHTML = "";

      latest.forEach((i) => {
        const medicamento = i.medicamentos?.[0];
        const proximaAcao = medicamento
          ? `${escapeHtml(medicamento.nome)} às ${medicamento.horario || ""}`
          : "Nenhuma ação";

        const eventos = i.informacoes?.trim() || "Nenhuma alteração";

        const card = document.createElement("div");
        card.className = "patient-card";

        card.innerHTML = `
          <img src="${getPhotoUrl(i.foto)}" class="photo" />

          <h3>${escapeHtml(i.nome)}</h3>

          <div class="tags">
            <span class="tag orange">!</span>
            <span class="tag yellow">2</span>
            <span class="tag blue">📅</span>
          </div>

          <div class="info">
            <p class="label">PRÓXIMA AÇÃO</p>
            <p class="value">${proximaAcao}</p>
          </div>

          <div class="info">
            <p class="label">EVENTOS RECENTES</p>
            <p class="value">${escapeHtml(eventos)}</p>
          </div>

          <button class="btn">
            <a style="color:white;text-decoration:none;" href="/pages/idoso/idoso.html?id=${i._id}">
              Ver Detalhes
            </a>
          </button>
        `;

        cardsContainer.appendChild(card);
      });

    } catch (err) {
      console.error("Erro ao carregar idosos:", err);
    }
  }

  loadLatestIdosos();
});