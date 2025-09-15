import { AuthUtils } from "./auth-utils.js";

class ResetPasswordForm {
  constructor() {
    this.form = document.getElementById("resetPasswordForm");
    this.newPasswordInput = document.getElementById("newPassword");
    this.confirmPasswordInput = document.getElementById("confirmNewPassword");
    this.resetBtn = document.getElementById("resetBtn");
    this.alertContainer = document.getElementById("alert-container");
    this.passwordStrengthDiv = document.getElementById("passwordStrength");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.newPasswordInput.addEventListener("input", this.checkPasswordStrength.bind(this));
    this.confirmPasswordInput.addEventListener("input", this.validatePasswordMatch.bind(this));

    const resetEmail = sessionStorage.getItem(AuthUtils.STORAGE_KEYS.resetEmail);
    if (!resetEmail) {
      AuthUtils.showAlert(this.alertContainer, "Session expired. Please start password reset again.", "error", 3000);
      setTimeout(() => window.location.href = "forgot-password.html", 3000);
    }
  }

  checkPasswordStrength() {
    const password = this.newPasswordInput.value;
    const strength = AuthUtils.checkPasswordStrength(password);
    this.passwordStrengthDiv.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <div style="flex:1;height:4px;background:#ccc;border-radius:2px;overflow:hidden;">
          <div style="height:100%;background:${strength.color};width:${strength.percentage}%"></div>
        </div>
        <span style="color:${strength.color};font-weight:500">${strength.text}</span>
      </div>
    `;
  }

  validatePasswordMatch() {
    if (this.newPasswordInput.value !== this.confirmPasswordInput.value) {
      this.confirmPasswordInput.style.borderColor = "var(--destructive)";
      AuthUtils.showAlert(this.alertContainer, "Passwords do not match", "error");
    } else {
      this.confirmPasswordInput.style.borderColor = "var(--border)";
      AuthUtils.clearAlert(this.alertContainer);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const password = this.newPasswordInput.value;
    const confirm = this.confirmPasswordInput.value;
    const email = sessionStorage.getItem(AuthUtils.STORAGE_KEYS.resetEmail);

    if (!email) return;

    if (!password || !confirm) {
      AuthUtils.showAlert(this.alertContainer, "Please fill in all fields", "error");
      return;
    }

    if (password !== confirm) {
      AuthUtils.showAlert(this.alertContainer, "Passwords do not match", "error");
      return;
    }

    if (!AuthUtils.checkPasswordStrength(password).score >= 4) {
      AuthUtils.showAlert(this.alertContainer, "Password does not meet requirements", "error");
      return;
    }

    AuthUtils.setButtonLoading(this.resetBtn, true, "Resetting...", "Reset Password");

    const { success, data, error } = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.resetPassword, {
      method: "POST",
      body: JSON.stringify({ email, newPassword: password }),
    });

    if (success) {
      AuthUtils.showAlert(this.alertContainer, "Password reset successful! Redirecting to login...", "success", 3000);
      sessionStorage.removeItem(AuthUtils.STORAGE_KEYS.resetEmail);
      setTimeout(() => window.location.href = "login.html", 2000);
    } else {
      AuthUtils.showAlert(this.alertContainer, error || "Failed to reset password", "error");
    }

    AuthUtils.setButtonLoading(this.resetBtn, false, "Resetting...", "Reset Password");
  }
}

const resetPasswordForm = new ResetPasswordForm();
