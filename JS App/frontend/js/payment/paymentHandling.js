document.getElementById("payBtn").onclick = async function () {
    console.log("Clicked Now");

    const payload = {
        wallet_id: "b6260927-a693-4e96-8c74-9fb7ba67c16d",
        ride_id: "r3333333-3333-3333-3333-333333333333",
        rider_id: "1a111111-1111-1111-1111-111111111111",
        driver_id: "4d444444-4444-4444-4444-444444444444",
        amount: 100.00,
        payment_method: "CARD"
    };

    try {
        // 1️⃣ Create Razorpay Order
        const response = await fetch("/payment/create-order/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
            alert("Failed to create order: " + (data.error || "Unknown error"));
            return;
        }

        const options = {
            key: data.razorpay_key_id,
            amount: data.amount,
            currency: data.currency,
            name: "Test Ride App",
            description: "Test Payment",
            order_id: data.order_id,
            handler: async function (res) {
                try {
                    // 2️⃣ Verify payment
                    const verifyResponse = await fetch("/payment/verify-payment/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: res.razorpay_order_id,
                            razorpay_payment_id: res.razorpay_payment_id,
                            razorpay_signature: res.razorpay_signature,
                            payment_id: data.payment_id  // Pass the exact Payment ID
                        })
                    });

                    const verifyData = await verifyResponse.json();
                    if (verifyResponse.ok) {
                        alert("Payment successful: " + verifyData.message);
                    } else {
                        alert("Payment verification failed: " + (verifyData.error || "Unknown error"));
                    }
                } catch (err) {
                    console.error("Verification error:", err);
                    alert("Error verifying payment.");
                }
            },
            prefill: {
                name: "Test User",
                email: "test@example.com",
                contact: "9999999999"
            },
            theme: { color: "#3399cc" },
            modal: { escape: true, backdropclose: false }
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error("Error creating order:", error.response || error.message || error);
        alert("An error occurred while creating order.");
    }
};
