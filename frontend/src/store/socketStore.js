import { create } from 'zustand'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useChatStore } from './chatStore'

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  
  connect: (user) => {
    const { socket } = get()
    
    if (socket?.connected) return
    
    const token = localStorage.getItem('auth-storage') 
      ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
      : null

    if (!token) return

    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      set({ socket: newSocket })
    })

    newSocket.on('userStatusUpdate', ({ userId, status }) => {
      set(state => {
        const newOnlineUsers = new Map(state.onlineUsers)
        if (status === 'online') {
          newOnlineUsers.set(userId, true)
        } else {
          newOnlineUsers.delete(userId)
        }
        return { onlineUsers: newOnlineUsers }
      })
    })

    newSocket.on('userTyping', ({ userId, isTyping }) => {
      set(state => {
        const newTypingUsers = new Map(state.typingUsers)
        if (isTyping) {
          newTypingUsers.set(userId, true)
        } else {
          newTypingUsers.delete(userId)
        }
        return { typingUsers: newTypingUsers }
      })
    })

    // Handle real-time new messages
    newSocket.on('newMessage', (messageData) => {
      // Dispatch custom event for chat store to handle
      window.dispatchEvent(new CustomEvent('newMessage', { detail: messageData }))
    })

    // Handle real-time chat updates
    newSocket.on('chatUpdated', (chatData) => {
      // Dispatch custom event for chat store to handle
      window.dispatchEvent(new CustomEvent('chatUpdated', { detail: chatData }))
    })

    // Handle message errors
    newSocket.on('messageError', (error) => {
      toast.error(error.message || 'Failed to send message')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      toast.error('Connection failed. Please try again.')
    })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ 
        socket: null, 
        onlineUsers: new Map(), 
        typingUsers: new Map() 
      })
    }
  },

  joinRoom: (roomId) => {
    const { socket } = get()
    if (socket) {
      socket.emit('joinRoom', roomId)
    }
  },

  leaveRoom: (roomId) => {
    const { socket } = get()
    if (socket) {
      socket.emit('leaveRoom', roomId)
    }
  },

  sendMessage: (messageData) => {
    const { socket } = get()
    if (socket) {
      socket.emit('sendMessage', messageData)
    }
  },

  setTyping: (chatId, isTyping) => {
    const { socket } = get()
    if (socket) {
      socket.emit('typing', { chatId, isTyping })
    }
  }
}))
