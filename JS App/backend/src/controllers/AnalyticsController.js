import AnalyticsService from '../services/AnalyticsService.js';
import ApiResponse from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asynHandler.js'

class AnalyticsController {

    rideFareCalculation = asyncHandler(async (req, res) => {

        const result = await AnalyticsService.rideFareCalculation(req.body);
        return res.status(201).json(new ApiResponse(201, result, ""))
    
    });
    getAllCompletedPayments= asyncHandler(async (req, res) => {
     
        const result = await AnalyticsService.getAllCompletedPayments(req.body);
   
        return res.status(200).json(new ApiResponse(200, result, ""))
    
    });
    getAllCompletedPaymentsbyid= asyncHandler(async (req, res) => {
     
        const result = await AnalyticsService.getAllCompletedPaymentsbyid(req.body);
   
        return res.status(200).json(new ApiResponse(200, result, ""))
    
    });



}
export default new AnalyticsController();