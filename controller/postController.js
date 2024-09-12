import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";

export const addNewPost = async(req, res) => {
    try{
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id; 

        if(!image) return res.status(400).json({message: "Image is required"});
        const optimizedImageBuffer = await sharp(image.buffer)
        .resize({width: 800, height: 800, fit: 'inside'})
        .toFormat('jpeg', {quality: 80})
        .toBuffer();
        
        //buffer to datauri
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })

        const user = await User.findById(authorId); 
        if(user){
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({path: 'author', select: '-password'});

    } 
    catch(error){

    }
}