
import { AuthUtils } from "../user/auth-utils.js";
import { showAlert } from "../vehicle/alert.js";

let currentPage = 1;
const limit = 6;

//filter
async function loadVehicles(page = 1) {
  currentPage = page;
  const search = document.getElementById("searchInput")?.value || "";
  const type = document.getElementById("typeFilter")?.value || "";

  const url = `${AuthUtils.API_ENDPOINTS.viewMyVehicles}?page=${page}&limit=${limit}&q=${encodeURIComponent(
    search
  )}&type=${encodeURIComponent(type)}`;

  const res = await AuthUtils.apiRequest(url, { method: "GET" });
  console.log("Vehicle API response:", res);

  const container = document.getElementById("myVehiclesList");
  if (!container) return;

  if (res.success && res.data?.data?.vehicles) {
    renderMyVehicles(res.data.data.vehicles);
    renderPagination(res.data.data.page, res.data.data.totalPages);
  } else {
    container.innerHTML = "<p>No vehicles found.</p>";
    document.getElementById("paginationControls")?.remove();
  }
}

// Render 
function renderMyVehicles(vehicles) {
  const container = document.getElementById("myVehiclesList");
  container.innerHTML = vehicles
    .map((v) => {
      const isActive = v.status === "active";
      const statusTag = isActive
        ? `<span class="status-label active">ACTIVE</span>`
        : `<button class="status-label activate-btn" onclick="activateVehicle('${v.vehicle_id}')">ACTIVATE</button>`;

      
      const imgUrl = `../../assets/images/vehicle-types/${v.vehicle_type}.png`;

      return `
      <div class="vehicle-card ${isActive ? "active-card" : "inactive-card"}" data-id="${v.vehicle_id}">
        <div class="card-top" style="background:${isActive ? '#d9f7d9' : '#eef1ff'};">
          <img src="${imgUrl}" onerror="this.style.display='none'" alt="${v.vehicle_type}" class="vehicle-img">
        </div>

        <div class="card-bottom">
          <div class="vehicle-header">
            <h3 class="vehicle-type">${escapeHtml(capitalize(v.vehicle_type))}</h3>
            ${statusTag}
          </div>

        <!-- details left aligned -->
        <div class="vehicle-info">
          <p class="vehicle-details">
            ${escapeHtml(v.make)} ${escapeHtml(v.model)} ${escapeHtml(String(v.year))}
          </p>
       
        </div>

          <div class="vehicle-actions">
            <a class="update-link" href="../../html/vehicle/update.html?id=${v.vehicle_id}">Update</a>
            <button class="delete-link" onclick="deleteVehicle('${v.vehicle_id}')">Delete</button>
          </div>

          <a class="view-btn" href="../../html/vehicle/details.html?id=${v.vehicle_id}">View Details</a>

        </div>
      </div>
      `;
    })
    .join("");
}

function renderPagination(page, totalPages) {
  const container = document.getElementById("paginationControls");
  if (!container) return;

  container.innerHTML = `
    <button ${page === 1 ? "disabled" : ""} id="prevBtn">Previous</button>
    <span>Page ${page} of ${totalPages}</span>
    <button ${page === totalPages ? "disabled" : ""} id="nextBtn">Next</button>
  `;

  document.getElementById("prevBtn")?.addEventListener("click", () => loadVehicles(Math.max(1, page - 1)));
  document.getElementById("nextBtn")?.addEventListener("click", () =>
    loadVehicles(Math.min(totalPages, page + 1))
  );
}

// activate vehicle
async function activateVehicle(id) {
  
  const url = AuthUtils.API_ENDPOINTS.updateVehicle.replace(":id", id);
  const res = await AuthUtils.apiRequest(url, {
    method: "PATCH",
    body: JSON.stringify({ status: "active" }),
    headers: { "Content-Type": "application/json" },
  });

  if (res.success) loadVehicles(currentPage);
  else alert(res.error || "Failed to activate vehicle");
}

async function deleteVehicle(id) {
  const modal = document.getElementById("confirmModal");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  modal.style.display = "flex";

  return new Promise((resolve) => {
    noBtn.onclick = () => {
      modal.style.display = "none";
      resolve(false);
    };
    yesBtn.onclick = async () => {
      modal.style.display = "none";

      const url = AuthUtils.API_ENDPOINTS.deleteVehicle.replace(":id", id);
      const res = await AuthUtils.apiRequest(url, { method: "DELETE" });

      if (res.success) {
        showAlert(document.getElementById("alert-container"), "Deleted successfully!", "success", 3000);
        loadVehicles(currentPage);
        resolve(true);
      } else {
        showAlert(document.getElementById("alert-container"), res.error || "Delete failed", "error", 3000);
        resolve(false);
      }
    };
  });
}


function viewDetails(vehicleId) {
  window.location.href = `../../html/vehicle/details.html?id=${vehicleId}`;
}


window.activateVehicle = activateVehicle;
window.deleteVehicle = deleteVehicle;
window.viewDetails = viewDetails;

//  Helpers
function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

//init
document.addEventListener("DOMContentLoaded", () => {
  const searchEl = document.getElementById("searchInput");
  const typeEl = document.getElementById("typeFilter");

  if (searchEl) searchEl.addEventListener("input", () => loadVehicles(1));
  if (typeEl) typeEl.addEventListener("change", () => loadVehicles(1));

  // create pagination 
  if (!document.getElementById("paginationControls")) {
    const p = document.createElement("div");
    p.id = "paginationControls";
    p.className = "pagination";
    document.body.appendChild(p);
  }

  loadVehicles(1);
});




