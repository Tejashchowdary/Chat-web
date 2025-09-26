import { useState } from 'react'
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

  // Filter chats based on search query
  const filteredChats = chats
    .filter(chat => {
      if (!searchQuery) return true
      if (chat.isGroupChat) return chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const otherUser = chat.participants.find(p => p._id !== user._id)
      return otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase())
    })
    // Sort by latest message
    .sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0
      return bTime - aTime
    })

  const handleChatSelect = (chat) => {
    setCurrentChat(chat)
    if (onClose) onClose()
  }

  return (
    <div className="h-full flex flex-col bg-white safe-area max-w-full sm:max-w-xs md:max-w-sm mx-auto">
      
      {/* Header */}
      <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Chats</h1>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            <button
              onClick={onNewChat}
              className="p-2 md:p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-button"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 md:p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors md:hidden touch-button"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
              </button>
            )}
          </div>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-2.5 md:py-3 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm sm:text-base md:text-lg"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-2" />
            <p className="text-sm md:text-base">No chats yet</p>
            <button
              onClick={onNewChat}
              className="mt-2 text-primary-500 text-sm md:text-base hover:text-primary-600"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          <div className="py-1 sm:py-2 md:py-3">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                currentUser={user}
                isSelected={currentChat?._id === chat._id}
                isOnline={chat.participants.some(
                  (p) => p._id !== user._id && onlineUsers.has(p._id)
                )}
                onClick={() => handleChatSelect(chat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Profile (sticky bottom) */}
      <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-medium text-gray-800 truncate">{user?.username}</p>
            <p className="text-xs md:text-sm text-gray-500">Online</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 md:p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-button flex-shrink-0"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
