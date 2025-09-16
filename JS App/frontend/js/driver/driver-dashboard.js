import { AuthUtils } from "../user/auth-utils.js";

let currentRide = null; // global ride object

document.addEventListener("DOMContentLoaded", async function () {
    // const authToken = AuthUtils.getAuthToken();
    // if (!authToken) {
    //     window.location.href = "../user/login.html";
    // }

    const loggedInUser = AuthUtils.getUserInfo();
    if (!loggedInUser) {
        window.location.href = "../user/login.html";
        return;
    }

    // navbar placeholder
    const navbarContainer = document.getElementById("navbar-placeholder");
    fetch("driver-navbar.html")
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not OK");
            return response.text();
        })
        .then((html) => {
            navbarContainer.innerHTML = html;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "../../css/driver/driver-navbar.css";
            document.head.appendChild(link);
        })
        .catch((error) => console.error("Error loading the navbar:", error));

    // footer placeholder
    const footerContainer = document.getElementById("footer-placeholder");
    fetch("driver-footer.html")
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not OK");
            return response.text();
        })
        .then((html) => {
            footerContainer.innerHTML = html;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "../../css/driver/driver-footer.css";
            document.head.appendChild(link);
        })
        .catch((error) => console.error("Error loading the footer:", error));

    // Extract user details
    const userId = loggedInUser?.id || null;
    const firstname = loggedInUser?.firstname || "Driver";
    const lastname = loggedInUser?.lastname || "User";
    const username = firstname + " " + lastname;

    // Update welcome message
    const heroHeading = document.querySelector(".hero-text h2");
    if (heroHeading) {
        heroHeading.textContent = `Welcome, ${username} 👋`;
    }

    try {
        // 1. Vehicle info
        const vehicleRes = await AuthUtils.apiRequest(
            AuthUtils.API_ENDPOINTS.getActiveVehicle,
            { method: "GET" }
        );
        if (vehicleRes.success && vehicleRes.data?.data) {
            const vehicle = vehicleRes.data.data;
            const vehicleInfoElement = document.querySelector(
                ".cards .card:nth-child(1) p"
            );
            if (vehicleInfoElement) {
                vehicleInfoElement.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`;
            }
        }

        // 2. Wallet info
        const walletUrl = AuthUtils.API_ENDPOINTS.getDriverWalletDetails.replace(
            ":driver_id",
            encodeURIComponent(userId)
        );
        const walletRes = await AuthUtils.apiRequest(walletUrl, { method: "GET" });
        if (walletRes.success && walletRes.data?.data) {
            const wallet = walletRes.data.data;
            const totalElement = document.getElementById("wallet-total");
            const availableElement = document.getElementById("wallet-available");
            if (totalElement) {
                totalElement.textContent =
                    wallet.totalBalance?.toLocaleString("en-IN") || "0";
            }
            if (availableElement) {
                availableElement.textContent =
                    wallet.actualBalance?.toLocaleString("en-IN") || "0";
            }
        }

        // 3. Ongoing rides (initial load)
        await refreshRideCard();
    } catch (err) {
        console.error("Failed to load dashboard data:", err);
    }

    // Start Driving button
    const startDrivingBtn = document.getElementById("start-driving-btn");
    if (startDrivingBtn) {
        const userProfileData = await AuthUtils.apiRequest(
            AuthUtils.API_ENDPOINTS.getUserProfile,
            { method: "GET" }
        );
        if (userProfileData?.success && userProfileData.data?.data) {
            if (userProfileData.data.data.isAvailable) {
                startDrivingBtn.textContent = "Stop Driving";
                startDrivingBtn.classList.remove("primary");
                startDrivingBtn.classList.add("danger");
            } else {
                startDrivingBtn.textContent = "Start Driving";
                startDrivingBtn.classList.remove("danger");
                startDrivingBtn.classList.add("primary");
            }
        }

        startDrivingBtn.addEventListener("click", async () => {
            const driverId = loggedInUser?.id;
            if (!driverId) {
                alert("User not authenticated");
                return;
            }

            try {
                const isStarting =
                    startDrivingBtn.textContent.trim() === "Start Driving";

                const res = await AuthUtils.apiRequest(
                    AuthUtils.API_ENDPOINTS.setDriverAvailableForRide,
                    {
                        method: "POST",
                        body: JSON.stringify({ isAvailable: isStarting }),
                    }
                );

                if (res.success && res.status === 200) {
                    if (isStarting) {
                        startDrivingBtn.textContent = "Stop Driving";
                        startDrivingBtn.classList.remove("primary");
                        startDrivingBtn.classList.add("danger");
                        alert("Driving session started!");
                    } else {
                        startDrivingBtn.textContent = "Start Driving";
                        startDrivingBtn.classList.remove("danger");
                        startDrivingBtn.classList.add("primary");
                        alert("Driving session stopped!");
                    }
                } else {
                    alert("Something went wrong.");
                }
            } catch (error) {
                console.error("Failed to toggle driving state:", error);
                alert("Failed to update driving state. Please try again.");
            }
        });
    }
});

/* ---------- Ride Card Helpers ---------- */
async function refreshRideCard() {
    const ongoingRideCard = document.getElementById("ongoing-ride-card");
    if (!ongoingRideCard) return;

    try {
        const ridesRes = await AuthUtils.apiRequest(
            AuthUtils.API_ENDPOINTS.getOngoingRidesDriver,
            { method: "GET" }
        );
        console.log(ridesRes);
        

        if (ridesRes.success && ridesRes.data?.data) {
            const ride = ridesRes.data.data;
            currentRide = ride;

            // Update ride info
            document.getElementById("rider-name").textContent = ride.riderName || "Unknown";
            document.getElementById("pickup-location").textContent = ride.pickup_address || "-";
            document.getElementById("drop-location").textContent = ride.dropoff_address || "-";
            document.getElementById("ride-fare").textContent = ride.fare || "0";

            function toSentenceCase(str) {
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }
            document.getElementById("ride-status").textContent = ride.ride_status ? toSentenceCase(ride.ride_status) : "-";

            toggleRideUI(ride.ride_status);
        } else {
            ongoingRideCard.querySelector(".ride-actions").innerHTML = "<p>No rides currently.</p>";
            currentRide = null;
        }
    } catch (err) {
        console.error("Failed to refresh ride:", err);
    }
}

function toggleRideUI(status) {
    const otpField = document.getElementById("entered-otp");
    const arrivedBtn = document.getElementById("arrived-btn");
    const startBtn = document.getElementById("start-ride-btn");
    const cancelBtn = document.getElementById("cancel-ride-btn");
    const cancelReasonInput = document.getElementById("cancel-reason");
    const completeBtn = document.getElementById("complete-ride-btn");
    const mapLinkBtn = document.getElementById("maps-link");

    [otpField, arrivedBtn, startBtn, cancelReasonInput, cancelBtn, completeBtn, mapLinkBtn].forEach(
        (el) => el?.classList.add("hidden")
    );
    console.log(status , "wadfasdfas");
    

    switch (status) {
        case "accepted":
            arrivedBtn.classList.remove("hidden");
            cancelReasonInput.classList.remove("hidden");
            cancelBtn.classList.remove("hidden");
            break;
        case "driver_arrived":
            otpField.classList.remove("hidden");
            startBtn.classList.remove("hidden");
            cancelReasonInput.classList.remove("hidden");
            cancelBtn.classList.remove("hidden");
            break;
        case "ongoing":
            completeBtn.classList.remove("hidden");
            mapLinkBtn.classList.remove("hidden");
            break;
    }
}

/* ---------- Ride Action Buttons ---------- */
const arrivedBtn = document.getElementById("arrived-btn");
const startBtn = document.getElementById("start-ride-btn");
const cancelBtn = document.getElementById("cancel-ride-btn");
const cancelReasonInput = document.getElementById("cancel-reason");
const completeBtn = document.getElementById("complete-ride-btn");
const enteredOtp = document.getElementById("entered-otp");

arrivedBtn?.addEventListener("click", async () => {
    if (!currentRide) return alert("No active ride found.");

    try {
        const url = AuthUtils.API_ENDPOINTS.driverArrived.replace(
            ":id",
            encodeURIComponent(currentRide.ride_id)
        );
        const res = await AuthUtils.apiRequest(url, { method: "POST" });

        if (res.success) {
            alert("Marked as arrived!");
            await refreshRideCard();
        } else {
            alert(res.error || "Failed to mark arrived.");
        }
    } catch (err) {
        console.error(err);
    }
});

startBtn?.addEventListener("click", async () => {
    if (!currentRide) return alert("No active ride found.");

    if (!enteredOtp.value) return alert("Please enter the OTP!");

    try {
        const url = AuthUtils.API_ENDPOINTS.startRide.replace(
            ":id",
            encodeURIComponent(currentRide.ride_id)
        );
        const res = await AuthUtils.apiRequest(url, {
            method: "POST",
            body: JSON.stringify({ otp: enteredOtp.value }),
        });

        if (res.success) {
            alert("Ride started!");
            await refreshRideCard();
        } else {
            alert(res.error || "Failed to start ride.");
        }
    } catch (err) {
        console.error(err);
    }
});

cancelBtn?.addEventListener("click", async () => {
    if (!currentRide) return alert("No active ride found.");

    const reason = cancelReasonInput.value.trim();
    if (!reason) {
        alert("Please provide a reason for cancellation.");
        return;
    }

    try {
        const url = AuthUtils.API_ENDPOINTS.cancelRide.replace(
            ":id",
            encodeURIComponent(currentRide.ride_id)
        );
        const cancelRideRes = await AuthUtils.apiRequest(url, { 
            method: "POST",
            body : JSON.stringify({reason})
        });

        if (cancelRideRes.success) {
            alert("Ride cancelled.");
            await refreshRideCard();
        } else {
            alert(cancelRideRes.error || "Failed to cancel ride.");
        }
    } catch (err) {
        console.error(err);
    }
});

completeBtn?.addEventListener("click", async () => {
    if (!currentRide) return alert("No active ride found.");

    try {
        const url = AuthUtils.API_ENDPOINTS.completeRide.replace(
            ":id",
            encodeURIComponent(currentRide.ride_id)
        );
        const res = await AuthUtils.apiRequest(url, { method: "POST", body : {...currentRide} });

        if (res.success) {
            alert("Ride completed!");
            await refreshRideCard();
        } else {
            alert(res.error || "Failed to complete ride.");
        }
    } catch (err) {
        console.error(err);
    }
});