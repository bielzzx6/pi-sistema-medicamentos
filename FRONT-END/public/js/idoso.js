// idoso.js
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  if (!id) {
    alert("Idoso não especificado.");
    window.location.href = "/pages/pacientes/pacientes.html";
    return;
  }

  const photoEl = document.getElementById("idoso-photo");
  const nomeEl = document.getElementById("idoso-nome");
  const ageEl = document.getElementById("idoso-age");
  const infoEl = document.getElementById("idoso-info");
  const contatosEl = document.getElementById("idoso-contatos");
  const doencasEl = document.getElementById("idoso-doencas");
  const medsEl = document.getElementById("idoso-medicamentos");
  const sinaisEl = document.getElementById("idoso-sinais");
  const editarLink = document.getElementById("editar-link");
  const excluirBtn = document.getElementById("excluir-btn");
  const formSinal = document.getElementById("sinal-form");

  function getPhotoUrl(path) {
    return path ? window.location.origin + path : "https://i.pravatar.cc/120";
  }

  function calcAge(dob) {
    if (!dob) return "";
    const diff = Date.now() - new Date(dob).getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return `${age} anos`;
  }

  async function load() {
    try {
      const res = await axios.get(`/api/idosos/${id}`);
      const i = res.data;
      if (!i) throw new Error("Não encontrado");

      document.getElementById("idoso-title").textContent = i.nome || "Perfil";
      nomeEl.textContent = i.nome || "";
      ageEl.textContent = calcAge(i.data_nasc);
      infoEl.textContent = i.informacoes || "";

      photoEl.src = getPhotoUrl(i.foto);

      // contatos
      contatosEl.innerHTML = "";
      (i.contatos || []).forEach(c => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${escapeHtml(c.nome)}</strong> — ${escapeHtml(c.telefone || "")}`;
        contatosEl.appendChild(li);
      });

      // doenças
      doencasEl.innerHTML = "";
      (i.doencas || []).forEach(d => {
        const div = document.createElement("div");
        div.className = "condition-card";
        div.innerHTML = `<h4>${escapeHtml(d.diagnostico)}</h4><p>${formatDate(d.data)} • ${escapeHtml(d.medico || "")}</p><p>${escapeHtml(d.observacoes || "")}</p>`;
        doencasEl.appendChild(div);
      });

      // medicamentos
      medsEl.innerHTML = "";
      (i.medicamentos || []).forEach(m => {
        const div = document.createElement("div");
        div.className = "med-item";
        div.innerHTML = `<strong>${escapeHtml(m.nome)}</strong> • ${escapeHtml(m.dose || "")} • ${escapeHtml(m.horario || "")} ${m.ativo ? "" : "(inativo)"}`;
        medsEl.appendChild(div);
      });

      // sinais
      sinaisEl.innerHTML = "";
      (i.sinais_vitais || []).slice().reverse().forEach(s => {
        const d = document.createElement("div");
        d.className = "sinal-item";
        d.innerHTML = `<small>${formatDateTime(s.data, s.hora)}</small>
          <p>PA: ${s.pressao_sistolica}/${s.pressao_diastolica} — BPM: ${s.batimentos} — T: ${s.temperatura}°C</p>
          <p>${escapeHtml(s.observacoes || "")}</p>`;
        sinaisEl.appendChild(d);
      });

      // edit link
      editarLink.href = `/pages/cadastroIdoso/cadastroIdoso.html?id=${id}`;

    } catch (err) {
      console.error(err);
      alert("Erro ao carregar idoso.");
      window.location.href = "/pages/pacientes/pacientes.html";
    }
  }

  excluirBtn.addEventListener("click", async () => {
    if (!confirm("Remover este idoso?")) return;
    try {
      await axios.delete(`/api/idosos/${id}`);
      alert("Idoso removido.");
      window.location.href = "/pages/pacientes/pacientes.html";
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Erro ao remover.");
    }
  });

  formSinal?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // gather
    const fd = new FormData(formSinal);
    const novo = {
      data: new Date().toISOString(),
      hora: new Date().toTimeString().split(" ")[0].slice(0,5),
      pressao_sistolica: Number(fd.get("pressao_sistolica") || 0),
      pressao_diastolica: Number(fd.get("pressao_diastolica") || 0),
      batimentos: Number(fd.get("batimentos") || 0),
      temperatura: Number(fd.get("temperatura") || 0),
      observacoes: fd.get("observacoes") || ""
    };

    try {
      // fetch original, append, PUT back
      const res = await axios.get(`/api/idosos/${id}`);
      const i = res.data;
      const sinais = i.sinais_vitais || [];
      sinais.push(novo);

      await axios.put(`/api/idosos/${id}`, { sinais_vitais: sinais });
      alert("Registro salvo.");
      formSinal.reset();
      load(); // recarrega lista
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar sinal.");
    }
  });

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;","<": "&lt;",">": "&gt;",'"': "&quot;","'": "&#39;"
    }[m]));
  }

  function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  }

  function formatDateTime(d, h) {
    if (!d) return h || "";
    const dt = new Date(d);
    return dt.toLocaleString() + (h ? " " + h : "");
  }

  load();
});
