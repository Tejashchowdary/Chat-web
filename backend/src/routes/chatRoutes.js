import express from 'express';
import {
  getChats,
  createChat,
  getChatMessages,
  sendMessage,
  searchUsers
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getChats);
router.post('/', createChat);
router.get('/users/search', searchUsers);
router.get('/:chatId/messages', getChatMessages);
router.post('/:chatId/messages', sendMessage);

export default router;