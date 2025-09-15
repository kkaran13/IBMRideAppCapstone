import VehicleRepository from "../repositories/VehicleRepository.js";
import RideRepository from "../repositories/RideRepository.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import RideRepository from "../repositories/RideRepository.js";

class VehicleService {
  async registerVehicle(data) {
    const {
      owner_id,
      registration_number,
      make,
      model,
      year,
      color,
      vehicle_type,
      status
    } = data;

    // Validate required fields
    if (!owner_id || !registration_number || !make || !model || !year || !color || !vehicle_type) {
      throw new ApiError(400, "Missing required vehicle fields.");
    }

    // Validate owner exists and is a driver
    const owner = await User.findByPk(owner_id);
    if (!owner || owner.role !== "driver") {
      throw new ApiError(400, "Invalid owner. Must be a driver.");
    }

    // Validate vehicle_type
    const allowedTypes = ["hatchback", "sedan", "suv", "auto", "bike"];
    if (!allowedTypes.includes(vehicle_type)) {
      throw new ApiError(400, `Invalid vehicle_type. Must be one of: ${allowedTypes.join(", ")}`);
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1990 || year > currentYear) {
      throw new ApiError(400, `Invalid year. Must be between 1990 and ${currentYear}`);
    }

    // Check duplicate registration number
    const existing = await VehicleRepository.findByRegNumber(registration_number);
    if (existing) {
      throw new ApiError(400, "Vehicle with this registration number already exists.");
    }

    // Default status if not provided
    const vehicleStatus = status || "active";

    // Create vehicle
    return await VehicleRepository.createVehicle({
      owner_id,
      registration_number,
      make,
      model,
      year,
      color,
      vehicle_type,
      status: vehicleStatus,
    });
  }

  async updateVehicle(id, data, currentUser) {
    // First fetch the vehicle
    const vehicle = await VehicleRepository.findById(id);

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    if (currentUser.role === "driver" && currentUser.id !== vehicle.owner_id) {
      throw new ApiError(403, "You cannot update another driver’s vehicle");
    }

    // deleted can't change
    if (vehicle.is_deleted) {
      throw new ApiError(400, "Vehicle is deleted and cannot be updated");
    }

    const updateFields = {};
    if (data.color) updateFields.color = data.color;
    if (data.status) {
      const allowedStatus = ["active", "inactive"];
      if (!allowedStatus.includes(data.status)) {
        throw new ApiError(400, "Invalid status value. Allowed: active, inactive");
      }

      const activeRide = await RideRepository.getActiveRideByDriver(vehicle.owner_id);
      if (activeRide) {
        
        if (data.status === "inactive" && activeRide.vehicle_id === id) {
          throw new ApiError(400, "vehicle is in an ongoing ride");
        }

        if (data.status === "active" && activeRide.vehicle_id !== id) {
          throw new ApiError(400, "cannot change vehicle on ongoing ride");
        }
      }
      
      if (data.status === "active") {
        
        await VehicleRepository.updateAllByOwnerExcept(vehicle.owner_id, id, {
          status: "inactive",
        });
      }

      updateFields.status = data.status;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new ApiError(400, "Nothing to update. Only color or status can be updated.");
    }

    // Update in repository
    const updated = await VehicleRepository.updateVehicle(id, updateFields);

    return updated;
  }

  async deleteVehicle(id, user) {
    const vehicle = await VehicleRepository.findById(id);

    if (!vehicle || vehicle.owner_id !== user.id) {
      throw new ApiError(404, "Vehicle not found");
    }

    if (user.role !== "driver") {
      throw new ApiError(403, "Only drivers can delete vehicles");
    }

    const activeRide = await RideRepository.findActiveRideByVehicleId(id);
    if (activeRide) {
      throw new ApiError(400, "Vehicle cannot be deleted because it has active rides");
    }

    await VehicleRepository.deleteVehicle(id);
    return true;
  }

  async getVehiclesByDriver(driverId) {
    return await VehicleRepository.findByOwner(driverId);
  }
}

export default new VehicleService();
