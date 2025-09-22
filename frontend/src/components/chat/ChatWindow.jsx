import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Menu,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  User,
} from "lucide-react"

import { useChatStore } from "../../store/chatStore"
import { useSocketStore } from "../../store/socketStore"
import { useCallStore } from "../../store/callStore"
import { useAuthStore } from "../../store/authStore"
import MessageBubble from "./MessageBubble"
import FileUpload from "./FileUpload"

const ChatWindow = ({ onToggleSidebar, isMobile }) => {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const prevChatIdRef = useRef(null)

  const { user } = useAuthStore()
  const { currentChat, messages, getChatMessages, addMessage, updateChat } =
    useChatStore()
  const { socket, joinRoom, leaveRoom, setTyping, typingUsers } =
    useSocketStore()
  const { startCall } = useCallStore()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (newMessage) => {
      if (!currentChat || newMessage.chat !== currentChat._id) return

      const exists = useChatStore
        .getState()
        .messages.some((msg) => msg._id === newMessage._id)

      if (!exists) {
        addMessage(newMessage)
      }
    }

    const handleChatUpdated = (updatedChat) => {
      updateChat(updatedChat)
    }

    socket.on("newMessage", handleNewMessage)
    socket.on("chatUpdated", handleChatUpdated)

    return () => {
      socket.off("newMessage", handleNewMessage)
      socket.off("chatUpdated", handleChatUpdated)
    }
  }, [socket, currentChat, addMessage, updateChat])

  // ✅ Load messages + join/leave rooms
  useEffect(() => {
    if (currentChat) {
      getChatMessages(currentChat._id)
      joinRoom(currentChat._id)

      if (prevChatIdRef.current && prevChatIdRef.current !== currentChat._id) {
        leaveRoom(prevChatIdRef.current)
      }
      prevChatIdRef.current = currentChat._id
    }

    return () => {
      if (currentChat) {
        leaveRoom(currentChat._id)
      }
    }
  }, [currentChat, getChatMessages, joinRoom, leaveRoom])

  // ✅ Send message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim() || !currentChat) return

    const messageData = {
      content: message,
      messageType: "text",
      chatId: currentChat._id,
    }

    // Optimistic update
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content: message,
      messageType: "text",
      chat: currentChat._id,
      sender: user,
      createdAt: new Date(),
    }
    addMessage(optimisticMessage)

    // Emit to backend
    socket?.emit("sendMessage", messageData)

    setMessage("")
    setIsTyping(false)
    setTyping(currentChat._id, false)
  }

  // ✅ Typing
  const handleTyping = (value) => {
    setMessage(value)

    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
      setTyping(currentChat._id, true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      setTyping(currentChat._id, false)
    }, 3000)
  }

  // ✅ File upload
  const handleFileUpload = (file) => {
    if (!currentChat) return

    const messageData = {
      content: file.filename,
      messageType: file.mimeType.startsWith("image/")
        ? "image"
        : file.mimeType.startsWith("video/")
        ? "video"
        : "file",
      media: file,
      chatId: currentChat._id,
    }

    socket?.emit("sendMessage", messageData)
  }

  // ✅ Calls
  const handleCall = (callType) => {
    if (!currentChat || currentChat.isGroupChat) return

    const otherUser = currentChat.participants.find((p) => p._id !== user._id)
    if (otherUser && socket) {
      startCall(otherUser._id, callType, socket)
    }
  }

  // ✅ Helpers
  const getChatDisplayName = () => {
    if (!currentChat) return ""
    if (currentChat.isGroupChat) {
      return currentChat.name || "Group Chat"
    } else {
      const otherUser = currentChat.participants.find((p) => p._id !== user._id)
      return otherUser?.username || "Unknown User"
    }
  }

  const getTypingUsers = () => {
    if (!currentChat) return []
    return Array.from(typingUsers.keys())
      .map((id) => currentChat.participants.find((p) => p._id === id))
      .filter((u) => u && u._id !== user._id)
  }

  // ✅ Empty state
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome to ChatApp
          </h2>
          <p className="text-gray-600">Select a chat to start messaging</p>
        </div>
      </div>
    )
  }

  // ✅ UI
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center">
            {!currentChat.isGroupChat &&
            currentChat.participants.find((p) => p._id !== user._id)?.avatar ? (
              <img
                src={
                  currentChat.participants.find((p) => p._id !== user._id).avatar
                }
                alt="Avatar"
                className="avatar-preview"
              />
            ) : (
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
              {getChatDisplayName()}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {currentChat.isGroupChat
                ? `${currentChat.participants.length} members`
                : "Last seen recently"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!currentChat.isGroupChat && (
            <>
              <button
                onClick={() => handleCall("audio")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleCall("video")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble
            key={m._id}
            message={m}
            isOwn={m.sender._id === user._id}
          />
        ))}

        {getTypingUsers().map((u) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-200 rounded-2xl px-4 py-2">
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </motion.div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2 sm:space-x-3"
        >
          <button
            type="button"
            onClick={() => setShowFileUpload(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-3 py-2 bg-gray-100 rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>

      {showFileUpload && (
        <FileUpload
          onClose={() => setShowFileUpload(false)}
          onUpload={handleFileUpload}
        />
      )}
    </div>
  )
}

export default ChatWindow
