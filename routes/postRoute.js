import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import upload from '../middleware/multer.js';
import { addComment, addNewPost, bookmark, deletePost, disLikePost, getAllPost, getCommentsOnPost, getUserPost, likePost } from '../controller/postController.js';

const router = express.Router();

router.route('/addpost').post(isAuthenticated, upload.single('image'), addNewPost);
router.route('/allpost').get(isAuthenticated, getAllPost);
router.route('/userpost/all').get(isAuthenticated, getUserPost);
router.route('/:id/like').get(isAuthenticated, likePost);
router.route('/:id/dislike').get(isAuthenticated, disLikePost);
router.route('/:id/comment').post(isAuthenticated, addComment);
router.route('/:id/comment/all').post(isAuthenticated, getCommentsOnPost);
router.route('/delete/:id').delete(isAuthenticated, deletePost);
router.route('/:id/bookmark').post(isAuthenticated, bookmark);

export default router;