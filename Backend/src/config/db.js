import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    // console.log(`${process.env.MONGO_URL}`);
    await mongoose.connect(process.env.MONGO_URL, {  
        family: 4   // Force IPv4
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB Connection Error:", error);
     process.exit(1); // Exit process on DB connection failure
  }    
};

export default connectDB;       