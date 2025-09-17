import { asyncHandler } from "../utils/asynHandler.js";
import RideService from "../services/RideService.js";
import ApiResponse from "../utils/ApiResponse.js";

class RideController {
    // Rider Routes
    createRide = asyncHandler(async (req, res) => {
        const ride = await RideService.createRide(req.body, req.user.id, req.user.role);
        res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { ride_id: ride.ride_id },
                    "Ride created successfully"
                )
            );
    });

    getRide = asyncHandler(async (req, res) => {
        const ride = await RideService.getRide(req.params.id, req.user);
        return res.status(200).json(new ApiResponse(200, ride, "Ride fetched successfully"));
    });

    listRides = asyncHandler(async (req, res) => {
        const rides = await RideService.listRides(req.user.id, req.user.role);
        res.status(200).json(new ApiResponse(200, rides));
    });

    cancelRide = asyncHandler(async (req, res) => {
        const ride = await RideService.cancelRide(
            req.user.id,
            req.params.id,
            req.body.reason,
            req.user.role
        );
        res
            .status(200)
            .json(new ApiResponse(200, ride, "Ride cancelled successfully"));
    });

    rejectRide = asyncHandler(async (req, res) => {
        const ride = await RideService.rejectRide(
            req.user.id,
            req.params.id
        );
        res
            .status(200)
            .json(new ApiResponse(200, ride, "Ride rejected successfully"));
    });

    getOngoingRidesForRider = asyncHandler(async (req, res) => {
        const rides = await RideService.getOngoingRidesByRider(req.user.id);
        res.status(200).json(new ApiResponse(200, rides, "Ongoing rides for rider"));
    });

    // Driver Routes
    getAvailableRides = asyncHandler(async (req, res) => {
        const rides = await RideService.getAvailableRides();
        res.status(200).json(new ApiResponse(200, rides, "Available rides"));
    });


    acceptRide = asyncHandler(async (req, res) => {

        const ride = await RideService.acceptRide(
            req.user.id,
            req.params.id
        );
        res.status(200).json(new ApiResponse(200, ride, "Ride accepted"));
    });

    driverArriveRide = asyncHandler(async (req, res) => {
        const ride = await RideService.driverArriveRide(req.user.id, req.params.id);
        res.status(200).json(new ApiResponse(200, ride, "Driver arrvied at your location"));
    });

    startRide = asyncHandler(async (req, res) => {
        const ride = await RideService.startRide(req.user.id, req.params.id,req.body);
        res.status(200).json(new ApiResponse(200, ride, "Ride started"));
    });

    completeRide = asyncHandler(async (req, res) => {
        const { fare, distance_km, duration_minutes } = req.body;
        const ride = await RideService.completeRide(
            req.user.id,
            req.params.id,
            fare,
            distance_km,
            duration_minutes
        );
        res.status(200).json(new ApiResponse(200, ride, "Ride completed"));
    });

    getOngoingRides = asyncHandler(async (req, res) => {
        const rides = await RideService.getOngoingRides(req.user.id);
        res.status(200).json(new ApiResponse(200, rides, "Ongoing rides"));
    });

    getRideHistory = asyncHandler(async (req, res) => {
        let rides;
        if (req.user.role === "rider") {
            rides = await RideService.getRideHistory(req.user.id);
        } else if (req.user.role === "driver") {
            rides = await RideService.getRideHistoryByDriver(req.user.id);
        } else {
            rides = [];
        }
        res.status(200).json(new ApiResponse(200, rides, "Ride history"));
    });

    // Admin Routes
    getAllRides = asyncHandler(async (req, res) => {
        const rides = await RideService.getAllRides(req.query);
        res.status(200).json(new ApiResponse(200, rides, "All rides"));
    });

    forceCancelRide = asyncHandler(async (req, res) => {
        const ride = await RideService.forceCancelRide(
            req.params.id,
            req.body.reason
        );
        res.status(200).json(new ApiResponse(200, ride, "Ride forcefully cancelled"));
    });

    deleteRide = asyncHandler(async (req, res) => {
        await RideService.deleteRide(req.params.id);
        res.status(200).json(new ApiResponse(200, null, "Ride deleted successfully"));
    });
}

export default new RideController();