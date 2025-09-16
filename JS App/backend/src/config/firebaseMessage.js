import admin from 'firebase-admin';
import fs from 'fs';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname , "../../service-account.json")

// Load the Firebase Admin SDK from the file.
const serviceAccount = JSON.parse(fs.readFileSync(filePath , "utf8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;