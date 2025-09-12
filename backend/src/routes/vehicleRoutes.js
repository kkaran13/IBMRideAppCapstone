import express from "express";
import VehicleController from "../controllers/VehicleController.js";
// import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Vehicle management
router.post("/vehicle", VehicleController.registerVehicle);
router.put("/vehicle/:id", VehicleController.updateVehicle);
router.delete("vehicle/:id", VehicleController.deactivateVehicle);


router.get("/driver/:driverId", VehicleController.getVehiclesByDriver);

export default router;
