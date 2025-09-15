import { AuthUtils } from "./auth-utils.js";

class OTPVerification {
  constructor() {
    this.form = document.getElementById("otpForm");
    this.inputs = document.querySelectorAll(".otp-input");
    this.verifyBtn = document.getElementById("verifyBtn");
    this.resendBtn = document.getElementById("resendBtn");
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
  }

  handleInput(e, index) {
    const value = e.target.value;
    if (!/^\d$/.test(value)) { e.target.value = ""; return; }
    if (value && index < this.inputs.length - 1) this.inputs[index + 1].focus();
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
    const email = localStorage.getItem(AuthUtils.STORAGE_KEYS.pendingEmail);
    if (!email) {
      AuthUtils.showAlert(this.alertContainer, "Email not found. Please start registration or recovery again.", "error");
      return;
    }

    AuthUtils.setButtonLoading(this.verifyBtn, true, "Verifying...", "Verify Account");

    const { success, data, error } = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.verifyOtp, {
      method: "POST",
      body: JSON.stringify({ otp, email }),
    });

    if (success) {
      AuthUtils.showAlert(this.alertContainer, "Verification successful! Redirecting to login...", "success", 2000);
      localStorage.removeItem("pendingEmail");
      setTimeout(() => window.location.href = "login.html", 2000);
    } else {
      AuthUtils.showAlert(this.alertContainer, error || "Invalid verification code.", "error");
      this.clearInputs();
    }

    AuthUtils.setButtonLoading(this.verifyBtn, false, "Verifying...", "Verify Account");
  }

  async handleResend() {
    AuthUtils.setButtonLoading(this.resendBtn, true, "Sending...", "Resend Code");

    const { success, data, error } = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.resendOtp, {
      method: "POST",
    });

    if (success) {
      AuthUtils.showAlert(this.alertContainer, "Verification code sent successfully!", "success", 2000);
      this.clearInputs();
      this.inputs[0].focus();
    } else {
      AuthUtils.showAlert(this.alertContainer, error || "Failed to resend code.", "error");
    }

    AuthUtils.setButtonLoading(this.resendBtn, false, "Sending...", "Resend Code");
  }

  clearInputs() { this.inputs.forEach(i => i.value = ""); }
}

const otpVerification = new OTPVerification();
