import RatingService from "../services/RatingService.js";

class RatingController {
    async createRating(req, res) {
        try {
            const result = await RatingService.createRating(req.body);
            return res.status(result.status).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({ error: error.message || error });
        }
    }

    async getRating(req, res) {
        try {
            const result = await RatingService.getRating(req.params.id);
            return res.status(result.status).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({ error: error.message || error });
        }
    }



 async getRideAndRating(req, res) {
    
    try {
      const result = await ratingService.getRideAndRating();
      return res.status(result.status).json(result);
    } catch (error) {
      console.error(" Error in RatingController:", error);
      return res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal Server Error",
      });
    }
  }

    async getAvgRating(req, res) {
        try {
            const result = await RatingService.getAverageDriverRating(req.params.driverId);
            return res.status(result.status).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({ error: error.message || error });
        }
    }

   async getDriverRatings(req, res) {
        try {
            const currentUserId = req.user.user_id;
            const result = await RatingService.getDriverRatings(currentUserId, currentUserId);
            return res.status(result.status).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({ error: error.message || error });
        }
    }

    async deleteRating(req, res) {
        try {
            const result = await RatingService.deleteRating(
                req.params.ratingId,
                req.user.user_id 
            );
            return res.status(result.status).json(result);
        } catch (error) {
            return res.status(error.status || 500).json({ error: error.message || error });
        }
    }

   async getRideAndRating(req, res) {
        try {
            const result = await RatingService.getRideAndRating();
            return res.status(result.status).json(result);
        } catch (error) {
            console.error(error);
            return res.status(error.status || 500).json({ error: error.message || error });
        }
    }

}

export default new RatingController();
