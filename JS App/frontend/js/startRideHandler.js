import { handleStartRide as originalHandleStartRide } from "./backendCoordinates";

const startRideBtn = document.getElementById('startRide');

startRideBtn.addEventListener('click', async () => {
    const coords = await originalHandleStartRide();
    if (!coords) return;

    const payload = {
        cords: {
            pickup: [coords.pickupLng, coords.pickupLat],
            drop: [coords.dropoffLng, coords.dropoffLat]
        }
    };

    try {
        const response = await fetch('http://localhost:3000/analysis/fare-cal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Backend response:', data);
    } catch (error) {
        console.error('Failed to send ride coordinates:', error);
    }
});
