import { AuthUtils } from "../user/auth-utils.js";

const API_BASE = "http://localhost:3000";



// Update Vehicle (only color)
document.getElementById("updateForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const vehicleId = new URLSearchParams(window.location.search).get("id");
  const res = await fetch(`${API_BASE}/update/${vehicleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ color: formData.color })
  });
  const data = await res.json();
  alert(data.message);
});



document.addEventListener("DOMContentLoaded", async () => {
  // Active Vehicle
  if (document.getElementById("activeVehicleCard")) {
    const res = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.getActiveVehicle);
    if (res.success && res.data?.data) {
      renderActiveVehicle(res.data.data);
    } else {
      document.getElementById("activeVehicleCard").innerHTML = "<p>No active vehicle found.</p>";
    }
  }

  // My Vehicles
  if (document.getElementById("myVehiclesList")) {
    const res = await AuthUtils.apiRequest(AuthUtils.API_ENDPOINTS.viewMyVehicles, {method : "GET"});
    console.log(res);
    if (res.success && res.data?.data?.vehicles) {
      const vehicles = res.data.data.vehicles;
      document.getElementById("myVehiclesList").innerHTML = vehicles.map(v => `
        <div class="vehicle-card">
          <h2>${v.make} ${v.model} (${v.year})</h2>
          <p>${v.registration_number}</p>
          <p>Color: ${v.color}</p>
          <p>Type: ${v.vehicle_type}</p>
          <p>Status: ${v.status}</p>
        </div>
      `).join("");
    } else {
      document.getElementById("myVehiclesList").innerHTML = "<p>No vehicles registered.</p>";
    }
  }
});

function renderActiveVehicle(v) {
  const imgPath = `../../assets/images/vehicle-types/${v.vehicle_type}.png`;
  document.getElementById("activeVehicleCard").innerHTML = `
    <div class="card-top">
      <img src="${imgPath}" alt="${v.vehicle_type}" class="vehicle-img">
      <div class="vehicle-header">
        <h2 class="vehicle-type">${v.vehicle_type}</h2>
        <span class="status ${v.status}">${v.status.toUpperCase()}</span>
      </div>
    </div>
    <div class="card-bottom">
      <p class="vehicle-details">${v.make} ${v.model} ${v.year}</p>
      <p class="vehicle-reg">${v.registration_number}</p>
      <div class="actions">
        <button onclick="updateVehicle('${v.vehicle_id}')">Update</button>
        <button onclick="deleteVehicle('${v.vehicle_id}')">Delete</button>
      </div>
    </div>
  `;
  document.getElementById("vehicleDetails").innerHTML = `
    <p><b>Brand:</b> ${v.make}</p>
    <p><b>Model:</b> ${v.model}</p>
    <p><b>Year:</b> ${v.year}</p>
    <p><b>Color:</b> ${v.color}</p>
    <p><b>Reg No:</b> ${v.registration_number}</p>
    <p><b>Type:</b> ${v.vehicle_type}</p>
    <p><b>Status:</b> ${v.status}</p>
  `;
}

// Delete vehicle
async function deleteVehicle(id) {
  const url = AuthUtils.API_ENDPOINTS.deleteVehicle.replace(":id", id);
  const res = await AuthUtils.apiRequest(url, { method: "DELETE" });
  if (res.success) location.reload();
  else alert(res.error);
}














