import mailTranspoter from "../config/mailTranspoter.js";
import fs from 'fs/promises';
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/Config.js";
import firebaseadmin from '../config/firebaseMessage.js'
import cloudinary from "../config/cloudinary.js";
import httpClient from '../config/httpClient.js';
import DeviceTokenService from "../services/DeviceTokenService.js";

// recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(__dirname);

class HelperFunction {

    /**
     * Sends an email using a predefined HTML template.
     *
     * - Loads the HTML template file from `assets/email-templates/`.
     * - Replaces placeholders inside the template (`#key#`) with values from `templateData`.
     * - Uses Nodemailer transporter (`mailTranspoter`) to send the email.
     *
     * @async
     * @function sendMail
     * @param {Object} options - Email sending options
     * @param {string|string[]} options.to - Recipient(s) email address (array or string)
     * @param {string} [options.subject=''] - Email subject line
     * @param {string} [options.htmlTemplate=''] - Template file name (e.g. "welcome.html")
     * @param {Object} [options.templateData={}] - Key-value pairs to replace placeholders in the template
     * 
     * @returns {Promise<Object>} Nodemailer info object containing message details
     *
     * @throws {Error} If reading the template or sending the email fails
     *
     * @example
     * await sendMail({
     *   to: ["user@example.com"],
     *   subject: "Welcome to our app!",
     *   htmlTemplate: "welcome.html",
     *   templateData: { username: "John", link: "https://example.com/verify" }
     * });
    */
    async sendMail({ to = [], subject = '', htmlTemplate = '', templateData = {} }) {
        try {
            const templatePath = path.join(__dirname, "..", "assets", "email-templates", htmlTemplate);

            // Read HTML file
            let htmlContent = await fs.readFile(templatePath, "utf-8") || ``;

            // Replacing the placeholders (#key# → value)
            for (const [key, value] of Object.entries(templateData)) {
                const regex = new RegExp(`#${key}#`, "g");
                htmlContent = htmlContent.replace(regex, value);
            }
            console.log(htmlContent);
            // Mail options
            const mailOptions = {
                from: config.SMTP_USER,
                to: Array.isArray(to) ? to.join(',') : to,
                subject,
                html: htmlContent
            }

            // send the mail here
            let info = await mailTranspoter.sendMail(mailOptions);
            console.log("Mail sent:", info.messageId);
            return info;

        } catch (error) {
            console.error("Error sending Mail: ", error.message);
            throw error;
        }
    }


    /**
     * Send an HTTP request to the Django / or any other App
     * @param {string} method - HTTP method (get, post, put, delete)
     * @param {string} url - API endpoint (relative to baseURL) "base url check in the .env file of the dir"
     * @param {object} [data={}] - Request body (ignored for GET/DELETE unless needed)
     * @param {object} [options={}] - Extra axios options (headers, params, etc.)
     */
    async axiosSendRequest(method, url, data = {}, options = {}) {
        try {

            const requestConfig = {
                method,
                url,
                ...options
            }
            requestConfig.url = (config.DJANGO_API_URL || "") + requestConfig.url;

            // based on the request method filtering is done for the data as only post, put and patch can have body
            if (["post", "put", "patch"].includes(method.toLowerCase())) {
                requestConfig.data = data;
            }
            // if not above methods then send data in the params 
            else {
                requestConfig.params = { ...(options.params || {}), ...data };
            }

            // call the api 
            console.log(requestConfig);
            const response = await httpClient.request(requestConfig);
            return response.data;

        } catch (error) {

            // The Api is returning a custom errors (catched when the status ! = 200)
            if (error.response) {
                throw { status: error.response.status, data: error.response.data };
            }
            // This means the request was sent, but the server didn’t respond at all.
            else if (error.request) {
                throw { message: "No response from server", error };
            }
            //This means Axios failed before even making the request.
            else {
                throw { message: error.message };
            }
        }
    }

