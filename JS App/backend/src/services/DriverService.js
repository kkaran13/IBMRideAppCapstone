// import { sequelize } from "../config/mysql.js";
import RideRepository from "../repositories/RideRepository.js";
import VehicleRepository from "../repositories/VehicleRepository.js";
import UserRepository from "../repositories/UserRepository.js";
// import deviceTokenService from "./DeviceTokenService.js";
import ApiError from "../utils/ApiError.js";
// import HF from "../utils/HelperFunction.js";

class DriverService {
  // Accept ride
  async acceptRide(driverId, rideId, vehicleId) {
    try {
      const ride = await RideRepository.getRideById(rideId);
      if (!ride) throw new ApiError(404, "Ride not found");
      
      if (ride.ride_status !== "requested") {
        throw new ApiError(409, "Ride is no longer available");
      }

      const driver = await UserRepository.findById(driverId);
      if (!driver) throw new ApiError(404, "Driver not found");

      if (driver.verification_status !== "approved") {
        throw new ApiError(403, "Driver is not verified yet");
        }

     if (driver.account_status !== "active") {
        throw new ApiError(403, "Driver is blocked or deactivated by admin");
        }

      const vehicle = await VehicleRepository.findByOwnerAndId(driverId, vehicleId);
      if (!vehicle || vehicle.status !== "active" || vehicle.is_deleted) {
        throw new ApiError(400, "Vehicle not found or inactive");
      }

      const activeRide = await RideRepository.getActiveRideByDriver(driverId);
      if (activeRide) throw new ApiError(409, "Driver already has an active ride");

      const vehicleActiveRide = await RideRepository.getActiveRideByVehicle(vehicleId);
      if (vehicleActiveRide) throw new ApiError(409, "Vehicle is already assigned to another ride");


      return await RideRepository.safeUpdateRideFields(ride.ride_id, {
            driver_id: driverId,
            vehicle_id: vehicleId,
            ride_status: "accepted",
            accepted_at: new Date(),
            });

      // Notifications
    //   try {
    //     const tokens = await deviceTokenService.getUserTokens(ride.rider_id);
    //     if (tokens?.length) {
    //       await HF.sendFirebasePushNotification(
    //         { title: "Ride Accepted", body: "A driver has accepted your ride." },
    //         tokens
    //       );
    //     }
    //   } catch (err) {
    //     console.warn("Push notification failed after acceptRide:", err.message || err);
    //   }

      // Email
    //   try {
    //     const rider = ride.rider_email ? null : await UserRepository.findById(ride.rider_id);
    //     const riderEmail = ride.rider_email || rider?.email;
    //     if (riderEmail) {
    //       await HF.sendMail({
    //         to: riderEmail,
    //         subject: "Your ride has been accepted",
    //         htmlTemplate: "ride-accepted.html",
    //         templateData: {
    //           rideId: ride.ride_id,
    //           driverName: driver.firstname ? `${driver.firstname} ${driver.lastname || ""}`.trim() : "Your driver",
    //           vehicleReg: vehicle.registration_number || "",
    //         },
    //       });
    //     }
    //   } catch (err) {
    //     console.warn("Email sending failed after acceptRide:", err.message || err);
    //   }

     
    } catch (err) {
      throw err;
    }
  }

  // Start ride (verify OTP)
  async startRide(driverId, rideId, otp) {
    try {
      const ride = await RideRepository.getRideById(rideId);
      if (!ride) throw new ApiError(404, "Ride not found");
      if (ride.driver_id !== driverId) throw new ApiError(403, "Not your ride to start");
      if (ride.ride_status !== "accepted") throw new ApiError(409, "Ride not in accepted state");

      if (!ride.otp) throw new ApiError(400, "OTP not set for ride");
      if (ride.otp !== otp) throw new ApiError(403, "Invalid OTP");


      return await RideRepository.safeUpdateRideFields(ride.ride_id, {
            ride_status: "started",
            started_at: new Date(),
            });

    //   try {
    //     const tokens = await deviceTokenService.getUserTokens(ride.rider_id);
    //     if (tokens?.length) {
    //       await HF.sendFirebasePushNotification(
    //         { title: "Ride Started", body: "Your trip has started." },
    //         tokens
    //       );
    //     }
    //   } catch (err) {
    //     console.warn("Push notification failed after startRide:", err.message || err);
    //   }

      return ride;
    } catch (err) {
      throw err;
    }
  }

