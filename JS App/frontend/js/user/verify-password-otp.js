import { AuthUtils } from "./auth-utils.js";

class VerifyPasswordOTP {
  constructor() {
    this.form = document.getElementById("verifyPasswordOtpForm");
    this.inputs = document.querySelectorAll(".otp-input");
    this.verifyBtn = document.getElementById("verifyCodeBtn");
    this.resendBtn = document.getElementById("resendCodeBtn");
    this.alertContainer = document.getElementById("alert-container");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.resendBtn.addEventListener("click", this.handleResend.bind(this));

    this.inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => this.handleInput(e, index));
      input.addEventListener("keydown", (e) => this.handleKeydown(e, index));
      input.addEventListener("paste", (e) => this.handlePaste(e));
    });

    this.inputs[0].focus();

    // Ensure email exists in sessionStorage
    const resetEmail = sessionStorage.getItem("resetEmail");
    if (!resetEmail) {
      AuthUtils.showAlert(this.alertContainer, "Session expired. Please start password reset again.", "error", 3000);
      setTimeout(() => window.location.href = "forgot-password.html", 3000);
    }
  }

  handleInput(e, index) {
    const value = e.target.value;
    if (!/^\d$/.test(value)) e.target.value = "";
    else if (value && index < this.inputs.length - 1) this.inputs[index + 1].focus();
    if (this.isComplete()) setTimeout(() => this.handleSubmit(new Event("submit")), 100);
  }

  handleKeydown(e, index) {
    if (e.key === "Backspace" && !e.target.value && index > 0) this.inputs[index - 1].focus();
    if (e.key === "ArrowLeft" && index > 0) this.inputs[index - 1].focus();
    if (e.key === "ArrowRight" && index < this.inputs.length - 1) this.inputs[index + 1].focus();
  }

  handlePaste(e) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    digits.split("").forEach((d, i) => { if (this.inputs[i]) this.inputs[i].value = d; });
    this.inputs[Math.min(digits.length, this.inputs.length - 1)].focus();
    if (digits.length === 6) setTimeout(() => this.handleSubmit(new Event("submit")), 100);
  }

  isComplete() { return Array.from(this.inputs).every(i => i.value.length === 1); }
  getOTP() { return Array.from(this.inputs).map(i => i.value).join(""); }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.isComplete()) {
      AuthUtils.showAlert(this.alertContainer, "Please enter the complete 6-digit code", "error");
      return;
    }

    const otp = this.getOTP();
    const email = sessionStorage.getItem(AuthUtils.STORAGE_KEYS.resetEmail);
    if (!email) {
      AuthUtils.showAlert(this.alertContainer, "Session expired. Please start over.", "error");
      return;
    }

    AuthUtils.setButtonLoading(this.verifyBtn, true, "Verifying...", "Verify Code");

    const { success, data, error } = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.verifyPasswordOtp, {
      method: "POST",
       // important
      body: JSON.stringify({ email, otp }),
    });

    if (success) {
      sessionStorage.setItem("resetToken", data.resetToken);
      AuthUtils.showAlert(this.alertContainer, "OTP verified! Redirecting to reset password...", "success", 2000);
      setTimeout(() => window.location.href = "reset-password.html", 1500);
    } else {
      AuthUtils.showAlert(this.alertContainer, error || "Invalid OTP. Try again.", "error");
      this.clearInputs();
    }

    AuthUtils.setButtonLoading(this.verifyBtn, false, "Verifying...", "Verify Code");
  }

  async handleResend() {
    const email = sessionStorage.getItem("resetEmail");
    if (!email) {
      AuthUtils.showAlert(this.alertContainer, "Session expired. Start over.", "error");
      return;
    }

    AuthUtils.setButtonLoading(this.resendBtn, true, "Sending...", "Resend Code");

    const { success, data, error } = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.forgotPassword, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (success) {
      AuthUtils.showAlert(this.alertContainer, "New OTP sent successfully!", "success", 2000);
      this.clearInputs();
      this.inputs[0].focus();
    } else {
      AuthUtils.showAlert(this.alertContainer, error || "Failed to resend OTP.", "error");
    }

    AuthUtils.setButtonLoading(this.resendBtn, false, "Sending...", "Resend Code");
  }

  clearInputs() { this.inputs.forEach(i => i.value = ""); }
}

const verifyPasswordOTP = new VerifyPasswordOTP();
