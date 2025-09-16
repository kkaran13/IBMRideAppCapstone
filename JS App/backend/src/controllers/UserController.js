import path from "path";
import fs from "fs";
import { asyncHandler } from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import UserService from "../services/UserService.js";


class UserController {
  register = asyncHandler(async (req, res) => {
    const user = await UserService.startRegistration(req.body, req.files, req);
    return res.status(200).json(new ApiResponse(200, null, "OTP sent to email. Please verify."));
  });

  recoverAccount = asyncHandler(async (req, res) => {
    const response = await UserService.recoverAccount(req.body.email, req);
    return res
      .status(200)
      .json(new ApiResponse(200, response, "Recovery OTP sent to email"));
  });

  verifyOtp = asyncHandler(async (req, res) => {
    const result = await UserService.verifyEmailOtp(req)
    return res.status(201).json(new ApiResponse(200, result, "Email Verfied."))
  })


 adminLogin=asyncHandler(async (req, res) => {
    const result = await UserService.loginAdmin(req.body);
    console.log(result)
    // result = { user, accessToken, cookieOptions }
    res.cookie("access_token", result.accessToken, result.cookieOptions);

    return res.status(200).json(
      new ApiResponse(
        200,
        { user: result.user, accessToken: result.accessToken },
        "Login successful"
      )
    );
  })

  login = asyncHandler(async (req, res) => {
    const result = await UserService.loginUser(req.body);

    // service returns: { user, accessToken, cookieOptions }
    res.cookie("access_token", result.accessToken, result.cookieOptions);

    // User details cookie (readable on frontend)
    res.cookie("user_info", JSON.stringify({
        id: result.user.user_id,
        firstname: result.user.firstname,
        lastname: result.user.lastname,
        email: result.user.email,
        role : result.user.role
    }), {
        httpOnly: false, // frontend can read this
        secure: process?.env?.NODE_ENV === "production" || false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, "Login successful"));
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const result = await UserService.forgotPassword(req);

    return res
      .status(result.statusCode || 200)
      .json(new ApiResponse(200, null, "Otp Sent to your email"));
  });

  verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
    const result = await UserService.verifyForgotPasswordOtp(req);
    return res.status(200).json(200, null, "Otp verified successfully");
  });

  resetPassword = asyncHandler(async (req, res) => {
    const result = await UserService.resetPassword(req);
    return res.status(200).json(200, null, "Password reset successfully");
  });

  logout = asyncHandler(async (req, res) => {
    await UserService.logoutUser(res); // service handles cookie clearing
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  });

  updateUser = asyncHandler(async (req, res) => {
    const result = await UserService.updateProfile(req);
    return res.status(201).json(new ApiResponse(200, result, "profile updated successfully"))
  })

  profile = asyncHandler(async (req, res) => {
    const result = await UserService.getProfile(req)
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Profile fetched.."));
  })

  deactivateUser = asyncHandler(async (req, res) => {
    const result = await UserService.deactivateUser(req);
    return res
      .status(200)
      .json(new ApiResponse(200, result, "User deactivated successfully"));
  });

  // Controller to handle user location update
  udpateUserLocation = asyncHandler(async (req, res) => {
    // Call service function to update location in Redis
    const result = await UserService.updateUserLocation(req);

    // Send success response back to client
    return res
      .status(201)
      .json(new ApiResponse(200, result, "Location updated succesfully"));
  });

  userRides = asyncHandler(async (req, res) => {
    // totalDays can come from query params, default to 14
    const totalDays = parseInt(req.query.totalDays) || 14;

    // Call service to generate the ZIP and return its path
    const zipPath = await UserService.exportUserRides(req.user.id, totalDays);

    // Respond with a success message and the path (or URL if you host it)
    return res
      .status(200)
      .json(new ApiResponse(200, { zipPath }, "User rides exported successfully"));
  })

  // controllers/userController.js
  getAllUser = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await UserService.getAllUsers(page, limit);

    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users fetched successfully"));
  });

  getPendingVerifications = asyncHandler(async (req, res) => {
    const result = await UserService.getPendingVerifications();
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Pending verifications fetched"));
  });

  // Approve user verification
  approveUserVerification = asyncHandler(async (req, res) => {

    const result = await UserService.approveUserVerification(req);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "User verification approved"));
  });


  rejectUserVerification = asyncHandler(async (req, res) => {
    const result = await UserService.rejectUserVerification(req);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "User verification rejected"));
  })

  adminRegister=asyncHandler(async (req, res) => {
    const result = await UserService.AdminRegister(req.body);
    console.log(result) 
    return res.status(200).json(
      new ApiResponse(
        200,
        { user: result.user, accessToken: result.accessToken },
        "Admin Register Successfull"
      )
    );
  })
}
export default new UserController();
