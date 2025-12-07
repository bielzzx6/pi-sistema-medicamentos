// FRONT-END/public/js/cadastrarCuidador.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cuidador");
  const titleEl = document.getElementById("title");
  const idososListEl = document.getElementById("idosos-list");

  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id");

  let allIdosos = [];
  let selectedIdosos = [];

  if (!form || !idososListEl) return;

  init();

  async function init() {
    await loadIdosos();
    if (editingId) {
      await loadCuidador(editingId);
      syncIdososCheckboxes();
    } else {
      syncIdososCheckboxes();
    }
  }

  async function loadIdosos() {
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
        "flex items-center gap-2 px-2 py-1 rounded hover:bg-background-light/60 dark:hover:bg-background-dark/60 cursor-pointer";

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

  function syncIdososCheckboxes() {
    const checkboxes = idososListEl.querySelectorAll(".checkbox-idoso");
    checkboxes.forEach((cb) => {
      const id = cb.value;
      cb.checked = selectedIdosos.includes(String(id));
    });
  }

  async function loadCuidador(id) {
    try {
      const res = await axios.get(`/api/cuidadores/${id}`);
      const c = res.data;

      console.log(c);

      titleEl.textContent = "Editar Cuidador";

      form.nomeCompleto.value = c.nome || "";
      form.cpf.value = c.cpf || "";
      form.telefone.value = c.telefone || "";
      form.funcao.value = c.funcao || "";

      if (Array.isArray(c.idososVinculados)) {
        selectedIdosos = c.idososVinculados.map((x) =>
          typeof x === "string" ? x : x._id || x.id
        );
      } else {
        selectedIdosos = [];
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar cuidador.");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeCompleto = form.nomeCompleto.value.trim();
    const cpf = form.cpf.value.trim();
    const telefone = form.telefone.value.trim();
    const funcao = form.funcao.value;

    if (!nomeCompleto) {
      alert("Informe o nome completo do cuidador.");
      return;
    }

    const idsSelecionados = Array.from(
      document.querySelectorAll(".checkbox-idoso:checked")
    ).map((cb) => cb.value);

    const payload = {
      nomeCompleto,
      cpf,
      telefone,
      funcao,
      idosos: idsSelecionados,
    };

    try {
      if (editingId) {
        await axios.put(`/api/cuidadores/${editingId}`, payload);
        alert("Cuidador atualizado com sucesso!");
      } else {
        await axios.post("/api/cuidadores", payload);
        alert("Cuidador cadastrado com sucesso!");
      }

      window.location.href = "/pages/cuidadores/cuidadores.html";
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Erro ao salvar cuidador.");
    }
  });
});
