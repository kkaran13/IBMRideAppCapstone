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

// Fetch My Vehicles
async function loadMyVehicles() {
  const list = document.getElementById("myVehiclesList");
  if (!list) return;
  const res = await fetch(`${API_BASE}/vehicle/my`);
  const data = await res.json();
  list.innerHTML = data.data.vehicles.map(v => `
    <div class="vehicle-card">
      <h2>${v.make} ${v.model} (${v.year})</h2>
      <p>${v.registration_number}</p>
      <p>Color: ${v.color}</p>
      <p>Type: ${v.vehicle_type}</p>
      <p>Status: ${v.status}</p>
    </div>
  `).join("");
}
loadMyVehicles();





async function loadActiveVehicle() {
  const card = document.getElementById("activeVehicleCard");
  const detailsDiv = document.getElementById("vehicleDetails");
  if (!card || !detailsDiv) return;

  try {
    const res = await fetch(`${API_BASE}/vehicle/active-vehicle`);
    const data = await res.json();
    const v = data.data;

    if (!v) {
      card.innerHTML = "<p>No active vehicle found.</p>";
      return;
    }

    // choose image based on type
    const imgPath = `../../assets/images/vehicle-types/${v.vehicle_type}.png`;

    card.innerHTML = `
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
        <button onclick="loadUpdate('${v.vehicle_id}')">Update</button>
        <button onclick="deleteVehicle('${v.vehicle_id}')">Delete</button>
        </div>
    </div>
    `;


    detailsDiv.innerHTML = `
      <p><b>Brand:</b> ${v.make}</p>
      <p><b>Model:</b> ${v.model}</p>
      <p><b>Year:</b> ${v.year}</p>
      <p><b>Color:</b> ${v.color}</p>
      <p><b>Reg No:</b> ${v.registration_number}</p>
      <p><b>Type:</b> ${v.vehicle_type}</p>
      <p><b>Status:</b> ${v.status}</p>
    `;
  } catch (err) {
    console.error("Failed to load active vehicle", err);
    card.innerHTML = "<p>Error loading active vehicle.</p>";
  }
}

loadActiveVehicle();

// Show vehicle details
async function loadVehicleDetails(id) {
  const detailsDiv = document.getElementById("vehicleDetails");
  if (!detailsDiv) return;
  const res = await fetch(`${API_BASE}/${id}`);
  const data = await res.json();
  const v = data.data;
  detailsDiv.innerHTML = `
    <p><b>Brand:</b> ${v.make}</p>
    <p><b>Model:</b> ${v.model}</p>
    <p><b>Year:</b> ${v.year}</p>
    <p><b>Color:</b> ${v.color}</p>
    <p><b>Reg No:</b> ${v.registration_number}</p>
    <p><b>Type:</b> ${v.vehicle_type}</p>
    <p><b>Status:</b> ${v.status}</p>
  `;
}