    /**
     * Sends a push notification via Firebase Cloud Messaging (FCM).
     *
     * - Fetches the template by name from Config.notificationBody.
     * - Replaces placeholders in title/body using the provided `data`.
     * - Uses the same `data` object as `extraData` for app-side handling.
     * - Sends a multicast message to provided device tokens.
     *
     * @async
     * @function sendFirebasePushNotification
     * @param {string} templateName - Notification template key (e.g. "rideAcceptedToRider")
     * @param {Object} data - Placeholder values and extra data (e.g. { driverName: "Amit", rideId: "123" })
     * @param {string[]} userids - Array of user ids to send notification to
     *
     * @returns {Promise<Object>} Firebase response with success & failure counts for each token
     *
     * @throws {Error} If sending the notification fails
     *
     * @example
     * await HF.sendFirebasePushNotification(
     *   "rideAcceptedToRider",
     *   { driverName: "Amit", rideId: "123" },
     *   ["userid1", "userid2"]
     * );
     */
    async sendFirebasePushNotification(templateName, data, userids) {
        try {
            // if (!Array.isArray(userids) || userids.length === 0) {
            //     throw new Error("No users provided for push notification");
            // }

            // if (!Array.isArray(userids) || userids.length === 0) {
            //     throw new Error("No device tokens provided for push notification");
            // }

            if(!userids){
                return {}
            }

            if(!Array.isArray(userids)){
                userids = [userids]
            }

            // get the device tokens for these users
            const deviceTokens = await DeviceTokenService.getMultipleUsersTokens(userids);

            // Build notification payload (title/message placeholders replaced with `data`)
            const payload = getNotificationTemplate(templateName, data);

            const message = {
                notification: payload.notification,
                data: Object.entries(data).reduce((acc, [k, v]) => {
                    acc[k] = String(v); // FCM `data` must be stringified
                    return acc;
                }, {}),
                tokens: deviceTokens,
            };

            const response = await firebaseadmin.messaging().sendEachForMulticast(message);

            console.log(`Push notification sent: ${response.successCount} success, ${response.failureCount} failures`);

            // Collect failed tokens (so caller can remove them from DB if needed)
            const failedTokens = [];
            if (response.failureCount > 0) {
                response.responses.forEach((res, idx) => {
                    if (!res.success) {
                        console.error(`Failed token[${idx}]: ${deviceTokens[idx]} | Error:`, res.error?.message);
                        failedTokens.push(deviceTokens[idx]);
                    }
                });
            }

            // remove the invalid tokens from the db
            DeviceTokenService.removeInvalidTokens(failedTokens);

            return { ...response, failedTokens };
        } catch (error) {
            console.error("Error sending push notification:", error.message);
            throw error;
        }
    }

    /**
     * Fetches a notification template by name and replaces placeholders
     * inside title/message with values from `data`.
     *
     * Placeholders follow the format {{key}} and are replaced by
     * corresponding values from `data`.
     *
     * @param {string} templateName - The template key (e.g., "rideAcceptedToRider")
     * @param {Object} data - Data object with placeholder values
     *
     * @returns {Object} - Object containing { notification: { title, body }, app, icon }
     *
     * @example
     * getNotificationTemplate("rideAcceptedToRider", { driverName: "Amit", rideId: "123" });
     * // =>
     * {
     *   notification: {
     *     title: "Ride Accepted",
     *     body: "Your driver Amit has accepted ride #123"
     *   },
     *   app: "RideApp",
     *   icon: "ride_icon.png"
     * }
     */
    getNotificationTemplate(templateName, data = {}) {
        const template = Config.notificationBody[templateName];

        if (!template) {
            throw new Error(`Notification template "${templateName}" not found`);
        }

        // Replace placeholders in title/message
        const replacePlaceholders = (text = "", values = {}) => {
            return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
        };

        return {
            notification: {
                title: replacePlaceholders(template.title, data),
                body: replacePlaceholders(template.message, data),
            },
            app: template.app || "RideApp",
            icon: template.icon || "default_icon.png",
        };
    }


    async uploadToCloudinary(file, folder) {
        if (!file || !file.buffer) {
            throw new Error("Invalid file object: buffer missing");
        }

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: `RideApp/${folder}` },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
            );
            stream.end(file.buffer); // send buffer directly
        });
    }


    
}

// const HF = new HelperFunction()
// let mailObj = {
//     to : "djbavda@gmail.com",
//     subject : "Welcome to Ride App !",
//     htmlTemplate : 'welcome.html',
//     templateData : {
//         username : "user.username",
//         email : "user.email"
//     }
// }
// HF.sendMail(mailObj);

export default new HelperFunction();
