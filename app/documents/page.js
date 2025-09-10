
/*
DESCRIPTION: This is the documents page that provides full document management functionality.
- Shows the current signed-in user information
- Provides document upload with drag-and-drop functionality
- Lists all documents with version management
- Handles document deletion and file operations
- Integrates with Supabase for storage and database operations

WHAT EACH PART DOES:
1. useUser hook - Gets the current authenticated user from Clerk
2. State management - Manages documents list, loading states, and upload progress
3. File upload - Handles drag-and-drop and file selection for document uploads
4. Document operations - Lists, deletes, and manages document versions
5. API integration - Communicates with backend API routes for CRUD operations

PSEUDOCODE:
- Import necessary hooks and components
- Get current user data using useUser hook
- Set up state for documents, loading, and upload progress
- Create functions for document operations (upload, delete, fetch)
- Render user info, upload interface, and documents list
- Handle loading and error states appropriately
*/

'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

export default function DocumentsPage() {
  // Get the current signed-in user from Clerk
  const { user, isLoaded, isSignedIn } = useUser()
  
  // State management
  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Fetch documents from API
  const fetchDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true)
      const response = await fetch('/api/documents/list')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else {
        console.error('Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setDocumentsLoading(false)
    }
  }, [])

  // Load documents on component mount
  useEffect(() => {
    if (isSignedIn) {
      fetchDocuments()
    }
  }, [isSignedIn, fetchDocuments])

  // Handle document upload
  const handleDocumentUpload = async (file, documentName) => {
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', documentName || file.name)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result)
        // Refresh documents list
        await fetchDocuments()
        setUploadProgress(100)
      } else {
        const error = await response.json()
        console.error('Upload failed:', error)
        alert('Upload failed: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle document deletion
  const handleDocumentDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/delete?id=${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove document from local state
        setDocuments(docs => docs.filter(doc => doc.id !== documentId))
        alert('Document deleted successfully')
      } else {
        const error = await response.json()
        console.error('Delete failed:', error)
        alert('Delete failed: ' + (error.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed: ' + error.message)
    }
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDocumentUpload(e.dataTransfer.files[0])
    }
  }

  // Handle file input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleDocumentUpload(e.target.files[0])
    }
  }

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Please sign in to access documents
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to view and manage documents.
          </p>
          <a 
            href="/sign-in" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">
            Manage and organize your safety documents and files.
          </p>
        </div>

        {/* User Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900 font-medium">
                {user?.fullName || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 font-medium">
                {user?.primaryEmailAddress?.emailAddress || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <p className="text-gray-600 text-sm font-mono">
                {user?.id || 'Not available'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <p className="text-gray-600">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
              </p>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
          
          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                isUploading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </label>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
            <button
              onClick={fetchDocuments}
              disabled={documentsLoading}
              className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {documentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {document.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Version {document.current_version}</span>
                        <span>•</span>
                        <span>Created {new Date(document.created_at).toLocaleDateString()}</span>
                        {document.document_versions && document.document_versions.length > 0 && (
                          <>
                            <span>•</span>
                            <span>
                              {document.document_versions.length} version{document.document_versions.length !== 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDocumentDelete(document.id)}
                        className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Document Versions */}
                  {document.document_versions && document.document_versions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Versions:</h4>
                      <div className="space-y-1">
                        {document.document_versions.map((version, index) => (
                          <div key={version.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              v{version.version} - {version.storage_path.split('/').pop()}
                            </span>
                            <span className="text-gray-500">
                              {new Date(version.uploaded_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
