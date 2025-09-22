import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, File, AlertCircle } from 'lucide-react'
import { uploadFile, validateFile, formatFileSize, getFileIcon } from '../../utils/fileUpload'
import LoadingSpinner from '../common/LoadingSpinner'

const FileUpload = ({ onClose, onUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    try {
      validateFile(file)
      setSelectedFile(file)
      setError(null)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setError(null)

      const uploadedFile = await uploadFile(selectedFile, setUploadProgress)
      onUpload(uploadedFile)
      onClose()
    } catch (error) {
      setError(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 chat-container"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Upload File</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto">
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  drag-area ${isDragActive ? 'drag-active' : ''}
                  ${error ? 'border-red-300' : 'border-gray-300'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                
                <div className="text-center">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-600 mb-2">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors touch-button text-sm sm:text-base"
                  >
                    Choose File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl sm:text-3xl flex-shrink-0">
                    {getFileIcon(selectedFile.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors touch-button text-sm sm:text-base"
                  >
                    Change File
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center touch-button text-sm sm:text-base"
                  >
                    {isUploading ? <LoadingSpinner size="sm" color="white" /> : 'Upload'}
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}

            {/* File Format Info */}
            <div className="mt-4 text-xs text-gray-500">
              <p className="mb-1">Supported formats: Images, Videos, PDF, Word documents, Text files</p>
              <p>Maximum file size: 50MB</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FileUpload