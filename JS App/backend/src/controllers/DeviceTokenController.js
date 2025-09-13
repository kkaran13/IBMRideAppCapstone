import { asyncHandler } from "../utils/asynHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import deviceTokenService from "../services/DeviceTokenService.js";
import ApiError from "../utils/ApiError.js";

class DeviceController{

    // Register the device
    registerDevice = asyncHandler(async (req, res) => {
        
        const { userId, deviceId, deviceType, fcmToken } = req.body;

        if( !userId || !deviceId || !deviceType || !fcmToken ){
            throw new ApiError(404, "Missing required fields for registering the device");
        }
        const device = await deviceTokenService.registerDevice({ userId, deviceId, deviceType, fcmToken });

        res.status(201).json(new ApiResponse(201, device, "Device registered successfully for the notification"));
    });

    // Get the user devices tokens
    getUserDevices = asyncHandler(async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            throw new ApiError(400, "UserId is required");
        }

        const devices = await deviceTokenService.getUserTokens(userId);

        res.status(200).json(new ApiResponse(200, devices, "Fetched user devices"));
    });

}
export default new DeviceController();