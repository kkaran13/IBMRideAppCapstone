import DriverWalletService from '../../services/wallets/DriverWalletService.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asynHandler.js';

class DriverWalletController {
    
    getDriverWalletDetails = asyncHandler(async (req, res) => {
       
        const result = await DriverWalletService.getDriverWalletDetails(req);
        return res
            .status(201)
            .json(new ApiResponse(200, result, ""));
        
    });

    getAllDriverWalletDetails = asyncHandler(async (req, res) => {
       
        const result = await DriverWalletService.getAllDriverWalletDetails();
         
        return res
            .status(200)
            .json(new ApiResponse(200, result, ""));
        
    });

    deactivateDriverWallet = asyncHandler(async (req, res) => {
       
        const result = await DriverWalletService.deactivateDriverWallet(req);
        console.log(result)
        return res
            .status(201)
            .json(new ApiResponse(200, result, ""));
        
    });

    addBonusByWalleteId = asyncHandler(async (req, res) => {      
        const result = await DriverWalletService.addBonusByWalleteId(req);
        
        return res
            .status(200)
            .json(new ApiResponse(200, result, ""));
        
    });
    addBonusAllAallet = asyncHandler(async (req, res) => {
        const result = await DriverWalletService.addBonusAllAallet(req);
        return res
            .status(200)
            .json(new ApiResponse(200, result, ""));
        
    });
}
export default new DriverWalletController();