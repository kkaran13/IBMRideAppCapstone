import Rating from "../models/Rating.js";

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
