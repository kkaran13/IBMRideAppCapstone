
import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  rating_id: {
    type: String, 
    unique: true, 
    required: true
  },
  ride_id: { 
    type: String, 
    ref: "Ride", 
    required: true 
  },
  driver_id: { 
    type: String, 
    ref: "User", 
    required: true
   },
   rider_id: { 
    type: String, 
    ref: "User", 
    required: true },
  score: { 
    type: Number, 
    min: 1, max: 5, 
    required: true 
  },
  comment: { 
    type: String,
    trim :true
   },
  timestamp: { 
    type: Date, 
    default: 
    Date.now 
  }
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;