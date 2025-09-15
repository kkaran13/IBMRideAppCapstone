import express from "express";
import driverWalletRouter from "./wallets/DriverWalletRoute.js";
// import withdrawWalletRouter from "./wallets/WithdrawWalletRoute.js";

const walletRoter = express.Router();

walletRoter.use('/driver-wallet', driverWalletRouter);
// walletRoter.use('/withdraw', withdrawWalletRouter);

export default walletRoter;