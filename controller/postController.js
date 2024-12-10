import sharp from "sharp";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";
import cloudinary from "../utils/cloudinary.js";
import { Comment } from "../models/commentModel.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

//add new post
export const addNewPost = async (req, res) => { 
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: "Image is required" });
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
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
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });
        return res.status(201).json({
            message: "New post added",
            post,
            success: true
        })

    }
    catch (error) {
        console.log('error: ', error);
        return res.status(500).json({ message: error.message });

    }
}
//get all post home page wale section ki post
export const getAllPost = async (req, res) => {
    try {
        const post = await Post.find().sort({ createAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilepIcture'
                }
            }); 
        return res.status(200).json({
            post,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
} 

//get user post that is available on profile section
export const getUserPost = async () => {
    try {
        const authorId = req.id
        const posts = await Post.find({ author: authorId }).sort({ createAt: -1 }).populate({
            path: 'author',
            select: 'username  profilePicture'
        }).populate({
            path: 'comments',
            sort: { createAt: -1 },
            populate: {
                path: 'author',
                select: 'username  profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}
//like post
export const likePost = async (req, res) => {
    try {
        const likeKarneWaleKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: 'false' })

        //like logic started
        await post.updateOne({ $addToSet: { likes: likeKarneWaleKiId } })
        await post.save();

        //implement socket.io for real time notification
        const user = await User.findById(likeKarneWaleKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeKarneWaleKiId){
            //emit a notification event
            const notification = {
                type: 'like',
                userId: likeKarneWaleKiId,
                userDetail: user,
                postId,
                message: 'Your post was liked'
            }
            const postOwnerSocketId = getRecieverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('newNotification', notification);
        }
    } catch (error) {
        console.log(error);

    }
}

//dislike post
export const disLikePost = async (req, res) => {
    try {
        const dislikeKarneWaleKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: 'false' })
        //Dislike logic started
        await post.updateOne({ $pull: { dislike: dislikeKarneWaleKiId } })
        await post.save();
 
         //implement socket.io for real time notification
         const user = await User.findById(dislikeKarneWaleKiId).select('username profilePicture');
         const postOwnerId = post.author.toString();
         if(postOwnerId !== dislikeKarneWaleKiId){
             const notification = {
                 type: 'dislike',
                 userId: dislikeKarneWaleKiId,
                 userDetail: user,
                 postId,
                 message: 'Your post was disliked'
             }
             const postOwnerSocketId = getRecieverSocketId(postOwnerId);
             io.to(postOwnerSocketId).emit('newNotification', notification);
         }
    } catch (error) {
        console.log(error);

    }
}

//add comment 
export const addComment = async (req, res) => {
    
    try {
      const { postId } = req.params; // Extract postId
      const commentkarneWaleUserKiId = req.id;
      const { text } = req.body;
  
      if (!text) return res.status(400).json({ message: 'Text is required', success: false });
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found', success: false });
  
      const comment = await Comment.create({
        text,
        author: commentkarneWaleUserKiId,
        post: postId,
      });
  
      await comment.populate({
        path: 'author',
        select: 'username profilePicture',
      });
  
      post.comments.push(comment._id);
      await post.save();
  
      return res.status(201).json({
        message: 'Comment added successfully',
        comment,
        success: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Server error', success: false });
    }
};

//all comments on a single post 
export const getCommentsOnPost = async () => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');
        if (!comments) return res.status(404).json({ message: 'No comment found', success: false })
        return res.status(200).json({ success: true, comments })
    } catch (error) {
        console.log(error)
    }
}

//delete post
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        
        if (!post) return res.status(404).json({ message: 'post is not available', success: false });

        // Only account holder delete their post 
        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorised user' });

        // delete post
        await Post.findByIdAndDelete(postId);

        // now delete the postId from user document
        let user = await User.findById(authorId);
        user.posts = user.posts.filter((id) => id.toString() !== postId); // add () to id.toString
        await user.save(); // save the user document

        // now delete all comments of deleted post 
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            message: "Post deleted",
            success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};


//bookmark post 
export const bookmark = async (req, res) => {
    try {
        const postId = req.params.id
        const authorId = req.id
        const post = await Post.findById(postId)

        if (!post) return res.status(404).json({ message: 'Post not found', success: false })

        const user = await User.findById(authorId)
        if (user.bookmarks.includes(post._id)) {
            //post is already bookmarked if person want to remove from bookmark
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: "Post removed from bookmark", success: true })
        }
        else {
            //have to bookmark the post
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: "Post bookmarked", success: true })
        }
    }
    catch (error) {
        console.log(error);

    }
}