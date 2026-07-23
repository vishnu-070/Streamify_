import {StreamChat} from "stream-chat";
import dotenv from "dotenv";

dotenv.config();
const apiKey=process.env.STREAM_API_KEY;
const apiSecret=process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API Key or Secret not found in environment variables");
}

const streamClient=StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUSer=async(userData)=>{
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }
    catch(err){
        console.error("Error upserting Stream user: ",err);
    }
}

export const generateStreamToken=(userId)=>{
    try {
        const userIdStr= userId.toString();
        return streamClient.createToken(userIdStr);

    } catch (error) {
        console.error("Error generating Stream token: ",error);

        
    }
}