import { AuthUtils } from "./auth-utils.js";

class RegisterForm {
  constructor() {
    this.form = document.getElementById("registerForm");
    this.registerBtn = document.getElementById("registerBtn");
    this.alertContainer = document.getElementById("alert-container");
    this.roleSelect = document.getElementById("role");
    this.driverFields = document.getElementById("driverFields");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Toggle driver-only fields
    this.roleSelect.addEventListener("change", (e) => {
      this.driverFields.style.display = e.target.value === "driver" ? "block" : "none";
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);

    // Convert FormData to object for validation and debugging
    const dataObj = {};
    formData.forEach((value, key) => (dataObj[key] = value));
    console.log("Register form data:", dataObj);

    if (!this.validateForm(dataObj)) return;

    AuthUtils.setButtonLoading(this.registerBtn, true, "Signing Up...", "Sign Up");

    // Send form as multipart/form-data
    try {
      const response = await fetch(AuthUtils.API_ENDPOINTS.register, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Register response:", result);

      if (response.ok) {
        if (dataObj.email) {
          // Store pending email for OTP verification
          localStorage.setItem(AuthUtils.STORAGE_KEYS.pendingEmail, dataObj.email);
        }

        AuthUtils.showAlert(this.alertContainer, "Registration successful! Check your email for OTP.", "success", 3000);

        setTimeout(() => {
          window.location.href = "verify-otp.html";
        }, 2000);
      } else {
        AuthUtils.showAlert(this.alertContainer, result.message || "Registration failed.", "error");
      }
    } catch (err) {
      console.error("Network/Fetch Error:", err);
      AuthUtils.showAlert(this.alertContainer, "Network error. Please try again.", "error");
    } finally {
      AuthUtils.setButtonLoading(this.registerBtn, false, "Signing Up...", "Sign Up");
    }
  }

  validateForm(data) {
    if (!data.email || !data.password || !data.role) {
      AuthUtils.showAlert(this.alertContainer, "Please fill in all required fields.", "error");
      return false;
    }

    if (!AuthUtils.isValidEmail(data.email)) {
      AuthUtils.showAlert(this.alertContainer, "Please enter a valid email address.", "error");
      return false;
    }

    // Optional: add more validations for password strength, phone, or driver-specific fields
    return true;
  }
}

// Initialize
const registerForm = new RegisterForm();
