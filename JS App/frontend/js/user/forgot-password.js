import { AuthUtils } from "./auth-utils.js";
class ForgotPasswordForm {
  constructor() {
    this.form = document.getElementById("forgotPasswordForm");
    this.emailInput = document.getElementById("email");
    this.submitBtn = document.getElementById("sendCodeBtn");
    this.alertContainer = document.getElementById("alert-container");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const email = this.emailInput.value.trim();
    if (!AuthUtils.isValidEmail(email)) {
      AuthUtils.showAlert(this.alertContainer, "Please enter a valid email", "error", 3000);
      return;
    }

    AuthUtils.setButtonLoading(this.submitBtn, true, "Sending OTP...", "Send OTP");

    // API call
    const { success, data, error } = await AuthUtils.apiRequest(
      AuthUtils.API_ENDPOINTS.forgotPassword,
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );

    if (success) {
      // Store email in sessionStorage for OTP verification
      sessionStorage.setItem(AuthUtils.STORAGE_KEYS.resetEmail, email);

      AuthUtils.showAlert(this.alertContainer, "OTP sent! Check your email.", "success", 3000);

      // Redirect to Verify OTP page
      AuthUtils.redirectTo("verify-password-otp.html", 2000);
    } else {
      AuthUtils.showAlert(this.alertContainer, error, "error", 3000);
    }

    AuthUtils.setButtonLoading(this.submitBtn, false, "Sending OTP...", "Send OTP");
  }
}

// Initialize form
const forgotPasswordForm = new ForgotPasswordForm();
