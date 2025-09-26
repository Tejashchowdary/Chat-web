import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Picker from "@emoji-mart/react";
import emojiData from "@emoji-mart/data";
import {
  Menu,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  User,
 ArrowLeft
} from "lucide-react";

import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import { useCallStore } from "../../store/callStore";
import { useAuthStore } from "../../store/authStore";
import MessageBubble from "./MessageBubble";
import FileUpload from "./FileUpload";

const ChatWindow = ({ onToggleSidebar, isMobile }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevChatIdRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { user } = useAuthStore();
  const { currentChat, messages, getChatMessages, addMessage, updateChat } =
    useChatStore();
  const { socket, joinRoom, leaveRoom, setTyping, typingUsers } =
    useSocketStore();
  const { startCall } = useCallStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (!currentChat || newMessage.chat !== currentChat._id) return;
      const exists = useChatStore
        .getState()
        .messages.some((msg) => msg._id === newMessage._id);
      if (!exists) addMessage(newMessage);
    };

    const handleChatUpdated = (updatedChat) => updateChat(updatedChat);

    socket.on("newMessage", handleNewMessage);
    socket.on("chatUpdated", handleChatUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("chatUpdated", handleChatUpdated);
    };
  }, [socket, currentChat, addMessage, updateChat]);

  // Load messages + join/leave rooms
  useEffect(() => {
    if (currentChat) {
      getChatMessages(currentChat._id);
      joinRoom(currentChat._id);
      if (prevChatIdRef.current && prevChatIdRef.current !== currentChat._id) {
        leaveRoom(prevChatIdRef.current);
      }
      prevChatIdRef.current = currentChat._id;
    }
    return () => {
      if (currentChat) leaveRoom(currentChat._id);
    };
  }, [currentChat, getChatMessages, joinRoom, leaveRoom]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    const messageData = {
      content: message,
      messageType: "text",
      chatId: currentChat._id,
    };

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content: message,
      messageType: "text",
      chat: currentChat._id,
      sender: user,
      createdAt: new Date(),
    };
    addMessage(optimisticMessage);
    socket?.emit("sendMessage", messageData);
    setMessage("");
    setIsTyping(false);
    setTyping(currentChat._id, false);
  };

  // Typing
  const handleTyping = (value) => {
    setMessage(value);
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      setTyping(currentChat._id, true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(currentChat._id, false);
    }, 3000);
  };

  // Add emoji
  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native);
  };

  // File upload
   const handleFileUpload = (file) => {
    if (!currentChat) return

    const msgData = {
      content: file.filename,
      messageType: file.mimeType.startsWith('image/')
        ? 'image'
        : file.mimeType.startsWith('video/')
        ? 'video'
        : 'file',
      media: file,
      chatId: currentChat._id,
    }

    const tempMsg = {
      ...msgData,
      _id: `temp-${Date.now()}`,
      sender: user,
      createdAt: new Date(),
      chat: currentChat._id,
    }

    addMessage(tempMsg)          // Show immediately
    socket?.emit('sendMessage', msgData)
  }


  // Calls
  const handleCall = (callType) => {
    if (!currentChat || currentChat.isGroupChat) return;
    const otherUser = currentChat.participants.find((p) => p._id !== user._id);
    if (otherUser && socket) startCall(otherUser._id, callType, socket);
  };

  // Helpers
  const getChatDisplayName = () => {
    if (!currentChat) return "";
    if (currentChat.isGroupChat) return currentChat.name || "Group Chat";
    const otherUser = currentChat.participants.find((p) => p._id !== user._id);
    return otherUser?.username || "Unknown User";
  };

  const getTypingUsers = () => {
    if (!currentChat) return [];
    return Array.from(typingUsers.keys())
      .map((id) => currentChat.participants.find((p) => p._id === id))
      .filter((u) => u && u._id !== user._id);
  };

  // Empty state
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="text-center max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl sm:text-3xl md:text-4xl">
              💬
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
            Welcome to ChatApp
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-2 sm:space-x-3 relative z-20">
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center overflow-hidden">
            {currentChat &&
            !currentChat.isGroupChat &&
            currentChat.participants.find((p) => p._id !== user._id)?.avatar ? (
              <img
                src={
                  currentChat.participants.find((p) => p._id !== user._id)
                    .avatar
                }
                alt="Avatar"
                className="w-full h-full object-cover"
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
              {currentChat?.isGroupChat
                ? `${currentChat.participants.length} members`
                : "Last seen recently"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {!currentChat.isGroupChat && (
            <>
              <button
                onClick={() => handleCall("audio")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => handleCall("video")}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
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
            <div className="bg-gray-200 rounded-2xl px-3 sm:px-4 py-2">
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
      <div className="bg-white border-t border-gray-200 p-2 sm:p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2 sm:space-x-3"
        >
           <button type="button" onClick={() => setShowFileUpload(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex-1 relative" ref={emojiPickerRef}>
            <input
              type="text"
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-3 py-2 bg-gray-100 rounded-full focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none text-sm sm:text-base"
            />

            {/* Smile Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Emoji Picker */}
            {/* Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-50 shadow-lg rounded-lg bg-white w-[260px] sm:w-[240px]"
                  style={{
                    bottom: "3rem", // above input
                    right: 0,
                  }}
                >
                  <Picker
                    data={emojiData}
                    onEmojiSelect={addEmoji}
                    theme="light"
                    emojiSize={20} // slightly smaller for neat look
                    perLine={7} // fewer columns → compact
                    previewPosition="none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim()}
            className="p-2 sm:p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
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
  );
};

export default ChatWindow;


// i want to update the chatwindow.jsx ,fileUpload.jsx and messagebubble.jsx fileUpload.js and in backend index.js 
