import { handleFareRide as originalHandleFareRide } from "./backendCoordinates.js";
import { handleRequestRide as originalHandleRequestRide } from "./backendCoordinates.js";

const fareRideBtn = document.getElementById('searchBtn');
const requestRideBtn = document.getElementById('requestRide');

fareRideBtn.addEventListener('click', async () => {
    const coords = await originalHandleFareRide();
    if (!coords) return;

    // fare calculation
    const payload = {
        cords: {
            pickup: [coords.pickupLng, coords.pickupLat],
            drop: [coords.dropoffLng, coords.dropoffLat]
        }
    };

    try {
        const response = await fetch('http://localhost:3000/analysis/fare-cal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Backend response:', data);

        if (data.success) {
            document.getElementById("distance").textContent = data.data.distance_km.toFixed(2);
            document.getElementById("duration").textContent = data.data.duration_minutes.toFixed(2);
            document.getElementById("fare").textContent = data.data.fare_estimate.toFixed(2);

            document.getElementById("fareResult").classList.remove("hidden");

            let latestFare = data.data.fare_estimate.toFixed(2);
            localStorage.setItem("latestFare", latestFare);
            requestRideBtn.disabled = false;
        } else {
            alert("Could not calculate fare: " + data.message);
        }
    } catch (error) {
        console.error('Failed to send ride coordinates:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById("rideModal");
    const closeModal = document.getElementById("closeModal");

    console.log(requestRideBtn, modal, closeModal); // Debug: should not be null
    requestRideBtn.disabled = true; // disable initially

    requestRideBtn.addEventListener('click', async () => {
        const requestData = await originalHandleRequestRide();
        if (!requestData) return;

        const latestFare = localStorage.getItem("latestFare") || "0";

        try {
            const response = await fetch('http://localhost:3000/ride/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            console.log('Ride API response:', data);

            if (data.success) {
                document.getElementById("rideStatus").textContent = "Your ride is booked successfully ✅";
                document.getElementById("pickupText").textContent = requestData.pickup_address;
                document.getElementById("dropText").textContent = requestData.dropoff_address;
                document.getElementById("fareText").textContent = latestFare;

                requestRideBtn.disabled = true;
                // Show modal
                modal.style.display = "block";

                loadRequestedRides();
            }
            else {
                alert(data.message || "Something went wrong!");
            }

        } catch (error) {
            console.error('Failed to request ride:', error);
        }
    });

    closeModal.onclick = () => { modal.style.display = "none"; };
    window.onclick = (event) => { if (event.target === modal) modal.style.display = "none"; };
});

export async function loadRequestedRides() {
    const ridesList = document.getElementById("ridesList");
    const rideHistoryList = document.getElementById("rideHistoryList");
    const modal = document.getElementById("rateRideModal");
    const closeModal = document.getElementById("closeRateModal");
    const submitBtn = document.getElementById("submitRating");
    const ratingInput = document.getElementById("rideRating");
    const reviewInput = document.getElementById("rideReview");

    ridesList.innerHTML = '<p class="no-rides">Loading rides...</p>';
    rideHistoryList.innerHTML = '<p class="no-rides">Loading ride history...</p>';

    try {
        const response = await fetch("http://localhost:3000/ride/", {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();
        console.log("API response:", data);

        if (!data.success || !data.data || data.data.length === 0) {
            ridesList.innerHTML = '<p class="no-rides">No active rides.</p>';
            rideHistoryList.innerHTML = '<p class="no-rides">No ride history available.</p>';
            return;
        }

        const rides = data.data;

        // Active Rides (requested, accepted, ongoing)
        const activeRides = rides.filter(r =>
            ["requested", "accepted", "ongoing"].includes(r.ride_status)
        );

        if (activeRides.length) {
            ridesList.innerHTML = "";
            activeRides.forEach(ride => {
                const rideEl = document.createElement("div");
                rideEl.classList.add("ride-item");
                const storedFare = localStorage.getItem("latestFare") || "0";
                const fareToShow = `₹ ${parseFloat(storedFare).toLocaleString("en-IN")}`;

                // Safely check Driver & Vehicle
                const driverInfo = ride.Driver
                    ? `<p><strong>Driver:</strong> ${ride.Driver.firstname} ${ride.Driver.lastname}</p>
               <p><strong>Phone:</strong> ${ride.Driver.phone}</p>`
                    : "<p><strong>Driver:</strong> Not Assigned</p>";

                const vehicleInfo = ride.Vehicle
                    ? `<p><strong>Vehicle:</strong> ${ride.Vehicle.model}</p>
                    <p><strong>Color:</strong> ${ride.Vehicle.color}</p>
               <p><strong>Reg. No:</strong> ${ride.Vehicle.registration_number}</p>`
                    : "<p><strong>Vehicle:</strong> Not Assigned</p>";

                if (ride.ride_status === "requested") {
                    // Only pickup, drop, status, cancel
                    rideEl.innerHTML = `
                <p><strong>Pickup:</strong> ${ride.pickup_address}</p>
                <p><strong>Drop:</strong> ${ride.dropoff_address}</p>
                <p><strong>Status:</strong> ${ride.ride_status}</p>
                <p><strong>Fare:</strong> ${fareToShow}</p>
                <button class="cancel-btn" data-ride-id="${ride.ride_id}">Cancel Ride</button>
            `;
                } else {
                    // Full details
                    rideEl.innerHTML = `
                <p><strong>Pickup:</strong> ${ride.pickup_address}</p>
                <p><strong>Drop:</strong> ${ride.dropoff_address}</p>
                <p><strong>Status:</strong> ${ride.ride_status}</p>
                ${driverInfo}
                ${vehicleInfo}
                ${["accepted"].includes(ride.ride_status)
                            ? `<button class="cancel-btn" data-ride-id="${ride.ride_id}">Cancel Ride</button>`
                            : ""}
            `;
                }

                ridesList.appendChild(rideEl);
            });
        } else {
            ridesList.innerHTML = '<p class="no-rides">No active rides.</p>';
        }

        // Attach cancel event listeners
        document.querySelectorAll(".cancel-btn").forEach(btn => {
            btn.addEventListener("click", async e => {
                const rideId = e.target.dataset.rideId;
                const reason = prompt("Why do you want to cancel this ride?");
                if (!reason) return;

                try {
                    const res = await fetch(`http://localhost:3000/ride/cancel/${rideId}`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ reason })
                    });

                    const resData = await res.json();
                    if (res.ok && resData.success) {
                        alert("Ride cancelled successfully ✅");
                        loadRequestedRides(); // refresh
                    } else {
                        alert("Error: " + (resData.message || "Failed to cancel ride"));
                    }
                } catch (err) {
                    console.error("Cancel error:", err);
                    alert("Cancel request failed. Check console.");
                }
            });
        });

        // Ride History (completed, cancelled)
        const historyRides = rides.filter(r =>
            ["completed", "cancelled"].includes(r.ride_status)
        );

        if (historyRides.length) {
            rideHistoryList.innerHTML = "";
            for (const ride of historyRides) {
                const rideEl = document.createElement("div");
                rideEl.classList.add("ride-history-item");

                const driverInfo = ride.Driver
                    ? `<p><strong>Driver:</strong> ${ride.Driver.firstname} ${ride.Driver.lastname}</p>
                   <p><strong>Phone:</strong> ${ride.Driver.phone}</p>`
                    : "<p><strong>Driver:</strong> Not Assigned</p>";

                const vehicleInfo = ride.Vehicle
                    ? `<p><strong>Vehicle:</strong> ${ride.Vehicle.model} (${ride.Vehicle.color})</p>
                   <p><strong>Reg. No:</strong> ${ride.Vehicle.registration_number}</p>`
                    : "<p><strong>Vehicle:</strong> Not Assigned</p>";

                // Fetch rating
                let ratingHtml = "<p><strong>Rating:</strong> Not given</p>";
                let hasRated = false;
                try {
                    const ratingRes = await fetch(`http://localhost:3000/rating/ratings/${ride.ride_id}`, {
                        method: "GET",
                        credentials: "include"
                    });
                    const ratingData = await ratingRes.json();
                    if (ratingRes.ok && ratingData.data) {
                        hasRated = true;
                        ratingHtml = `
                        <p><strong>Rating:</strong> ⭐ ${ratingData.data.score}/5</p>
                        ${ratingData.data.comment ? `<p><strong>Comment:</strong><em>${ratingData.data.comment}</em></p>` : ""}
                    `;
                    }
                } catch (err) {
                    console.error(`Failed to fetch rating for ride ${ride.ride_id}:`, err);
                }

                rideEl.innerHTML = `
                <p><strong>Pickup:</strong> ${ride.pickup_address}</p>
                <p><strong>Drop:</strong> ${ride.dropoff_address}</p>
                <p><strong>Status:</strong> ${ride.ride_status}</p>
                ${driverInfo}
                ${vehicleInfo}
                ${ratingHtml}
                ${ride.ride_status === "completed" && !hasRated
                        ? `<button class="rate-ride-btn" data-ride-id="${ride.ride_id}">Rate Ride</button>`
                        : ""}
            `;
                rideHistoryList.appendChild(rideEl);
            }
            document.querySelectorAll(".rate-ride-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const rideId = e.target.dataset.rideId;
                    modal.style.display = "block";

                    submitBtn.onclick = async () => {
                        const score = parseInt(ratingInput.value);
                        const comment = reviewInput.value;

                        if (!score || score < 1 || score > 5) {
                            alert("Rating must be between 1 and 5");
                            return;
                        }

                        try {
                            const res = await fetch("http://localhost:3000/rating/ratings", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ rideid: rideId, score, comment })
                            });
                            const resData = await res.json();
                            console.log(resData);
                            if (resData.message) {
                                alert("Rating submitted ✅");
                                modal.style.display = "none";
                                loadRequestedRides(); // refresh ride history
                            } else {
                                alert("Failed to submit rating: " + (resData.message || ""));
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Error submitting rating. Check console.");
                        }
                    };
                });
            });
            closeModal.onclick = () => { modal.style.display = "none"; };
            window.onclick = (event) => { if (event.target === modal) modal.style.display = "none"; };
        }
        else {
            rideHistoryList.innerHTML = '<p class="no-rides">No ride history.</p>';
        }
    } catch (err) {
        console.error("Failed to load requested rides:", err);
        ridesList.innerHTML = '<p class="no-rides">Failed to load rides.</p>';
        rideHistoryList.innerHTML = '<p class="no-rides">Failed to load ride history.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadRequestedRides();
});