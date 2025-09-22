import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  X
} from 'lucide-react'
import { useCallStore } from '../../store/callStore'
import { useSocketStore } from '../../store/socketStore'

const CallModal = () => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const { socket } = useSocketStore()
  const {
    incomingCall,
    activeCall,
    callType,
    isCallActive,
    isCallModalOpen,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    closeCallModal
  } = useCallStore()

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  if (!isCallModalOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center chat-container"
      >
        <div className="w-full h-full max-w-4xl mx-auto relative safe-area">
          {/* Close Button */}
          <button
            onClick={() => {
              if (isCallActive) {
                endCall(socket)
              } else {
                closeCallModal()
              }
            }}
            className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors touch-button"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Incoming Call */}
          {incomingCall && !isCallActive && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-white text-center"
            >
              <div className="mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  Incoming {callType} call
                </h2>
                <p className="text-sm sm:text-base text-gray-300">
                  From: User {incomingCall.from}
                </p>
              </div>

              <div className="flex justify-center space-x-6 sm:space-x-8">
                <button
                  onClick={() => rejectCall(socket)}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors touch-button"
                >
                  <PhoneOff className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                <button
                  onClick={() => answerCall(socket)}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors touch-button"
                >
                  <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Active Call */}
          {isCallActive && (
            <div className="h-full flex flex-col">
              {/* Video Area */}
              {callType === 'video' ? (
                <div className="flex-1 relative">
                  {/* Remote Video */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover bg-gray-900"
                  />
                  
                  {/* Local Video */}
                  <div className="absolute top-4 right-4 w-32 h-24 sm:w-48 sm:h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Call Info */}
                  <div className="absolute top-4 left-4 text-white">
                    <p className="text-base sm:text-lg font-semibold">Video Call</p>
                    <p className="text-xs sm:text-sm opacity-75">Connected</p>
                  </div>
                </div>
              ) : (
                /* Audio Call */
                <div className="flex-1 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-4xl">👤</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2">Audio Call</h2>
                    <p className="text-sm sm:text-base text-gray-300">Connected</p>
                  </div>
                </div>
              )}

              {/* Call Controls */}
              <div className="flex justify-center items-center p-4 sm:p-8 space-x-4 sm:space-x-6 mobile-bottom">
                <button
                  onClick={toggleMute}
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors touch-button
                    ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
                  `}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>

                {callType === 'video' && (
                  <button
                    onClick={toggleVideo}
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors touch-button
                      ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}
                    `}
                  >
                    {isVideoOff ? (
                      <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => endCall(socket)}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors touch-button"
                >
                  <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CallModal