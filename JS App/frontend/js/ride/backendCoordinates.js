export async function handleFareRide() {
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');

    const pickupQuery = pickupInput.value.trim();
    const dropoffQuery = dropoffInput.value.trim();

    if (!pickupQuery || !dropoffQuery) {
        alert('Please enter both pickup and dropoff locations before starting a ride.');
        return null;
    }

    if (!window.uberMapInstance) {
        alert('Map is not ready yet.');
        return null;
    }

    const pickupData = await window.uberMapInstance.getCoordinates(pickupQuery, pickupInput);
    const dropoffData = await window.uberMapInstance.getCoordinates(dropoffQuery, dropoffInput);

    if (!pickupData || !dropoffData) {
        alert('Could not fetch coordinates. Please check the addresses.');
        return null;
    }

    return {
        pickupLat: pickupData.coords[1],
        pickupLng: pickupData.coords[0],
        dropoffLat: dropoffData.coords[1],
        dropoffLng: dropoffData.coords[0]
    };
}

export async function handleRequestRide() {
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');

    const pickupQuery = pickupInput.value.trim();
    const dropoffQuery = dropoffInput.value.trim();

    if (!pickupQuery || !dropoffQuery) {
        alert('Please enter both pickup and dropoff locations before requesting a ride.');
        return null;
    }

    if (!window.uberMapInstance) {
        alert('Map is not ready yet.');
        return null;
    }

    const pickupData = await window.uberMapInstance.getCoordinates(pickupQuery, pickupInput);
    const dropoffData = await window.uberMapInstance.getCoordinates(dropoffQuery, dropoffInput);

    if (!pickupData || !dropoffData) {
        alert('Could not fetch coordinates. Please check the addresses.');
        return null;
    }

    // build payload in the exact format your API wants
    return {
        pickup_address: pickupQuery,
        pickup_latitude: pickupData.coords[1],
        pickup_longitude: pickupData.coords[0],
        dropoff_address: dropoffQuery,
        dropoff_latitude: dropoffData.coords[1],
        dropoff_longitude: dropoffData.coords[0]
    };
}