import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI=process.env.MONGO_URI;

export const connectDb=async()=>{
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Connected To MongoDB");
    }
    catch(err){
        console.log("Error Connecting To MongoDb: ",err);
        process.exit(1);
    }
}

