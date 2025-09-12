import express from "express";
// import userController from "../controllers/userController.js";
import  { authenticateJWT }  from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public
// router.post("/register", userController.register);       // Rider/Driver/Admin Register
// router.post("/login", userController.login);
// router.post("/forgot-password", userController.forgotPassword);
// router.post("/reset-password", userController.resetPassword);

// // Protected (after login)
// router.get("/profile", authenticateJWT ,userController.getProfile);
// router.put("/update", authenticateJWT, userController.updateUser);
// router.post("/logout", authenticateJWT ,userController.logout);
// router.delete("/deactivate", authenticateJWT, userController.deactivateUser);


export default router;
