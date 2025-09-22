# Real-Time Chat Application

A full-stack real-time chat application built with the MERN stack, featuring Socket.IO for real-time communication and WebRTC for audio/video calls.

## Features

- 🔐 **Authentication**: JWT-based auth with bcrypt password hashing
- 💬 **Real-time Chat**: 1-to-1 messaging with Socket.IO
- 📁 **Media Sharing**: Upload and share images, videos, and files
- 📞 **Audio/Video Calls**: WebRTC-powered peer-to-peer calling
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop
- 🎨 **Modern UI**: WhatsApp-like interface with smooth animations

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.IO client for real-time communication
- WebRTC for audio/video calls

### Backend
- Node.js with Express.js
- MongoDB Atlas with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Cloudinary for media storage
- Multer for file uploads

## Project Structure

```
chat-app/
├── frontend/                  # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── store/             # State management
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/                   # Express.js backend
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── utils/            # Utility functions
│   │   └── index.js          # Entry point
│   └── package.json
└── README.md
```

### Backend Setup
1. Navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
### Frontend Setup
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
## Deployment
- **Backend**: Deploy to Render
- **Frontend**: Deploy to Vercel
