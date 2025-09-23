import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, User, Mail, Edit2, Upload, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { uploadFile, validateFile } from '../utils/fileUpload'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser, updateProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      validateFile(file, 5 * 1024 * 1024) // 5MB limit for avatars
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setAvatarPreview(e.target.result)
      reader.readAsDataURL(file)

      // Upload file
      setIsUploading(true)
      const uploadedFile = await uploadFile(file)
      
      setFormData(prev => ({ ...prev, avatar: uploadedFile.url }))
      setAvatarPreview(uploadedFile.url)
      
      toast.success('Avatar uploaded successfully!')
        await updateProfile({ ...formData, avatar: uploadedFile.url })
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar')
      setAvatarPreview(user?.avatar || '')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setIsEditing(false)
      }
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 chat-container">
      <div className="max-w-2xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm mobile-header flex-shrink-0">
          <div className="px-4 py-4 flex items-center safe-area-top">
            <button
              onClick={() => navigate('/chat')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors touch-button"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Profile</h1>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto mobile-bottom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 profile-form"
          >
            {/* Avatar Section */}
            <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="avatar-upload-container">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-primary-500 rounded-full flex items-center justify-center avatar-upload relative">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="avatar-preview"
                      />
                    ) : (
                      <User className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <LoadingSpinner size="sm" color="white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="avatar-upload-overlay">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                </div>
                
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{user?.username}</h2>
                  <p className="text-gray-600 mb-2">{user?.email}</p>
                  <button
                    onClick={() => document.querySelector('input[type="file"]').click()}
                    disabled={isUploading}
                    className="inline-flex items-center space-x-2 text-sm text-primary-500 hover:text-primary-600 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Personal Information</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary-500 hover:text-primary-600 transition-colors touch-button p-2"
                >
                  {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 message-input"
                    />
                  ) : (
                    <p className="text-gray-800 py-2 text-sm sm:text-base">{user?.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 message-input"
                    />
                  ) : (
                    <p className="text-gray-800 py-2 text-sm sm:text-base">{user?.email}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors touch-button"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        username: user?.username || '',
                        email: user?.email || '',
                        avatar: user?.avatar || ''
                      })
                      setAvatarPreview(user?.avatar || '')
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors touch-button"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Settings</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-button text-sm sm:text-base">
                  Notifications
                </button>
                <button className="w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-button text-sm sm:text-base">
                  Privacy
                </button>
                <button className="w-full text-left px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-button text-sm sm:text-base">
                  Security
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-button text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Profile