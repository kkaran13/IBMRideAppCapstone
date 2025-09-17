import WithdrawWalletService from "../../services/wallets/WithdrawWalletService.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asynHandler.js";

class WithdrawWalletController {
  getWithDrawReqDetails = asyncHandler(async (req, res) => {
    const result = await WithdrawWalletService.getAllWithdrawReqDetails(req);

    return res
      .status(200) // ✅ GET -> 200
      .json(new ApiResponse(200, result, "Withdraw requests fetched successfully"));
  });

  getWithDrawByidReqDetails = asyncHandler(async (req, res) => {
    const result = await WithdrawWalletService.getAllWithdrawReqByidDetails(req);

    return res
      .status(200) // ✅ GET -> 200
      .json(new ApiResponse(200, result, "Withdraw requests fetched successfully"));
  });

  postWithDrawByidReqDetails = asyncHandler(async (req, res) => {
    const result = await WithdrawWalletService.postAllWithdrawReqByidDetails(req);

    return res
      .status(200) // ✅ GET -> 200
      .json(new ApiResponse(200, result, "Withdraw requests fetched successfully"));
  });

changeReqStatus = asyncHandler(async (req, res) => {
    
  const result = await WithdrawWalletService.changeReqStatus(req);
    console.log("Arhb")
  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Withdrawal request status changed successfully"
    )
  );
});

}

export default new WithdrawWalletController();
