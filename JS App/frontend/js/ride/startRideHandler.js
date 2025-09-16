import { handleFareRide as originalHandleFareRide } from "./backendCoordinates.js";
import { handleRequestRide as originalHandleRequestRide } from "./backendCoordinates.js";

const fareRideBtn = document.getElementById('fareBtn');

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

            latestFare = data.data.fare_estimate.toFixed(2);
        } else {
            alert("Could not calculate fare: " + data.message);
        }
    } catch (error) {
        console.error('Failed to send ride coordinates:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const requestRideBtn = document.getElementById('requestRide');
    const modal = document.getElementById("rideModal");
    const closeModal = document.getElementById("closeModal");

    console.log(requestRideBtn, modal, closeModal); // Debug: should not be null

    requestRideBtn.addEventListener('click', async () => {
        const requestData = await originalHandleRequestRide();
        if (!requestData) return;

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
                document.getElementById("fareText").textContent = data.data?.fare_estimate || "Estimated after ride";

                // Show modal
                modal.style.display = "block";

                loadRequestedRides();
            }
            else{
                alert(data.message || "Something went wrong!");
            }

        } catch (error) {
            console.error('Failed to request ride:', error);
        }
    });

    closeModal.onclick = () => { modal.style.display = "none"; };
    window.onclick = (event) => { if (event.target === modal) modal.style.display = "none"; };
});

// List rides
// Fetch and display requested rides
export async function loadRequestedRides() {
    const ridesList = document.getElementById('ridesList');
    ridesList.innerHTML = '<p class="no-rides">Loading rides...</p>';

    try {
        const response = await fetch('http://localhost:3000/ride/'); // adjust endpoint if needed
        const data = await response.json();

        if (!data.success || !data.data || data.data.length === 0) {
            ridesList.innerHTML = '<p class="no-rides">No rides requested yet.</p>';
            return;
        }

        // Clear existing
        ridesList.innerHTML = '';

        data.data.forEach(ride => {
            const rideEl = document.createElement('div');
            rideEl.classList.add('ride-item');


            if (ride.ride_status == "requested") {
                rideEl.innerHTML = `
                <p><strong>Pickup:</strong> ${ride.pickup_address}</p>
                <p><strong>Drop:</strong> ${ride.dropoff_address}</p>
                <p><strong>Status:</strong> ${ride.ride_status || 'Pending'}</p>
            `;

                ridesList.appendChild(rideEl);
            }
        });
    } catch (err) {
        console.error('Failed to load requested rides:', err);
        ridesList.innerHTML = '<p class="no-rides">Failed to load rides.</p>';
    }
}

// Call this on page load
document.addEventListener('DOMContentLoaded', () => {
    loadRequestedRides();
});