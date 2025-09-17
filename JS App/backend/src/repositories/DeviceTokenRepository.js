import DeviceToken from "../models/DeviceToken.js";

class DeviceTokenRepository {
    
    /**
     * Create or update a device token
     * If the (userId + deviceId) combo exists, update the token
     */
    async upsertDeviceToken({userId, deviceId, deviceType, fcmToken}){
        return await DeviceToken.findOneAndUpdate(
            {userId, deviceId},
            {deviceType, fcmToken, updatedAt : new Date()},
            { new : true, upsert : true}
        );
    }

    /**
     * Get all devices for a user
     */
    async getDevicesByUserId(userId) {
        return await DeviceToken.find({ userId });
    }

    /**
     * Get all devices for multiple users
     */
    async getDevicesByUserIds(userIds = []) {
        try {
            const devices = await DeviceToken.find({ userId: { $in: userIds } });
            return devices;
        } catch (error) {
            console.log(error);
        }
        
    }

    /**
     * Delete device by userId + deviceId
     */
    async deleteDevice(userId, deviceId) {
        return await DeviceToken.deleteOne({ userId, deviceId });
    }

     /**
     * Delete all devices for a user (e.g. logout from all devices)
     */
    async deleteDevicesByUserId(userId) {
        return await DeviceToken.deleteMany({ userId });
    }

    /**
     * Remove devices by a list of FCM tokens (useful for cleaning invalid tokens)
     */
    async deleteDevicesByTokens(tokens = []) {
        return await DeviceToken.deleteMany({ fcmToken: { $in: tokens } });
    }

}
export default new DeviceTokenRepository();