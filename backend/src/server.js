import { join } from "path";
import dotenv from "dotenv"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });
import app from "./app.js";
// import mongoConnect from "./config/mongo.js";
import { checkMySqlConnection, syncSqlDatabase } from './config/mysql.js';

const PORT = process.env.PORT;
console.log(PORT)

const startServer = async () => {
    try {

        // await mongoConnect();

        await checkMySqlConnection();

        await syncSqlDatabase();

        app.listen(3000, () => {
            console.log(`Server running on http://localhost:${3000}`);
        });

    } catch (error) {
        console.error("Error starting the server :", error.message);
        process.exit(1);
    }
}
export default startServer;