
import DriverService from "../services/DriverService.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

class DriverController {
  async acceptRide(req, res, next) {
    try {
      const { rideId, vehicleId } = req.body;
      if (!rideId || !vehicleId) throw new ApiError(400, "rideId and vehicleId are required");

      const driverId = req.user.user_id; // UUID from token
      const ride = await DriverService.acceptRide(driverId, rideId, vehicleId);

      return res.json(new ApiResponse(200, ride, "Ride accepted successfully"));
    } catch (err) {
      next(err);
    }
  }

  async startRide(req, res, next) {
    try {
      const { rideId, otp } = req.body;
      if (!rideId || !otp) throw new ApiError(400, "rideId and otp are required");

      const driverId = req.user.user_id;
      const ride = await DriverService.startRide(driverId, rideId, otp);

      return res.json(new ApiResponse(200, ride, "Ride started successfully"));
    } catch (err) {
      next(err);
    }
  }

  async completeRide(req, res, next) {
    try {
      const { rideId } = req.body;
      if (!rideId) throw new ApiError(400, "rideId is required");

      const driverId = req.user.user_id;
      const ride = await DriverService.completeRide(driverId, rideId);

      return res.json(new ApiResponse(200, ride, "Ride completed successfully"));
    } catch (err) {
      next(err);
    }
  }

  async cancelRide(req, res, next) {
    try {
      const { rideId, reason } = req.body;
      if (!rideId) throw new ApiError(400, "rideId is required");

      const driverId = req.user.user_id;
      const ride = await DriverService.cancelRide(driverId, rideId, reason);

      return res.json(new ApiResponse(200, ride, "Ride cancelled successfully"));
    } catch (err) {
      next(err);
    }
  }

  async viewNewRides(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const rides = await DriverService.viewNewRides(parseInt(limit));

      return res.json(new ApiResponse(200, rides, "Available rides fetched"));
    } catch (err) {
      next(err);
    }
  }

  async rideHistory(req, res, next) {
    try {
        const driverId = req.user.user_id;
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const rides = await DriverService.rideHistory(driverId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        startDate,
        endDate,
        });

        return res.json(new ApiResponse(200, rides, "Ride history fetched"));
    } catch (err) {
        next(err);
    }
    }

}

export default new DriverController();
