import express from "express";
import PaymentController from '../controllers/PaymentController.js'
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js'

const paymentRouter = express.Router();

paymentRouter.post('/create-order', PaymentController.createCheckoutOrder);
paymentRouter.post('/verify-payment',  PaymentController.verifyPaymentStatus); 

export default paymentRouter;