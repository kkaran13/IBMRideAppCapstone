
import express from "express";
import session from "express-session"
import cookieParser from "cookie-parser";
import  {errorHandler}  from "./middlewares/errorHandler.js";
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

app.use("/user",userRoute); //User Routes
app.use("/vehicle",vehicleRoute); //Vehicle Routes
app.use("/device",deviceRouter); //Device Routes
app.use("/driver",driverRoute);  // Driver Routes

// global error handling
app.use(errorHandler);

export default app;