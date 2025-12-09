// /public/js/layout.js

document.addEventListener("DOMContentLoaded", function () {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
  <div class="flex flex-1 z-50">
    <!-- SIDEBAR (Shell fixo) -->
    <aside
      class="fixed top-0 flex h-full min-h-screen w-64 flex-col justify-start border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#18262b] p-4 z-50"
    >
       <div class="flex flex-col items-center gap-3 text-center">
          <div
            class="relative flex items-center justify-center gap-3 rounded-full h-auto w-auto overflow-hidden"
          >
            <img src="/public/logo.png" class="w-32 h-32"></img>
          </div>
        </div>

        <div class="flex flex-col gap-2 mt-6">
          <a
            class="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary/10 rounded-DEFAULT"
            href="/pages/painel"
          >
            <span class="material-symbols-outlined text-xl">dashboard</span>
            <p class="text-sm font-medium leading-normal">Dashboard</p>
          </a>
                    <a
            class="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary/10 rounded-DEFAULT"
            href="/pages/cuidadores"
          >
            <span class="material-symbols-outlined text-xl">family_group</span>
            <p class="text-sm font-medium leading-normal">Cuidadores</p>
          </a>
          <a
            class="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary/10 rounded-DEFAULT"
            href="/pages/pacientes"
          >
            <span class="material-symbols-outlined text-xl fill">group</span>
            <p class="text-sm font-medium leading-normal">Pacientes</p>
          </a>
          <a
            class="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary/10 rounded-DEFAULT"
            href="/pages/medicamentos"
          >
            <span class="material-symbols-outlined text-xl"
              >medication</span
            >
            <p class="text-sm font-medium leading-normal">Medicamentos</p>
          </a>
          <a
            class="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-primary/10 rounded-DEFAULT"
            href="/pages/relatorio"
          >
            <span class="material-symbols-outlined text-xl">analytics</span>
            <p class="text-sm font-medium leading-normal">Relatórios</p>
          </a>
        </div>
      </div>

      <div
        class="mt-6 rounded-lg border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#101820] px-3 py-3 text-xs text-gray-600 dark:text-gray-300"
      >
        <p class="font-medium">Versão do sistema</p>
        <p
          id="app-version"
          class="mt-1 font-mono text-[11px] text-gray-700 dark:text-gray-200"
        >
          carregando...
        </p>
      </div>
    </aside>

    <!-- MAIN (Shell fixo + slot da página) -->
    <main class="flex-1 z-50">
      <!-- TOP NAV (Shell fixo) -->
      <header
        class="fixed top-0 ml-64 w-[calc(100%-16rem)] flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200/80 dark:border-slate-800/80 px-10 py-3 bg-white dark:bg-[#18262b]"
      >


        <div class="flex flex-1 justify-end gap-4 items-center">
          <button
            class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-background-light dark:bg-background-dark text-[#0d181b] dark:text-gray-200"
          >
            <span class="material-symbols-outlined text-xl">notifications</span>
          </button>

          <div id="user-menu-container" class="relative">
            <button
              id="user-menu-button"
              type="button"
              class="flex items-center gap-3 rounded-full px-3 py-1.5 bg-background-light dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div
                id="top-user-avatar"
                class="bg-center bg-no-repeat bg-cover rounded-full h-9 w-9"
                style="
                  background-image: url('https://cdn-icons-png.flaticon.com/512/847/847969.png');
                "
              ></div>
              <div class="flex flex-col items-start">
                <span
                  id="top-user-name"
                  class="text-sm font-semibold text-[#0d181b] dark:text-white leading-tight"
                >
                  Usuário
                </span>
                <span
                  id="top-user-role"
                  class="text-[11px] text-gray-500 dark:text-gray-400 leading-tight"
                >
                  atribuição ou email
                </span>
              </div>
              <span
                class="material-symbols-outlined text-gray-500 dark:text-gray-400 text-base"
              >
                expand_more
              </span>
            </button>

            <div
              id="user-menu-dropdown"
              class="hidden absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101820] shadow-lg z-20"
            >
              <div
                class="flex flex-col justify-center items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800"
              >
                <div
                  id="dropdown-user-avatar"
                  class="bg-center bg-no-repeat bg-cover rounded-full h-20 w-20"
                  style="
                    background-image: url('https://cdn-icons-png.flaticon.com/512/847/847969.png');
                  "
                ></div>
                <div class="flex flex-col justify-center items-center w-full">
                  <span
                    id="dropdown-user-name"
                    class="text-base font-semibold text-[#0d181b] dark:text-white"
                  >
                    Usuário
                  </span>
                  <span
                    id="dropdown-user-email"
                    class="text-sm text-gray-500 dark:text-gray-400"
                  >
                    usuario@exemplo.com
                  </span>
                </div>
              </div>

              <div class="py-2">
                <a
                  href="/pages/perfil"
                  class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span class="material-symbols-outlined text-base"
                    >settings</span
                  >
                  <span>Configurações</span>
                </a>
                <button
                  id="btn-logout"
                  type="button"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <span class="material-symbols-outlined text-base"
                    >logout</span
                  >
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </main>
  </div>
`;

  loadCurrentAdmin();
  initUserMenu();
  loadVersion();
});

function initUserMenu() {
  const container = document.getElementById("user-menu-container");
  const button = document.getElementById("user-menu-button");
  const dropdown = document.getElementById("user-menu-dropdown");
  const logoutBtn = document.getElementById("btn-logout");

  console.log(button);

  if (button && dropdown && container) {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      try {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        // window.location.href = "/";
      } catch (e) {}
      window.location.href = "/";
    });
  }
}

function loadVersion() {
  const versionEl = document.getElementById("app-version");
  if (!versionEl) return;

  fetch("/api/system/version")
    .then(function (res) {
      if (!res.ok) throw new Error("version error");
      return res.json();
    })
    .then(function (data) {
      if (data && data.version) {
        versionEl.textContent = "v" + data.version;
      } else {
        versionEl.textContent = "v0.0.0";
      }
    })
    .catch(function () {
      versionEl.textContent = "v0.0.0";
    });
}

function loadCurrentAdmin() {
  fetch("/api/admin/me", { credentials: "include" })
    .then(function (res) {
      if (res.status === 401 || res.status === 403) {
        return null;
      }
      if (!res.ok) throw new Error("me error");
      return res.json();
    })
    .then(function (data) {
      if (!data) return;

      const name = data.nome || data.name || "Usuário";
      const email = data.email || "usuario@exemplo.com";
      const role =
        data.atribuicao || data.role || data.cargo || data.funcao || email;

      const avatarUrl = data.foto;

      const topAvatar = document.getElementById("top-user-avatar");
      const topName = document.getElementById("top-user-name");
      const topRole = document.getElementById("top-user-role");
      const ddAvatar = document.getElementById("dropdown-user-avatar");
      const ddName = document.getElementById("dropdown-user-name");
      const ddEmail = document.getElementById("dropdown-user-email");

      if (topAvatar)
        topAvatar.setAttribute("style", `background-image: url(${avatarUrl})`);
      if (topName) topName.textContent = name;
      if (topRole) topRole.textContent = role;
      if (ddAvatar)
        ddAvatar.setAttribute("style", `background-image: url(${avatarUrl})`);
      if (ddName) ddName.textContent = name;
      if (ddEmail) ddEmail.textContent = email;
    })
    .catch(function () {
      /* silencioso */
    });
}

function loadPage(path) {
  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      const root = document.getElementById("page-root");
      root.innerHTML = html;
    })
    .catch((err) => {
      console.error("Erro ao carregar página:", err);
    });
}
