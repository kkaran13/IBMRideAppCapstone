import { asyncHandler } from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import VehicleService from "../services/VehicleService.js";
import UserRepository from "../repositories/UserRepository.js";

class VehicleController {
  registerVehicle = asyncHandler(async (req, res) => {

    if (req.user.role !== "driver") {
      throw new ApiError(403, "Only drivers can register vehicles");
    }
    // Force owner_id to be the logged-in driver
    req.body.owner_id = req.user.id; // JWT contains id of logged-in user

    const vehicle = await VehicleService.registerVehicle(req.body);
    res.status(201).json(new ApiResponse(201, vehicle, "Vehicle registered successfully"));
  });

  updateVehicle = asyncHandler(async (req, res) => {
    // Service will check existence, ownership, and deletion
    const updatedVehicle = await VehicleService.updateVehicle(req.params.id, req.body, req.user);
    res.status(200).json(new ApiResponse(200, updatedVehicle, "Vehicle updated successfully"));
  });

  deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await VehicleService.deleteVehicle(req.params.id, req.user);
    res
      .status(200)
      .json(new ApiResponse(200, vehicle, "Vehicle deleted successfully"));
  });

  getVehiclesByDriver = asyncHandler(async (req, res) => {
    const driver = await UserRepository.findById(req.params.driverId);
    if (!driver || driver.role !== "driver") {
      throw new ApiError(404, "Driver not found");
    }

    // Only admin or the driver himself can view
    if (req.user.role !== "admin" && req.user.id !== driver.uuid) {
      throw new ApiError(403, "You cannot view vehicles of another driver");
    }

    const vehicles = await VehicleService.getVehiclesByDriver(req.params.driverId);
    res.status(200).json(new ApiResponse(200, vehicles, "Vehicles fetched successfully"));
  });

  getActiveVehicle = asyncHandler(async (req, res) => {

    const result = await VehicleService.getActiveVehicle(req);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Active Vehicles Data")); 
  
  });
}

export default new VehicleController();