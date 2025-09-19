'use client'
/*
DESCRIPTION: Client component for managing training courses.
- Displays all training courses in a responsive layout
- Provides create, edit, and delete functionality
- Mobile-optimized with cards layout
- Form handling for course creation and editing

WHAT EACH PART DOES:
1. State management - Tracks courses data and form states
2. CRUD operations - Create, read, update, delete courses
3. Form handling - Course creation and editing forms
4. Responsive layout - Mobile-first card design
5. Date formatting - Shows creation dates

PSEUDOCODE:
- Display courses in responsive cards
- Show create course form
- Handle edit/delete operations
- Format dates for display
- Handle loading and error states
*/

import { useState } from 'react'

/**
 * CourseManager component - Displays and manages training courses
 */
export default function CourseManager({ courses }) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    validity_months: ''
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

  // Get validity display
  const getValidityDisplay = (validityMonths) => {
    if (!validityMonths) return 'No expiry'
    return `${validityMonths} months`
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      validity_months: ''
    })
    setIsCreating(false)
    setEditingCourse(null)
    setError(null)
    setSuccess('')
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle create course
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/training/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validity_months: formData.validity_months ? parseInt(formData.validity_months) : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create course')
      }

      setSuccess('Course created successfully!')
      resetForm()
      // Refresh the page to show new course
      window.location.reload()
    } catch (error) {
      console.error('Error creating course:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit course
  const handleEditCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/training/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration_hours: parseFloat(formData.duration_hours)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update course')
      }

      setSuccess('Course updated successfully!')
      resetForm()
      // Refresh the page to show updated course
      window.location.reload()
    } catch (error) {
      console.error('Error updating course:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete course
  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/training/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete course')
      }

      setSuccess('Course deleted successfully!')
      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting course:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Start editing a course
  const startEditing = (course) => {
    setFormData({
      name: course.name,
      validity_months: course.validity_months || ''
    })
    setEditingCourse(course)
    setIsCreating(false)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Training Courses
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage training courses for your organization.
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setIsCreating(true)
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Course
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingCourse) && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </h2>
          
          <form onSubmit={editingCourse ? handleEditCourse : handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Validity (Months)
                </label>
                <input
                  type="number"
                  name="validity_months"
                  value={formData.validity_months}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-slate-100"
                  placeholder="Enter validity in months (optional)"
                />
              </div>

            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      {courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {course.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200`}>
                      Course
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><span className="font-medium">Validity:</span> {getValidityDisplay(course.validity_months)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => startEditing(course)}
                    className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            No Training Courses Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Create your first training course to get started.
          </p>
          <button
            onClick={() => {
              resetForm()
              setIsCreating(true)
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Course
          </button>
        </div>
      )}
    </div>
  )
}
