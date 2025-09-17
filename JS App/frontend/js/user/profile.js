import { AuthUtils } from "./auth-utils.js";

class ProfilePage {
  constructor() {
    this.editBtn = document.getElementById("editBtn");
    this.saveBtn = document.getElementById("saveBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.alertContainer = document.getElementById("alertContainer");
    this.profileForm = document.getElementById("profileForm");
    this.avatarInput = document.getElementById("avatarInput");
    this.avatarPreview = document.getElementById("avatarPreview");

    this.userData = {};
    this.isEditing = false;
    this.originalAvatar = null;

    this.init();
  }

  init() {
    this.loadProfile();
    this.editBtn.addEventListener("click", () => this.enableEdit());
    this.cancelBtn.addEventListener("click", () => this.cancelEdit());
    this.profileForm.addEventListener("submit", (e) => this.saveProfile(e));
    this.logoutBtn.addEventListener("click", () => this.logout());
    if (this.avatarInput) {
      this.avatarInput.addEventListener("change", (e) => this.previewAvatar(e));
    }
  }

  async loadProfile() {
    const res = await AuthUtils.apiRequest(`${AuthUtils.BASE_URL}/user/profile`, { method: "GET" });
    if (res.success) {
      this.userData = res.data?.updatedUser || res.data?.data || res.data || {};
      this.renderProfile();
    } else {
      AuthUtils.showAlert(this.alertContainer, res.error, "danger");
    }
  }

  renderProfile() {
    if (!this.userData) return;

    document.querySelectorAll(".profile-value").forEach((el) => {
      const key = el.dataset.field;
      let value = this.userData[key];
      if (["created_at", "updated_at", "last_login_at", "license_expiry_date"].includes(key) && value) {
        value = new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      }
      if (value === null || value === undefined || value === "") value = "-";
      else if (typeof value === "boolean") value = value ? "Yes" : "No";
      el.textContent = value;
    });

    document.querySelectorAll(".profile-input").forEach((el) => {
      const key = el.name;
      if (["email", "phone", "role"].includes(key)) {
        el.disabled = true;
      }
      const value = this.userData[key];
      if (el.type === "checkbox") el.checked = !!value;
      else if (el.type === "date" && value) el.value = new Date(value).toISOString().split("T")[0];
      else el.value = value || "";
    });

    if (this.avatarPreview) {
      const avatarUrl = this.userData.profile_image_url || "../../images/default-avatar.png";
      this.avatarPreview.src = avatarUrl;
      this.originalAvatar = avatarUrl;
    }

    const driverFields = document.getElementById("driverFields");
    if (driverFields) driverFields.style.display = this.userData.role === "driver" ? "block" : "none";

    this.setViewMode();
  }

  previewAvatar(e) {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      AuthUtils.showAlert(this.alertContainer, "Invalid image file", "danger");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      this.avatarPreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  setViewMode() {
    document.querySelectorAll(".profile-input").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".profile-value").forEach((el) => (el.style.display = "inline-block"));
    if (this.avatarInput) this.avatarInput.style.display = "none";
    this.editBtn.style.display = "inline-block";
    this.saveBtn.style.display = "none";
    this.cancelBtn.style.display = "none";
  }

  setEditMode() {
    document.querySelectorAll(".profile-value").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".profile-input").forEach((el) => (el.style.display = "inline-block"));
    if (this.avatarInput) this.avatarInput.style.display = "block";
    this.editBtn.style.display = "none";
    this.saveBtn.style.display = "inline-block";
    this.cancelBtn.style.display = "inline-block";
  }

  enableEdit() {
    this.isEditing = true;
    this.setEditMode();
    this.alertContainer.innerHTML = "";
  }

  cancelEdit() {
    this.isEditing = false;
    this.setViewMode();
    if (this.avatarPreview && this.originalAvatar) this.avatarPreview.src = this.originalAvatar;
    if (this.avatarInput) this.avatarInput.value = "";
    this.renderProfile();
    this.alertContainer.innerHTML = "";
  }
async saveProfile(e) {
  e.preventDefault();
  if (!this.isEditing) return;

  const formData = new FormData();
  document.querySelectorAll(".profile-input").forEach((el) => {
    if (
      el.name &&
      el.type !== "file" &&
      el.name !== "email" &&
      el.name !== "role" &&
      el.name !== "phone"
    ) {
      formData.append(el.name, el.value);
    }
  });

  if (this.avatarInput.files[0]) {
    formData.append("avatar", this.avatarInput.files[0]);
  } else if (!this.userData.profile_image_url) {
    AuthUtils.showAlert(this.alertContainer, "Please upload a profile image", "danger");
    return;
  }

  AuthUtils.setButtonLoading(this.saveBtn, true, "Saving...", "Save");
  const res = await AuthUtils.apiRequest(`${AuthUtils.BASE_URL}/user/update`, {
    method: "PUT",
    body: formData,
  });
  AuthUtils.setButtonLoading(this.saveBtn, false, "Saving...", "Save");

  if (!res.success) {
    AuthUtils.showAlert(this.alertContainer, res.error || "Failed to update profile", "danger");
    return;
  }

  // ✅ Extract updated user correctly
  const updatedUser = res.data?.data?.updatedUser || res.data?.updatedUser || res.data || {};
  this.userData = { ...this.userData, ...updatedUser };

  // ✅ Immediately refresh avatar
  if (updatedUser.profile_image_url) {
    this.avatarPreview.src = updatedUser.profile_image_url;
    this.originalAvatar = updatedUser.profile_image_url;
  }

  this.renderProfile();
  AuthUtils.showAlert(this.alertContainer, "Profile updated successfully!", "success", 3000);
  this.cancelEdit();
}

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      AuthUtils.clearAuthData();
      window.location.href = "login.html";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = AuthUtils.getUserInfo();
  
  if (!loggedInUser) {
    // Redirect to login if no user session found
    window.location.href = "/html/user/login.html";
    return;
  }

  // Only initialize ProfilePage if user is logged in
  new ProfilePage();
});

