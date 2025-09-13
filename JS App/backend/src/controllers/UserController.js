import { asyncHandler } from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import UserService from "../services/UserService.js";

class UserController {
  register = asyncHandler(async (req, res) => {
    const user = await UserService.startRegistration(req.body, req.files, req);
    return res.status(200).json(new ApiResponse(200, null, "OTP sent to email. Please verify."));
  });

  verifyOtp = asyncHandler(async (req, res) => {
    const result = await UserService.verifyEmailOtp(req)
    return res.status(201).json(new ApiResponse(200, result, "User created successfully"))
  })

  login = asyncHandler(async (req, res) => {
    const result = await UserService.loginUser(req.body);

    // service returns: { user, accessToken, cookieOptions }
    res.cookie("access_token", result.accessToken, result.cookieOptions);

    return res
      .status(200)
      .json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, "Login successful"));
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const result = await UserService.forgotPassword(req);

    return res
      .status(result.statusCode || 200)
      .json(new ApiResponse(result.statusCode || 200, null, result.message));
  });

  verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
    const result = await UserService.verifyForgotPasswordOtp(req);
    return res.status(result.statusCode || 200).json(result);
  });

  resetPassword = asyncHandler(async (req, res) => {
    const result = await UserService.resetPassword(req);
    return res.status(result.statusCode || 200).json(result);
  });

  logout = asyncHandler(async (req, res) => {
    await UserService.logoutUser(res); // service handles cookie clearing
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  });

  updateUser = asyncHandler(async (req,res) => {
    const result = await UserService.updateProfile(req);
    return res.status(201).json(new ApiResponse(200, result, "profile updated successfully"))
  }) 

  profile = asyncHandler(async (req,res) => {
    const result = await UserService.getProfile(req)
    return res
    .status(200)
    .json(new ApiResponse(200, result, "Profile fetched.."));
  })
}
  // deactivateUser = asyncHandler(async(req,res) => {

  // });

export default new UserController();
