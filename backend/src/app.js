
import express from "express";
import cookieParser from "cookie-parser";
import  {errorHandler}  from "./middlewares/errorHandler.js";

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Import All Routes
import userRoute from "./routes/UserRoutes.js";
import vehicleRoute from "./routes/vehicleRoutes.js";
import deviceRouter from "./routes/DeviceTokenRoutes.js";

app.use("/user",userRoute); //User Routes
app.use("/vehicle",vehicleRoute); //Vehicle Routes
app.use("/device",deviceRouter); //Device Routes

// global error handling
app.use(errorHandler);

export default app;