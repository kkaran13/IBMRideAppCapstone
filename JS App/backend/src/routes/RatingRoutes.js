
import express from "express";
import ratingController from "../controllers/RatingController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";


const ratingRouter = express.Router();



//give rating -rider
ratingRouter.post(
  "/ratings",
  authenticateJWT,
  authorizeRole("rider"),
  (req, res) => ratingController.createRating(req, res)
);

//delete given rating- rider
ratingRouter.delete(
  "/ratings/:ratingId",
  authenticateJWT,
  authorizeRole("rider"),
  (req, res) => ratingController.deleteRating(req, res)
);



//get given rating for a ride- rider
ratingRouter.get(
  "/ratings/:id",
  authenticateJWT,
  authorizeRole("rider"),
  (req, res) => ratingController.getRating(req, res)
);

//get avg rating of the driver-rider,driver
ratingRouter.get(
  "/avgrating/:driverId",
  authenticateJWT,authorizeRole("rider","driver"),
  (req, res) => ratingController.getAvgRating(req, res)
);


//get avg rating and all ratings- driver
ratingRouter.get(
  "/driver/ratings",
  authenticateJWT,
  authorizeRole("driver"),
  (req, res) => ratingController.getDriverRatings(req, res)
);



export default ratingRouter;
