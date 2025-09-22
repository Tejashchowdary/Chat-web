import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'username email avatar status')
    .populate('lastMessage')
    .populate('admin', 'username email')
    .sort({ updatedAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new chat
// @route   POST /api/chat
// @access  Private
export const createChat = async (req, res) => {
  try {
    const { participantId, isGroupChat, name, participants } = req.body;

    if (!isGroupChat && !participantId) {
      return res.status(400).json({ message: 'Participant ID is required for direct chat' });
    }

    if (isGroupChat && (!participants || participants.length < 2)) {
      return res.status(400).json({ message: 'Group chat requires at least 2 participants' });
    }

    let chatParticipants;
    
    if (isGroupChat) {
      chatParticipants = [...participants, req.user.id];
    } else {
      // Check if direct chat already exists
      const existingChat = await Chat.findOne({
        isGroupChat: false,
        participants: { $all: [req.user.id, participantId], $size: 2 }
      });

      if (existingChat) {
        return res.status(200).json({ 
          message: 'Chat already exists',
          chat: existingChat 
        });
      }

      chatParticipants = [req.user.id, participantId];
    }

    const chat = await Chat.create({
      name: isGroupChat ? name : undefined,
      isGroupChat,
      participants: chatParticipants,
      admin: isGroupChat ? req.user.id : undefined
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'username email avatar status')
      .populate('admin', 'username email');

    res.status(201).json({
      message: 'Chat created successfully',
      chat: populatedChat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ 
      chat: chatId,
      deleted: false
    })
    .populate('sender', 'username email avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', media } = req.body;

    // Verify user is participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      sender: req.user.id,
      chat: chatId,
      content,
      messageType,
      media
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search users
// @route   GET /api/chat/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};