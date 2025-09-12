import mongoose from "mongoose";
import config from './Config.js';

const mongo_uri = config.MONGO_URI;

const mongoConnect = async () => {
    try {
        await mongoose.connect(mongo_uri)
        console.log('Connected to MongoDB');
    } catch (error) {
        throw error
    }
}
export default mongoConnect;