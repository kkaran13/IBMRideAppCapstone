import ApiError from "../utils/ApiError.js";
import HelperFunction from "../utils/HelperFunction.js";
import RideRepository from "../repositories/RideRepository.js";

class PaymentService {

    async createDriverWallet(reqObj){
        
        const { driver_id } = reqObj.body;

        if(!driver_id) { throw new ApiError(400, "Missing the driver id") };

        const driverData = await UserRepository.findById(driver_id);

        if(!driverData) { throw new ApiError(400, "User not found") };

        const apiResponseData = await HelperFunction.axiosSendRequest("post", `wallet/driver-wallet/${driver_id}`);
        
        return apiResponseData;

    }

    // get the driver wallet details
    async getDriverWalletDetails(reqObj){

        if(!reqObj) { throw new ApiError(400, "Missing the required data") };

        const { driver_id } = reqObj.params;

        if(!driver_id) { throw new ApiError(400, "Missing the driver id") };

        const loggedInUser = reqObj.user;
        if(!loggedInUser) { throw new ApiError(401, "Unauthenticated user") };

        if(loggedInUser.id != driver_id) { throw new ApiError(401, "Unauthorised user") }

        const driverData = await UserRepository.findById(driver_id);

        if(!driverData) { throw new ApiError(400, "User not found") };

        const apiResponseData = await HelperFunction.axiosSendRequest("get", `wallet/driver-wallet/${driver_id}`);
        
        return apiResponseData;

    }

    // get All The driver wallet details
    async getAllDriverWalletDetails(){

        const apiResponseData = await HelperFunction.axiosSendRequest("get", `wallet/driver-wallet/`);
        
        return apiResponseData;

    }

    // deactivate the driver wallet
    async deactivateDriverWallet(reqObj){

        if(!reqObj) { throw new ApiError(400, "Missing the required data") };

        const { driver_id } = reqObj.params;

        if(!driver_id) { throw new ApiError(400, "Missing the driver id") };

        const loggedInUser = reqObj.user;
        if(!loggedInUser) { throw new ApiError(401, "Unauthenticated user") };

        if(loggedInUser.id != driver_id) { throw new ApiError(401, "Unauthorised user") }

        const driverData = await UserRepository.findById(driver_id);

        if(!driverData) { throw new ApiError(400, "User not found") };

        const apiResponseData = await HelperFunction.axiosSendRequest("patch", `wallet/driver-wallet/${driver_id}`);
        
        return apiResponseData;

    }


    
}
export default new PaymentService();