import Config from "../config/Config.js";
import redisClient from "../config/redisClient.js";
import RideRepository from "../repositories/RideRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import VehicleRepository from "../repositories/VehicleRepository.js";
import ApiError from "../utils/ApiError.js";
import HelperFunction from "../utils/HelperFunction.js";

class RideService {

    // Rider Methods
    async createRide(data, rider_id, role) {
        const {
            pickup_address,
            pickup_latitude,
            pickup_longitude,
            dropoff_address,
            dropoff_latitude,
            dropoff_longitude,
        } = data;

        // Pickup validation
        const validPickup =
            (pickup_address && !pickup_latitude && !pickup_longitude) || // case 1 & 2
            (!pickup_address && pickup_latitude != null && pickup_longitude != null) || // case 3 & 4
            (pickup_address && pickup_latitude != null && pickup_longitude != null); // case 5

        if (!validPickup) {
            throw new ApiError(
                400,
                "Invalid pickup input. Acceptable: address only, coordinates only, or both."
            );
        }

        // Dropoff validation
        const validDropoff =
            (dropoff_address && !dropoff_latitude && !dropoff_longitude) || // case 1 & 3
            (!dropoff_address && dropoff_latitude != null && dropoff_longitude != null) || // case 2 & 4
            (dropoff_address && dropoff_latitude != null && dropoff_longitude != null); // case 5

        if (!validDropoff) {
            throw new ApiError(
                400,
                "Invalid dropoff input. Acceptable: address only, coordinates only, or both."
            );
        }

        // Rider existence
        const rider = await UserRepository.findById(rider_id);
        if (!rider) throw new ApiError(404, "Rider not found");

        if (role !== "rider") throw new ApiError(403, "Only riders can request rides");

        // Active ride check
        const existingRide = await RideRepository.getActiveRideByRider(rider_id);
        if (existingRide) throw new ApiError(409, "You already have an ongoing ride");

        const pendingPaymentRide = await RideRepository.getCompletedRideWithPendingPayment(rider_id);
        if (pendingPaymentRide) throw new ApiError(409, "You have a completed ride with pending payment. Please pay before booking another ride.");
        
        // Create ride
        return await RideRepository.createRide({
            rider_id,
            driver_id: null,
            vehicle_id: null,
            pickup_address,
            pickup_latitude,
            pickup_longitude,
            dropoff_address,
            dropoff_latitude,
            dropoff_longitude,
            ride_status: "requested",
        });
    }

    async getActiveRide(rider_id) {
        return await RideRepository.getActiveRideByRider(rider_id);
    }

    async getRideHistory(rider_id) {
        const rides = await RideRepository.getRidesByRider(rider_id);
        return rides.filter(r => ["completed", "cancelled"].includes(r.ride_status));
    }

