import Rating from "../models/Rating.js";
// src/repositories/ride.repository.js
import Ride from "../models/Ride.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";

class RatingRepository {
  async insertRating(ratingData) {
    const rating = new Rating(ratingData);
    return await rating.save();
  }

   async deleteRating(ratingId) {
        // returns the deleted document (or null if none)
        return await Rating.findOneAndDelete({ rating_id: ratingId });
    }

  async findById(rating_id) {
    return await Rating.findOne({ rating_id }).lean();
  }

  // Get rating for a specific ride
  async getRatingByRide(ride_id) {
    return await Rating.findOne({ ride_id }).lean();
  }


 async getCompletedRides() {
    return await Ride.findAll({
      where: { ride_status: "completed" },
      include: [
        {
          model: User,
          as: "Rider",
          attributes: ["user_id", "firstname", "lastname", "email"],
        },
        {
          model: User,
          as: "Driver",
          attributes: ["user_id", "firstname", "lastname", "email"],
        },
        {
          model: Vehicle,
          // ✅ Only request columns that exist in DB
          attributes: ["vehicle_id"], 
        },
      ],
    });
  }

  async findByDriverId(driverId) {
        return await Rating.find({ driver_id: driverId }).sort({ timestamp: -1 });
    }

  // Calculate average rating of a driver
  async getAverageDriverRating(driver_id) {
    const result = await Rating.aggregate([
      { $match: { driver_id } },
      { $group: { _id: "$driver_id", avgRating: { $avg: "$score" } } },
    ]);
    return result.length > 0 ? result[0].avgRating : null;
  }
}

export default new RatingRepository();
