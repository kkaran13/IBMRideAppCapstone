import VehicleRepository from "../repositories/VehicleRepository.js";
//import User from "../models/user.js";
import ApiError from "../utils/ApiError.js";

class VehicleService {
  async registerVehicle(data) {
    const { owner_id, registration_number } = data;

    
    // Check driver exists
    // const owner = await User.findByPk(owner_id);
    // if (!owner || owner.role !== "driver") {
    //   throw new ApiError(400, "Invalid owner. Must be a driver.");
    // }

    // Check duplicate reg. number
    const existing = await VehicleRepository.findByRegNumber(registration_number);
    if (existing) {
      throw new ApiError(400, "Vehicle with this registration already exists");
    }

    return await VehicleRepository.createVehicle(data);
  }

  async updateVehicle(id, data) {
    const updated = await VehicleRepository.updateVehicle(id, data);
    if (!updated) throw new ApiError(404, "Vehicle not found");
    return updated;
  }

  async deactivateVehicle(id) {
    const deactivated = await VehicleRepository.softDeleteVehicle(id);
    if (!deactivated) throw new ApiError(404, "Vehicle not found");
    return deactivated;
  }

  async getVehiclesByDriver(driverId) {
    return await VehicleRepository.findByOwner(driverId);
  }
}

export default new VehicleService();
