
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { errorHandler } from "./middlewares/errorHandler.js";
import Config from "./config/Config.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: Config.SESSION_SECRET, // use env var
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000 } // 10 min
}));


// Import All Routes
import userRoute from "./routes/UserRoutes.js";
import vehicleRoute from "./routes/VehicleRoutes.js";
import deviceRouter from "./routes/DeviceTokenRoutes.js";
import driverRoute from './routes/DriverRoutes.js'
// import rideRoute from "./routes/RideRoutes.js"

// Python App APIs
import anaylticsRouter from "./routes/AnalyticsRoute.js";
import walletRoter from "./routes/WalletRoute.js";
import ratingRouter from "./routes/RatingRoutes.js";
// import walletRoter from "./routes/WalletRoute.js";
// import paymentRouter from "./routes/PaymentRoute.js";

app.use("/user", userRoute); //User Routes
app.use("/vehicle", vehicleRoute); //Vehicle Routes
app.use("/device", deviceRouter); //Device Routes
app.use("/driver", driverRoute);  // Driver Routes
app.use("/rating",ratingRouter);
// app.use("/api/v1/ride", rideRoute);

// Python App APIs
app.use('/analysis', anaylticsRouter);
app.use('/wallet', walletRoter);
// app.use('/payment', paymentRouter);

// global error handling
app.use(errorHandler);

export default app;
