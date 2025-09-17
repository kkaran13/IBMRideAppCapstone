import { AuthUtils } from "./auth-utils.js";

class OTPVerification {
  constructor() {
    this.form = document.getElementById("otpForm");
    this.groups = {
      email: document.querySelectorAll(".otp-input[data-group='email']"),
      phone: document.querySelectorAll(".otp-input[data-group='phone']"),
    };
    this.verifyBtn = document.getElementById("verifyBtn");
    this.resendBtn = document.getElementById("resendBtn");
    this.alertContainer = document.getElementById("alert-container");

    this.init();
  }

  init() {
    Object.values(this.groups).forEach((inputs) => {
      inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => this.handleInput(e, index, inputs));
        input.addEventListener("keydown", (e) => this.handleKeydown(e, index, inputs));
        input.addEventListener("paste", (e) => this.handlePaste(e, inputs));
      });
    });

    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.resendBtn.addEventListener("click", this.handleResend.bind(this));

    // Focus first email input
    this.groups.email[0]?.focus();
  }

  handleInput(e, index, inputs) {
    const value = e.target.value;
    if (!/^\d$/.test(value)) { e.target.value = ""; return; }
    if (value && index < inputs.length - 1) inputs[index + 1].focus();
    if (this.isComplete()) setTimeout(() => this.handleSubmit(new Event("submit")), 100);
  }

  handleKeydown(e, index, inputs) {
    if (e.key === "Backspace" && !e.target.value && index > 0) inputs[index - 1].focus();
    if (e.key === "ArrowLeft" && index > 0) inputs[index - 1].focus();
    if (e.key === "ArrowRight" && index < inputs.length - 1) inputs[index + 1].focus();
  }

  handlePaste(e, inputs) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, inputs.length);
    digits.split("").forEach((d, i) => { if (inputs[i]) inputs[i].value = d; });
    inputs[Math.min(digits.length, inputs.length - 1)].focus();
    if (digits.length === inputs.length && this.isComplete()) {
      setTimeout(() => this.handleSubmit(new Event("submit")), 100);
    }
  }

  isComplete() {
    return (
      Array.from(this.groups.email).every(i => i.value.length === 1) &&
      Array.from(this.groups.phone).every(i => i.value.length === 1)
    );
  }

  getOTP(groupName) {
    return Array.from(this.groups[groupName]).map(i => i.value).join("");
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.isComplete()) {
      AuthUtils.showAlert(this.alertContainer, "Please enter both OTP codes completely", "error");
      return;
    }

    const otp = this.getOTP("email");      // email otp
    const phone_otp = this.getOTP("phone"); // phone otp
    const email = localStorage.getItem(AuthUtils.STORAGE_KEYS.pendingEmail);

    if (!email) {
      AuthUtils.showAlert(this.alertContainer, "Email not found. Please start registration again.", "error");
      return;
    }

    AuthUtils.setButtonLoading(this.verifyBtn, true, "Verifying...", "Verify Account");

    const { success, data, error } = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.verifyOtp, {
      method: "POST",
      body: JSON.stringify({ otp, phone_otp, email }),
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
      AuthUtils.showAlert(this.alertContainer, "Verification codes sent successfully!", "success", 2000);
      this.clearInputs();
      this.groups.email[0]?.focus();
    } else {
      AuthUtils.showAlert(this.alertContainer, error || "Failed to resend code.", "error");
    }

    AuthUtils.setButtonLoading(this.resendBtn, false, "Sending...", "Resend Code");
  }

  clearInputs() {
    Object.values(this.groups).forEach(inputs => inputs.forEach(i => i.value = ""));
  }
}

const otpVerification = new OTPVerification();
