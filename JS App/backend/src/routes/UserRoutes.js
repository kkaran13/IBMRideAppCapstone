import express from "express";
import userController from "../controllers/UserController.js";
import {uploadMultiple} from "../middlewares/multer.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import UserController from "../controllers/UserController.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();


// Public
router.post("/register", uploadMultiple , userController.register);
router.post("/verify-otp", UserController.verifyOtp)
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-password-otp",userController.verifyForgotPasswordOtp)
router.post("/reset-password", userController.resetPassword);
router.post("/recover-account", userController.recoverAccount);

//Admin Login Route
router.post("/admin/login",authorizeRole("admin"),userController.adminLogin)
router.post("/admin/register",authenticateJWT,authorizeRole("admin"),userController.adminRegister)

// // Protected (after login)
router.get("/profile", authenticateJWT ,userController.profile);
router.put("/update", authenticateJWT,uploadMultiple, userController.updateUser);
router.post("/logout", authenticateJWT ,userController.logout);
router.patch("/deactivate", authenticateJWT, userController.deactivateUser);
router.get("/export-rides", authenticateJWT, UserController.userRides);
router.post("/update-location", authenticateJWT, userController.udpateUserLocation);

// admin protected
router.get("/getalluser",authenticateJWT,authorizeRole(["admin"]),userController.getAllUser)
router.get("/pending-verifications",authenticateJWT,authorizeRole(["admin"]), userController.getPendingVerifications);
router.post("/:id/approve", authenticateJWT,authorizeRole(["admin"]),userController.approveUserVerification);
router.post("/:id/reject", authenticateJWT,authorizeRole(["admin"]),userController.rejectUserVerification);

export default router;