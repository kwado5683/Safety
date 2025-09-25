'use client'
/*
DESCRIPTION: Client component for managing training records.
- Displays user's training records and certificates
- Allows adding new training records
- Handles certificate file uploads
- Mobile-first responsive design
- Shows completion status and expiry dates

WHAT EACH PART DOES:
1. State management - Tracks training records and form states
2. File upload - Handles certificate uploads to documents storage
3. Form handling - Training record creation and editing
4. Status display - Shows completion and expiry status
5. Mobile optimization - Responsive card layout

PSEUDOCODE:
- Display training records in responsive cards
- Show add new training record form
- Handle certificate file uploads
- Display completion status and expiry dates
- Handle loading and error states
*/

import { useState, useRef } from 'react'

/**
 * TrainingRecords component - Displays and manages user training records
 */
export default function TrainingRecords({ trainingRecords, availableCourses, userId }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const fileInputRef = useRef(null)
  
  // Form state
  const [formData, setFormData] = useState({
    course_id: '',
    completed_on: '',
    expires_on: '',
    certificate_file: null
  })

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if training is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  // Check if training expires soon (within 30 days)
  const expiresSoon = (expiryDate) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow && expiry > new Date()
  }

  // Get status color
  const getStatusColor = (expiryDate) => {
    if (isExpired(expiryDate)) return 'bg-red-100 text-red-800'
    if (expiresSoon(expiryDate)) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  // Get status text
  const getStatusText = (expiryDate) => {
    if (isExpired(expiryDate)) return 'Expired'
    if (expiresSoon(expiryDate)) return 'Expires Soon'
    return 'Completed'
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      course_id: '',
      completed_on: '',
      expires_on: '',
      certificate_file: null
    })
    setIsAdding(false)
    setEditingRecord(null)
    setError(null)
    setSuccess('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        certificate_file: file
      }))
    }
  }

  // Upload certificate file
  const uploadCertificate = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'training_certificates')
    formData.append('description', `Training certificate: ${file.name}`)

    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload certificate')
    }

    const result = await response.json()
    return result.documentUrl
  }

  // Handle add/edit training record
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let certificateUrl = null

      // Upload certificate if file is selected
      if (formData.certificate_file) {
        setUploading(true)
        certificateUrl = await uploadCertificate(formData.certificate_file)
        setUploading(false)
      }

      const recordData = {
        course_id: formData.course_id,
        user_id: userId,
        completed_on: formData.completed_on,
        expires_on: formData.expires_on || null,
        certificate_url: certificateUrl
      }

      const response = await fetch('/api/training/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save training record')
      }

      setSuccess('Training record saved successfully!')
      resetForm()
      // Refresh the page to show new record
      window.location.reload()
    } catch (error) {
      console.error('Error saving training record:', error)
      setError(error.message)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  // Handle delete training record
  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Are you sure you want to delete this training record? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/training/records/${recordId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete training record')
      }

      setSuccess('Training record deleted successfully!')
      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting training record:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Start editing a record
  const startEditing = (record) => {
    setFormData({
      course_id: record.course_id,
      completed_on: record.completed_on,
      expires_on: record.expires_on || '',
      certificate_file: null
    })
    setEditingRecord(record)
    setIsAdding(false)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              My Training Records
            </h1>
            <p className="text-slate-600">
              Track your training completion and certificates.
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setIsAdding(true)
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Training Record
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingRecord) && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            {editingRecord ? 'Edit Training Record' : 'Add New Training Record'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Training Course *
                </label>
                <select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a course</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} {course.validity_months ? `(${course.validity_months} months validity)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Completion Date *
                </label>
                <input
                  type="date"
                  name="completed_on"
                  value={formData.completed_on}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expires_on"
                  value={formData.expires_on}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Certificate (PDF, JPG, PNG)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {uploading && (
                <p className="text-sm text-blue-600 mt-1">
                  Uploading certificate...
                </p>
              )}
            </div>


            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Training Records List */}
      {trainingRecords.length > 0 ? (
        <div className="space-y-4">
          {trainingRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">
                      {record.training_courses?.name || 'Unknown Course'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.expires_on)}`}>
                      {getStatusText(record.expires_on)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    {record.training_courses?.validity_months && (
                      <p><span className="font-medium">Validity:</span> {record.training_courses.validity_months} months</p>
                    )}
                    <p><span className="font-medium">Completed:</span> {formatDate(record.completed_on)}</p>
                    {record.expires_on && (
                      <p><span className="font-medium">Expires:</span> {formatDate(record.expires_on)}</p>
                    )}
                  </div>
                  
                  {record.certificate_url && (
                    <div className="mt-3">
                      <a
                        href={record.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Certificate
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => startEditing(record)}
                    className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No Training Records Yet
          </h3>
          <p className="text-slate-600 mb-6">
            Add your first training record to get started.
          </p>
          <button
            onClick={() => {
              resetForm()
              setIsAdding(true)
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Record
          </button>
        </div>
      )}
    </div>
  )
}
