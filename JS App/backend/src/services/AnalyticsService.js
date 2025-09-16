import ApiError from "../utils/ApiError.js";
import HelperFunction from "../utils/HelperFunction.js";

class AnalyticsService {
    
    // calculated the fare for the ride
    async rideFareCalculation(data){
        
        if(!data) { throw new ApiError(400, "Missing data") };
        
        // expected data
        // cords = {
        //     pickup : [long, lat],
        //     drop : [long, lat],
        // }

        const { cords } = data;
        let pickup;
        let drop;

        if(cords.pickup && Array.isArray(cords.pickup) && cords.pickup.length == 2){
            pickup = cords.pickup;
        }
        if(cords.drop && Array.isArray(cords.drop) && cords.drop.length == 2){
            drop = cords.drop;
        }
        if(!cords || !pickup || !drop) { throw new ApiError(400, "Missing required fields") };
        
        const requestData = { "cordinates": [[pickup[0], pickup[1]],[drop[0], drop[1]]] };

        const apiResponseData = await HelperFunction.axiosSendRequest("post", "analysis/fare-cal", requestData, {});

        return apiResponseData;
    }
    // calculated the fare for the ride
    async getAllCompletedPayments(){
          

        const apiResponseData = await HelperFunction.axiosSendRequest("get", "payments/completed-payments/");

        return apiResponseData;
    }
}
export default new AnalyticsService();