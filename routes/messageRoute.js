import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { getMessages, sendMessage } from '../controller/messageController.js';

const router = express.Router();

router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/all/:id').post(isAuthenticated, getMessages);

export default router;