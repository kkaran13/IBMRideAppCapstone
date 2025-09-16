import HelperFunction from "../../utils/HelperFunction.js";

class WithdrawWalletService {
  async getAllWithdrawReqDetails() {
     
    const apiResponseData = await HelperFunction.axiosSendRequest(
      "get",
      "wallet/withdraw/"
    );
     

    return apiResponseData;
  }


async changeReqStatus(req) {
    try {
      const { withdraw_id } = req.params;
      const { status } = req.body;

      if (!withdraw_id || !status) {
        throw new Error("Withdraw ID and status are required");
      }
 
      // ✅ Send PATCH request to Django API
      const apiResponseData = await HelperFunction.axiosSendRequest(
        "patch",
        `wallet/withdraw/status/${withdraw_id}/`,
        { status }
      );

      console.log("Change Request Status Response:", apiResponseData);
      return apiResponseData;
    } catch (error) {
      console.error("Error changing withdrawal request status:", error.message);
      throw error;
    }
  }
}



export default new WithdrawWalletService();
