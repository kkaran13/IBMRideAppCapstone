// import deviceTokenRepository from "../repositories/DeviceTokenRepository.js";
// import ApiError from "../utils/ApiError.js";

// class DeviceTokenService {

//     /**
//      * Register or update a device token for a user
//      */
//     async registerDevice({ userId, deviceId, deviceType, fcmToken }) {
        
//         if (!userId || !deviceId || !deviceType || !fcmToken) {
//             throw new ApiError(404, "Missing required fields for registering device");
//         }

//         return await deviceTokenRepository.upsertDeviceToken({
//             userId,
//             deviceId,
//             deviceType,
//             fcmToken,
//         });
//     }

//      /**
//      * Logout a device (remove a single token)
//      */
//     async logoutDevice(userId, deviceId) {
//         if (!userId || !deviceId) {
//             throw new ApiError(404, "Missing required fields for logout");
//         }

//         return deviceTokenRepository.deleteDevice(userId, deviceId);
//     }


//     /**
//      * Logout user from all devices
//      */
//     async logoutAllDevices(userId) {
//         if (!userId) {
//            throw new ApiError(404, "UserId is required");
//         }

//         return deviceTokenRepository.deleteDevicesByUserId(userId);
//     }


//     /**
//      * Get all FCM tokens for a user
//      */
//     async getUserTokens(userId) {
//         if (!userId) {
//            throw new ApiError(404, "UserId is required");
//         }

//         const devices = await deviceTokenRepository.getDevicesByUserId(userId);
//         return devices.map((d) => d.fcmToken);
//     }

//     /**
//      * Get all FCM tokens for multiple users
//      */
//     async getMultipleUsersTokens(userIds = []) {
//         const devices = await deviceTokenRepository.getDevicesByUserIds(userIds);
//         return devices.map((d) => d.fcmToken);
//     }

//     /**
//      * Clean invalid tokens (after Firebase tells you which are expired/invalid)
//      */
//     async removeInvalidTokens(tokens = []) {
//         if (!tokens.length) return;
//         return deviceTokenRepository.deleteDevicesByTokens(tokens);
//     }

// }
// export default new DeviceTokenService();