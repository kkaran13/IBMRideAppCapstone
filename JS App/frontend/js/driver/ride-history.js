import { AuthUtils } from "../user/auth-utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("ride-history-list");
  const paginationContainer = document.getElementById("pagination");
  let currentPage = 1;
  const limit = 5; // number of rides per page

  async function fetchRides(page = 1) {
    try {
      const res = await AuthUtils.apiRequest(
        `${AuthUtils.API_ENDPOINTS.driverRideHistory}?page=${page}&limit=${limit}`,
        { method: "GET" }
      );
      console.log(res);

      if (res.success) {
        const { rides, page, totalPages } = res.data.data;

        if (!rides || rides.length === 0) {
          container.innerHTML = "<p>No ride history available.</p>";
          paginationContainer.innerHTML = "";
          return;
        }

        // Render rides
        container.innerHTML = rides
          .map((ride) => {
            const riderName = ride.Rider
              ? `${ride.Rider.firstname} ${ride.Rider.lastname}`
              : "Unknown Rider";
            const riderPhone = ride.Rider?.phone || "-";

            const statusClass =
              ride.ride_status === "completed"
                ? "status-completed"
                : ride.ride_status === "cancelled"
                ? "status-cancelled"
                : "status-other";

            return `
              <div class="ride-card">
                <div class="ride-header">
                  <span class="ride-status ${statusClass}">${ride.ride_status}</span>
                  <span class="ride-date">${new Date(
                    ride.created_at
                  ).toLocaleString()}</span>
                </div>
                <div class="ride-body">
                  <p><strong>Rider:</strong> ${riderName} (${riderPhone})</p>
                  <p><strong>From:</strong> ${ride.pickup_address}</p>
                  <p><strong>To:</strong> ${ride.dropoff_address}</p>
                </div>
                <div class="ride-footer">
                  <span><strong>Fare:</strong> ₹${ride.fare || 0}</span>
                  <span><strong>Duration:</strong> ${
                    ride.duration_minutes || "-"
                  } min</span>
                </div>
              </div>
            `;
          })
          .join("");

        // Render pagination
        let paginationHTML = "";
        for (let i = 1; i <= totalPages; i++) {
          paginationHTML += `<button class="page-btn ${
            i === page ? "active" : ""
          }" data-page="${i}">${i}</button>`;
        }
        paginationContainer.innerHTML = paginationHTML;

        // Bind pagination click events
        document.querySelectorAll(".page-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            currentPage = parseInt(btn.dataset.page);
            fetchRides(currentPage);
          });
        });
      } else {
        container.innerHTML =
          "<p>Failed to load ride history. Please try again.</p>";
      }
    } catch (err) {
      console.error("Error loading driver ride history:", err);
      container.innerHTML =
        "<p>Something went wrong while fetching ride history.</p>";
    }
  }

  fetchRides(currentPage);
});
