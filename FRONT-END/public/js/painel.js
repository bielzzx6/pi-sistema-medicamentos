// painel.js
document.addEventListener("DOMContentLoaded", () => {
  const recentContainer = document.querySelector(".cards"); // usa sua grid de cards
  const sidebarName = document.getElementById("sidebar-name");
  const sidebarEmail = document.getElementById("sidebar-email");

  function getPhotoUrl(fotoPath) {
    if (!fotoPath) return "https://i.pravatar.cc/100";
    return window.location.origin + fotoPath;
  }

  // Preenche dados do admin (se tiver admin salvo localmente)
  const adminStr = localStorage.getItem("admin");
  if (adminStr) {
    try {
      const admin = JSON.parse(adminStr);
      if (sidebarName) sidebarName.textContent = admin.nome || "";
      if (sidebarEmail) sidebarEmail.textContent = admin.email || "";
    } catch (e) {}
  }

  async function loadSummary() {
    try {
      const res = await axios.get("/api/idosos");
      const idosos = res.data || [];

      // resumo simples
      const total = idosos.length;
      const totalMedicamentos = idosos.reduce((acc, i) => acc + (i.medicamentos?.length || 0), 0);
      const totalCuidadores = new Set(idosos.flatMap(i => (i.cuidadores || []).map(c => c.nome))).size;

      // montar cards de resumo no topo (pode trocar pelo layout existente)
      const summaryHtml = `
        <div class="summary-row">
          <div class="summary-card"><h3>${total}</h3><p>Idosos</p></div>
          <div class="summary-card"><h3>${totalMedicamentos}</h3><p>Medicamentos</p></div>
          <div class="summary-card"><h3>${totalCuidadores}</h3><p>Cuidadores</p></div>
        </div>
      `;

      // inserir antes dos cards (ou adaptar conforme seu layout)
      const containerParent = document.querySelector(".main");
      if (containerParent) {
        const existing = document.querySelector(".summary-row");
        if (!existing) containerParent.insertAdjacentHTML("afterbegin", summaryHtml);
      }

      // últimos 4 idosos (ordenar por createdAt desc)
      const sorted = idosos.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      const latest = sorted.slice(0, 4);

      // limpar e renderizar os patient-card usando seu HTML existente
      const cardsContainer = document.querySelector(".cards");
      if (!cardsContainer) return;

      cardsContainer.innerHTML = "";

      latest.forEach(i => {
        const card = document.createElement("div");
        card.className = "patient-card";
        card.innerHTML = `
          <img src="${getPhotoUrl(i.foto)}" class="photo" />
          <h3>${escapeHtml(i.nome)}</h3>
          <div class="tags">
            <span class="tag">${i.medicamentos?.some(m=>m.ativo) ? "💊" : "○"}</span>
          </div>
          <div class="info">
            <p class="label">PRÓXIMA AÇÃO</p>
            <p class="value">${escapeHtml(i.medicamentos?.[0]?.nome || "Nenhuma ação")}</p>
          </div>
          <div class="info">
            <p class="label">EVENTOS RECENTES</p>
            <p class="value">${escapeHtml(i.informacoes || "Nenhuma alteração")}</p>
          </div>
          <button class="btn"><a href="/pages/idoso/idoso.html?id=${i._id}">Ver Detalhes</a></button>
        `;
        cardsContainer.appendChild(card);
      });

    } catch (err) {
      console.error(err);
    }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;","<": "&lt;",">": "&gt;",'"': "&quot;","'": "&#39;"
    }[m]));
  }

  loadSummary();
});
