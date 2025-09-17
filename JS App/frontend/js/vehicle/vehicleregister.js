
import { AuthUtils } from "../user/auth-utils.js";

const API_BASE = "http://localhost:3000";

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(e.target).entries());

  try {
    const res = await fetch(`${API_BASE}/vehicle/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AuthUtils.getAuthToken()}`
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (res.ok) {
      showSuccessPopup("Vehicle registered successfully!");
    } else {
      showErrorPopup(data.message || "Registration failed");
    }
  } catch (err) {
    console.error("Error:", err);
    showErrorPopup("Something went wrong. Please try again.");
  }
});

// Utility: popup success
function showSuccessPopup(message) {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="popup success">
      <div class="popup-box">
        <p>${message}</p>
        <button id="popupClose">OK</button>
      </div>
    </div>
  `;
  document.getElementById("popupClose").onclick = () => {

    window.location.href = "../../html/vehicle/my-vehicle.html"; 
  };
}

function showErrorPopup(message) {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="popup error">
      <div class="popup-box">
        <p>${message}</p>
        <button id="popupClose">Close</button>
      </div>
    </div>
  `;
  document.getElementById("popupClose").onclick = () => {
    alertContainer.innerHTML = "";
  };
}
