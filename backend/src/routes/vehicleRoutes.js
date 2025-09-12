import express from "express";
import VehicleController from "../controllers/VehicleController.js";
// import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Vehicle management
router.post("/register", VehicleController.registerVehicle);
router.put("/update/:id", VehicleController.updateVehicle);
router.delete("deactivate/:id", VehicleController.deactivateVehicle);


router.get("/driver/:driverId", VehicleController.getVehiclesByDriver);

export default router;
