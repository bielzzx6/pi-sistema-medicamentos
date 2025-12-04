// cadastroIdoso.js
document.addEventListener("DOMContentLoaded", () => {

  // Elements
  const form = document.getElementById("form-idoso");
  const contactsList = document.getElementById("contacts-list");
  const addContactBtn = document.getElementById("add-contact");
  const conditionsList = document.getElementById("conditions-list");
  const addConditionBtn = document.getElementById("add-condition");
  const fileInput = document.getElementById("foto");

  //-----------------------
  // Helpers de criação
  //-----------------------

  function createContactRow(contact = {}) {
    const row = document.createElement("div");
    row.className = "contact-row";

    row.innerHTML = `
      <input class="input small" name="contato_nome[]" type="text" placeholder="Nome do contato" value="${escapeHtml(contact.nome || "")}" />
      <input class="input small" name="contato_tel[]" type="text" placeholder="(00) 00000-0000" value="${escapeHtml(contact.telefone || "")}" />
      <button type="button" class="icon-btn remove-contact">✖</button>
    `;

    row.querySelector(".remove-contact").addEventListener("click", () => row.remove());

    const telInput = row.querySelector(`input[name="contato_tel[]"]`);
    telInput.addEventListener("input", phoneMaskListener);

    return row;
  }

  function createConditionCard(condition = {}) {
    const card = document.createElement("div");
    card.className = "condition-card";

    card.innerHTML = `
      <button type="button" class="icon-btn remove-condition">✖</button>
      <div class="row">
        <div class="col">
          <label class="label">Diagnóstico</label>
          <input class="input" name="condicao_nome[]" type="text" value="${escapeHtml(condition.diagnostico || "")}" />
        </div>
        <div class="col">
          <label class="label">Data</label>
          <input class="input" name="condicao_data[]" type="date" value="${formatDateForInput(condition.data)}" />
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="label">Médico responsável</label>
          <input class="input" name="condicao_medico[]" type="text" value="${escapeHtml(condition.medico || "")}" />
        </div>
      </div>

      <label class="label">Observações médicas</label>
      <textarea class="input textarea" name="condicao_obs[]">${escapeHtml(condition.observacoes || "")}</textarea>
    `;

    card.querySelector(".remove-condition").addEventListener("click", () => card.remove());
    return card;
  }

  //-----------------------
  // Utils
  //-----------------------

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));
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

  //-----------------------
  // Inicialização
  //-----------------------

  addContactBtn?.addEventListener("click", () => contactsList.appendChild(createContactRow()));
  addConditionBtn?.addEventListener("click", () => conditionsList.appendChild(createConditionCard()));

  // Aplicar máscara aos que já existem
  contactsList.querySelectorAll(`input[name="contato_tel[]"]`).forEach((i) => {
    i.addEventListener("input", phoneMaskListener);
  });

  // Param id
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id");

  if (editingId) loadIdoso(editingId);

  //-----------------------
  // Carregar idoso (edição)
  //-----------------------

  async function loadIdoso(id) {
    try {
      const res = await axios.get(`/api/idosos/${id}`);
      const data = res.data;

      if (!data) {
        alert("Idoso não encontrado.");
        return;
      }

      form.nome.value = data.nome || "";
      form.data_nasc.value = formatDateForInput(data.data_nasc);
      form.telefone.value = data.telefone || "";
      form.informacoes.value = data.informacoes || "";

      // contatos
      contactsList.innerHTML = "";
      (data.contatos || []).forEach((c) => {
        contactsList.appendChild(createContactRow(c));
      });

      // doenças
      conditionsList.innerHTML = "";
      (data.doencas || []).forEach((d) => {
        conditionsList.appendChild(
          createConditionCard({
            diagnostico: d.diagnostico || "",
            data: d.data,
            medico: d.medico,
            observacoes: d.observacoes
          })
        );
      });

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar dados do idoso.");
    }
  }

  //-----------------------
  // Montar dados do formulário
  //-----------------------

  function buildPayload() {
    const formData = new FormData(form);

    const payload = {
      nome: formData.get("nome")?.trim() || "",
      data_nasc: formData.get("data_nasc") || null,
      telefone: formData.get("telefone")?.trim() || "",
      informacoes: formData.get("informacoes")?.trim() || ""
    };

    // contatos
    const n = formData.getAll("contato_nome[]");
    const t = formData.getAll("contato_tel[]");

    payload.contatos = n.map((nome, i) => ({
      nome: nome.trim(),
      telefone: (t[i] || "").trim()
    })).filter(c => c.nome || c.telefone);

    // doenças
    const dn = formData.getAll("condicao_nome[]");
    const dd = formData.getAll("condicao_data[]");
    const dm = formData.getAll("condicao_medico[]");
    const dob = formData.getAll("condicao_obs[]");

    payload.doencas = dn.map((nome, i) => ({
      diagnostico: nome.trim(),
      data: dd[i] || null,
      medico: dm[i] || "",
      observacoes: dob[i] || ""
    })).filter(d => d.diagnostico);

    return payload;
  }

  //-----------------------
  // ENVIAR FORMULÁRIO (POST/PUT)
  //-----------------------

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = buildPayload();

    if (!payload.nome) {
      alert("Informe o nome do idoso.");
      return;
    }

    // FormData real (para upload)
    const sendData = new FormData();

    sendData.append("nome", payload.nome);
    sendData.append("data_nasc", payload.data_nasc);
    sendData.append("telefone", payload.telefone);
    sendData.append("informacoes", payload.informacoes);

    sendData.append("contatos", JSON.stringify(payload.contatos));
    sendData.append("doencas", JSON.stringify(payload.doencas));

    // Se a foto foi selecionada:
    if (fotoInput?.files.length > 0) {
      sendData.append("foto", fileInput.files[0]);
    }

    try {
      if (editingId) {
        await axios.put(`/api/idosos/${editingId}`, sendData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Idoso atualizado com sucesso.");
      } else {
        await axios.post(`/api/idosos`, sendData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Idoso cadastrado com sucesso.");
      }

      window.location.href = "/pages/pacientes/pacientes.html";

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erro ao salvar idoso.");
    }
  });

  //-----------------------
  // Default: sempre 1 bloco
  //-----------------------

  if (contactsList.children.length === 0) {
    contactsList.appendChild(createContactRow());
  }

  if (conditionsList.children.length === 0) {
    conditionsList.appendChild(createConditionCard());
  }
});
