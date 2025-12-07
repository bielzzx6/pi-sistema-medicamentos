// /public/js/cadastroIdoso.js

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const title = document.getElementById("title");
  const form = document.getElementById("form-idoso");
  const contactsList = document.getElementById("contacts-list");
  const addContactBtn = document.getElementById("add-contact");
  const conditionsList = document.getElementById("conditions-list");
  const addConditionBtn = document.getElementById("add-condition");
  const contatosJsonInput = document.getElementById("contatos-json");
  const doencasJsonInput = document.getElementById("doencas-json");
  const fileInput = document.getElementById("foto");
  const fotoPreview = document.getElementById("foto-preview");

  //-----------------------
  // Helpers – criar blocos
  //-----------------------

  function createContactRow(contact = {}) {
    const row = document.createElement("div");
    row.className =
      "contact-row flex items-end gap-4 bg-surface-accent-light dark:bg-surface-accent-dark " +
      "border border-border-light dark:border-border-dark rounded-xl p-4";

    row.innerHTML = `
      <label class="flex flex-col min-w-40 flex-1">
        <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
          Nome
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg
          text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50
          border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-12
          placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 text-base font-normal leading-normal"
          name="contato_nome[]"
          placeholder="Nome do contato"
          value="${escapeHtml(contact.nome || "")}"
        />
      </label>

      <label class="flex flex-col min-w-40 flex-1">
        <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
          Telefone
        </p>
        <input
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg
          text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50
          border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-12
          placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 text-base font-normal leading-normal"
          name="contato_tel[]"
          placeholder="(00) 00000-0000"
          value="${escapeHtml(contact.telefone || "")}"
        />
      </label>

      <button
        type="button"
        class="flex items-center justify-center shrink-0 size-12 rounded-lg
        text-subtext-light dark:text-subtext-dark hover:text-red-500 hover:bg-red-500/10
        dark:hover:text-red-400 dark:hover:bg-red-400/10 remove-contact"
      >
        <span class="material-symbols-outlined">delete</span>
      </button>
    `;

    row.querySelector(".remove-contact").addEventListener("click", () => {
      row.remove();
      updateJsonHiddenFields();
    });

    const telInput = row.querySelector(`input[name="contato_tel[]"]`);
    telInput.addEventListener("input", phoneMaskListener);

    // qualquer mudança nos inputs atualiza JSON
    row
      .querySelectorAll("input")
      .forEach((inp) => inp.addEventListener("input", updateJsonHiddenFields));

    return row;
  }

  function createConditionCard(condition = {}) {
    const card = document.createElement("div");
    card.className =
      "condition-card bg-surface-accent-light dark:bg-surface-accent-dark border border-border-light " +
      "dark:border-border-dark rounded-xl p-6";

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <input
          class="text-lg font-bold text-text-light dark:text-text-dark bg-transparent border-none outline-none"
          name="condicao_nome[]"
          placeholder="Diagnóstico"
          value="${escapeHtml(condition.diagnostico || "")}"
        />

        <button
          type="button"
          class="flex items-center justify-center shrink-0 size-9 rounded-lg
          text-subtext-light dark:text-subtext-dark hover:text-red-500 hover:bg-red-500/10
          dark:hover:text-red-400 dark:hover:bg-red-400/10 remove-condition"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <label class="flex flex-col min-w-40 flex-1">
          <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
            Data do diagnóstico
          </p>
          <input
            type="date"
            name="condicao_data[]"
            value="${formatDateForInput(condition.data)}"
            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg
            text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50
            border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-12
            placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 text-base font-normal leading-normal"
          />
        </label>

        <label class="flex flex-col min-w-40 flex-1">
          <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
            Médico responsável
          </p>
          <input
            name="condicao_medico[]"
            placeholder="Nome do médico"
            value="${escapeHtml(condition.medico || "")}"
            class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg
            text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-primary/50
            border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark h-12
            placeholder:text-subtext-light dark:placeholder:text-subtext-dark px-4 text-base font-normal leading-normal"
          />
        </label>

        <label class="flex flex-col min-w-40 flex-1 col-span-2">
          <p class="text-text-light dark:text-text-dark text-sm font-medium leading-normal pb-2">
            Observações médicas
          </p>
          <textarea
            name="condicao_obs[]"
            class="form-textarea w-full resize-y min-h-24 rounded-lg text-text-light dark:text-text-dark
            focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light dark:border-border-dark
            bg-background-light dark:bg-background-dark placeholder:text-subtext-light dark:placeholder:text-subtext-dark
            p-4 text-base font-normal leading-normal"
            placeholder="Detalhes, tratamentos, medicamentos..."
          >${escapeHtml(condition.observacoes || "")}</textarea>
        </label>
      </div>
    `;

    card.querySelector(".remove-condition").addEventListener("click", () => {
      card.remove();
      updateJsonHiddenFields();
    });

    // qualquer mudança nos inputs/textarea atualiza JSON
    card
      .querySelectorAll("input, textarea")
      .forEach((el) => el.addEventListener("input", updateJsonHiddenFields));

    return card;
  }

  //-----------------------
  // Utils
  //-----------------------

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

  function formatDateForInput(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  }

  function phoneMaskListener(e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
    e.target.value = v.slice(0, 15);
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
      let message = `Erro ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) message = data.error;
      } catch (_) {}
      throw new Error(message);
    }
    return res.json();
  }

  async function sendForm(url, method, formData) {
    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      let message = `Erro ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) message = data.error;
      } catch (_) {}
      throw new Error(message);
    }

    return res;
  }

  //-----------------------
  // Build arrays + atualizar hidden JSONs
  //-----------------------

  function collectContatos() {
    if (!contactsList) return [];

    const rows = Array.from(contactsList.querySelectorAll(".contact-row"));

    return rows
      .map((row) => {
        const nomeEl = row.querySelector('[name="contato_nome[]"]');
        const telEl = row.querySelector('[name="contato_tel[]"]');

        const nome = (nomeEl?.value || "").trim();
        const telefone = (telEl?.value || "").trim();

        return { nome, telefone };
      })
      .filter((c) => c.nome || c.telefone);
  }

  function collectDoencas() {
    if (!conditionsList) return [];

    const cards = Array.from(
      conditionsList.querySelectorAll(".condition-card")
    );

    return cards
      .map((card) => {
        const nomeEl = card.querySelector('[name="condicao_nome[]"]');
        const dataEl = card.querySelector('[name="condicao_data[]"]');
        const medEl = card.querySelector('[name="condicao_medico[]"]');
        const obsEl = card.querySelector('[name="condicao_obs[]"]');

        const diagnostico = (nomeEl?.value || "").trim();

        return {
          diagnostico,
          data: dataEl?.value || null,
          medico: medEl?.value || "",
          observacoes: obsEl?.value || "",
        };
      })
      .filter((d) => d.diagnostico);
  }

  function updateJsonHiddenFields() {
    const contatos = collectContatos();
    const doencas = collectDoencas();

    if (contatosJsonInput) {
      contatosJsonInput.value = JSON.stringify(contatos);
    }
    if (doencasJsonInput) {
      doencasJsonInput.value = JSON.stringify(doencas);
    }
  }

  //-----------------------
  // Build payload (para validação básica)
  //-----------------------

  function buildPayloadForValidation() {
    const formData = new FormData(form);

    return {
      nome: formData.get("nome")?.trim() || "",
      data_nasc: formData.get("data_nasc") || null,
      telefone: formData.get("telefone")?.trim() || "",
      informacoes: formData.get("informacoes")?.trim() || "",
      contatos: collectContatos(),
      doencas: collectDoencas(),
    };
  }

  //-----------------------
  // Inicialização dos blocos
  //-----------------------

  addContactBtn?.addEventListener("click", () => {
    const row = createContactRow();
    contactsList.appendChild(row);
    updateJsonHiddenFields();
  });

  addConditionBtn?.addEventListener("click", () => {
    const card = createConditionCard();
    conditionsList.appendChild(card);
    updateJsonHiddenFields();
  });

  // máscara nos telefones iniciais + atualizar JSON
  contactsList
    ?.querySelectorAll(`input[name="contato_tel[]"]`)
    .forEach((i) => i.addEventListener("input", phoneMaskListener));

  contactsList
    ?.querySelectorAll(".contact-row input")
    .forEach((i) => i.addEventListener("input", updateJsonHiddenFields));

  // Param id (edição)
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id");

  if (editingId) {
    document.title = "Edição de Idoso";
    if (title) title.textContent = "Edição de Idoso";
    loadIdoso(editingId);
  } else {
    // cria ao menos um card de condição
    if (conditionsList && conditionsList.children.length === 0) {
      conditionsList.appendChild(createConditionCard());
    }
    updateJsonHiddenFields();
  }

  //-----------------------
  // Carregar idoso (edição)
  //-----------------------

  async function loadIdoso(id) {
    try {
      const data = await fetchJson(`/api/idosos/${id}`);

      if (!data) {
        console.debug("Idoso não encontrado.");
        return;
      }

      if (form.nome) form.nome.value = data.nome || "";
      if (form.data_nasc)
        form.data_nasc.value = formatDateForInput(data.data_nasc);
      if (form.telefone) form.telefone.value = data.telefone || "";
      if (form.informacoes) form.informacoes.value = data.informacoes || "";
      fotoPreview.innerHTML = `
  <div 
    class="w-full h-full bg-center bg-cover rounded-full" 
    style="background-image: url('${data.foto}')">
  </div>
`;

      document.getElementById("foto").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        const fotoPreview = document.getElementById("foto-preview");

        fotoPreview.innerHTML = `
    <div 
      class="w-full h-full bg-center bg-cover rounded-full"
      style="background-image: url('${url}')">
    </div>
  `;
      });
      // contatos
      if (contactsList) {
        contactsList.innerHTML = "";
        (data.contatos || []).forEach((c) => {
          contactsList.appendChild(createContactRow(c));
        });
      }

      // doenças
      if (conditionsList) {
        conditionsList.innerHTML = "";
        (data.doencas || []).forEach((d) => {
          conditionsList.appendChild(
            createConditionCard({
              diagnostico: d.diagnostico || "",
              data: d.data,
              medico: d.medico,
              observacoes: d.observacoes,
            })
          );
        });

        if (conditionsList.children.length === 0) {
          conditionsList.appendChild(createConditionCard());
        }
      }

      updateJsonHiddenFields();
    } catch (err) {
      console.error(err);
      console.debug(err.message || "Erro ao carregar dados do idoso.");
    }
  }

  //-----------------------
  // Submit
  //-----------------------

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // monta arrays e atualiza os inputs hidden
      const payload = buildPayloadForValidation();
      updateJsonHiddenFields();

      if (!payload.nome) {
        console.debug("Informe o nome do idoso.");
        return;
      }

      // FormData real do form (inclui nome, data_nasc, contatos, doencas-json, arquivo, etc.)
      const sendData = new FormData(form);

      try {
        if (editingId) {
          await sendForm(`/api/idosos/${editingId}`, "PUT", sendData);
          console.debug("Idoso atualizado com sucesso.");
        } else {
          await sendForm(`/api/idosos`, "POST", sendData);
          console.debug("Idoso cadastrado com sucesso.");
        }

        window.location.href = "/pages/pacientes";
      } catch (err) {
        console.error(err);
        console.debug(err.message || "Erro ao salvar idoso.");
      }
    });
  }
});
