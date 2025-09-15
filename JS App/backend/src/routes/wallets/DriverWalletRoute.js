import express from "express";
import DriverWalletController from '../../controllers/wallets/DriverWalletController.js'
import { authenticateJWT } from '../../middlewares/authMiddleware.js';
import { authorizeRole } from '../../middlewares/roleMiddleware.js'

const driverWalletRouter = express.Router();

driverWalletRouter.get('/:driver_id', authenticateJWT, authorizeRole(['driver', 'admin']), DriverWalletController.getDriverWalletDetails); // get wallet details
driverWalletRouter.get('/', authenticateJWT, authorizeRole(['admin']), DriverWalletController.getAllDriverWalletDetails); // Get all the wallets
driverWalletRouter.patch('/:driver_id', authenticateJWT, authorizeRole(['driver', 'admin']), DriverWalletController.deactivateDriverWallet); // deactivate the wallet

export default driverWalletRouter;