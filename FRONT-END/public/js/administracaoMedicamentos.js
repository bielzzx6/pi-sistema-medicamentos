// FRONT-END/public/js/administracaoMedicamentos.js
document.addEventListener("DOMContentLoaded", () => {
  const selectIdoso = document.getElementById("filtro-idoso");
  const btnPeriodos = document.querySelectorAll(".btn-period");
  const chkAtrasados = document.getElementById("filtro-atrasados");
  const chkIgnorados = document.getElementById("filtro-ignorados");

  const listaManha = document.getElementById("lista-manha");
  const listaTarde = document.getElementById("lista-tarde");
  const listaNoite = document.getElementById("lista-noite");

  const spanTomados = document.getElementById("resumo-tomados");
  const spanAtrasados = document.getElementById("resumo-atrasados");
  const spanIgnorados = document.getElementById("resumo-ignorados");
  const spanDataHoje = document.getElementById("data-hoje");

  const obsDiaInput = document.getElementById("observacoes-dia");
  const btnSalvar = document.getElementById("btn-salvar-admin");
  const subtitleEl = document.getElementById("admin-med-subtitle");

  if (
    !selectIdoso ||
    !listaManha ||
    !listaTarde ||
    !listaNoite ||
    !spanTomados ||
    !spanAtrasados ||
    !spanIgnorados
  ) {
    console.error(
      "administracaoMedicamentos.js: elementos principais não encontrados no DOM."
    );
    return;
  }

  const params = new URLSearchParams(window.location.search);
  let currentIdosoId =
    params.get("idosoId") || params.get("id") || selectIdoso.value || "";

  let allIdosos = [];
  let allMedicamentos = [];
  const adminState = {};
  let currentPeriodFilter = "today";

  setHojeLabel();
  init();

  async function init() {
    await loadIdosos();
    await loadMedicamentos();
    attachEvents();
  }

  function setHojeLabel() {
    if (!spanDataHoje) return;
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, "0");
    const mes = String(now.getMonth() + 1).padStart(2, "0");
    const ano = now.getFullYear();
    spanDataHoje.textContent = `${dia}/${mes}/${ano}`;
  }

  async function loadIdosos() {
    try {
      const res = await axios.get("/api/idosos");
      allIdosos = Array.isArray(res.data) ? res.data : [];

      selectIdoso.innerHTML = "";
      const optTodos = document.createElement("option");
      optTodos.value = "";
      optTodos.textContent = "Todos os idosos";
      selectIdoso.appendChild(optTodos);

      allIdosos.forEach((i) => {
        const id = i._id || i.id;
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = i.nome || "Idoso sem nome";
        selectIdoso.appendChild(opt);
      });

      if (currentIdosoId) {
        selectIdoso.value = currentIdosoId;
      } else {
        currentIdosoId = "";
      }

      if (currentIdosoId && subtitleEl) {
        const idoso = allIdosos.find(
          (i) => String(i._id || i.id) === String(currentIdosoId)
        );
        if (idoso) {
          subtitleEl.textContent =
            "Registre as doses administradas para " +
            (idoso.nome || "o paciente selecionado") +
            ".";
        }
      }
    } catch (err) {
      console.error("Erro ao carregar idosos:", err);
    }
  }

  async function loadMedicamentos() {
    try {
      const res = await axios.get("/api/medicamentos");
      allMedicamentos = Array.isArray(res.data) ? res.data : [];
      renderAll();
    } catch (err) {
      console.error("Erro ao carregar medicamentos:", err);
      clearLists();
      const msg =
        '<p class="text-sm text-red-600 dark:text-red-400">Erro ao carregar medicamentos.</p>';
      listaManha.innerHTML = msg;
      listaTarde.innerHTML = msg;
      listaNoite.innerHTML = msg;
    }
  }

  function attachEvents() {
    selectIdoso.addEventListener("change", () => {
      currentIdosoId = selectIdoso.value || "";
      renderAll();
    });

    btnPeriodos.forEach((btn) => {
      btn.addEventListener("click", () => {
        const period = btn.dataset.period || "today";
        currentPeriodFilter = period;

        btnPeriodos.forEach((b) => {
          b.classList.remove("bg-primary/15", "text-primary");
          b.classList.remove("border-primary");
          b.classList.add(
            "bg-background-light",
            "dark:bg-background-dark",
            "text-text-muted-light",
            "dark:text-text-muted-dark"
          );
        });

        btn.classList.add("bg-primary/15", "text-primary");
        btn.classList.remove(
          "bg-background-light",
          "dark:bg-background-dark",
          "text-text-muted-light",
          "dark:text-text-muted-dark"
        );

        renderAll();
      });
    });

    chkAtrasados.addEventListener("change", () => {
      if (chkAtrasados.checked) chkIgnorados.checked = false;
      renderAll();
    });

    chkIgnorados.addEventListener("change", () => {
      if (chkIgnorados.checked) chkAtrasados.checked = false;
      renderAll();
    });

    if (btnSalvar) {
      btnSalvar.addEventListener("click", () => {
        const registros = buildCurrentEntries().map((entry) => {
          const state = adminState[entry.id] || {};
          return {
            id: entry.id,
            medicamentoId: entry.medId,
            horario: entry.horario,
            periodo: entry.periodo,
            status: state.status || entry.initialStatus,
          };
        });

        const payload = {
          idosoId: currentIdosoId || null,
          date: new Date().toISOString().slice(0, 10),
          observacoes: obsDiaInput?.value || "",
          registros,
        };

        console.log("Registros de administração (payload simulada):", payload);
        alert(
          "Administrações marcadas apenas no front-end.\nIntegração com API pode ser adicionada depois."
        );
      });
    }
  }

  function clearLists() {
    listaManha.innerHTML = "";
    listaTarde.innerHTML = "";
    listaNoite.innerHTML = "";
  }

  function renderAll() {
    clearLists();
    const entries = buildCurrentEntries();

    let countTaken = 0;
    let countLate = 0;
    let countIgnored = 0;

    const onlyLate = chkAtrasados.checked;
    const onlyIgnored = chkIgnorados.checked;

    entries.forEach((entry) => {
      const state = adminState[entry.id] || {};
      const status = state.status || entry.initialStatus;

      if (status === "taken") countTaken++;
      if (status === "late") countLate++;
      if (status === "ignored") countIgnored++;

      if (onlyLate && status !== "late") return;
      if (onlyIgnored && status !== "ignored") return;

      const card = createCard(entry, status);

      if (entry.periodo === "morning") {
        listaManha.appendChild(card);
      } else if (entry.periodo === "afternoon") {
        listaTarde.appendChild(card);
      } else {
        listaNoite.appendChild(card);
      }
    });

    spanTomados.textContent = countTaken;
    spanAtrasados.textContent = countLate;
    spanIgnorados.textContent = countIgnored;

    if (!listaManha.children.length) {
      listaManha.innerHTML =
        '<p class="text-xs text-text-muted-light dark:text-text-muted-dark">Nenhum horário de medicamento para este período.</p>';
    }
    if (!listaTarde.children.length) {
      listaTarde.innerHTML =
        '<p class="text-xs text-text-muted-light dark:text-text-muted-dark">Nenhum horário de medicamento para este período.</p>';
    }
    if (!listaNoite.children.length) {
      listaNoite.innerHTML =
        '<p class="text-xs text-text-muted-light dark:text-text-muted-dark">Nenhum horário de medicamento para este período.</p>';
    }
  }

  function buildCurrentEntries() {
    const filteredMeds = allMedicamentos.filter((m) => {
      if (!currentIdosoId) return true;
      const vinc =
        m.idosos ||
        m.idososVinculados ||
        m.pacientes ||
        m.pacientesVinculados ||
        [];
      if (!Array.isArray(vinc)) return false;
      return vinc.map(String).includes(String(currentIdosoId));
    });

    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);

    return filteredMeds.flatMap((m) => {
      const horarios = Array.isArray(m.horarios) ? m.horarios : [];
      const medId = m._id || m.id;
      const nome = m.nome || "Medicamento sem nome";

      return horarios.map((h) => {
        const cleanTime = String(h || "").slice(0, 5);
        const periodo = getPeriodo(cleanTime);

        let initialStatus = "pending";
        if (currentPeriodFilter === "today") {
          const medDateTime = parseTodayTime(cleanTime);
          if (medDateTime && medDateTime < now) {
            initialStatus = "late";
          }
        }

        return {
          id: `${medId}_${cleanTime}`,
          medId,
          nome,
          horario: cleanTime,
          periodo,
          initialStatus,
          date: todayIso,
        };
      });
    });
  }

  function getPeriodo(timeStr) {
    const parts = timeStr.split(":");
    const hour = Number(parts[0]) || 0;

    if (hour >= 5 && hour <= 11) return "morning";
    if (hour >= 12 && hour <= 17) return "afternoon";
    return "night";
  }

  function parseTodayTime(timeStr) {
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
  }

  function createCard(entry, status) {
    const { badgeText, badgeClasses } = getStatusConfig(status);

    const card = document.createElement("div");
    card.className =
      "rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 flex flex-col md:flex-row md:items-center justify-between gap-3";

    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <span class="material-symbols-outlined">pill</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-sm font-semibold text-text-light dark:text-text-dark">
            ${escapeHtml(entry.nome)}
          </p>
          <p class="text-xs text-text-muted-light dark:text-text-muted-dark">
            Horário: <span class="font-medium">${escapeHtml(
              entry.horario
            )}</span>
          </p>
        </div>
      </div>

      <div class="flex flex-col items-end gap-2">
        <span
          class="status-pill inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${badgeClasses}"
        >
          ${badgeText}
        </span>

        <div class="flex flex-wrap gap-1 justify-end">
          <button
            type="button"
            data-action="taken"
            class="btn-status inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 text-[11px] font-semibold text-green-700 dark:text-green-200 px-2.5 py-1 hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors"
          >
            <span class="material-symbols-outlined text-xs">check</span>
            Tomado
          </button>

          <button
            type="button"
            data-action="late"
            class="btn-status inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-[11px] font-semibold text-amber-700 dark:text-amber-200 px-2.5 py-1 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
          >
            <span class="material-symbols-outlined text-xs">schedule</span>
            Atrasado
          </button>

          <button
            type="button"
            data-action="ignored"
            class="btn-status inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/30 text-[11px] font-semibold text-red-700 dark:text-red-200 px-2.5 py-1 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
          >
            <span class="material-symbols-outlined text-xs">close</span>
            Ignorado
          </button>
        </div>
      </div>
    `;

    const statusPill = card.querySelector(".status-pill");
    const buttons = card.querySelectorAll(".btn-status");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        let newStatus = "pending";
        if (action === "taken") newStatus = "taken";
        if (action === "late") newStatus = "late";
        if (action === "ignored") newStatus = "ignored";

        adminState[entry.id] = {
          ...(adminState[entry.id] || {}),
          status: newStatus,
        };

        const cfg = getStatusConfig(newStatus);
        if (statusPill) {
          statusPill.textContent = cfg.badgeText;
          statusPill.className =
            "status-pill inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold " +
            cfg.badgeClasses;
        }

        renderAll();
      });
    });

    return card;
  }

  function getStatusConfig(status) {
    if (status === "taken") {
      return {
        badgeText: "Tomado",
        badgeClasses:
          "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200",
      };
    }
    if (status === "late") {
      return {
        badgeText: "Atrasado",
        badgeClasses:
          "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200",
      };
    }
    if (status === "ignored") {
      return {
        badgeText: "Ignorado",
        badgeClasses:
          "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200",
      };
    }
    return {
      badgeText: "Pendente",
      badgeClasses:
        "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
    };
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
});
