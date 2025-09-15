import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });
class Config{

    constructor(){

        this.NODE_ENV = process.env.NODE_ENV;
        this.NODE_PORT = process.env.NODE_PORT;
        this.JWT_SECRET = process.env.JWT_SECRET; 

        this.MONGO_URI = process.env.MONGO_URI;

        this.DB_NAME = process.env.DB_NAME;
        this.DB_USER = process.env.DB_USER;
        this.DB_PASS = process.env.DB_PASS;
        this.DB_HOST = process.env.DB_HOST;

        this.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
        this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
        this.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
        
        this.SMTP_HOST = process.env.SMTP_HOST;
        this.SMTP_PORT = process.env.SMTP_PORT;
        this.SMTP_USER = process.env.SMTP_USER;
        this.SMTP_PASS = process.env.SMTP_PASS;

        this.SESSION_SECRET = process.env.SESSION_SECRET;

        this.DJANGO_API_URL = process.env.DJANGO_API_URL;

        this.REDIS_HOST = process.env.REDIS_HOST;
        this.REDIS_PORT = process.env.REDIS_PORT;
        this.REDIS_PASSWORD = process.env.REDIS_PASSWORD;
        this.REDIS_DB = process.env.REDIS_DB;


        this.notificationBody = {
            // Rider Notifications
            rideRequested: {
                title: "Ride Requested",
                message: "Your ride request has been placed successfully.",
                appName: "RideApp",
                icon: "ride_request_icon"
            },
            rideAcceptedToRider: {
                title: "Driver Assigned",
                message: "Your driver {{driverName}} is on the way to pick you up.",
                appName: "RideApp",
                icon: "driver_assigned_icon"
            },
            rideStartedToRider: {
                title: "Ride Started",
                message: "Your ride has started. Sit back and enjoy the trip!",
                appName: "RideApp",
                icon: "ride_started_icon"
            },
            rideCompletedToRider: {
                title: "Ride Completed",
                message: "You have reached your destination. Please rate your driver.",
                appName: "RideApp",
                icon: "ride_completed_icon"
            },
            rideCancelledToRider: {
                title: "Ride Cancelled",
                message: "Your ride has been cancelled.",
                appName: "RideApp",
                icon: "ride_cancelled_icon"
            },

            // Driver Notifications
            // newRideRequestToDriver: {
            //     title: "New Ride Request",
            //     message: "A rider {{riderName}} near you is requesting a ride.",
            //     appName: "RideApp",
            //     icon: "new_request_icon"
            // },
            rideAcceptedToDriver: {
                title: "Ride Accepted",
                message: "You have accepted the ride request.",
                appName: "RideApp",
                icon: "ride_accepted_icon"
            },
            rideStartedToDriver: {
                title: "Ride Started",
                message: "You have started the ride.",
                appName: "RideApp",
                icon: "ride_started_icon"
            },
            rideCompletedToDriver: {
                title: "Ride Completed",
                message: "You have completed the ride successfully.",
                appName: "RideApp",
                icon: "ride_completed_icon"
            },
            rideCancelledToDriver: {
                title: "Ride Cancelled",
                message: "The rider has cancelled the ride.",
                appName: "RideApp",
                icon: "ride_cancelled_icon"
            }
        };

    }
}
export default new Config();