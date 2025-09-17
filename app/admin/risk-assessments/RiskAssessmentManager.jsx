'use client'
/*
DESCRIPTION: Client component for managing Risk Assessments.
- Displays all risk assessments in a responsive layout
- Shows status indicators (draft/published)
- Provides create new RA button
- Mobile-optimized with cards layout

WHAT EACH PART DOES:
1. State management - Tracks risk assessments data
2. Status indicators - Shows draft/published status with colors
3. Create button - Links to new RA creation page
4. Responsive layout - Mobile-first card design
5. Date formatting - Shows creation and update dates

PSEUDOCODE:
- Display risk assessments in responsive cards
- Show status with color-coded indicators
- Provide create new RA button
- Format dates for display
- Handle empty state
*/

import Link from 'next/link'

/**
 * RiskAssessmentManager component - Displays and manages risk assessments
 */
export default function RiskAssessmentManager({ riskAssessments }) {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Risk Assessments
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage and create risk assessments for safety activities.
            </p>
          </div>
          
          <Link
            href="/ra/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New RA
          </Link>
        </div>
      </div>

      {/* Risk Assessments List */}
      {riskAssessments.length > 0 ? (
        <div className="space-y-4">
          {riskAssessments.map((ra) => (
            <div key={ra.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {ra.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ra.status)}`}>
                      {ra.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><span className="font-medium">Activity:</span> {ra.activity}</p>
                    <p><span className="font-medium">Location:</span> {ra.location}</p>
                    <p><span className="font-medium">Assessor:</span> {ra.assessor_id}</p>
                    <p><span className="font-medium">Version:</span> {ra.version}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>Created: {formatDate(ra.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {ra.status === 'draft' && (
                    <Link
                      href={`/ra/new?id=${ra.id}`}
                      className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-sm font-medium text-center"
                    >
                      Continue Editing
                    </Link>
                  )}
                  
                  <Link
                    href={`/ra/view/${ra.id}`}
                    className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
            No Risk Assessments Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Create your first risk assessment to get started with safety management.
          </p>
          <Link
            href="/ra/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First RA
          </Link>
        </div>
      )}
    </div>
  )
}
