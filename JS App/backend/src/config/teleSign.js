// @ts-nocheck
import TeleSignSDK from "telesignsdk";
import config from "./Config.js"

const customerId = config.TELESIGN_CUSTOMER;   // from portal
const apiKey = config.TELESIGN_API;           // from portal
const restEndpoint = "https://rest-api.telesign.com"; // default

// Initialize TeleSign client
const client = new TeleSignSDK(customerId, apiKey, restEndpoint);
export default client;