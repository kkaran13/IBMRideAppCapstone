async function sendToBackend(coords) {
    console.log("sendtobackendcalled");
    console.log(coords);
    try {
        const response = await axios.post('http://localhost:3000/analysis/fare-cal', coords, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Coordinates sent successfully:', response.data);
    } catch (err) {
        console.error('Failed to send coordinates:', err);
    }
}

export async function handleStartRide() {
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');

    const pickupQuery = pickupInput.value.trim();
    const dropoffQuery = dropoffInput.value.trim();

    if (!pickupQuery || !dropoffQuery) {
        alert('Please enter both pickup and dropoff locations before starting a ride.');
        return;
    }

    if (!window.uberMapInstance) {
        alert('Map is not ready yet.');
        return;
    }

    const pickupData = await window.uberMapInstance.getCoordinates(pickupQuery, pickupInput);
    const dropoffData = await window.uberMapInstance.getCoordinates(dropoffQuery, dropoffInput);

    if (!pickupData || !dropoffData) {
        alert('Could not fetch coordinates. Please check the addresses.');
        return;
    }

    const coords = {
        pickupLat: pickupData.coords[1],
        pickupLng: pickupData.coords[0],
        dropoffLat: dropoffData.coords[1],
        dropoffLng: dropoffData.coords[0]
    };

    sendToBackend(coords);
}