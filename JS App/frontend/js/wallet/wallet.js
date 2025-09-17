import { AuthUtils } from "../user/auth-utils.js";

const userInfo = AuthUtils.getUserInfo();
console.log(AuthUtils.getUserInfo());


if (userInfo && userInfo.id) {
    const driverId = userInfo.id;

    // Build the API URL using the endpoint template
    const apiUrl = AuthUtils.API_ENDPOINTS.getDriverWalletDetails.replace(":driver_id", driverId);

    // Select the balance element
    const balanceEl = document.getElementById("walletBalance");
    const totalEarningsEl = document.getElementById("totalEarnings");
    console.log("Balance Element:", document.getElementById("walletBalance"));
    console.log("Total Earnings Element:", document.getElementById("totalEarnings"));

    // Fetch the wallet details
    AuthUtils.apiRequest(apiUrl)
            .then(response => {
               if (response.success && response.data && response.data.data) {
                    const data = response.data.data;
                    console.log("Actual Balance Raw:", data.actual_balance);
                    console.log("Total Balance Raw:", data.total_balance);

                    // Update the actual balance
                    balanceEl.textContent = `₹ ${parseFloat(data.actual_balance).toFixed(2)}`;

                    // Update the total balance
                    totalEarningsEl.textContent = `₹ ${parseFloat(data.total_balance).toFixed(2)}`;
                } else {
                    console.error("API error:", response.error);
                    balanceEl.textContent = "Error loading balance";
                    totalEarningsEl.textContent = "Error loading total earnings";
                }
            })
            .catch(error => {
               if (response.success && response.data) {
                    const data = response.data;

                    // Update the actual balance
                    balanceEl.textContent = `₹ ${parseFloat(data.actual_balance).toFixed(2)}`;

                    // Update the total balance
                    totalEarningsEl.textContent = `₹ ${parseFloat(data.total_balance).toFixed(2)}`;
                } else {
                    console.error("API error:", response.error);
                    balanceEl.textContent = "Error loading balance";
                    totalEarningsEl.textContent = "Error loading total earnings";
                }
            });

} else {
        console.error("Unexpected error:", error);
        balanceEl.textContent = "Error loading balance";
        totalEarningsEl.textContent = "Error loading total earnings";
}
