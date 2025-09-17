
import { AuthUtils } from "../user/auth-utils.js";
import { showAlert } from "../vehicle/alert.js";

document.addEventListener("DOMContentLoaded", async () => {
  const updateForm = document.getElementById("updateForm");
  if (!updateForm) return;

  const vehicleId = new URLSearchParams(window.location.search).get("id");
  if (!vehicleId) return;

  try {
    // Fetch vehicle details
    const res = await AuthUtils.apiRequest(
      AuthUtils.API_ENDPOINTS.viewVehicleDetails.replace(":id", vehicleId),
      { method: "GET" }
    );

    let vehicle = res.success && res.data?.data ? res.data.data : null;
    if (!vehicle) {
      alert("Vehicle details not found");
      return;
    }

    // Prefill fields
    updateForm.querySelector('input[name="make"]').value = vehicle.make || "";
    updateForm.querySelector('input[name="model"]').value = vehicle.model || "";
    updateForm.querySelector('input[name="year"]').value = vehicle.year || "";
    updateForm.querySelector('input[name="registration_number"]').value = vehicle.registration_number || "";
    updateForm.querySelector('input[name="color"]').value = vehicle.color || "";

    // Handle form submit
    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const color = updateForm.querySelector('input[name="color"]').value;

      const updateRes = await AuthUtils.apiRequest(
        AuthUtils.API_ENDPOINTS.updateVehicle.replace(":id", vehicleId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ color }),
        }
      );

      const alertContainer = document.getElementById("alert-container");
      if (updateRes.success) {
        showAlert(alertContainer, "Vehicle updated successfully!", "success", 3000);
      } else {
        showAlert(alertContainer, updateRes.error || "Update failed", "error", 3000);
      }
    });

    // Close
    const closeBtn = updateForm.querySelector('button[type="button"]');
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        window.location.href = "../../html/vehicle/my-vehicle.html";
      });
    }
  } catch (err) {
    console.error("Error loading vehicle:", err);
    alert("Failed to load vehicle details");
  }
});
