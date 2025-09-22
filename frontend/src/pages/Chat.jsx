import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSocketStore } from '../store/socketStore'
import { useChatStore } from '../store/chatStore'
import { useCallStore } from '../store/callStore'

import Sidebar from '../components/chat/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import UserSearch from '../components/chat/UserSearch'

const Chat = () => {
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showSidebar, setShowSidebar] = useState(!isMobile)

  const { socket } = useSocketStore()
  const { currentChat, getChats, addMessage } = useChatStore()
  const { initializeCall } = useCallStore()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setShowSidebar(!mobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

 useEffect(() => {
  getChats(); // Load chats on mount
}, [getChats]);

useEffect(() => {
  if (!socket) return;

  initializeCall(socket);

  // Handle new messages
  const handleNewMessage = (message) => {
    addMessage(message);      // Update messages in the current chat
    getChats();               // Refresh chat list (for last message, unread, etc.)
  };

  socket.on('newMessage', handleNewMessage);

  return () => {
    socket.off('newMessage', handleNewMessage);
  };
}, [socket, initializeCall, addMessage, getChats]);

  return (
    <div className="flex h-screen bg-gray-100 chat-container">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: showSidebar ? 0 : isMobile ? -window.innerWidth : -320,
          opacity: showSidebar ? 1 : isMobile ? 0 : 1
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`
          ${isMobile ? 'fixed z-20 sidebar-mobile' : 'relative w-80'} 
          h-full bg-white border-r border-gray-200
        `}
      >
        <Sidebar 
          onNewChat={() => setShowUserSearch(true)}
          onClose={() => isMobile && setShowSidebar(false)}
        />
      </motion.div>

      {/* Mobile overlay */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 touch-none"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow 
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          isMobile={isMobile}
        />
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
          onUserSelect={() => setShowUserSearch(false)}
        />
      )}

      {/* Mobile chat selected overlay */}
      {isMobile && currentChat && showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-5 touch-none"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}

export default Chat