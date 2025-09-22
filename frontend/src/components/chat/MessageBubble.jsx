import { motion } from 'framer-motion'
import { formatFileSize, getFileIcon } from '../../utils/fileUpload'

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={message.media.url}
              alt={message.content}
              className="rounded-lg w-full h-auto"
              loading="lazy"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      
      case 'video':
        return (
          <div className="max-w-xs">
            <video
              src={message.media.url}
              controls
              className="rounded-lg w-full h-auto"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-20 rounded-lg">
            <div className="text-2xl">
              {getFileIcon(message.media.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {message.media.filename}
              </p>
              <p className="text-xs opacity-75">
                {formatFileSize(message.media.size)}
              </p>
            </div>
            <a
              href={message.media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Download
            </a>
          </div>
        )
      
      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          message-bubble max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl
          ${isOwn 
            ? 'bg-primary-500 text-white message-bubble sent' 
            : 'bg-gray-200 text-gray-800 message-bubble received'
          }
        `}
      >
        {!isOwn && (
          <p className="text-xs font-medium mb-1 opacity-75 truncate">
            {message.sender.username}
          </p>
        )}
        
        {renderMessageContent()}
        
        <div className={`text-xs mt-1 opacity-75 ${isOwn ? 'text-right' : 'text-left'} whitespace-nowrap`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble