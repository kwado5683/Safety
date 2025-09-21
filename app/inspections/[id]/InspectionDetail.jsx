/*
DESCRIPTION: Client component that displays detailed inspection information.
- Shows inspection overview, statistics, and detailed results
- Displays failed items with photos and notes
- Provides interactive elements and proper mobile responsiveness
- Uses proper dark mode contrast for accessibility

WHAT EACH PART DOES:
1. useState - Manages image modal state for viewing photos
2. Interactive elements - Photo viewing and result filtering
3. Statistics calculation - Computes pass/fail rates and critical failures
4. Responsive design - Adapts to different screen sizes

PSEUDOCODE:
- Display inspection overview with key information
- Show statistics summary with color-coded results
- List all inspection items with results and notes
- Highlight failed items and critical failures
- Provide photo viewing functionality
*/

'use client'

import { useState } from 'react'
import ImageModal from '@/components/ImageModal'

export default function InspectionDetail({ inspection, responses }) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Calculate statistics
  const total = responses.length
  const passed = responses.filter(r => r.result === 'pass').length
  const failed = responses.filter(r => r.result === 'fail').length
  const na = responses.filter(r => r.result === 'na').length
  const criticalFails = responses.filter(r => 
    r.result === 'fail' && r.checklist_items?.critical
  ).length

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get status color and text
  const getStatusInfo = (inspection) => {
    if (!inspection.submitted_at) {
      return { color: 'text-yellow-600 dark:text-yellow-400', text: 'In Progress', bg: 'bg-yellow-100 dark:bg-yellow-900/20' }
    }
    return { color: 'text-green-600 dark:text-green-400', text: 'Completed', bg: 'bg-green-100 dark:bg-green-900/20' }
  }

  // Get result color
  const getResultColor = (result) => {
    switch (result?.toLowerCase()) {
      case 'pass':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'fail':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'na':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  // Handle image click
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  const status = getStatusInfo(inspection)
  const failedItems = responses.filter(r => r.result === 'fail')

  return (
    <>
      {/* Inspection Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {inspection.checklists?.name || 'Unknown Checklist'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {inspection.checklists?.category || 'No Category'}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.bg}`}>
            {status.text}
          </span>
        </div>

        {/* Inspection Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">Inspection ID</dt>
            <dd className="text-sm text-slate-900 dark:text-slate-100 font-mono">INS-{inspection.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">Inspector</dt>
            <dd className="text-sm text-slate-900 dark:text-slate-100">{inspection.inspector_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">Started</dt>
            <dd className="text-sm text-slate-900 dark:text-slate-100">{formatDate(inspection.started_at)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">Completed</dt>
            <dd className="text-sm text-slate-900 dark:text-slate-100">{formatDate(inspection.submitted_at)}</dd>
          </div>
        </div>

        {/* PDF Download Button */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => window.open(`/api/inspections/${inspection.id}/pdf`, '_blank')}
            disabled={!inspection.submitted_at}
            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{total}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Total Items</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{passed}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Passed</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failed}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Failed</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{na}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">N/A</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalFails}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Critical Fails</div>
        </div>
      </div>

      {/* Failed Items Section */}
      {failedItems.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Failed Items ({failedItems.length})
          </h2>
          
          <div className="space-y-4">
            {failedItems.map((item, index) => (
              <div key={index} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {item.checklist_items?.text || 'Unknown Item'}
                  </h3>
                  {item.checklist_items?.critical && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                      CRITICAL
                    </span>
                  )}
                </div>
                
                {item.note && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{item.note}</p>
                )}
                
                {item.photos && item.photos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {item.photos.map((photo, photoIndex) => (
                      <button
                        key={photoIndex}
                        onClick={() => handleImageClick(photo)}
                        className="w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 transition-colors"
                      >
                        <img
                          src={photo}
                          alt={`Inspection photo ${photoIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Results Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          All Results
        </h2>
        
        <div className="space-y-3">
          {responses.map((response, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {response.checklist_items?.text || 'Unknown Item'}
                  </span>
                  {response.checklist_items?.critical && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                      CRITICAL
                    </span>
                  )}
                </div>
                {response.note && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{response.note}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultColor(response.result)}`}>
                {response.result?.toUpperCase() || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  )
}
