import { create } from 'zustand'
import Peer from 'simple-peer'
import toast from 'react-hot-toast'

export const useCallStore = create((set, get) => ({
  // Call state
  incomingCall: null,
  activeCall: null,
  callType: null,
  isCallActive: false,
  isCallModalOpen: false,
  
  // Media streams
  localStream: null,
  remoteStream: null,
  
  // Peer connection
  peer: null,
  
  // Audio/Video settings
  isMuted: false,
  isVideoOff: false,

  // Initialize call functionality
  initializeCall: (socket) => {
    if (!socket) return

    // Handle incoming calls
    socket.on('incomingCall', ({ from, signal, callType }) => {
      set({
        incomingCall: { from, signal, callType },
        callType,
        isCallModalOpen: true
      })
      
      // Play ringtone (optional)
      toast.success(`Incoming ${callType} call`, {
        duration: 10000
      })
    })

    // Handle call answered
    socket.on('callAnswered', ({ signal }) => {
      const { peer } = get()
      if (peer) {
        peer.signal(signal)
      }
    })

    // Handle call rejected
    socket.on('callRejected', () => {
      toast.error('Call was rejected')
      get().endCall()
    })

    // Handle call ended
    socket.on('callEnded', () => {
      toast.info('Call ended')
      get().endCall()
    })

    // Handle ICE candidates
    socket.on('ice-candidate', ({ candidate }) => {
      const { peer } = get()
      if (peer) {
        peer.signal(candidate)
      }
    })
  },

  // Start a call
  startCall: async (userId, callType, socket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      })

      set({
        localStream: stream,
        callType,
        isCallActive: true,
        isCallModalOpen: true
      })

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream
      })

      peer.on('signal', (signal) => {
        socket.emit('callUser', {
          userId,
          signalData: signal,
          callType
        })
      })

      peer.on('stream', (remoteStream) => {
        set({ remoteStream })
      })

      peer.on('error', (error) => {
        console.error('Peer error:', error)
        toast.error('Call failed')
        get().endCall()
      })

      set({ peer, activeCall: userId })

    } catch (error) {
      console.error('Failed to start call:', error)
      toast.error('Failed to access camera/microphone')
    }
  },

  // Answer incoming call
  answerCall: async (socket) => {
    try {
      const { incomingCall, callType } = get()
      if (!incomingCall) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      })

      set({
        localStream: stream,
        isCallActive: true,
        activeCall: incomingCall.from,
        incomingCall: null
      })

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream
      })

      peer.on('signal', (signal) => {
        socket.emit('answerCall', {
          to: incomingCall.from,
          signal
        })
      })

      peer.on('stream', (remoteStream) => {
        set({ remoteStream })
      })

      peer.on('error', (error) => {
        console.error('Peer error:', error)
        toast.error('Call failed')
        get().endCall()
      })

      peer.signal(incomingCall.signal)
      set({ peer })

    } catch (error) {
      console.error('Failed to answer call:', error)
      toast.error('Failed to access camera/microphone')
    }
  },

  // Reject incoming call
  rejectCall: (socket) => {
    const { incomingCall } = get()
    if (!incomingCall) return

    socket.emit('rejectCall', { to: incomingCall.from })
    set({
      incomingCall: null,
      isCallModalOpen: false
    })
  },

  // End active call
  endCall: (socket) => {
    const { activeCall, localStream, peer } = get()

    if (activeCall && socket) {
      socket.emit('endCall', { to: activeCall })
    }

    // Stop media streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }

    // Close peer connection
    if (peer) {
      peer.destroy()
    }

    set({
      incomingCall: null,
      activeCall: null,
      callType: null,
      isCallActive: false,
      isCallModalOpen: false,
      localStream: null,
      remoteStream: null,
      peer: null,
      isMuted: false,
      isVideoOff: false
    })
  },

  // Toggle mute
  toggleMute: () => {
    const { localStream } = get()
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        set({ isMuted: !audioTrack.enabled })
      }
    }
  },

  // Toggle video
  toggleVideo: () => {
    const { localStream } = get()
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        set({ isVideoOff: !videoTrack.enabled })
      }
    }
  },

  // Close call modal
  closeCallModal: () => {
    set({ isCallModalOpen: false })
  }
}))