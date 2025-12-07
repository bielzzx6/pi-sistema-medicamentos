// /public/js/pacientes.js
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.querySelector(".list");
  const searchInput = document.querySelector(".search"); // optional, only if exists in HTML
  const addBtn = document.querySelector(".add-btn");

  if (!listEl) return; // safety

  // -----------------------------
  // Helpers
  // -----------------------------

  function getPhotoUrl(fotoPath) {
    if (!fotoPath) {
      // default avatar image
      return "https://images.pexels.com/photos/7551661/pexels-photo-7551661.jpeg?auto=compress&cs=tinysrgb&w=160";
    }

    // If it is already an absolute URL, return as is
    if (fotoPath.startsWith("http://") || fotoPath.startsWith("https://")) {
      return fotoPath;
    }

    // Example: "/uploads/idosos/123.jpg"
    return window.location.origin + fotoPath;
  }

  function calcAge(dateValue) {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (isNaN(d)) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  }

  function escapeHtml(str) {
    return String(str || "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[m])
    );
  }

  function showToast(msg) {
    // Simple notification (can be replaced by a nicer toast later)
    alert(msg);
  }

  function buildSummary(idoso) {
    const parts = [];

    if (Array.isArray(idoso.doencas) && idoso.doencas.length > 0) {
      const main = idoso.doencas[0];
      if (main?.diagnostico) {
        parts.push(main.diagnostico);
      }
    }

    if (idoso.informacoes) {
      parts.push(idoso.informacoes);
    }

    if (parts.length === 0) {
      return "Acompanhamento geral de saúde.";
    }

    return parts.join(" · ");
  }

  function getMainContact(idoso) {
    if (!Array.isArray(idoso.contatos) || idoso.contatos.length === 0) {
      return null;
    }
    return idoso.contatos[0]; // first contact
  }

  // -----------------------------
  // Create card item (Tailwind)
  // -----------------------------
  function createItem(idoso) {
    const item = document.createElement("div");

    const photoUrl = getPhotoUrl(idoso.foto);
    const age = calcAge(idoso.data_nasc);
    const ageText = age != null ? `${age} anos` : "Idade não informada";
    const summary = buildSummary(idoso);
    const contact = getMainContact(idoso);

    const contactHtml = contact
      ? `
      <div class="flex items-center gap-1 text-slate-500 dark:text-slate-300">
        <span class="material-symbols-outlined text-[16px]">
          contact_phone
        </span>
        <span>${escapeHtml(contact.nome || "Contato")}: ${escapeHtml(
          contact.telefone || ""
        )}</span>
      </div>
    `
      : "";

    item.className =
      "flex flex-col md:flex-row items-start md:items-center gap-4 " +
      "bg-card-light dark:bg-card-dark px-5 py-4 rounded-lg shadow-sm " +
      "border border-border-light dark:border-border-dark";

    item.innerHTML = `
      <div class="flex items-start gap-4 w-full">
        <!-- Avatar -->
        <div
          class="bg-center bg-no-repeat bg-cover rounded-full h-16 w-16 shrink-0 border border-border-light dark:border-border-dark"
          style="background-image: url('${photoUrl}');"
        ></div>

        <!-- Main info -->
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <p
              class="text-text-light-primary dark:text-text-dark-primary text-base md:text-lg font-semibold leading-snug truncate"
            >
              ${escapeHtml(idoso.nome)}
            </p>
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              ${escapeHtml(ageText)}
            </span>
          </div>

          <p
            class="text-text-light-secondary dark:text-text-dark-secondary text-sm leading-snug line-clamp-2"
          >
            ${escapeHtml(summary)}
          </p>

          <div class="flex flex-wrap gap-3 pt-2 text-xs sm:text-sm">
            ${contactHtml}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex gap-2 md:gap-3 w-full md:w-auto md:items-center mt-2 md:mt-0 pr-4"
      >
        <a
          href="/pages/cadastroIdoso?id=${idoso._id}"
          class="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">
            edit
          </span>
          Editar
        </a>

        <a
          href="/pages/idoso?id=${idoso._id}"
          class="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span class="material-symbols-outlined text-[18px]">
            visibility
          </span>
          Ver perfil
        </a>

        <button
          type="button"
          class="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors delete"
          data-id="${idoso._id}"
        >
          <span class="material-symbols-outlined text-[18px]">
            delete
          </span>
          Remover
        </button>
      </div>
    `;

    // Delete handler
    const deleteBtn = item.querySelector(".delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
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
    }

    return item;
  }

  // -----------------------------
  // Loading + rendering
  // -----------------------------

  async function loadList() {
    listEl.innerHTML = `
      <div class="text-center py-10 text-sm text-text-light-secondary dark:text-text-dark-secondary">
        Carregando idosos...
      </div>
    `;
    try {
      const res = await axios.get("/api/idosos");
      const idosos = res.data || [];

      // store for client-side search
      window.__idosos_cache = idosos;

      renderList(idosos);
    } catch (err) {
      console.error(err);
      listEl.innerHTML = `
        <div class="text-center py-10 text-sm text-red-600 dark:text-red-400">
          Erro ao carregar idosos.
        </div>
      `;
    }
  }

  function renderList(idosos) {
    if (!idosos || idosos.length === 0) {
      listEl.innerHTML = `
        <div class="text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-lg py-16 px-6">
          <div class="mx-auto w-fit bg-primary/20 text-primary p-4 rounded-full mb-4">
            <span class="material-symbols-outlined">group</span>
          </div>
          <h3 class="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
            Nenhum idoso cadastrado
          </h3>
          <p class="text-text-light-secondary dark:text-text-dark-secondary mt-1">
            Clique em "Adicionar Novo Idoso" para começar.
          </p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = "";
    idosos.forEach((idoso) => listEl.appendChild(createItem(idoso)));
  }

  // -----------------------------
  // Search
  // -----------------------------
  searchInput?.addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    const all = window.__idosos_cache || [];
    if (!q) {
      renderList(all);
      return;
    }
    const filtered = all.filter(
      (i) =>
        (i.nome || "").toLowerCase().includes(q) ||
        (i.informacoes || "").toLowerCase().includes(q)
    );
    renderList(filtered);
  });

  // -----------------------------
  // Add button
  // -----------------------------
  addBtn?.addEventListener("click", () => {
    window.location.href = "/pages/cadastroIdoso";
  });

  // -----------------------------
  // Initial load
  // -----------------------------
  loadList();
});
