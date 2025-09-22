import { motion } from 'framer-motion'
import { User, Users } from 'lucide-react'

const ChatListItem = ({ 
  chat, 
  currentUser, 
  isSelected, 
  isOnline, 
  onClick 
}) => {
  const getDisplayName = () => {
    if (chat.isGroupChat) {
      return chat.name || 'Group Chat'
    } else {
      const otherUser = chat.participants.find(p => p._id !== currentUser._id)
      return otherUser?.username || 'Unknown User'
    }
  }

  const getLastMessagePreview = () => {
    if (!chat.lastMessage) return 'No messages yet'
    
    if (chat.lastMessage.messageType === 'text') {
      return chat.lastMessage.content
    } else {
      return `📎 ${chat.lastMessage.messageType}`
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const messageDate = new Date(date)
    const diffMs = now - messageDate
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    
    return messageDate.toLocaleDateString()
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: '#f9fafb' }}
      onClick={onClick}
      className={`
        flex items-center px-3 sm:px-4 py-3 cursor-pointer transition-colors relative touch-button
        ${isSelected ? 'bg-primary-50 border-r-2 border-primary-500' : 'hover:bg-gray-50'}
      `}
    >
      {/* Avatar */}
      <div className="relative mr-3 flex-shrink-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center">
          {chat.isGroupChat ? (
            <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          ) : chat.participants.find(p => p._id !== currentUser._id)?.avatar ? (
            <img 
              src={chat.participants.find(p => p._id !== currentUser._id).avatar} 
              alt="Avatar" 
              className="avatar-preview"
            />
          ) : (
            <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          )}
        </div>
        {!chat.isGroupChat && isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate">
            {getDisplayName()}
          </h3>
          {chat.lastMessage && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {getLastMessagePreview()}
        </p>
      </div>

      {/* Unread indicator */}
      {/* TODO: Implement unread count */}
      {false && (
        <div className="ml-2 flex-shrink-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ChatListItem