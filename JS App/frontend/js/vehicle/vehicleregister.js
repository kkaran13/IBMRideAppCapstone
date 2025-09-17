import { AuthUtils } from "../user/auth-utils.js";
document.addEventListener("DOMContentLoaded", async function () {

  const loggedInUser = AuthUtils.getUserInfo();
  if (!loggedInUser) {
    window.location.href = "/html/user/login.html";
    return;
  }

  document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(e.target).entries());
    console.log(formData);
    const user = AuthUtils.getUserInfo();
    formData.user_id = user.id;
    console.log(formData);

    // Send request using AuthUtils.apiRequest
    const res = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.registerVehicle, {
      method: "POST",
      body: JSON.stringify(formData)
    });

    if (res.success) {
      AuthUtils.showAlert(
        document.getElementById("alert-container"),
        "Vehicle registered successfully!",
        "success",
        3000
      );

      // Redirect after success
      AuthUtils.redirectTo("../../html/vehicle/my-vehicle.html", 1500);
    } else {
      AuthUtils.showAlert(
        document.getElementById("alert-container"),
        res.error || "Vehicle registration failed",
        "error",
        3000
      );
    }
  });
});