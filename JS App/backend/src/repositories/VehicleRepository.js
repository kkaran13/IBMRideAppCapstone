import Vehicle from "../models/Vehicle.js";
import { Op } from "sequelize";

class VehicleRepository {
  async createVehicle(data) {
    return await Vehicle.create(data);
  }

  async findById(id) {
    return await Vehicle.findByPk(id);
  }

  async findByRegNumber(registration_number) {
    return await Vehicle.findOne({ where: { registration_number } });
  }

  async findByOwner(ownerId) {
    return await Vehicle.findAll({ where: { owner_id: ownerId } });
  }

  async updateVehicle(id, data) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) return null;
    return await vehicle.update(data);
  }

  // Soft delete
  async softDeleteVehicle(id) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) return null;
    return await vehicle.update({
      status: "inactive",
      is_deleted: true,
    });
  }

   async updateAllByOwnerExcept(ownerId, excludeVehicleId, updateFields) {
    return await Vehicle.update(updateFields, {
      where: {
        owner_id: ownerId,
        vehicle_id: { [Op.ne]: excludeVehicleId }
      }
    });
  }

  async findByOwnerAndId(ownerId, vehicleId, options = {}) {
  return await Vehicle.findOne({
    where: { owner_id: ownerId, vehicle_id: vehicleId },
    ...options,
  });
}


  // Reactivate (admin)
  // async reactivateVehicle(id) {
  //   const vehicle = await Vehicle.findByPk(id);
  //   if (!vehicle) return null;
  //   return await vehicle.update({
  //     status: "active",
  //     is_deleted: false,
  //   });
  // }
}

export default new VehicleRepository();
