document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const content = document.getElementById("tab-content");

  // Aba padrão
  loadTab("medicamentos");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelector(".tab.active")?.classList.remove("active");
      tab.classList.add("active");

      loadTab(tab.dataset.tab);
    });
  });

  function loadTab(tab) {
    const url = `../${tab}/${tab}.html`;

    fetch(url)
      .then((res) => res.text())
      .then((html) => (content.innerHTML = html))
      .catch(() => (content.innerHTML = "<p>Erro ao carregar conteúdo.</p>"));
  }
});
