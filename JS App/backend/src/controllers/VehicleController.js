import { asyncHandler } from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import VehicleService from "../services/VehicleService.js";


class VehicleController {
  registerVehicle = asyncHandler(async (req, res) => {

    if (req.user.role !== "driver") {
      throw new ApiError(403, "Only drivers can register vehicles");
    }
    // Force owner_id to be the logged-in driver
    req.body.owner_id = req.user.id; 

    const vehicle = await VehicleService.registerVehicle(req.body);
    res.status(201).json(new ApiResponse(201, vehicle, "Vehicle registered successfully"));
  });

  updateVehicle = asyncHandler(async (req, res) => {
  
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
  const { driverId } = req.params;
  const vehicles = await VehicleService.getVehiclesByDriver(driverId, req.user);

  res.status(200).json(new ApiResponse(200, vehicles, "Vehicles fetched successfully"));
});

  getVehicleById = asyncHandler(async (req, res) => {
    const driverId = req.user.id; 
    const vehicleId = req.params.id;

    const vehicle = await VehicleService.getVehicleById(vehicleId, driverId);

    res.status(200).json(
      new ApiResponse(200, vehicle, "Vehicle details fetched successfully")
    );
  });



  getActiveVehicle = asyncHandler(async (req, res) => {

    const result = await VehicleService.getActiveVehicle(req);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Active Vehicles Data")); 
  
  });


  getMyVehicles = asyncHandler(async (req, res) => {
      const driverId = req.user.id; 
      const { page = 1, limit = 10, status, type, make, model, year, q } = req.query;

      const result = await VehicleService.getMyVehicles(driverId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status,
        type,
        make,
        model,
        year,
        q,
      });

      res.status(200).json(
        new ApiResponse(200, result, "Vehicles fetched successfully")
      );
    });

}

export default new VehicleController();