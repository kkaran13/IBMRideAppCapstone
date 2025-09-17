import { AuthUtils } from "../user/auth-utils.js";
import { showAlert } from "../vehicle/alert.js";

document.addEventListener("DOMContentLoaded", function () {
  const loggedInUser = AuthUtils.getUserInfo();
  if (!loggedInUser) {
    window.location.href = "/html/user/login.html";
    return;
  }

  document.getElementById("registerVehicle")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.target).entries());
    formData.user_id = loggedInUser.id;

    try {
      const res = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.registerVehicle, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });

      const alertContainer = document.getElementById("alert-container");

      if (res.success) {
        showAlert(alertContainer, "Vehicle registered successfully!", "success", 3000);

        // Redirect 
        setTimeout(() => {
          window.location.href = "../../html/vehicle/my-vehicle.html";
        }, 1500);
      } else {
        showAlert(alertContainer, res.error || "Vehicle registration failed", "error", 3000);
      }
    } catch (err) {
      showAlert(
        document.getElementById("alert-container"),
        err.message || "Unexpected error occurred",
        "error",
        3000
      );
    }
  });
});
