import express from "express";
import VehicleController from "../controllers/VehicleController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();


router.use(authenticateJWT, authorizeRole("driver"));

// Vehicle management
router.post("/register", VehicleController.registerVehicle);
router.patch("/update/:id", VehicleController.updateVehicle);
router.patch("/deactivate/:id", VehicleController.deactivateVehicle);

// Admin or driver himself can view vehicles by driver
router.get("/driver/:driverId", authenticateJWT, authorizeRole(["driver", "admin"]), VehicleController.getVehiclesByDriver);

export default router;
