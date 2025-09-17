import { AuthUtils } from "./auth-utils.js";

class ProfilePage {
  constructor() {
    this.editBtn = document.getElementById("editBtn");
    this.saveBtn = document.getElementById("saveBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.logoutBtn = document.getElementById("logoutBtn");
    this.alertContainer = document.getElementById("alertContainer");
    this.profileForm = document.getElementById("profileForm");

    this.userData = null;
    this.isEditing = false;

    this.init();
  }

  init() {
    if (!this.editBtn || !this.saveBtn || !this.cancelBtn || !this.logoutBtn) {
      console.error("ProfilePage: required elements missing");
      return;
    }

    this.loadProfile();

    this.editBtn.addEventListener("click", () => this.enableEdit());
    this.cancelBtn.addEventListener("click", () => this.cancelEdit());
    this.profileForm.addEventListener("submit", (e) => this.saveProfile(e));
    this.logoutBtn.addEventListener("click", () => this.logout());
  }

  async loadProfile() {
    const url = `${AuthUtils.BASE_URL}/user/profile`;
    const res = await AuthUtils.apiRequest(url, {
      method: "GET",
      // headers: { Authorization: `Bearer ${AuthUtils.getAuthToken()}` },
    });
    console.log(res,"res");
    if (!res.success) {
      AuthUtils.showAlert(this.alertContainer, res.error, "danger");
      return;
    }

    this.userData = res.data;
    this.renderProfile();
  }

  renderProfile() {
    if (!this.userData) return;

    document.querySelectorAll(".profile-value").forEach((el) => {
      const key = el.dataset.field;
      el.textContent = this.userData[key] || "-";
    });

    document.querySelectorAll(".profile-input").forEach((el) => {
      const key = el.name;
      el.value = this.userData[key] || "";
    });

    // Show driver-only section if role = driver
    if (this.userData.role === "driver") {
      document.getElementById("driverFields").style.display = "block";
    }
  }

  enableEdit() {
    this.isEditing = true;

    document.querySelectorAll(".profile-value").forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".profile-input").forEach((el) => (el.style.display = "inline-block"));

    this.editBtn.style.display = "none";
    this.saveBtn.style.display = "inline-block";
    this.cancelBtn.style.display = "inline-block";
  }

  cancelEdit() {
    this.isEditing = false;

    document.querySelectorAll(".profile-value").forEach((el) => (el.style.display = "inline-block"));
    document.querySelectorAll(".profile-input").forEach((el) => (el.style.display = "none"));

    this.editBtn.style.display = "inline-block";
    this.saveBtn.style.display = "none";
    this.cancelBtn.style.display = "none";

    this.renderProfile(); // reset inputs back to original values
  }

  async saveProfile(e) {
    e.preventDefault();
    if (!this.isEditing) return;

    const formData = new FormData(this.profileForm);
    const updatedData = {};
    formData.forEach((value, key) => {
      updatedData[key] = value.trim();
    });

    AuthUtils.setButtonLoading(this.saveBtn, true, "Saving...", "Save");

    const url = `${AuthUtils.BASE_URL}/user/update`;
    const res = await AuthUtils.apiRequest(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${AuthUtils.getAuthToken()}` },
      body: JSON.stringify(updatedData),
    });

    AuthUtils.setButtonLoading(this.saveBtn, false, "Saving...", "Save");

    if (!res.success) {
      AuthUtils.showAlert(this.alertContainer, res.error, "danger");
      return;
    }

    this.userData = res.data;
    this.renderProfile();

    AuthUtils.showAlert(this.alertContainer, "Profile updated successfully!", "success", 3000);

    this.cancelEdit(); // switch back to readonly
  }

  logout() {
    AuthUtils.clearAuthData();
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ProfilePage();
});