    // Ride Cancel senecio
    // Rider -> requested, accepted, not after started
    // Driver -> accepted, not after started
    async cancelRide(user_id, ride_id, reason, role) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) throw new ApiError(404, "Ride not found");

        if (ride.ride_status === "rejected") {
            throw new ApiError(400, "Rejected ride cannot be modified");
        }

        // Rider rules
        if (role === "rider") {
            if (ride.rider_id !== user_id) throw new ApiError(403, "Not your ride");
            if (!["requested", "accepted"].includes(ride.ride_status)) {
                throw new ApiError(409, "Cannot cancel ride after it has started or completed");
            }
        }

        // Driver rules
        if (role === "driver") {
            if (ride.driver_id !== user_id) throw new ApiError(403, "Not your ride");
            if (ride.ride_status !== "accepted") {
                throw new ApiError(409, "Driver can only cancel ride before it is accepted");
            }
        }

        return await RideRepository.cancelRide(ride_id, reason);
    }

    // Reject Ride
    async rejectRide(user_id, ride_id) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) throw new ApiError(404, "Ride not found");

        if (ride.ride_status === "rejected") {
            throw new ApiError(400, "Ride Already Rejected");
        }

        if (ride.ride_status !== "requested") {
            throw new ApiError(409, "Driver can only reject a ride if it is requested");
        }
        return await RideRepository.rejectRide(user_id, ride_id);
    }

    async getOngoingRidesByRider(rider_id) {
        const ride = await RideRepository.getActiveRideByRider(rider_id);
        if (!ride) throw new ApiError(404, "Ride not found");
        return ride;
    }

    // Driver Methods

    async getAvailableRides() {
        return await RideRepository.getAvailableRides();
    }

    async acceptRide(driver_id, ride_id, vehicle_id) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) throw new ApiError(404, "Ride not found");

        if (ride.ride_status === "rejected") {
            throw new ApiError(400, "Rejected ride cannot be modified");
        }

        if (ride.ride_status !== "requested") throw new ApiError(409, "Ride already accepted");

        const driverBusy = await RideRepository.getActiveRideByDriver(driver_id);
        if (driverBusy) throw new ApiError(409, "Driver already has an ongoing ride");

        const vehicle = await VehicleRepository.findById(vehicle_id);
        if (!vehicle || vehicle.owner_id !== driver_id) {
            throw new ApiError(400, "Invalid vehicle for this driver");
        }

        // Generate a 6 digit OTP
        const otp = "" + Math.floor(100000 + Math.random() * 900000);
        // Assign driver + save OTP in DB
        const rideData = await RideRepository.assignDriverWithOtp(
            ride_id,
            driver_id,
            vehicle_id,
            otp
        );

        // get rider id from ride (ride has rider_id for passenger)
        const riderId = rideData.rider_id;

        const driver = await UserRepository.findById(driver_id);

        // build notification data
        const notificationData = {
            driverName: driver.fullname,
            rideId: ride_id,
            otp: otp,
            ...rideData
        };

        HelperFunction.sendFirebasePushNotification(
            "rideAcceptedToRider",   // template key
            notificationData,        // placeholders
            riderId                  // single user or array of ids
        );
        return rideData;
    }

    async driverArriveRide(driver_id, ride_id) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) throw new ApiError(404, "Ride not found");

        if (ride.ride_status === "rejected") {
            throw new ApiError(400, "Rejected ride cannot be modified");
        }

        if (ride.driver_id !== driver_id) throw new ApiError(403, "Not your ride");
        switch (ride.ride_status) {
            case "accepted":
                // first hit → move to driver_arrived
                return await RideRepository.updateRideStatus(ride_id, "driver_arrived");

            case "driver_arrived":
                // second hit → move to started
                throw new ApiError(409, `Ride cannot be started from current status: ${ride.ride_status}`);

            default:
                throw new ApiError(409, `Ride cannot be started from current status: ${ride.ride_status}`);
        }
    }

    async startRide(driver_id, ride_id, body) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) throw new ApiError(404, "Ride not found");

        let ride_otp = ride.otp || null;
        if (!ride_otp) {
            throw new ApiError(404, "No otp found")
        }

        if (ride_otp !== body.otp) {
            throw new ApiError(400, "OTP didn't match")
        }

        if (ride.ride_status === "rejected") {
            throw new ApiError(400, "Rejected ride cannot be modified");
        }

        if (ride.driver_id !== driver_id) throw new ApiError(403, "Not your ride");
        switch (ride.ride_status) {
            case "driver_arrived":
                // first hit → move to driver_arrived
                return await RideRepository.updateRideStatus(ride_id, "ongoing");

            case "ongoing":
                // second hit → move to started
                throw new ApiError(409, `Ride cannot be started from current status: ${ride.ride_status}`);

            default:
                throw new ApiError(409, `Ride cannot be started from current status: ${ride.ride_status}`);
        }
    }

    async completeRide(driver_id, ride_id, fare, distance, duration) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) throw new ApiError(404, "Ride not found");

        if (ride.ride_status === "rejected") {
            throw new ApiError(400, "Rejected ride cannot be modified");
        }
        if (ride.driver_id !== driver_id) throw new ApiError(403, "Not your ride");

        return await RideRepository.completeRide(ride_id, fare, distance, duration);
    }

    async getOngoingRides(driver_id) {
        const ride = await RideRepository.getActiveRideByDriver(driver_id);
        if (!ride) throw new ApiError(404, "Ride not found");
        return ride;
    }

    async getRideHistoryByDriver(driver_id) {
        return await RideRepository.getRidesByDriver(driver_id);
    }

    // Admin Methods

    async getAllRides(filter = {}) {
        const rides = await RideRepository.getAllRides(filter);
        return rides;
    }

    async forceCancelRide(ride_id, reason) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) {
            throw new ApiError(404, "Ride not found");
        }
        if (ride.ride_status === "rejected" || ride.ride_status === "completed" || ride.ride_status === "cancelled") {
            throw new ApiError(400, `Ride is already ${ride.ride_status}, cannot force cancel.`);
        }

        return await RideRepository.forceCancelRide(ride_id, reason);
    }

    async deleteRide(ride_id) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) {
            throw new ApiError(404, "Ride not found");
        }
        return await RideRepository.deleteRide(ride_id);
    }

    async getRideStats() {
        return await RideRepository.getRideStats();
    }

    async getRide(ride_id, user) {
        const ride = await RideRepository.getRideById(ride_id);
        if (!ride) {
            throw new ApiError(404, "Ride not found");
        }

        // Admin
        if (user.role === "admin") {
            return ride;
        }

        // Rider rule: can only see their own ride
        if (user.role === "rider" && ride.rider_id !== user.id) {
            throw new ApiError(404, "Ride not found");
        }

        // Driver rule: can only see ride if accepted
        if (user.role === "driver" && ride.driver_id !== user.id) {
            throw new ApiError(404, "Ride not found");
        }
        return ride;
    }

    async listRides(user_id, role) {
        if (role === "rider") return await RideRepository.getRidesByRider(user_id);
        if (role === "driver") return await RideRepository.getRidesByDriver(user_id);
        throw new ApiError(403, "Invalid role for listing rides");
    }
}

export default new RideService();