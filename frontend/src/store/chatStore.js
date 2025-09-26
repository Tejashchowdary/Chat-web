import { create } from 'zustand'
import toast from 'react-hot-toast'
import api from '../utils/api'

export const useChatStore = create((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,

  setCurrentChat: (chat, reloadMessages = true) => {
    set({ currentChat: chat, messages: [] })
     if (reloadMessages) {
      get().refreshChatMessages(chat._id)
    }
  },

  getChats: async () => {
    try {
      set({ isLoading: true })
      const response = await api.get('/chat')
      set({ chats: response.data.chats })
    } catch (error) {
      console.error('Get chats error:', error)
      toast.error('Failed to load chats')
    } finally {
      set({ isLoading: false })
    }
  },

  createChat: async (chatData) => {
    try {
      const response = await api.post('/chat', chatData)
      const newChat = response.data.chat

      set(state => ({
        chats: [newChat, ...state.chats]
      }))

      return { success: true, chat: newChat }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create chat'
      toast.error(message)
      return { success: false, message }
    }
  },

  getChatMessages: async (chatId) => {
    try {
      set({ isLoading: true })
      const response = await api.get(`/chat/${chatId}/messages`)
      set({ messages: response.data.messages })
    } catch (error) {
      console.error('Get messages error:', error)
      toast.error('Failed to load messages')
    } finally {
      set({ isLoading: false })
    }
  },

   refreshChatMessages: async (chatId) => {
    await get().getChatMessages(chatId)
  },

  sendMessage: async (chatId, messageData) => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, messageData)
      const newMessage = response.data.data

      set(state => {
        // Replace temp message if exists
        const updatedMessages = state.messages.map(msg =>
          msg._id.startsWith('temp-') && msg.content === newMessage.content
            ? newMessage
            : msg
        )

        // Avoid duplicate insert
        const exists = updatedMessages.some(msg => msg._id === newMessage._id)
        return {
          messages: exists ? updatedMessages : [...updatedMessages, newMessage]
        }
      })

      return { success: true, message: newMessage }
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
      return { success: false }
    }
  },

  addMessage: (message) => {
    set(state => {
      let updatedMessages = [...state.messages]

      // Replace optimistic temp message with server message
      if (!message._id.startsWith('temp-')) {
        updatedMessages = updatedMessages.map(msg =>
          msg._id.startsWith('temp-') &&
          msg.content === message.content &&
          msg.sender._id === message.sender._id
            ? message
            : msg
        )
      }

      // Prevent duplicates
      const exists = updatedMessages.some(msg => msg._id === message._id)
      if (!exists) {
        updatedMessages = [...updatedMessages, message]
      }

      return { messages: updatedMessages }
    })
  },

  updateChat: (updatedChat) => {
    set(state => ({
      chats: state.chats.map(chat =>
        chat._id === updatedChat._id ? updatedChat : chat
      )
    }))
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/chat/users/search?query=${query}`)
      return response.data.users
    } catch (error) {
      console.error('Search users error:', error)
      toast.error('Failed to search users')
      return []
    }
  }
  
}))
