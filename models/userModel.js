import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String, default: "" },
    bio: { type: String, default: "" },
    gender: { type: String, enum:['male','female'] },
    followers: [ {type: mongoose.Schema.Types.ObjectedId, ref: 'User'}],
    followings: [ {type: mongoose.Schema.Types.ObjectedId, ref: 'User'}],  
    post: [{type: mongoose.Schema.Types.ObjectedId, ref: 'Post'}],
    bookmarks: [{type: mongoose.Schema.Types.ObjectedId, ref: 'Post'}],
},{timestamps: true});
export const User = mongoose.model("User", userSchema); 