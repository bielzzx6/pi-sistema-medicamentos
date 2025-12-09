// FRONT-END/public/js/idoso.js
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    alert("Idoso não especificado.");
    window.location.href = "/pages/pacientes";
    return;
  }

  // Elementos básicos do cabeçalho / dados gerais
  const pageTitleEl = document.getElementById("idoso-page-title");
  const idosoAvatarEl = document.getElementById("idoso-avatar");
  const idosoNomeEl = document.getElementById("idoso-nome");
  const idosoNascimentoEl = document.getElementById("idoso-nascimento");
  const dadosNomeEl = document.getElementById("dados-nome");
  const dadosNascimentoEl = document.getElementById("dados-nascimento");
  const dadosContatoEl = document.getElementById("dados-contato");
  const doencasEl = document.getElementById("idoso-doencas");
  const editarLinkEl = document.getElementById("editar-link");

  /* -------------------------------
   * Tabs (Informações / Vitais / Meds)
   * ----------------------------- */

  // Botões de aba devem ter data-tab="gerais" | "sinais" | "medicamentos"
  // Containers de conteúdo devem ter data-tab-panel="gerais" | ...
  const tabButtons = document.querySelectorAll("[data-tab]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  function activateTab(tabKey) {
    if (!tabKey) return;

    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabKey;

      // classes base do HTML original
      if (isActive) {
        btn.classList.add(
          "border-b-[3px]",
          "border-b-primary",
          "text-[#0d181b]",
          "dark:text-white"
        );
        btn.classList.remove(
          "border-b-transparent",
          "text-gray-500",
          "dark:text-gray-400"
        );
      } else {
        btn.classList.remove(
          "border-b-[3px]",
          "border-b-primary",
          "text-[#0d181b]",
          "dark:text-white"
        );
        btn.classList.add(
          "border-b-transparent",
          "text-gray-500",
          "dark:text-gray-400"
        );
      }

      // Ícone com/sem fill
      const icon = btn.querySelector(".material-symbols-outlined");
      if (icon) {
        if (isActive) {
          icon.classList.add("fill");
        } else {
          icon.classList.remove("fill");
        }
      }
    });

    tabPanels.forEach((panel) => {
      const isCurrent = panel.dataset.tabPanel === tabKey;
      panel.classList.toggle("hidden", !isCurrent);
    });
  }

  function setupTabs() {
    if (!tabButtons.length || !tabPanels.length) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const tabKey = btn.dataset.tab;
        activateTab(tabKey);
      });
    });

    // Ativa aba padrão (gerais) ou a primeira
    const defaultTab =
      document.querySelector("[data-tab='gerais']") || tabButtons[0];
    if (defaultTab) {
      activateTab(defaultTab.dataset.tab);
    }
  }

  /* -------------------------------
   * Helpers
   * ----------------------------- */

  function getPhotoUrl(path) {
    if (!path) return "https://i.pravatar.cc/160";
    if (/^https?:\/\//i.test(path)) return path;
    return window.location.origin + (path.startsWith("/") ? path : "/" + path);
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" });
  }

  function renderDoencas(lista) {
    if (!doencasEl) return;
    doencasEl.innerHTML = "";

    (lista || []).forEach((d) => {
      const details = document.createElement("details");
      details.className =
        "group bg-background-light dark:bg-background-dark p-4 rounded-lg";
      details.open = true;

      const diagnostico = escapeHtml(d.diagnostico || "Condição clínica");
      const medico = escapeHtml(d.medico || "");
      const dt = formatDate(d.data);
      const obs = escapeHtml(d.observacoes || "");

      details.innerHTML = `
        <summary
          class="flex justify-between items-center cursor-pointer list-none"
        >
          <div>
            <p class="font-bold text-[#0d181b] dark:text-white">
              ${diagnostico}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              ${medico ? medico + (dt ? " • " + dt : "") : dt ? dt : ""}
            </p>
          </div>
          <span
            class="material-symbols-outlined transition-transform duration-300 group-open:rotate-180"
          >
            expand_more
          </span>
        </summary>
        <div
          class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm"
        >
          ${
            dt
              ? `<p>
                  <strong class="text-gray-600 dark:text-gray-300">
                    Diagnóstico:
                  </strong> ${dt}
                </p>`
              : ""
          }
          ${
            obs
              ? `<p>
                  <strong class="text-gray-600 dark:text-gray-300">
                    Observações:
                  </strong> ${obs}
                </p>`
              : ""
          }
        </div>
      `;

      doencasEl.appendChild(details);
    });
  }

  /* -------------------------------
   * Carregar dados do idoso
   * ----------------------------- */

  async function loadIdoso() {
    try {
      const res = await fetch(`/api/idosos/${encodeURIComponent(id)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erro ao buscar idoso");
      const i = await res.json();

      const nome = i.nome || "Paciente";

      if (pageTitleEl) pageTitleEl.textContent = "Perfil de " + nome;
      if (idosoNomeEl) idosoNomeEl.textContent = nome;
      if (dadosNomeEl) dadosNomeEl.textContent = nome;

      const nascFmt = formatDate(i.data_nasc);
      if (idosoNascimentoEl) {
        idosoNascimentoEl.textContent = nascFmt
          ? "Nascimento: " + nascFmt
          : "Nascimento: -";
      }
      if (dadosNascimentoEl) dadosNascimentoEl.textContent = nascFmt || "-";

      if (idosoAvatarEl) {
        const url = getPhotoUrl(i.foto);
        idosoAvatarEl.style.backgroundImage = `url('${url}')`;
      }

      if (dadosContatoEl) {
        const c = (i.contatos || [])[0];
        if (c) {
          const n = c.nome ? String(c.nome) : "";
          const t = c.telefone ? String(c.telefone) : "";
          dadosContatoEl.textContent = n || t ? n + (t ? ` (${t})` : "") : "-";
        } else {
          dadosContatoEl.textContent = "-";
        }
      }

      if (editarLinkEl) {
        editarLinkEl.href = `/pages/cadastroIdoso/?id=${encodeURIComponent(
          id
        )}`;
      }

      renderDoencas(i.doencas || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar dados do paciente.");
      window.location.href = "/pages/pacientes";
    }
  }

  // Inicialização
  setupTabs();
  loadIdoso();
});
