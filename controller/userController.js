import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Register
export const register = async (req, res) => {
    console.log('req: ', req.body);
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                sucess: false
            });
        }
        const user = await User.findOne({ email });
        if (user) {
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
    catch (error) {
        console.log(error);

    }
};

//Login
export const login = async (req, res) => {  
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                sucess: false
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
                sucess: false
            });
        }
        //create new user
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
                sucess: false
            });
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
        console.log('token: ', token);
        //populate each post 
        // const populateedPost = await Promise.all(
        //     user.posts.map(async(postId)=>{
        //         const post = await Post.findById(postId)
        //         if(post.author.equals(user._id)){
        //             return post;
        //         }
        //         return null;
        //     })
        // )
    
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            followings: user.followings,
            // posts: populateedPost
        }
        return res.cookie('token', token, { 
            httpOnly: true, 
            sameSite: 'strict', 
            maxAge: 1 * 24 * 60 * 60 * 1000 
        }).json({     //for more security purpose
            message: `Welcome back ${user.username}`,
            success: true,
            user
        })

    }
    catch (error) {
        console.log(error);
    }
};

//Logout
export const logout = async (_, res) => {
    try {
        res.cookie('token', '', { maxAge: 0 }).json({
            message: "Logout successfully",
            success: true
        });
    }
    catch (error) {
        console.log(error);
    }
}

//User Profile
export const userProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).populate({path: 'posts', createdAt:-1}).populate('bookmarks');
        return res.status(200).json({
            user,   
            success: true
        });

    }
    catch (error) {
        console.log(error);
    }
};
//Edit User Profile
export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body; 
        const profilePicture = req.files.filename;
        let cloudResponse;
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (cloudResponse) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user
        });
    }
    catch (error) {
        console.log(error);
    }
}

//SuggestedUsers
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password")
        if (!suggestedUsers) {
            return res.status(400).json({
                message: "Currently do not have any users"
            })
        };
        return res.status(200).json({
            sucess: true,
            users: suggestedUsers
        })

    }
    catch (error) {
        console.log(error);


    }
}

//Follow Or Unfollow
export const followOrUnfollow = async () => {
    try {
        const followKarneWala = req.id;  //logged in user
        const jisKoFollowKarna = req.params.id;  //user to follow like dost ko follow karna ja dost k dost ko follow karna 

        if (followKarneWala === jisKoFollowKarna) {
            return res.status(400).json({
                message: "You cannot follow yourself",
                success: false
            });
        }

        const user = await User.findById(followKarneWala);
        const targetUser = await User.findById(jisKoFollowKarna);

        if (!user || !targetUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        //check if user is already following the target user
        const isFollowing = user.followings.includes(jisKoFollowKarna);
        if (isFollowing) {
            //unfollow logic 
            await Promise.all([
                User.updateOne({ _id: followKarneWala }, { $pull: { followings: jisKoFollowKarna } }),
                User.updateOne({ _id: jisKoFollowKarna }, { $pull: { followings: followKarneWala } })
            ])
            return res.status(200).json({
                message: "Unfollowed successfully",
                success: true
            })
        }
        else {
            //follow logic
            await Promise.all([
                User.updateOne({ _id: followKarneWala }, { $push: { followings: jisKoFollowKarna } }),
                User.updateOne({ _id: jisKoFollowKarna }, { $push: { followings: followKarneWala } })
            ])
            return res.status(200).json({
                message: "followed successfully",
                success: true
            })

        }

    }
    catch (error) {

    }
}       