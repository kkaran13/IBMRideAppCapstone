import express from "express";
import RideController from "../controllers/RideController.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Rider Routes
router.post("/", authenticateJWT, authorizeRole(["rider"]), RideController.createRide);
router.get("/ongoing/rider", authenticateJWT, authorizeRole(["rider"]), RideController.getOngoingRidesForRider);
router.post("/cancel/:id", authenticateJWT, authorizeRole(["rider", "driver"]), RideController.cancelRide);
router.get("/", authenticateJWT, authorizeRole(["rider", "driver"]), RideController.listRides);

// Driver Routes
router.get("/available", authenticateJWT, authorizeRole(["driver"]), RideController.getAvailableRides);
router.get("/ongoing/driver", authenticateJWT, authorizeRole(["driver"]), RideController.getOngoingRides);
router.get("/history/driver", authenticateJWT, authorizeRole(["driver"]), RideController.getRideHistory);
router.post("/accept/:id", authenticateJWT, authorizeRole(["driver"]), RideController.acceptRide);
router.post("/driver-arrive/:id", authenticateJWT, authorizeRole(["driver"]), RideController.driverArriveRide);
router.post("/start/:id", authenticateJWT, authorizeRole(["driver"]), RideController.startRide);
router.post("/complete/:id", authenticateJWT, authorizeRole(["driver"]), RideController.completeRide);
router.post("/reject/:id", authenticateJWT, authorizeRole(["driver"]), RideController.rejectRide);

// Admin Routes (keep them below or grouped separately)
router.get("/all", authenticateJWT, authorizeRole(["admin"]), RideController.getAllRides);
router.post("/force-cancel/:id", authenticateJWT, authorizeRole(["admin"]), RideController.forceCancelRide);
router.delete("/:id", authenticateJWT, authorizeRole(["admin"]), RideController.deleteRide);

// Rider/Driver specific route by id (generic param route) — place AFTER specific routes
router.get("/:id", authenticateJWT, authorizeRole(["rider", "driver", "admin"]), RideController.getRide);

export default router;