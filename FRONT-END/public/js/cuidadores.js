// FRONT-END/public/js/cuidadores.js
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("cuidadores-tbody");
  const searchInput = document.getElementById("search-cuidador");
  const addBtn = document.getElementById("btn-add-cuidador");

  if (!tbody) {
    console.error("cuidadores.js: elemento #cuidadores-tbody não encontrado.");
    return;
  }

  let cuidadores = [];

  addBtn?.addEventListener("click", () => {
    // Ajuste o path se o seu cadastro estiver em outro local
    window.location.href = "/pages/cadastrarCuidador";
  });

  loadCuidadores();

  async function loadCuidadores() {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-sm text-text-muted-light dark:text-text-muted-dark">
          Carregando cuidadores...
        </td>
      </tr>
    `;

    try {
      const res = await axios.get("/api/cuidadores");

      if (!res?.data) {
        cuidadores = [];
      } else if (Array.isArray(res.data)) {
        cuidadores = res.data;
      } else if (Array.isArray(res.data.cuidadores)) {
        cuidadores = res.data.cuidadores;
      } else {
        cuidadores = [];
      }

      window.__cuidadores_cache = cuidadores;
      render(cuidadores);

      if (searchInput) {
        searchInput.oninput = () => {
          const q = (searchInput.value || "").toLowerCase().trim();
          if (!q) {
            render(cuidadores);
            return;
          }

          const filtered = cuidadores.filter((c) => {
            const nome = (c.nome || "").toLowerCase();
            const cpf = (c.cpf || "").toLowerCase();
            return nome.includes(q) || cpf.includes(q);
          });

          render(filtered);
        };
      }
    } catch (err) {
      console.error("Erro ao carregar cuidadores:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-sm text-red-600 dark:text-red-400">
            Erro ao carregar cuidadores.
          </td>
        </tr>
      `;
    }
  }

  function render(list) {
    tbody.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-sm text-text-muted-light dark:text-text-muted-dark">
            Nenhum cuidador encontrado.
          </td>
        </tr>
      `;
      return;
    }

    list.forEach((c) => {
      const nome = c.nome || "Sem nome";
      const cpf = c.cpf || "—";
      const telefone = c.telefone || c.whatsapp || "—";

      const idosos = Array.isArray(c.idososVinculados)
        ? c.idososVinculados
        : [];

      const idososLabel =
        idosos.length === 0
          ? "Nenhum idoso vinculado"
          : idosos.length === 1
          ? "1 idoso vinculado"
          : `${idosos.length} idosos vinculados`;

      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-background-light dark:hover:bg-background-dark transition-colors";

      tr.innerHTML = `
        <!-- Nome -->
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-text-dark">
          ${escapeHtml(nome)}
        </td>

        <!-- CPF -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">
          ${escapeHtml(cpf)}
        </td>

        <!-- Telefone / WhatsApp -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">
          ${escapeHtml(telefone)}
        </td>

        <!-- Idosos vinculados -->
        <td class="px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">
          ${escapeHtml(idososLabel)}
        </td>

        <!-- Ações -->
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-edit flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary/20 hover:text-primary transition-colors"
              title="Editar cuidador"
            >
              <span class="material-symbols-outlined text-base">edit</span>
            </button>

            <button
              type="button"
              class="btn-delete flex h-8 w-8 items-center justify-center rounded-lg hover:bg-danger/10 hover:text-danger transition-colors"
              title="Remover cuidador"
            >
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </td>
      `;

      const editBtn = tr.querySelector(".btn-edit");
      const delBtn = tr.querySelector(".btn-delete");

      editBtn?.addEventListener("click", () => {
        // ajuste a rota se o cadastro estiver em outro path
        window.location.href = `/pages/cadastrarCuidador?id=${encodeURIComponent(
          c._id
        )}`;
      });

      delBtn?.addEventListener("click", async () => {
        if (!confirm("Tem certeza que deseja remover este cuidador?")) return;

        try {
          await axios.delete(`/api/cuidadores/${c._id}`);
          cuidadores = cuidadores.filter((x) => x._id !== c._id);
          render(cuidadores);
        } catch (err) {
          console.error("Erro ao remover cuidador:", err);
          alert("Erro ao remover cuidador.");
        }
      });

      tbody.appendChild(tr);
    });
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
});
