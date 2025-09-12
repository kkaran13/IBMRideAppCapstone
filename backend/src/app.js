
import express from "express";
import cookieParser from "cookie-parser";
import  {errorHandler}  from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Import All Routes
import userRoute from "./routes/userRoutes.js";
import vehicleRoute from "./routes/vehicleRoutes.js";
import driverRoute from "./routes/DriverRoutes.js";

app.use("/user",userRoute); //User Routes
app.use("/vehicle",vehicleRoute); //Vehicle Routes
app.use("/driver",driverRoute);  // Driver Routes

// global error handling
app.use(errorHandler);

export default app;