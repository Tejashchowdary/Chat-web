import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  User, 
  Settings,
  MessageCircle,
  X
} from 'lucide-react'

import { useAuthStore } from '../../store/authStore'
import { useChatStore } from '../../store/chatStore'
import { useSocketStore } from '../../store/socketStore'
import ChatListItem from './ChatListItem'

const Sidebar = ({ onNewChat, onClose }) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  
  const { user } = useAuthStore()
  const { chats, setCurrentChat, currentChat } = useChatStore()
  const { onlineUsers } = useSocketStore()

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    
    if (chat.isGroupChat) {
      return chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    } else {
      const otherUser = chat.participants.find(p => p._id !== user._id)
      return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase())
    }
  })

  const handleChatSelect = (chat) => {
    setCurrentChat(chat)
    if (onClose) onClose()
  }

  return (
    <div className="h-full flex flex-col bg-white safe-area">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 mobile-header">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewChat}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-button"
            >
              <Plus className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors md:hidden touch-button"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none message-input"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">No chats yet</p>
            <button
              onClick={onNewChat}
              className="mt-2 text-primary-500 text-sm hover:text-primary-600"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="py-2">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                currentUser={user}
                isSelected={currentChat?._id === chat._id}
                isOnline={chat.participants.some(p => 
                  p._id !== user._id && onlineUsers.has(p._id)
                )}
                onClick={() => handleChatSelect(chat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 mobile-bottom">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="avatar-preview"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-button flex-shrink-0"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar