import express from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js';
import RideMatchingController from '../controllers/RideMatchingController.js';

const rideMatchingRouter = express.Router();

rideMatchingRouter.post('/ignore', authenticateJWT, authorizeRole(['driver']), RideMatchingController.addIgonredDriver); // igonres this ride for a particular driver