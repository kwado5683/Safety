/*
Description: Document management page with version control.
- Upload new documents or new versions of existing documents.
- List documents with latest version info.
- View version history and download files.

Pseudocode:
- Load documents list on mount
- Show upload form for new documents
- Display documents in cards with latest version
- Show version history in modal/drawer
- Handle file uploads with progress
*/
import { useEffect, useState } from 'react'
import ClientLayout from '../../components/ClientLayout'

export default function DocumentsIndexPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [versions, setVersions] = useState([])
  
  // Upload form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isNewVersion, setIsNewVersion] = useState(false)
  const [selectedDocumentForUpload, setSelectedDocumentForUpload] = useState(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    setLoading(true)
    const res = await fetch('/api/documents/list?pageSize=100')
    if (res.ok) {
      const data = await res.json()
      setDocuments(data.items || [])
    }
    setLoading(false)
  }

  async function loadVersions(documentId) {
    const res = await fetch(`/api/documents/versions?document_id=${documentId}`)
    if (res.ok) {
      const data = await res.json()
      setVersions(data.versions || [])
    }
  }

  function openHistoryDrawer(document) {
    setSelectedDocument(document)
    loadVersions(document.id)
    setHistoryDrawerOpen(true)
  }

  function openUploadForm(document = null) {
    if (document) {
      // New version of existing document
      setIsNewVersion(true)
      setSelectedDocumentForUpload(document)
      setTitle(document.title)
      setDescription(document.description || '')
      setCategory(document.category || '')
    } else {
      // New document
      setIsNewVersion(false)
      setSelectedDocumentForUpload(null)
      setTitle('')
      setDescription('')
      setCategory('')
    }
    setSelectedFile(null)
  }

  function resetUploadForm() {
    setTitle('')
    setDescription('')
    setCategory('')
    setSelectedFile(null)
    setIsNewVersion(false)
    setSelectedDocumentForUpload(null)
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!title || !selectedFile) {
      alert('Please fill in title and select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('file', selectedFile)
    
    if (isNewVersion && selectedDocumentForUpload) {
      formData.append('document_id', selectedDocumentForUpload.id)
    }

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      resetUploadForm()
      loadDocuments()
    } else {
      alert('Failed to upload document')
    }
    setUploading(false)
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  function getFileIcon(contentType) {
    if (contentType.includes('pdf')) return '📄'
    if (contentType.includes('word') || contentType.includes('document')) return '📝'
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊'
    if (contentType.includes('image')) return '🖼️'
    return '📎'
  }

  return (
    <ClientLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Document Management</h1>
        <button
          onClick={() => openUploadForm()}
          className="rounded-full bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-500"
        >
          Upload Document
        </button>
      </div>

      {/* Upload Form */}
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">
          {isNewVersion ? 'Upload New Version' : 'Upload New Document'}
        </h2>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              File *
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-neutral-600">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetUploadForm}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : (isNewVersion ? 'Upload Version' : 'Upload Document')}
            </button>
          </div>
        </form>
      </div>

      {/* Documents List */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-600">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="col-span-full text-center py-8 text-neutral-600">No documents found</div>
        ) : (
          documents.map((document) => (
            <div key={document.id} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-neutral-900">{document.title}</h3>
                  <span className="text-xs text-neutral-500">v{document.current_version}</span>
                </div>
                {document.description && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{document.description}</p>
                )}
                {document.category && (
                  <span className="inline-block text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                    {document.category}
                  </span>
                )}
              </div>

              {document.latest_version && (
                <div className="mb-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getFileIcon(document.latest_version.content_type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">
                        {document.latest_version.file_name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {formatFileSize(document.latest_version.file_size)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Uploaded: {new Date(document.latest_version.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {document.latest_version?.file_url && (
                  <a
                    href={document.latest_version.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-full bg-indigo-600 text-white text-xs px-3 py-1.5 text-center hover:bg-indigo-500"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={() => openHistoryDrawer(document)}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  History
                </button>
                <button
                  onClick={() => openUploadForm(document)}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  New Version
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Version History Drawer */}
      {historyDrawerOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Version History</h2>
                <button
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-neutral-900">{selectedDocument.title}</h3>
                {selectedDocument.description && (
                  <p className="text-sm text-neutral-600">{selectedDocument.description}</p>
                )}
              </div>

              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getFileIcon(version.content_type)}</span>
                      <div>
                        <div className="font-medium text-neutral-900">
                          Version {version.version_number}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {version.file_name}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatFileSize(version.file_size)} • {new Date(version.uploaded_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {version.file_url && (
                      <a
                        href={version.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-indigo-600 text-white text-xs px-3 py-1.5 hover:bg-indigo-500"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}
