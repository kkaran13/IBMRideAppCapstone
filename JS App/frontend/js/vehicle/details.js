
import { AuthUtils } from "../user/auth-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const vehicleId = new URLSearchParams(window.location.search).get("id");
  if (!vehicleId) {
    document.getElementById("vehicleDetails").innerHTML = "<p>No vehicle ID provided.</p>";
    return;
  }

  try {
    const res = await AuthUtils.apiRequest(
      AuthUtils.API_ENDPOINTS.viewVehicleDetails.replace(":id", vehicleId),
      { method: "GET" }
    );

    let vehicle = null;

    // Handle response
    if (res.success && res.data?.data?.vehicles?.length > 0) {
      vehicle = res.data.data.vehicles.find(v => v.vehicle_id === vehicleId);
    } else if (res.success && res.data?.data) {
      vehicle = res.data.data;
    }

    if (!vehicle) {
      document.getElementById("vehicleDetails").innerHTML = "<p>Vehicle not found.</p>";
      return;
    }

    renderEachVehicle(vehicle);

  } catch (err) {
    console.error("Error fetching vehicle:", err);
    document.getElementById("vehicleDetails").innerHTML = "<p>Failed to load vehicle details.</p>";
  }
});

function renderEachVehicle(vehicle) {
  const card = document.getElementById("vehicleCard");
  const details = document.getElementById("vehicleDetails");
  const imgUrl = `../../assets/images/vehicle-types/${vehicle.vehicle_type}.png`;

  const isActive = vehicle.status === "active";

  // Apply active/inactive 
  card.className = `vehicle-card ${isActive ? "active-card" : "inactive-card"}`;

  card.innerHTML = `
    <div class="card-top" style="background:${isActive ? "#d9f7d9" : "#eef1ff"};">
      <img src="${imgUrl}" class="vehicle-img" alt="${vehicle.vehicle_type}">
    </div>
    <div class="card-bottom">
      <div class="vehicle-header">
        <h3 class="vehicle-type">${capitalize(vehicle.vehicle_type)}</h3>
        ${
          isActive
            ? `<span class="status-label active">ACTIVE</span>`
            : `<span class="status-label inactive">INACTIVE</span>`
        }
      </div>
      <p class="vehicle-details"><strong>${vehicle.make}</strong> ${vehicle.model} ${vehicle.year}</p>
      <p class="vehicle-reg">${vehicle.registration_number}</p>
    </div>
  `;

  details.innerHTML = `
    <p><strong>Make:</strong> ${vehicle.make}</p>
    <p><strong>Model:</strong> ${vehicle.model}</p>
    <p><strong>Year:</strong> ${vehicle.year}</p>
    <p><strong>Color:</strong> ${vehicle.color}</p>
    <p><strong>Type:</strong> ${vehicle.vehicle_type}</p>
    <p><strong>Reg No:</strong> ${vehicle.registration_number}</p>
    <p><strong>Status:</strong> ${isActive ? "Active" : "Inactive"}</p>
  `;
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
