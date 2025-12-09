// pacientes.js
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.querySelector(".list");
  const searchInput = document.querySelector(".search");
  const addBtn = document.querySelector(".add-btn");

  // Helpers
  function getPhotoUrl(fotoPath) {
    if (!fotoPath) return "https://i.pravatar.cc/50";
    // fotoPath stored like "/uploads/idosos/123.jpg"
    return window.location.origin + fotoPath;
  }

  function createItem(idoso) {
    const item = document.createElement("div");
    item.className = "item";

    const infoHtml = `
      <div class="info">
        <img src="${getPhotoUrl(idoso.foto)}" class="avatar" />
        <div>
          <h3>${escapeHtml(idoso.nome)}</h3>
          <span>${escapeHtml(idoso.informacoes || "")}</span>
        </div>
      </div>
    `;

    const actionsHtml = `
      <div class="actions-item">
        <a href="/pages/cadastroIdoso/cadastroIdoso.html?id=${idoso._id}" class="edit">Editar</a>
        <a href="/pages/idoso/idoso.html?id=${idoso._id}" class="view">Ver Perfil</a>
        <button class="delete" data-id="${idoso._id}">Remover</button>
      </div>
    `;

    item.innerHTML = infoHtml + actionsHtml;

    // delete handler
    item.querySelector(".delete").addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!confirm("Tem certeza que deseja excluir este idoso?")) return;
      try {
        await axios.delete(`/api/idosos/${id}`);
        item.remove();
        showToast("Idoso removido.");
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || "Erro ao remover.");
      }
    });

    return item;
    // helper escapeHtml defined below
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
  }

  function showToast(msg) {
    // simples notificação
    alert(msg);
  }

  // Load list
  async function loadList() {
    listEl.innerHTML = "<p>Carregando...</p>";
    try {
      const res = await axios.get("/api/idosos");
      let idosos = res.data || [];

      // store for client-side search
      window.__idosos_cache = idosos;

      renderList(idosos);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = "<p>Erro ao carregar idosos.</p>";
    }
  }

  function renderList(idosos) {
    if (!idosos || idosos.length === 0) {
      listEl.innerHTML = "<p>Nenhum idoso cadastrado.</p>";
      return;
    }

    listEl.innerHTML = "";
    idosos.forEach((id) => listEl.appendChild(createItem(id)));
  }

  // Search
  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const all = window.__idosos_cache || [];
    if (!q) {
      renderList(all);
      return;
    }
    const filtered = all.filter((i) =>
      (i.nome || "").toLowerCase().includes(q) ||
      (i.informacoes || "").toLowerCase().includes(q)
    );
    renderList(filtered);
  });

  // Add button
  addBtn?.addEventListener("click", () => {
    window.location.href = "/pages/cadastroIdoso/cadastroIdoso.html";
  });

  // initial load
  loadList();
});
