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
        } else {
            alert("Could not calculate fare: " + data.message);
        }
    } catch (error) {
        console.error('Failed to send ride coordinates:', error);
    }
});

const requestRideBtn = document.getElementById('requestRide');

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
    } catch (error) {
        console.error('Failed to request ride:', error);
    }
});