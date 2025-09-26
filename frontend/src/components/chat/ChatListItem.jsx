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
  
   const hasUnread = chat.unreadCount > 0 

 


   return (
     <motion.div
       whileHover={{ backgroundColor: "#f9fafb" }}
       onClick={onClick}
       className={`
        flex items-center px-2 sm:px-4 py-2 sm:py-3 cursor-pointer transition-colors relative
        ${
          isSelected
            ? "bg-primary-50 border-r-2 border-primary-500"
            : "hover:bg-gray-50"
        }
      `}
     >
       {/* Avatar */}
       <div className="relative mr-2 sm:mr-3 flex-shrink-0">
         <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
           {chat.isGroupChat ? (
             <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
           ) : chat.participants.find((p) => p._id !== currentUser._id)
               ?.avatar ? (
             <img
               src={
                 chat.participants.find((p) => p._id !== currentUser._id).avatar
               }
               alt="Avatar"
               className="w-full h-full object-cover"
             />
           ) : (
             <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
           )}
         </div>

         {/* Online status for each participant */}
         {chat.isGroupChat
           ? chat.participants
               .filter(
                 (p) => p._id !== currentUser._id && onlineUsers.has(p._id)
               )
               .map((p, idx) => (
                 <div
                   key={p._id}
                   style={{
                     bottom: "-2px",
                     right: `${2 + idx * 8}px`, // spacing between multiple dots
                   }}
                   className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"
                 />
               ))
           : isOnline && (
               <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full" />
             )}
       </div>

       {/* Chat Info */}
       <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between mb-0.5 sm:mb-1">
           <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate max-w-[70%] sm:max-w-none">
             {getDisplayName()}
           </h3>
           {chat.lastMessage && (
             <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 ml-1 sm:ml-2">
               {formatTime(chat.lastMessage.createdAt)}
             </span>
           )}
         </div>
         <p className="text-xs sm:text-sm text-gray-500 truncate">
           {getLastMessagePreview()}
         </p>
       </div>
     </motion.div>
   );
}


export default ChatListItem