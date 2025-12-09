// FRONT-END/public/js/cadastrarMedicamento.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-med");
  if (!form) return;

  const chips = document.querySelectorAll(".chip-classificacao");
  const classificacaoInput = document.getElementById("classificacao");
  const horariosList = document.getElementById("horarios-list");
  const addHorarioBtn = document.getElementById("add-horario");
  const fotoInput = document.getElementById("foto");
  const fotoPreview = document.getElementById("foto-preview");

  const estoqueInput = document.getElementById("estoque");
  const estoqueInicialInput = document.getElementById("estoque_inicial");

  // campo dos idosos (lista de checkboxes)
  const idososListEl = document.getElementById("idosos-list");

  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id");

  let allIdosos = [];
  let selectedIdosos = [];

  /* ----------------------------------------
      Helpers visuais
  ----------------------------------------- */

  function setChipActive(chip, active) {
    if (active) {
      chip.classList.add("bg-primary/15", "text-primary", "border-primary");
      chip.classList.remove(
        "bg-background-light",
        "dark:bg-background-dark",
        "text-text-muted-light",
        "dark:text-text-muted-dark"
      );
    } else {
      chip.classList.remove("bg-primary/15", "text-primary", "border-primary");
      chip.classList.add(
        "bg-background-light",
        "dark:bg-background-dark",
        "text-text-muted-light",
        "dark:text-text-muted-dark"
      );
    }
  }

  function resolveFotoUrl(foto) {
    if (!foto) return null;
    const path = String(foto).trim();
    if (!path) return null;
    if (/^(https?:)?\/\//i.test(path)) return path;
    return window.location.origin + (path.startsWith("/") ? path : "/" + path);
  }

  function updateFotoPreviewFromFile(file) {
    if (!file || !fotoPreview) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      fotoPreview.innerHTML = "";
      fotoPreview.style.backgroundImage = `url('${e.target.result}')`;
      fotoPreview.style.backgroundSize = "cover";
      fotoPreview.style.backgroundPosition = "center";
    };
    reader.readAsDataURL(file);
  }

  function updateFotoPreviewFromUrl(url) {
    if (!url || !fotoPreview) return;
    fotoPreview.innerHTML = "";
    fotoPreview.style.backgroundImage = `url('${url}')`;
    fotoPreview.style.backgroundSize = "cover";
    fotoPreview.style.backgroundPosition = "center";
  }

  /* ----------------------------------------
      Chips de classificação
  ----------------------------------------- */

  // default
  classificacaoInput.value = "Uso Contínuo";
  chips.forEach((chip) => {
    const isDefault = chip.dataset.value === "Uso Contínuo";
    setChipActive(chip, isDefault);
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => setChipActive(c, false));
      setChipActive(chip, true);
      classificacaoInput.value = chip.dataset.value || "";
    });
  });

  /* ----------------------------------------
      Horários
  ----------------------------------------- */

  function addHorarioRow(value = "") {
    const row = document.createElement("div");
    row.className = "flex items-center gap-2";

    row.innerHTML = `
      <input
        class="h-10 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
        type="time"
        name="horarios[]"
        value="${value}"
      />
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-border-light dark:border-border-dark px-2 h-8 text-xs text-text-muted-light dark:text-text-muted-dark hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors remove"
      >
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    `;

    row.querySelector(".remove").addEventListener("click", () => row.remove());
    horariosList.appendChild(row);
  }

  addHorarioBtn?.addEventListener("click", () => addHorarioRow());

  /* ----------------------------------------
      Foto preview
  ----------------------------------------- */

  fotoInput?.addEventListener("change", () => {
    if (fotoInput.files && fotoInput.files[0]) {
      updateFotoPreviewFromFile(fotoInput.files[0]);
    }
  });

  /* ----------------------------------------
      Idosos (multi-seleção)
  ----------------------------------------- */

  async function loadIdosos() {
    if (!idososListEl) return;

    try {
      const res = await axios.get("/api/idosos");
      allIdosos = Array.isArray(res.data) ? res.data : [];
      renderIdosos();
    } catch (err) {
      console.error(err);
      idososListEl.innerHTML =
        '<p class="text-sm text-red-600 dark:text-red-400">Erro ao carregar idosos.</p>';
    }
  }

  function renderIdosos() {
    if (!idososListEl) return;

    idososListEl.innerHTML = "";

    if (!allIdosos.length) {
      idososListEl.innerHTML =
        '<p class="text-sm text-text-muted-light dark:text-text-muted-dark">Nenhum idoso cadastrado.</p>';
      return;
    }

    allIdosos.forEach((idoso) => {
      const id = idoso._id || idoso.id;
      const isChecked = selectedIdosos.includes(String(id));

      const label = document.createElement("label");
      label.className =
        "flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-background-light/60 dark:hover:bg-background-dark/60";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = id;
      checkbox.className =
        "checkbox-idoso rounded border-border-light dark:border-border-dark text-primary focus:ring-primary";
      checkbox.checked = isChecked;

      const span = document.createElement("span");
      span.className = "text-sm";
      span.textContent = idoso.nome || "Idoso sem nome";

      label.appendChild(checkbox);
      label.appendChild(span);

      idososListEl.appendChild(label);
    });
  }

  /* ----------------------------------------
      Carregar medicamento (edição)
  ----------------------------------------- */

  async function loadMedicamento(id) {
    try {
      const res = await axios.get(`/api/medicamentos/${id}`);
      const m = res.data;

      const titleEl = document.getElementById("title");
      if (titleEl) titleEl.textContent = "Editar Medicamento";

      if (form.nome) form.nome.value = m.nome || "";
      if (form.medico) form.medico.value = m.medico || "";
      if (form.especialidade) form.especialidade.value = m.especialidade || "";
      if (estoqueInput)
        estoqueInput.value = m.estoque != null ? String(m.estoque) : "";
      if (estoqueInicialInput)
        estoqueInicialInput.value =
          m.estoqueInicial != null ? String(m.estoqueInicial) : "";
      if (form.instrucoes) form.instrucoes.value = m.instrucoes || "";

      // classificação
      classificacaoInput.value = m.classificacao || "";
      chips.forEach((c) => {
        const isActive = c.dataset.value === m.classificacao;
        setChipActive(c, isActive);
      });

      // horários
      horariosList.innerHTML = "";
      const horarios = Array.isArray(m.horarios) ? m.horarios : [];
      if (horarios.length > 0) {
        horarios.forEach((h) => addHorarioRow(h));
      } else {
        addHorarioRow();
      }

      // idosos vinculados
      if (Array.isArray(m.idososVinculados)) {
        selectedIdosos = m.idososVinculados.map((x) =>
          typeof x === "string" ? x : x._id || x.id
        );
      } else if (Array.isArray(m.idosos)) {
        // fallback se o backend usar outro nome
        selectedIdosos = m.idosos.map((x) =>
          typeof x === "string" ? x : x._id || x.id
        );
      } else {
        selectedIdosos = [];
      }

      // re-renderiza a lista de idosos com os marcados
      renderIdosos();

      // foto existente
      if (m.foto) {
        const url = resolveFotoUrl(m.foto);
        if (url) updateFotoPreviewFromUrl(url);
      }
    } catch (err) {
      console.error(err);
      console.debug("Erro ao carregar medicamento.");
    }
  }

  /* ----------------------------------------
      Init
  ----------------------------------------- */

  (async function init() {
    // carrega idosos primeiro
    await loadIdosos();

    if (editingId) {
      await loadMedicamento(editingId);
    } else {
      // pelo menos 1 horário por padrão
      addHorarioRow();
    }
  })();

  /* ----------------------------------------
      Submit (POST / PUT)
  ----------------------------------------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("nome", form.nome?.value || "");
    fd.append("classificacao", classificacaoInput.value || "");
    fd.append("medico", form.medico?.value || "");
    fd.append("especialidade", form.especialidade?.value || "");

    // estoques
    fd.append("estoque_inicial", estoqueInicialInput?.value || "");
    fd.append("estoque", estoqueInput?.value || "");

    fd.append("instrucoes", form.instrucoes?.value || "");

    // horários
    const horarios = Array.from(
      document.querySelectorAll("input[name='horarios[]']")
    )
      .map((i) => i.value)
      .filter((v) => v);

    fd.append("horarios", JSON.stringify(horarios));

    // idosos vinculados (pode ser 0, 1 ou N)
    if (idososListEl) {
      const idsSelecionados = Array.from(
        document.querySelectorAll(".checkbox-idoso:checked")
      ).map((cb) => cb.value);

      if (idsSelecionados.length > 0) {
        fd.append("idososVinculados", JSON.stringify(idsSelecionados));
      }
    }

    // foto
    if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
      fd.append("foto", fotoInput.files[0]);
    }

    try {
      if (editingId) {
        await axios.put(`/api/medicamentos/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.debug("Medicamento atualizado com sucesso!");
      } else {
        await axios.post("/api/medicamentos", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.debug("Medicamento cadastrado com sucesso!");
      }

      window.location.href = "/pages/medicamentos";
    } catch (err) {
      console.error(err);
      console.debug(err.response?.data?.error || "Erro ao salvar medicamento.");
    }
  });
});
