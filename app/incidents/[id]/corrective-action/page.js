/*
DESCRIPTION: This is the corrective action page for a specific incident.
- Displays incident details in a read-only format
- Provides a form for creating corrective actions
- Includes file upload functionality
- Supports printing the corrective action
- Protected by authentication (requires login)

WHAT EACH PART DOES:
1. 'use client' - Tells Next.js this component runs in the browser
2. useState - Manages component state (incident data, form data, loading)
3. useParams - Gets the incident ID from the URL
4. useEffect - Fetches incident data when component loads
5. Form handling - Manages corrective action form submission

PSEUDOCODE:
- Get incident ID from URL parameters
- Fetch incident details from API
- Display incident information in read-only format
- Provide form for corrective action details
- Handle file uploads for supporting documents
- Submit corrective action data to API
- Provide print functionality
*/

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import DashboardLayout from '@/components/DashboardLayout'
import ImageUpload from '@/components/ImageUpload'

// Form validation schema
const correctiveActionSchema = yup.object({
  actionPlan: yup.string().required('Action plan is required'),
  correctiveAction: yup.string().required('Corrective action is required'),
  responsibleOfficer: yup.string().required('Responsible officer is required'),
  targetDate: yup.string().required('Target date is required'),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required')
})

export default function CorrectiveActionPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params.id

  // State management
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [attachments, setAttachments] = useState([])

  // Form handling
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(correctiveActionSchema),
    defaultValues: {
      status: 'pending',
      priority: 'medium'
    }
  })

  // Fetch incident details
  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/incidents/${incidentId}`)
        if (response.ok) {
          const data = await response.json()
          setIncident(data.incident)
        } else {
          setError('Incident not found')
        }
      } catch (err) {
        console.error('Error fetching incident:', err)
        setError('Failed to load incident details')
      } finally {
        setLoading(false)
      }
    }

    if (incidentId) {
      fetchIncident()
    }
  }, [incidentId])

  // Handle file upload
  const handleFileUpload = (url) => {
    setAttachments(prev => [...prev, { url, type: 'image' }])
  }

  const handleFileRemove = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      setError(null)

      const correctiveActionData = {
        ...data,
        incidentId: parseInt(incidentId),
        attachments: attachments,
        createdAt: new Date().toISOString()
      }

      const response = await fetch('/api/corrective-actions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(correctiveActionData),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/incidents')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit corrective action')
      }
    } catch (err) {
      console.error('Error submitting corrective action:', err)
      setError('Failed to submit corrective action. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Print function
  const handlePrint = () => {
    window.print()
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error && !incident) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/incidents')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Incidents
          </button>
        </div>
      </DashboardLayout>
    )
  }

  // Success state
  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Corrective Action Submitted Successfully!</h2>
            <p className="text-sm sm:text-base text-slate-600 mb-4">Your corrective action has been recorded and will be reviewed.</p>
            <p className="text-xs sm:text-sm text-slate-500">Redirecting to incidents list...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Corrective Action Plan</h1>
            <p className="text-sm sm:text-base text-slate-600">Create and manage corrective actions for incident #{incidentId}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`/reports/incident/${incidentId}`, '_blank')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={() => router.push('/incidents')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Incidents
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Incident Details Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Incident Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Incident Type</label>
                <p className="text-slate-900 font-medium">{incident?.incidentType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  incident?.severity === '5' ? 'bg-red-100 text-red-800' :
                  incident?.severity === '4' ? 'bg-orange-100 text-orange-800' :
                  incident?.severity === '3' ? 'bg-yellow-100 text-yellow-800' :
                  incident?.severity === '2' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {incident?.severity}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <p className="text-slate-900">{incident?.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time of Incident</label>
                <p className="text-slate-900">
                  {incident?.timeOfIncident ? new Date(incident.timeOfIncident).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reported By</label>
                <p className="text-slate-900 font-medium">{incident?.reportedBy}</p>
                {incident?.reporterPhone && (
                  <p className="text-slate-600 text-sm">{incident.reporterPhone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Timestamp</label>
                <p className="text-slate-900">
                  {incident?.reportTimestamp ? new Date(incident.reportTimestamp).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg text-sm">
                  {incident?.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Incident Image */}
          {incident?.hasImage && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Incident Image</label>
              <div className="max-w-md">
                <img
                  src={incident.imagePreview.url}
                  alt={incident.imagePreview.alt}
                  className="w-full h-auto rounded-lg border border-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Corrective Action Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Corrective Action Plan</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Action Plan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Action Plan <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('actionPlan')}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe the detailed action plan to address this incident..."
                />
                {errors.actionPlan && (
                  <p className="mt-1 text-xs text-red-600">{errors.actionPlan.message}</p>
                )}
              </div>

              {/* Corrective Action */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Corrective Action <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('correctiveAction')}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe the specific corrective actions to be taken..."
                />
                {errors.correctiveAction && (
                  <p className="mt-1 text-xs text-red-600">{errors.correctiveAction.message}</p>
                )}
              </div>

              {/* Responsible Officer */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Responsible Officer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('responsibleOfficer')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter responsible officer name"
                />
                {errors.responsibleOfficer && (
                  <p className="mt-1 text-xs text-red-600">{errors.responsibleOfficer.message}</p>
                )}
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('targetDate')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {errors.targetDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.targetDate.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('priority')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-xs text-red-600">{errors.priority.message}</p>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Supporting Documents (Optional)
              </label>
              <ImageUpload
                onImageUpload={handleFileUpload}
                onImageRemove={() => {}} // We'll handle this differently for multiple files
                initialImage={null}
              />
              
              {/* Display uploaded attachments */}
              {attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Uploaded Files:</h4>
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                        <span className="text-sm text-slate-600">Document {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleFileRemove(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Corrective Action
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          .print-container {
            max-width: none;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
