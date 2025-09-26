import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { authenticateSocket } from './middleware/authMiddleware.js';
import Chat from './models/Chat.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO with CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userId: socket.userId,
    status: 'online'
  });

  // Broadcast user status
  socket.broadcast.emit('userStatusUpdate', {
    userId: socket.userId,
    status: 'online'
  });

  // Join user to their personal room
  socket.join(socket.userId);

  // Handle joining chat rooms
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  // Handle leaving chat rooms
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.userId} left room ${roomId}`);
  });

  // Handle new messages
  socket.on('sendMessage', async (messageData) => {
    try {
      // Create message in database first
      const message = await Message.create({
        sender: socket.userId,
        chat: messageData.chatId,
        content: messageData.content,
        messageType: messageData.messageType,
        media: messageData.media
      });

      // Update chat's last message
      await Chat.findByIdAndUpdate(messageData.chatId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });

      // Populate message data
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username email avatar');

      // Broadcast to all users in the room EXCEPT the sender
      io.in(messageData.chatId).emit('newMessage', populatedMessage);


      // Also broadcast chat update to all users EXCEPT the sender
      const updatedChat = await Chat.findById(messageData.chatId)
        .populate('participants', 'username email avatar status')
        .populate('lastMessage');

      socket.to(messageData.chatId).emit('chatUpdated', updatedChat);
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('messageError', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId, isTyping }) => {
    socket.to(chatId).emit('userTyping', {
      userId: socket.userId,
      isTyping
    });
  });

  // WebRTC signaling for voice/video calls
  socket.on('callUser', ({ userId, signalData, callType }) => {
    const targetUser = connectedUsers.get(userId);
    if (targetUser) {
      io.to(targetUser.socketId).emit('incomingCall', {
        from: socket.userId,
        signal: signalData,
        callType
      });
    }
  });

  socket.on('answerCall', ({ to, signal }) => {
    const targetUser = connectedUsers.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('callAnswered', {
        signal,
        from: socket.userId
      });
    }
  });

  socket.on('rejectCall', ({ to }) => {
    const targetUser = connectedUsers.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('callRejected', {
        from: socket.userId
      });
    }
  });

  socket.on('endCall', ({ to }) => {
    const targetUser = connectedUsers.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('callEnded', {
        from: socket.userId
      });
    }
  });

  // Handle ice candidates for WebRTC
  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetUser = connectedUsers.get(to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('ice-candidate', {
        from: socket.userId,
        candidate
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Remove user from connected users
    connectedUsers.delete(socket.userId);
    
    // Broadcast user offline status
    socket.broadcast.emit('userStatusUpdate', {
      userId: socket.userId,
      status: 'offline'
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;