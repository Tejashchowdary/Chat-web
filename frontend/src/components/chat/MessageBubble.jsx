import { motion } from 'framer-motion'
import { formatFileSize, getFileIcon } from '../../utils/fileUpload'

// Helper to check if a message is only emojis
const isOnlyEmoji = (text) => {
  return text && text.replace(/\s/g, '').match(/^\p{Emoji}+$/u)
}

const MessageBubble = ({ message, isOwn }) => {
  // Format date + time with Today / Yesterday / Older
  const formatDateTime = (date) => {
    const d = new Date(date)
    const now = new Date()

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (isYesterday) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  const renderMessageContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="max-w-xs sm:max-w-sm lg:max-w-md">
            <img
              src={message.media.url}
              alt={message.content || 'Image'}
              className="rounded-lg w-full h-auto"
              loading="lazy"
            />
            {message.content && (
              <p className="mt-2 text-sm break-words">{message.content}</p>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="max-w-xs sm:max-w-sm lg:max-w-md">
            <video
              src={message.media.url}
              controls
              className="rounded-lg w-full h-auto"
            />
            {message.content && (
              <p className="mt-2 text-sm break-words">{message.content}</p>
            )}
          </div>
        )

      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white bg-opacity-20 rounded-lg max-w-xs sm:max-w-sm lg:max-w-md">
            <div className="text-2xl">{getFileIcon(message.media.mimeType)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.media.filename}</p>
              <p className="text-xs opacity-75">{formatFileSize(message.media.size)}</p>
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
        const emojiOnly = isOnlyEmoji(message.content)
        return (
          <p
            className="break-words"
            style={{
              fontSize: emojiOnly ? '2rem' : '1rem',
              lineHeight: emojiOnly ? 1 : 1.5,
              textAlign: emojiOnly ? 'center' : 'left',
            }}
          >
            {message.content}
          </p>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
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

        <div
          className={`text-xs mt-1 opacity-75 ${isOwn ? 'text-right' : 'text-left'} whitespace-nowrap`}
        >
          {formatDateTime(message.createdAt)}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble
