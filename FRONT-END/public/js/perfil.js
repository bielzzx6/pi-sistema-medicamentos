const API_BASE_URL = "/api/admin";

function showAlert(message, type = "success") {
  const alert = document.getElementById("alert-container");
  if (!alert) return;
  alert.classList.remove(
    "hidden",
    "border-red-500",
    "text-red-700",
    "bg-red-50",
    "border-green-500",
    "text-green-700",
    "bg-green-50",
    "border-blue-500",
    "text-blue-700",
    "bg-blue-50"
  );
  if (type === "error") {
    alert.classList.add("border-red-500", "text-red-700", "bg-red-50");
  } else if (type === "info") {
    alert.classList.add("border-blue-500", "text-blue-700", "bg-blue-50");
  } else {
    alert.classList.add("border-green-500", "text-green-700", "bg-green-50");
  }
  alert.textContent = message;
  alert.classList.remove("opacity-0");
  if (alert.autoHideTimeout) {
    clearTimeout(alert.autoHideTimeout);
  }
  alert.autoHideTimeout = setTimeout(() => {
    alert.classList.add("opacity-0");
    setTimeout(() => {
      alert.classList.add("hidden");
    }, 200);
  }, 4000);
}

function clearAlert() {
  const alert = document.getElementById("alert-container");
  if (!alert) return;
  alert.classList.add("hidden");
  alert.textContent = "";
}

function togglePageLoader(show) {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  if (show) loader.classList.remove("hidden");
  else loader.classList.add("hidden");
}

function setSaving(isSaving) {
  const btn = document.getElementById("btn-save");
  const spinner = document.getElementById("btn-save-spinner");
  const text = document.getElementById("btn-save-text");
  if (!btn || !spinner || !text) return;
  if (isSaving) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    text.textContent = "Salvando...";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    text.textContent = "Salvar Alterações";
  }
}

function setPhotoUploading(isUploading) {
  const btn = document.getElementById("btn-photo");
  const spinner = document.getElementById("btn-photo-spinner");
  const text = document.getElementById("btn-photo-text");
  if (!btn || !spinner || !text) return;
  if (isUploading) {
    btn.disabled = true;
    spinner.classList.remove("hidden");
    text.textContent = "Enviando...";
  } else {
    btn.disabled = false;
    spinner.classList.add("hidden");
    text.textContent = "Alterar Foto";
  }
}

function setSwitchState(button, value) {
  if (!button) return;
  const thumb = button.querySelector("span");
  const isOn = !!value;
  button.setAttribute("aria-checked", isOn ? "true" : "false");
  if (isOn) {
    button.classList.remove("bg-gray-200", "dark:bg-gray-700");
    button.classList.add("bg-primary");
    if (thumb) {
      thumb.classList.add("translate-x-5");
      thumb.classList.remove("translate-x-0");
    }
  } else {
    button.classList.add("bg-gray-200", "dark:bg-gray-700");
    button.classList.remove("bg-primary");
    if (thumb) {
      thumb.classList.add("translate-x-0");
      thumb.classList.remove("translate-x-5");
    }
  }
}

function getSwitchValue(button) {
  if (!button) return false;
  return button.getAttribute("aria-checked") === "true";
}

function setAvatarUrl(url) {
  const profileAvatar = document.getElementById("profile-avatar");
  const sidebarAvatar = document.getElementById("sidebar-avatar");
  const fallback =
    profileAvatar?.getAttribute("data-default-url") ||
    sidebarAvatar?.getAttribute("data-default-url");
  const finalUrl = url || fallback;
  if (profileAvatar && finalUrl) {
    profileAvatar.style.backgroundImage = `url('${finalUrl}')`;
  }
  if (sidebarAvatar && finalUrl) {
    sidebarAvatar.style.backgroundImage = `url('${finalUrl}')`;
  }
}

function previewLocalPhoto(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const profileAvatar = document.getElementById("profile-avatar");
    const sidebarAvatar = document.getElementById("sidebar-avatar");
    if (profileAvatar) {
      profileAvatar.style.backgroundImage = `url('${e.target.result}')`;
    }
    if (sidebarAvatar) {
      sidebarAvatar.style.backgroundImage = `url('${e.target.result}')`;
    }
  };
  reader.readAsDataURL(file);
}

async function uploadPhoto(file) {
  const formData = new FormData();
  formData.append("foto", file);
  setPhotoUploading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/update-photo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Erro ao enviar foto.");
    }
    if (data.foto) {
      setAvatarUrl(data.foto);
    }
    showAlert(data.message || "Foto atualizada com sucesso!");
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erro ao enviar foto.", "error");
  } finally {
    setPhotoUploading(false);
  }
}

async function loadAdminProfile() {
  togglePageLoader(true);
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      credentials: "include",
    });
    const admin = await response.json();
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const cpfInput = document.getElementById("cpf");
    const telefoneInput = document.getElementById("telefone");
    if (nomeInput) nomeInput.value = admin.nome || "";
    if (emailInput) emailInput.value = admin.email || "";
    if (cpfInput) cpfInput.value = admin.cpf || "";
    if (telefoneInput) telefoneInput.value = admin.telefone || "";
    const adminNameDisplay = document.getElementById("admin-name-display");
    const adminEmailDisplay = document.getElementById("admin-email-display");
    const sidebarName = document.getElementById("sidebar-admin-name");
    const sidebarEmail = document.getElementById("sidebar-admin-email");
    if (adminNameDisplay)
      adminNameDisplay.textContent = admin.nome || "Administrador";
    if (adminEmailDisplay) adminEmailDisplay.textContent = admin.email || "";
    if (sidebarName) sidebarName.textContent = admin.nome || "Administrador";
    if (sidebarEmail) sidebarEmail.textContent = admin.email || "";
    if (admin.foto) {
      setAvatarUrl(admin.foto);
    } else {
      setAvatarUrl(null);
    }
    const prefs = admin.preferencias || {};
    const emailToggle = document.getElementById("email-notifications-toggle");
    const pushToggle = document.getElementById("push-notifications-toggle");
    const fusoSelect = document.getElementById("fusoHorario");
    const formatoSelect = document.getElementById("formatoRelatorio");
    setSwitchState(emailToggle, prefs.notificacoesEmail ?? true);
    setSwitchState(pushToggle, prefs.notificacoesPush ?? false);
    if (fusoSelect && prefs.fusoHorario) {
      fusoSelect.value = prefs.fusoHorario;
    }
    if (formatoSelect && prefs.formatoRelatorio) {
      formatoSelect.value = prefs.formatoRelatorio;
    }
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erro ao carregar perfil.", "error");
  } finally {
    togglePageLoader(false);
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  clearAlert();

  const nomeInput = document.getElementById("nome");
  const emailInput = document.getElementById("email");
  const cpfInput = document.getElementById("cpf");
  const telefoneInput = document.getElementById("telefone");
  const senhaAtualInput = document.getElementById("senhaAtual");
  const novaSenhaInput = document.getElementById("novaSenha");
  const confirmarNovaSenhaInput = document.getElementById("confirmarNovaSenha");
  const emailToggle = document.getElementById("email-notifications-toggle");
  const pushToggle = document.getElementById("push-notifications-toggle");
  const fusoSelect = document.getElementById("fusoHorario");
  const formatoSelect = document.getElementById("formatoRelatorio");
  const nome = nomeInput?.value?.trim();
  const email = emailInput?.value?.trim();
  const cpf = cpfInput?.value?.trim();
  const telefone = telefoneInput?.value?.trim();
  const senhaAtual = senhaAtualInput?.value;
  const novaSenha = novaSenhaInput?.value;
  const confirmarNovaSenha = confirmarNovaSenhaInput?.value;
  const notificacoesEmail = emailToggle
    ? getSwitchValue(emailToggle)
    : undefined;
  const notificacoesPush = pushToggle ? getSwitchValue(pushToggle) : undefined;
  const fusoHorario = fusoSelect?.value;
  const formatoRelatorio = formatoSelect?.value;
  if (novaSenha || confirmarNovaSenha) {
    if (novaSenha !== confirmarNovaSenha) {
      showAlert("A nova senha e a confirmação não coincidem.", "error");
      return;
    }
    if (!senhaAtual) {
      showAlert("Informe a sua senha atual para alterar a senha.", "error");
      return;
    }
  }
  const payload = {
    nome,
    email,
    cpf,
    telefone,
    senhaAtual: senhaAtual || undefined,
    novaSenha: novaSenha || undefined,
    notificacoesEmail,
    notificacoesPush,
    fusoHorario,
    formatoRelatorio,
  };
  setSaving(true);
  try {
    const response = await fetch(`${API_BASE_URL}/update`, {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Erro ao atualizar perfil.");
    }
    showAlert(data.message || "Perfil atualizado com sucesso!");
    if (senhaAtualInput) senhaAtualInput.value = "";
    if (novaSenhaInput) novaSenhaInput.value = "";
    if (confirmarNovaSenhaInput) confirmarNovaSenhaInput.value = "";
    await loadAdminProfile();
  } catch (err) {
    console.error(err);
    showAlert(err.message || "Erro ao atualizar perfil.", "error");
  } finally {
    setSaving(false);
  }
}

function handleCancel() {
  clearAlert();
  loadAdminProfile();
}

function handlePhotoButtonClick() {
  const input = document.getElementById("foto");
  if (input) input.click();
}

function handlePhotoInputChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showAlert("Arquivo muito grande. Máximo 5MB.", "error");
    event.target.value = "";
    return;
  }
  previewLocalPhoto(file);
  uploadPhoto(file);
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const btnCancel = document.getElementById("btn-cancel");
  const emailToggle = document.getElementById("email-notifications-toggle");
  const pushToggle = document.getElementById("push-notifications-toggle");
  const btnPhoto = document.getElementById("btn-photo");
  const fotoInput = document.getElementById("foto");
  if (form) {
    form.addEventListener("submit", handleProfileSubmit);
  }
  if (btnCancel) {
    btnCancel.addEventListener("click", handleCancel);
  }
  if (emailToggle) {
    emailToggle.addEventListener("click", () => {
      const current = getSwitchValue(emailToggle);
      setSwitchState(emailToggle, !current);
    });
  }
  if (pushToggle) {
    pushToggle.addEventListener("click", () => {
      const current = getSwitchValue(pushToggle);
      setSwitchState(pushToggle, !current);
    });
  }
  if (btnPhoto) {
    btnPhoto.addEventListener("click", handlePhotoButtonClick);
  }
  if (fotoInput) {
    fotoInput.addEventListener("change", handlePhotoInputChange);
  }
  loadAdminProfile();
});
