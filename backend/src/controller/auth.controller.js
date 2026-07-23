import { upsertStreamUSer } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req,res){
    try{
        const {email,password,fullName}=req.body;

        if(!email || !password || !fullName){
            return res.status(400).json({Message:"All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({Message:"Password must be at least 6 characters long"});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUSer= await User.findOne({email});

        if(existingUSer){
            return res.status(400).json({Message:"User with this email already exists"});
        }

        const idx=Math.floor(Math.random()*100)+1;
        const randomAvatar= `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser=await User.create({
            email,
            password,
            fullName,
            profilePic:randomAvatar
        })
        try{
            await upsertStreamUSer({
            id:newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || " "
        })
        }
        catch(err){
            console.log("Error creating Stream user during signup: ",err);
        }

        const token=jwt.sign({userId:newUser._id},process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );

        res.cookie("jwt",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });

        res.status(201).json({
            message:"User created successfully",
            user:newUser});

}
    catch(err){
    console.log("Error in signup: ",err);
        res.status(500).json({message:"Internal Server Error"});
    }

}

export async function login(req,res){
    const {email,password}=req.body;

    try{
        //fields check
        if(!email || !password){
            return res.status(400).json({Message:"All fields are required"});
        }
        

        //email finding
        const user=await User.findOne({email});
        if(!user){
            console.log("User not found with email: ", email);
            return res.status(401).json({Message: "Invalid Email or Password"});
        }

        //password matching
        const isMatch=await user.comparePassword(password);
        if(!isMatch){
            res.status(401).json({Message: "Invalid Email or Password"});
        }


        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );

        res.cookie("jwt",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:"strict",
            maxAge:7*24*60*60*1000
        });

        res.status(200).json({success:true,user});

    }
    catch(err){
        console.log("Error in login: ",err);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export function logout(req,res){
    res.clearCookie("jwt");
    res.status(200).json({success:true,message:"Logged out successfully"});
}

export async function onboard(req,res){
    try{
        const userId=req.user._id;
        const {fullName,bio,nativeLanguage,LearningLanguage,Location}=req.body;
        
        if(!fullName || !bio || !nativeLanguage || !LearningLanguage || !Location){
            return res.status(400).json({
                message:"All fields are required for onboarding",
                missingFields: [
                !fullName && "fullName",
                !bio && "bio",
                !nativeLanguage && "nativeLanguage",
                !LearningLanguage && "LearningLanguage",
                !Location && "Location"
                ]
            })
        }
        const updatedUser=await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnboarded:true
        },{new:true});

        if(!updatedUser){
            return res.status(404).json({message:"User not found"});
        }

        try {
            await upsertStreamUSer({
            id:updatedUser._id.toString(),
            name:updatedUser.fullName,
            image:updatedUser.profilePic || " "
        })
        res.status(200).json({message:"Onboarding completed successfully",user:updatedUser});
            
        } catch (error) {
            console.log("Error updating Stream user during onboarding: ", error);
            
        }
        
    }
    catch(err){
        console.log("Error in onboarding: ",err);
        res.status(500).json({message:"Internal Server Error"});
    }
}