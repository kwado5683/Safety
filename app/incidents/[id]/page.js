/*
DESCRIPTION: This is the incident detail page that displays a specific incident's information.
- Shows complete incident details in a read-only format
- Includes incident images and all metadata
- Provides actions like viewing corrective actions and downloading PDF
- Protected by authentication (requires login)

WHAT EACH PART DOES:
1. 'use client' - Tells Next.js this component runs in the browser
2. useState - Manages component state (incident data, loading)
3. useParams - Gets the incident ID from the URL
4. useEffect - Fetches incident data when component loads
5. Conditional rendering - Shows different content based on data state

PSEUDOCODE:
- Get incident ID from URL parameters
- Fetch incident details from API
- Display incident information in a clean layout
- Provide action buttons for corrective actions and PDF download
- Handle loading and error states
*/

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import ImageModal from '@/components/ImageModal'

export default function IncidentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const incidentId = params.id

  // State management
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageModal, setImageModal] = useState({ isOpen: false, imageData: null })

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

  // Handle image modal
  const handleImageClick = (imageData) => {
    setImageModal({ isOpen: true, imageData })
  }

  const handleCloseImageModal = () => {
    setImageModal({ isOpen: false, imageData: null })
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Incident #{incidentId}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              {incident?.incidentType} • {incident?.location}
            </p>
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
            <Link
              href={`/incidents/${incidentId}/corrective-action`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Corrective Action
            </Link>
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

        {/* Incident Details Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Incident Details</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Incident Type</label>
                  <p className="text-slate-900 font-medium">{incident?.incidentType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    incident?.severity === '5' ? 'bg-red-100 text-red-800' :
                    incident?.severity === '4' ? 'bg-orange-100 text-orange-800' :
                    incident?.severity === '3' ? 'bg-yellow-100 text-yellow-800' :
                    incident?.severity === '2' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {incident?.severity}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <p className="text-slate-900">{incident?.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Incident</label>
                  <p className="text-slate-900">
                    {incident?.timeOfIncident ? new Date(incident.timeOfIncident).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {incident?.timeOfIncident ? new Date(incident.timeOfIncident).toLocaleTimeString() : ''}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reported On</label>
                  <p className="text-slate-900">
                    {incident?.reportTimestamp ? new Date(incident.reportTimestamp).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {incident?.reportTimestamp ? new Date(incident.reportTimestamp).toLocaleTimeString() : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reported By</label>
                <p className="text-slate-900 font-medium">{incident?.reportedBy}</p>
                {incident?.reporterPhone && (
                  <p className="text-slate-600 text-sm">{incident.reporterPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-slate-900 leading-relaxed">
                    {incident?.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Incident Image */}
          {incident?.hasImage && (
            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-700 mb-3">Incident Image</label>
              <div className="max-w-md">
                <button
                  onClick={() => handleImageClick(incident.imagePreview)}
                  className="relative group"
                >
                  <img
                    src={incident.imagePreview.url}
                    alt={incident.imagePreview.alt}
                    className="w-full h-auto rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
                <p className="text-xs text-slate-500 mt-2">Click to view full size</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={`/incidents/${incidentId}/corrective-action`}
              className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-indigo-900">Create Corrective Action</h3>
                <p className="text-xs text-indigo-600">Add action plan and assign responsibilities</p>
              </div>
            </Link>

            <button
              onClick={() => window.open(`/reports/incident/${incidentId}`, '_blank')}
              className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-900">Download PDF Report</h3>
                <p className="text-xs text-red-600">Generate professional incident report</p>
              </div>
            </button>

            <Link
              href="/incidents"
              className="flex items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-900">View All Incidents</h3>
                <p className="text-xs text-slate-600">Return to incidents list</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        imageData={imageModal.imageData}
        onClose={handleCloseImageModal}
      />
    </DashboardLayout>
  )
}
