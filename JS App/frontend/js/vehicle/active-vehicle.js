
import { AuthUtils } from "../user/auth-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const res = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.getActiveVehicle);
  if (res.success && res.data?.data) {
    renderActiveVehicle(res.data.data);
  } else {
    document.getElementById("activeVehicleCard").innerHTML = "<p>No active vehicle found.</p>";
  }
});

function renderActiveVehicle(vehicle) {
  const container = document.getElementById("activeVehicleCard");
  const imgUrl = `../../assets/images/vehicle-types/${vehicle.vehicle_type}.png`;

  container.innerHTML = `
    <div class="card-top" style="background:#d9f7d9;">
      <img src="${imgUrl}" class="vehicle-img" alt="${vehicle.vehicle_type}">
    </div>
    <div class="card-bottom">
      <div class="vehicle-header">
        <h3 class="vehicle-type">${capitalize(vehicle.vehicle_type)}</h3>
        <span class="status-label active">ACTIVE</span>
      </div>
      <p class="vehicle-details"><strong>${vehicle.make}</strong> ${vehicle.model} ${vehicle.year}</p>
      <p class="vehicle-reg">${vehicle.registration_number}</p>
    </div>
  `;

  const details = document.getElementById("vehicleDetails");
  if (details) {
    details.innerHTML = `
      <p><strong>Make:</strong> ${vehicle.make}</p>
      <p><strong>Model:</strong> ${vehicle.model}</p>
      <p><strong>Year:</strong> ${vehicle.year}</p>
      <p><strong>Color:</strong> ${vehicle.color}</p>
      <p><strong>Type:</strong> ${vehicle.vehicle_type}</p>
      <p><strong>Reg No:</strong> ${vehicle.registration_number}</p>
    `;
  }
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
