// FRONT-END/public/js/relatorios.js
document.addEventListener("DOMContentLoaded", () => {
  const selectIdoso = document.getElementById("filtro-idoso");

  if (!selectIdoso) {
    console.error("relatorios.js: elemento #filtro-idoso não encontrado.");
    return;
  }

  async function loadIdosos() {
    try {
      const res = await axios.get("/api/idosos");

      let idosos = [];
      if (Array.isArray(res?.data)) {
        idosos = res.data;
      } else if (Array.isArray(res?.data?.idosos)) {
        idosos = res.data.idosos;
      }

      // limpa e adiciona opção padrão
      selectIdoso.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = "Todos os idosos";
      selectIdoso.appendChild(optAll);

      // adiciona idosos
      idosos.forEach((i) => {
        const option = document.createElement("option");
        option.value = i._id;
        option.textContent = i.nome || "Idoso sem nome";
        selectIdoso.appendChild(option);
      });

      if (!idosos.length) {
        // se não veio ninguém, mostra mensagem básica
        const optEmpty = document.createElement("option");
        optEmpty.value = "";
        optEmpty.textContent = "Nenhum idoso cadastrado";
        selectIdoso.appendChild(optEmpty);
      }
    } catch (err) {
      console.error("relatorios.js: erro ao carregar idosos:", err);
      selectIdoso.innerHTML = "";
      const optError = document.createElement("option");
      optError.value = "";
      optError.textContent = "Erro ao carregar idosos";
      selectIdoso.appendChild(optError);
    }
  }

  loadIdosos();
});
