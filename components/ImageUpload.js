/*
DESCRIPTION: Drag and drop image upload component for incident reports.
- Supports drag and drop functionality
- Shows image preview
- Validates file types and sizes
- Handles upload to Supabase Storage
- Optional field - can be left empty

WHAT EACH PART DOES:
1. useState - Manages drag state, selected file, preview, and upload status
2. File validation - Checks file type and size
3. Drag handlers - Manages drag and drop events
4. Upload function - Uploads to Supabase Storage
5. Preview display - Shows selected image

PSEUDOCODE:
- Handle drag and drop events
- Validate uploaded files (type, size)
- Show image preview
- Upload to Supabase Storage
- Return file URL to parent component
*/

'use client'

import { useState, useRef } from 'react'

export default function ImageUpload({ onImageUpload, onImageRemove, initialImage = null }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(initialImage)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // Valid file types
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  // Validate file
  const validateFile = (file) => {
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
      return false
    }
    if (file.size > maxSize) {
      setError('File size must be less than 5MB')
      return false
    }
    return true
  }

  // Handle file selection
  const handleFileSelect = async (file) => {
    setError(null)
    
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadFile(file)
  }

  // Upload file to Supabase Storage
  const uploadFile = async (file) => {
    try {
      setUploading(true)
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `incident-images/${fileName}`

      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', filePath)

      // Upload via API route
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Notify parent component
      onImageUpload?.(result.url)
      
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image. Please try again.')
      setSelectedFile(null)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Remove image
  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    onImageRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-neutral-700">
        Incident Image (Optional)
      </label>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-neutral-300 hover:border-neutral-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          // Image Preview
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Incident preview"
                className="max-w-full max-h-48 sm:max-h-64 rounded-lg shadow-sm"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors touch-manipulation"
                disabled={uploading}
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          // Upload Prompt
          <div className="space-y-4">
            <div className="text-neutral-500">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-indigo-600 hover:text-indigo-500 touch-manipulation"
                >
                  Tap to upload
                </button>
                <span className="hidden sm:inline"> or drag and drop</span>
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
            </div>
          </div>
        )}
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
