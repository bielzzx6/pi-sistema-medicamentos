// public/js/painel.js
document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.getElementById("cards");
  const loadingEl = document.getElementById("idosos-loading");
  const emptyEl = document.getElementById("idosos-empty");
  const searchInput = document.getElementById("search-input");

  let allIdosos = [];

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const contentType = res.headers.get("Content-Type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    }

    if (!res.ok) {
      const msg =
        (data && data.error) ||
        data?.message ||
        `Erro na requisição (${res.status})`;
      throw new Error(msg);
    }

    return data;
  }

  function getPhotoUrl(path) {
    if (path) return window.location.origin + path;
    return "https://i.pravatar.cc/120?img=65";
  }

  function calcAge(dob) {
    if (!dob) return "";
    const diff = Date.now() - new Date(dob).getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return `${age} anos`;
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

  function renderIdosos(list) {
    cardsContainer.innerHTML = "";

    if (!list || list.length === 0) {
      emptyEl.classList.remove("hidden");
      return;
    }

    emptyEl.classList.add("hidden");

    list.forEach((i) => {
      const id = i._id || i.id;
      const foto = getPhotoUrl(i.foto);
      const idade = calcAge(i.data_nasc);

      const meds = Array.isArray(i.medicamentos) ? i.medicamentos : [];
      const sinais = Array.isArray(i.sinais_vitais) ? i.sinais_vitais : [];

      const principalMed =
        meds.find((m) => m.ativo !== false) || meds[0] || null;
      const proximaAcaoNome = principalMed?.nome || "Sem medicações ativas";
      const proximaAcaoDose = principalMed?.dose || "";
      const proximaAcaoHorario = principalMed?.horario || "--:--";

      const ultimoSinal = sinais[sinais.length - 1];
      let eventosRecentesTexto = "Nenhum evento recente.";
      if (ultimoSinal) {
        if (ultimoSinal.observacoes) {
          eventosRecentesTexto = ultimoSinal.observacoes;
        } else if (
          ultimoSinal.pressao_sistolica &&
          ultimoSinal.pressao_diastolica
        ) {
          eventosRecentesTexto = `PA ${ultimoSinal.pressao_sistolica}/${ultimoSinal.pressao_diastolica}`;
        }
      }

      const estoqueBaixoCount = meds.filter((m) => m.estoque_baixo).length || 0;
      const doseAtrasadaCount = 0;

      const estoqueBadge =
        estoqueBaixoCount > 0
          ? `<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">${estoqueBaixoCount}</span>`
          : "";
      const doseBadge =
        doseAtrasadaCount > 0
          ? `<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">${doseAtrasadaCount}</span>`
          : "";

      const href = `/pages/idoso/?id=${encodeURIComponent(id)}`;

      const card = document.createElement("div");
      card.className =
        "flex flex-col gap-4 rounded-xl bg-white dark:bg-background-dark/50 border border-gray-200 dark:border-gray-800 p-5 transition-all";

      card.innerHTML = `
  <div class="flex items-center gap-3">
    <div
      class="w-12 h-12 bg-center bg-no-repeat bg-cover rounded-full"
      style="background-image: url('${foto}');"
    ></div>
    <div class="flex flex-col flex-1">
      <p class="text-gray-900 dark:text-white text-lg font-semibold leading-normal">
        ${escapeHtml(i.nome || "Sem nome")}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        ${escapeHtml(idade)}
      </p>
    </div>
  </div>

  <div class="flex items-center justify-around gap-2 text-center">
    <div class="flex flex-col items-center gap-1.5" title="Estoque Baixo">
      <div class="relative rounded-full bg-orange-100 dark:bg-orange-500/20 p-2.5 text-orange-500 dark:text-orange-400">
        <span class="material-symbols-outlined text-2xl">pill</span>
        ${estoqueBadge}
      </div>
    </div>
    <div class="flex flex-col items-center gap-1.5" title="Dose Atrasada">
      <div class="relative rounded-full bg-red-100 dark:bg-red-500/20 p-2.5 text-red-500 dark:text-red-400">
        <span class="material-symbols-outlined text-2xl">alarm</span>
        ${doseBadge}
      </div>
    </div>
    <div class="flex flex-col items-center gap-1.5" title="Consulta Próxima">
      <div class="relative rounded-full bg-blue-100 dark:bg-blue-500/20 p-2.5 text-blue-500 dark:text-blue-400">
        <span class="material-symbols-outlined text-2xl">calendar_month</span>
      </div>
    </div>
  </div>

  <div class="bg-gray-100 dark:bg-white/10 rounded-lg p-3">
    <p class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
      Próxima Ação
    </p>
    <p class="text-gray-800 dark:text-gray-200 text-base font-semibold">
      ${escapeHtml(proximaAcaoNome)} ${escapeHtml(proximaAcaoDose)} às 
      <span class="text-primary">${escapeHtml(proximaAcaoHorario)}</span>
    </p>
  </div>

  <div class="bg-gray-100 dark:bg-white/10 rounded-lg p-3">
    <p class="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
      Eventos Recentes
    </p>
    <p class="text-gray-800 dark:text-gray-200 text-base font-semibold">
      ${escapeHtml(eventosRecentesTexto)}
    </p>
  </div>

  <button
    class="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/80 active:bg-primary/70 transition-colors"
    data-idoso-id="${encodeURIComponent(id)}"
  >
    Ver Detalhes
  </button>
`;

      const btn = card.querySelector("button");
      btn.addEventListener("click", () => {
        window.location.href = href;
      });

      cardsContainer.appendChild(card);
    });
  }

  async function loadIdosos() {
    loadingEl.classList.remove("hidden");
    emptyEl.classList.add("hidden");
    cardsContainer.innerHTML = "";

    try {
      const data = await fetchJson("/api/idosos");
      allIdosos = Array.isArray(data) ? data : [];
      renderIdosos(allIdosos);
    } catch (err) {
      console.error(err);
      emptyEl.classList.remove("hidden");
      emptyEl.textContent = err.message || "Erro ao carregar idosos.";
    } finally {
      loadingEl.classList.add("hidden");
    }
  }

  function applySearch(filterText) {
    const text = filterText.trim().toLowerCase();
    if (!text) {
      renderIdosos(allIdosos);
      return;
    }

    const filtered = allIdosos.filter((i) => {
      const nome = (i.nome || "").toLowerCase();
      const info =
        (i.informacoes || "").toLowerCase() +
        " " +
        (i.doencas || [])
          .map((d) => d.diagnostico || "")
          .join(" ")
          .toLowerCase();

      return nome.includes(text) || info.includes(text);
    });

    renderIdosos(filtered);
  }

  function setupSearch() {
    if (!searchInput) return;

    let timeout = null;

    searchInput.addEventListener("input", () => {
      const value = searchInput.value;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => applySearch(value), 200);
    });
  }

  loadIdosos();
  setupSearch();
});
