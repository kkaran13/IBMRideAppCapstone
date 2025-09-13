import express from "express";
import deviceTokenController from "../controllers/DeviceTokenController.js";

const deviceRouter = express.Router();

deviceRouter.post('/registerDevice', deviceTokenController.registerDevice);
deviceRouter.post('/getUserDevices', deviceTokenController.getUserDevices);

export default deviceRouter; 