  // Complete ride
  async completeRide(driverId, rideId) {
    try {
      const ride = await RideRepository.getRideById(rideId);
      if (!ride) throw new ApiError(404, "Ride not found");
      if (ride.driver_id !== driverId) throw new ApiError(403, "Not your ride to complete");
      if (ride.ride_status !== "started") throw new ApiError(409, "Ride not in progress");

      return await RideRepository.safeUpdateRideFields(ride.ride_id, {
            ride_status: "completed",
            completed_at: new Date(),
            });

    //   try {
    //     const tokens = await deviceTokenService.getUserTokens(ride.rider_id);
    //     if (tokens?.length) {
    //       await HF.sendFirebasePushNotification(
    //         { title: "Ride Completed", body: "Your trip has completed." },
    //         tokens
    //       );
    //     }
    //   } catch (err) {
    //     console.warn("Push notification failed after completeRide:", err.message || err);
    //   }


      //Trigger Payments

    //   try {
    //     const rider = ride.rider_email ? null : await UserRepository.findById(ride.rider_id);
    //     const riderEmail = ride.rider_email || rider?.email;
    //     if (riderEmail) {
    //       await HF.sendMail({
    //         to: riderEmail,
    //         subject: "Your ride is completed",
    //         htmlTemplate: "ride-completed.html",
    //         templateData: { rideId: ride.ride_id, fare: ride.fare || "0.00" },
    //       });
    //     }
    //   } catch (err) {
    //     console.warn("Email sending failed after completeRide:", err.message || err);
    //   }

    } catch (err) {
      throw err;
    }
  }

  // Cancel ride
  async cancelRide(driverId, rideId, reason = "Cancelled by driver") {
    try {
      const ride = await RideRepository.getRideById(rideId);
      if (!ride) throw new ApiError(404, "Ride not found");
      if (ride.driver_id && ride.driver_id !== driverId) {
        throw new ApiError(403, "Not your ride to cancel");
      }
      if (ride.ride_status !== "requested" && ride.ride_status !== "accepted" && ride.ride_status!=="driver_arrived") {
            throw new ApiError(409, "Ride cannot be cancelled at this stage");
            }


      return await RideRepository.safeUpdateRideFields(ride.ride_id, {
            ride_status: "cancelled",
            cancellation_reason: reason,
            cancelled_at: new Date(),
            });

    //   try {
    //     const tokens = await deviceTokenService.getUserTokens(ride.rider_id);
    //     if (tokens?.length) {
    //       await HF.sendFirebasePushNotification(
    //         { title: "Ride Cancelled", body: "Your driver cancelled the ride." },
    //         tokens
    //       );
    //     }
    //   } catch (err) {
    //     console.warn("Push notification failed after cancelRide:", err.message || err);
    //   }

    //   try {
    //     const rider = ride.rider_email ? null : await UserRepository.findById(ride.rider_id);
    //     const riderEmail = ride.rider_email || rider?.email;
    //     if (riderEmail) {
    //       await HF.sendMail({
    //         to: riderEmail,
    //         subject: "Your ride was cancelled",
    //         htmlTemplate: "ride-cancelled.html",
    //         templateData: { rideId: ride.ride_id, reason },
    //       });
    //     }
    //   } catch (err) {
    //     console.warn("Email sending failed after cancelRide:", err.message || err);
    //   }

     
    } catch (err) {
      throw err;
    }
  }

  // View available rides
  async viewNewRides(limit = 20) {
    return await RideRepository.getAvailableRides(limit);
  }

  // Driver's ride history
  async rideHistory(driverId, filters = {}) {
  const { page = 1, limit = 10, status, startDate, endDate } = filters;
  return await RideRepository.getRidesByDriver(driverId, {
    page,
    limit,
    status,
    startDate,
    endDate,
  });
}

}

export default new DriverService();
