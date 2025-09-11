/*
DESCRIPTION: This component provides a document viewer modal for reading documents.
- Displays documents in a modal overlay
- Supports PDF, images, and text files
- Provides download functionality
- Handles different file types appropriately

WHAT EACH PART DOES:
1. Modal overlay - Creates a full-screen modal for document viewing
2. File type detection - Determines how to display different file types
3. PDF viewer - Uses iframe for PDF documents
4. Image viewer - Displays images with zoom controls
5. Text viewer - Shows text files in a readable format

PSEUDOCODE:
- Create modal overlay with backdrop
- Detect file type from URL or props
- Render appropriate viewer based on file type
- Provide download and close functionality
*/

'use client'

import { useState, useEffect } from 'react'

export default function DocumentViewer({ 
  isOpen, 
  onClose, 
  documentId, 
  documentName, 
  version = 'latest',
  fileType = 'pdf' 
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [documentUrl, setDocumentUrl] = useState(null)

  // Generate document URL when component opens
  useEffect(() => {
    if (isOpen && documentId) {
      const url = `/api/documents/view?id=${documentId}&version=${version}&action=view`
      setDocumentUrl(url)
      setLoading(false)
    }
  }, [isOpen, documentId, version])

  // Handle download
  const handleDownload = () => {
    if (documentId) {
      const downloadUrl = `/api/documents/view?id=${documentId}&version=${version}&action=download`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = documentName || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Handle modal close
  const handleClose = () => {
    setDocumentUrl(null)
    setError(null)
    setLoading(false)
    onClose()
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {fileType === 'pdf' && (
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                )}
                {fileType.startsWith('image') && (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
                {fileType === 'text' && (
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {documentName || 'Document Viewer'}
                </h3>
                <p className="text-sm text-gray-500">
                  Version {version === 'latest' ? 'Latest' : version}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading document</h3>
                  <p className="mt-1 text-sm text-gray-500">{error}</p>
                </div>
              </div>
            ) : (
              <div className="h-96 sm:h-[600px]">
                {fileType === 'pdf' ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title={documentName}
                  />
                ) : fileType.startsWith('image') ? (
                  <div className="flex items-center justify-center h-full">
                    <img
                      src={documentUrl}
                      alt={documentName}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  </div>
                ) : fileType === 'text' ? (
                  <div className="h-full overflow-auto">
                    <iframe
                      src={documentUrl}
                      className="w-full h-full border-0 rounded-lg"
                      title={documentName}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Preview not available</h3>
                      <p className="mt-1 text-sm text-gray-500">This file type cannot be previewed</p>
                      <button
                        onClick={handleDownload}
                        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download to view
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
