import express from 'express';
import { editProfile, followOrUnfollow, getSuggestedUsers, login, logout, register, userProfile } from '../controller/userController.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import upload from '../middleware/multer.js';

const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated, userProfile);
router.route('/profile/edit/:id').patch(isAuthenticated, upload.single('profilePicture'), editProfile);
router.route('/suggested').get( getSuggestedUsers);
router.route('/followOrUnfollow/:id').get(isAuthenticated, followOrUnfollow);
export default router;
