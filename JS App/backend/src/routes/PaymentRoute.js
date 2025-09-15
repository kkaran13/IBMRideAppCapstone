import express from "express";
import PaymentController from '../controllers/PaymentController.js'
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { authorizeRole } from '../middlewares/roleMiddleware.js'

const paymentRouter = express.Router();

// paymentRouter.get('/:driver_id', authenticateJWT, authorizeRole(['driver', 'admin']), DriverWalletController.getDriverWalletDetails); // get wallet details
// paymentRouter.get('/', authenticateJWT, authorizeRole(['admin']), DriverWalletController.getAllDriverWalletDetails); // Get all the wallets
// paymentRouter.patch('/:driver_id', authenticateJWT, authorizeRole(['driver', 'admin']), DriverWalletController.deactivateDriverWallet); // deactivate the wallet

export default paymentRouter;