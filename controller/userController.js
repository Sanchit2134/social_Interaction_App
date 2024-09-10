import { User } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri";
import cloudinary from "../utils/cloudinary";

// Register
export const register = async (req, res) => {
    try{
      const {username, email, password} = req.body;
      if(!username || !email || !password){
        return res.status(400).json({
            message: "All fields are required",
            sucess: false
        });
      }
      const user = await User.findOne({email});
      if(user){
        return res.status(401).json({
            message: "User already exists",
            sucess: false
        }); 
      }
      const hashPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        email,
        password: hashPassword
      });
      return res.status(201).json({
        message: "User created successfully",
        sucess: true
      });

    }
    catch(error){
        console.log(error);

    }
};

//Login
export const Login = async(req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message: "All fields are required",
                sucess: false
            });
        }

        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message: "Invalid credentials",
                sucess: false
            });
        }  
        //create new user
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message: "Invalid credentials",
                sucess: false
            });
        }
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            followings: user.followings,
            posts: user.post
        }

        const token =jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});
        return res.cookie('token',token, {httpOnly: true, sameSite: 'strict', maxAge: 1*24*60*60*1000}).json({     //for more security purpose
            message: `Welcome back ${user.username}`,
            success: true,
            user
        })   

    }
    catch(error){
        console.log(error);
    }
};

//Logout
export const logout = async(_,res) => {
    try{
        res.cookie('token','',{maxAge: 0}).json({
            message: "Logout successfully",
            success: true
        });
    }
    catch(error){
        console.log(error);
    }
}

//User Profile
export const userProfile = async (req, res) => {
    try{
        const {userId} = req.param.id;
        const user = await User.findById(userId);
        return res.status(200).json({
            user,
            success: true
        });

    }
    catch(error){
        console.log(error);
    }
};

//Edit User Profile
export const editProfile = async(req,res)=>{
    try{
        const userId = req.id;
        const {bio,gender} = req.body;
        const profilePicture = req.file;
        let cloudResponse;
        if(profilePicture){
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }   
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        if(bio) user.bio = bio;
        if(gender) user.gender = gender;
        if(cloudResponse) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
        });
    }
    catch(error){
        console.log(error);
    }
}

export const getSuggestedUsers = async (req,res) =>{
    try{
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password")
        if(!suggestedUsers){
            return res.status(400).json({
                message: "Currently do not have any users"
            })
        };
        return res.status(200).json({
            sucess: true,
            users: suggestedUsers
        })

    }
    catch(error){
        console.log(error);
        

    }
}

//Follow Or Unfollow
export const followOrUnfollow = ()=>{
    try{
        const followKarneWala = req.id;
        const followKiyaJanaWala = req.params.id;

    }
    catch(error){

    }
}