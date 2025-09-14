
import DriverService from "../services/DriverService.js";
import ApiResponse from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asynHandler.js";

class DriverController {
  acceptRide = asyncHandler(async (req, res) => {
    const driverId = req.user.id;
    const ride = await DriverService.acceptRide(driverId, req.body);
    res.status(200).json(new ApiResponse(200, ride, "Ride accepted successfully"));
  });

  startRide = asyncHandler(async (req, res) => {
    const driverId = req.user.id;
    const ride = await DriverService.startRide(driverId, req.body);
    res.status(200).json(new ApiResponse(200, ride, "Ride started successfully"));
  });

  completeRide = asyncHandler(async (req, res) => {
    const driverId = req.user.user_id;
    const ride = await DriverService.completeRide(driverId, req.body);
    res.status(200).json(new ApiResponse(200, ride, "Ride completed successfully"));
  });

  cancelRide = asyncHandler(async (req, res) => {
    const driverId = req.user.user_id;
    const ride = await DriverService.cancelRide(driverId, req.body);
    res.status(200).json(new ApiResponse(200, ride, "Ride cancelled successfully"));
  });

  viewNewRides = asyncHandler(async (req, res) => {
    const rides = await DriverService.viewNewRides(req.query);
    res.status(200).json(new ApiResponse(200, rides, "Available rides fetched"));
  });

  rideHistory = asyncHandler(async (req, res) => {
    const driverId = req.user.user_id;
    const rides = await DriverService.rideHistory(driverId, req.query);
    res.status(200).json(new ApiResponse(200, rides, "Ride history fetched"));
  });

}

export default new DriverController();
