// FRONT-END/public/js/medicamentos.js
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("med-cards");
  const searchInput = document.getElementById("search-med");
  const addBtn = document.getElementById("btn-add-med");

  if (!tbody) {
    console.error(
      "medicamentos.js: elemento #med-cards não encontrado no DOM."
    );
    return;
  }

  const fallbackImg = "/public/img/medicamento-default.png";
  let medicamentos = [];

  // Navegar para cadastro
  addBtn?.addEventListener("click", () => {
    window.location.href = "/pages/cadastrarMedicamento";
  });

  // Carregamento inicial
  loadMedicamentos();

  async function loadMedicamentos() {
    try {
      const res = await axios.get("/api/medicamentos");

      if (!res?.data) {
        medicamentos = [];
      } else if (Array.isArray(res.data)) {
        medicamentos = res.data;
      } else if (Array.isArray(res.data.medicamentos)) {
        medicamentos = res.data.medicamentos;
      } else {
        medicamentos = [];
      }

      render(medicamentos);

      // Busca
      if (searchInput) {
        searchInput.oninput = () => {
          const q = (searchInput.value || "").toLowerCase().trim();
          render(
            q
              ? medicamentos.filter((m) =>
                  (m.nome || "").toLowerCase().includes(q)
                )
              : medicamentos
          );
        };
      }
    } catch (err) {
      console.error("Erro ao carregar medicamentos:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-sm text-red-600 dark:text-red-400">
            Erro ao carregar medicamentos.
          </td>
        </tr>`;
    }
  }

  function fotoUrl(foto) {
    if (!foto) return fallbackImg;
    const path = String(foto).trim();
    if (/^(https?:)?\/\//i.test(path)) return path;
    return window.location.origin + (path.startsWith("/") ? path : "/" + path);
  }

  function render(list) {
    tbody.innerHTML = "";

    if (!Array.isArray(list) || !list.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-sm text-text-muted-light dark:text-text-muted-dark">
            Nenhum medicamento encontrado.
          </td>
        </tr>`;
      return;
    }

    list.forEach((m) => {
      const nome = m.nome || "Sem nome";
      const horariosArr = Array.isArray(m.horarios) ? m.horarios : [];
      const horarios = horariosArr.length ? horariosArr.join(", ") : "—";

      // Estoque atual e estoque inicial (novo campo)
      const estoque = Number(m.estoque) || 0;

      // prioridade para estoqueInicial; se não existir, cai para estoque_total (compatibilidade)
      const estoqueInicialRaw =
        m.estoqueInicial !== undefined ? m.estoqueInicial : m.estoque_total;

      const estoqueInicial =
        estoqueInicialRaw !== undefined && estoqueInicialRaw !== null
          ? Number(estoqueInicialRaw) || 0
          : 0;

      // Percentual de estoque em relação ao inicial
      let percent = 100;
      if (estoqueInicial > 0) {
        percent = Math.max(0, Math.min(100, (estoque / estoqueInicial) * 100));
      }

      // ==========================
      // STATUS BASEADO EM 20%
      // ==========================
      let statusText;
      let statusBg;
      let statusDot;
      let statusColor;

      if (estoqueInicial > 0 && percent < 20) {
        // menos de 5% do estoque inicial
        statusText = "Estoque Baixo";
        statusBg = "bg-warning/20";
        statusDot = "bg-warning";
        statusColor = "text-warning";
      } else if (estoqueInicial > 0) {
        // 5% ou mais
        statusText = "Em estoque";
        statusBg = "bg-primary/20";
        statusDot = "bg-primary";
        statusColor = "text-primary/90";
      } else {
        // caso não tenha estoqueInicial definido
        statusText = "—";
        statusBg = "bg-text-muted-light/10 dark:bg-text-muted-dark/10";
        statusDot = "bg-text-muted-light dark:bg-text-muted-dark";
        statusColor = "text-text-muted-light dark:text-text-muted-dark";
      }

      const avatar = fotoUrl(m.foto);
      const percentRounded = Math.round(percent);

      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-background-light dark:hover:bg-background-dark transition-colors";

      tr.innerHTML = `
        <!-- NOME + AVATAR -->
        <td class="h-[72px] px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div class="flex items-center gap-3">
            <div
              class="size-9 rounded-full bg-center bg-cover bg-no-repeat border border-border-light dark:border-border-dark"
              style="background-image: url('${avatar}');"
            ></div>
            <span>${escapeHtml(nome)}</span>
          </div>
        </td>

        <!-- HORÁRIOS -->
        <td class="h-[72px] px-6 py-4 whitespace-nowrap text-sm text-text-muted-light dark:text-text-muted-dark">
          ${escapeHtml(horarios)}
        </td>

        <!-- ESTOQUE (barra + label) -->
        <td class="h-[72px] px-6 py-4 whitespace-nowrap text-sm">
          <div class="flex items-center gap-3">
            <div class="w-24 overflow-hidden rounded-full bg-primary/10">
              <div
                class="h-2 rounded-full bg-primary"
                style="width: ${percentRounded}%;"
              ></div>
            </div>
            <p class="font-medium ${
              estoqueInicial > 0 && percent < 5 ? "text-warning" : ""
            }">
              ${estoque} un.
            </p>
          </div>
        </td>

        <!-- STATUS -->
        <td class="h-[72px] px-6 py-4 whitespace-nowrap text-sm">
          <div class="inline-flex items-center gap-1.5 ${statusBg} px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}">
            <div class="size-1.5 rounded-full ${statusDot}"></div>
            ${escapeHtml(statusText)}
          </div>
        </td>

        <!-- AÇÕES -->
        <td class="h-[72px] px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="btn-edit flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary/20 hover:text-primary transition-colors"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
          </div>
        </td>
      `;

      // Clique em editar
      tr.querySelector(".btn-edit")?.addEventListener("click", () => {
        window.location.href = `/pages/cadastrarMedicamento?id=${encodeURIComponent(
          m._id
        )}`;
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
