import express from "express";
import DriverController from "../controllers/DriverController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const driverRouter = express.Router();

//protected
 driverRouter.use(authenticateJWT, authorizeRole("driver"));

driverRouter.post("/accept", DriverController.acceptRide);
driverRouter.post("/start", DriverController.startRide);
driverRouter.post("/complete", DriverController.completeRide);
driverRouter.post("/cancel", DriverController.cancelRide);

driverRouter.get("/new-rides", DriverController.viewNewRides);
driverRouter.get("/history", DriverController.rideHistory);

export default driverRouter;
