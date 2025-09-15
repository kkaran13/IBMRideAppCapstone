import PaymentService from '../services/PaymentService.js';
import ApiResponse from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asynHandler.js';

class PaymentController {
    
    getDriverWalletDetails = asyncHandler(async (req, res) => {
       
        const result = await DriverWalletService.getDriverWalletDetails(req);
        return res
            .status(201)
            .json(new ApiResponse(200, result, ""));
        
    });

    getAllDriverWalletDetails = asyncHandler(async (req, res) => {
       
        const result = await DriverWalletService.getAllDriverWalletDetails();
        return res
            .status(201)
            .json(new ApiResponse(200, result, ""));
        
    });

    deactivateDriverWallet = asyncHandler(async (req, res) => {
       
        const result = await DriverWalletService.deactivateDriverWallet(req);
        return res
            .status(201)
            .json(new ApiResponse(200, result, ""));
        
    });
}
export default new PaymentController();