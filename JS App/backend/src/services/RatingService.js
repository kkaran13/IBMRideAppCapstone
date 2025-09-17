import { v4 as uuidv4 } from "uuid";
import ratingRepository from "../repositories/RatingRepository.js";
import rideRepository from "../repositories/RideRepository.js";
import Rating from "../models/Rating.js";

class RatingService {
    async createRating({ rideid, score, comment }) {
        if (!rideid || !score) {
            throw { status: 400, message: "rideid and score are required" };
        }

        const ride = await rideRepository.getRideById(rideid);
        if (!ride) throw { status: 404, message: "Ride not found" };

        if (ride.ride_status !== "completed") {
            throw { status: 400, message: "Rating can only be given after ride completion" };
        }

        if (ride.rating_id) {
            throw { status: 400, message: "Rating already exists for this ride" };
        }

        const rating_id = uuidv4();
        const rating = await ratingRepository.insertRating({
            rating_id,
            rider_id: ride.rider_id,
            driver_id: ride.driver_id,
            ride_id: ride.ride_id,
            score,
            comment,
        });

        await rideRepository.safeUpdateRideFields(rideid, { rating_id });

        return { status: 201, data: rating, message: "Rating created successfully" };
    }

    async getRating(ride_id) {
        // const rating = await ratingRepository.findById(ratingid);
        const rating = await ratingRepository.getRatingByRide(ride_id);
        if (!rating) throw { status: 404, message: "Rating not found" };

        return { status: 200, data: rating, message: "Rating fetched successfully" };
    }

    async getAverageDriverRating(driverId) {
        const avgRating = await ratingRepository.getAverageDriverRating(driverId);
        if (avgRating === null) {
            throw { status: 404, message: "No ratings found for this driver" };
        }
        return { status: 200, data: { driverId, avgRating } };
    }

    async getDriverRatings(driverId, currentUserId) {
        if (driverId !== currentUserId) {
            throw { status: 403, message: "Unauthorized access: You can only view your own ratings" };
        }

        const ratings = await ratingRepository.findByDriverId(driverId);
        const avgRating = await ratingRepository.getAverageDriverRating(driverId);

        return {
            status: 200,
            data: {
                driverId,
                avgRating: avgRating || 0,
                ratings,
            },
        };
    }


    async deleteRating(ratingId, currentUserId) {
        
        const rating = await ratingRepository.findById(ratingId);
        if (!rating) throw { status: 404, message: "Rating not found" };

     
        if (rating.rider_id !== currentUserId) {
            throw { status: 403, message: "Unauthorized: You can only delete your own rating" };
        }

    
        const ride = await rideRepository.getRideById(rating.ride_id);
        if (ride) {
            await rideRepository.safeUpdateRideFields(rating.ride_id, { rating_id: null });
        }

      
        await ratingRepository.deleteRating(ratingId);

        return { status: 200, message: "Rating deleted successfully" };
    }
async getRideAndRating() {
     const rides = await ratingRepository.getCompletedRides();

    if (!rides || rides.length === 0) {
      return { status: 404, message: "No completed rides found", data: [] };
    }

     const rideIds = rides.map((ride) => ride.ride_id);

     const ratings = await Rating.find({ ride_id: { $in: rideIds } });

     const ridesWithRatings = rides.map((ride) => {
      const rating = ratings.find((r) => r.ride_id === ride.ride_id);
      return {
        ...ride.toJSON(),
        rating: rating ? rating : null, 
      };
    });
 

    return {
      status: 200,
      message: "Completed rides with ratings retrieved successfully",
      data: ridesWithRatings,
    };
  }


}

export default new RatingService();
