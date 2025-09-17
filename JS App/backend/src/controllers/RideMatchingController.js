import { asyncHandler } from '../utils/asynHandler.js';
import RideMatchingService from '../services/RideMatchingService.js';
import ApiResponse from '../utils/ApiResponse.js'

class RideMatchingCotroller {

    // adds the driverid for ignoring for this ride
    addIgonredDriver = asyncHandler(async (req, res) => {
        const result = await RideMatchingService.addIgonredDriver(req);
        return res
            .status(200)
            .json(new ApiResponse(200, result, "User deactivated successfully"));
    });

}
export default new RideMatchingCotroller();