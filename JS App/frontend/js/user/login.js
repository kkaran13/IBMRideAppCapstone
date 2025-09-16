import { AuthUtils } from "./auth-utils.js";
class LoginForm {
  constructor() {
    this.form = document.getElementById("loginForm");
    this.loginBtn = document.getElementById("loginBtn");
    this.alertContainer = document.getElementById("alert-container");

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Support Enter key
    this.form.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSubmit(e);
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const loginData = {
      email: formData.get("email")?.trim(),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe") === "on",
    };

    // Validate
    if (!this.validateForm(loginData)) return;

    AuthUtils.setButtonLoading(this.loginBtn, true, "Signing In...", "Sign In");

    const { success, data, error } = await AuthUtils.apiRequest(
      AuthUtils.API_ENDPOINTS.login,
      {
        method: "POST",
        body: JSON.stringify(loginData),
      }
    );    

    if (success) {
      AuthUtils.showAlert(this.alertContainer, "Login successful! Redirecting...", "success", 3000);

      // Store token
      if (data.accessToken) AuthUtils.storeAuthToken(data.accessToken);
      
      const loggedInUser = AuthUtils.getUserInfo();
      if(loggedInUser?.role == "driver"){
        AuthUtils.redirectTo(data.redirectUrl || "../driver/driver-dashboard.html", 1500);
      }
      else if(loggedInUser?.role == "rider") {
        AuthUtils.redirectTo(data.redirectUrl || "../../html/ride/ride.html", 1500);
      }
      
    } else {
      AuthUtils.showAlert(this.alertContainer, error, "error", 3000);
    }

    AuthUtils.setButtonLoading(this.loginBtn, false, "Signing In...", "Sign In");
  }

  validateForm({ email, password }) {
    if (!email || !password) {
      AuthUtils.showAlert(this.alertContainer, "Please fill in all required fields", "error", 3000);
      return false;
    }
    if (!AuthUtils.isValidEmail(email)) {
      AuthUtils.showAlert(this.alertContainer, "Please enter a valid email address", "error", 3000);
      return false;
    }
    return true;
  }
}

// Initialize
const loginForm = new LoginForm();
