import mongoose from "mongoose";

const mongoConnect = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/IBM-NODE-DEMO')
        console.log('Connected to MongoDB');
    } catch (error) {
        throw error
    }
}
export default mongoConnect;