import express from "express";
import WithdrawWalletController from "../../controllers/wallets/WithdrawWalletController.js";
import { authenticateJWT } from '../../middlewares/authMiddleware.js';
import { authorizeRole } from '../../middlewares/roleMiddleware.js'

const withdrawWalletRouter = express.Router();

 
withdrawWalletRouter.get(
  "/",
  authenticateJWT,
  authorizeRole(["admin"]),
  WithdrawWalletController.getWithDrawReqDetails
);



 withdrawWalletRouter.patch(
  "/status/:withdraw_id",
  WithdrawWalletController.changeReqStatus
);

 withdrawWalletRouter.get(
  "/:driver_id",
  WithdrawWalletController.getWithDrawByidReqDetails
);

 withdrawWalletRouter.post(
  "/:driver_id",
  WithdrawWalletController.postWithDrawByidReqDetails
);

export default withdrawWalletRouter;
