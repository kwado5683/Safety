/*
DESCRIPTION: Client component that displays the list of inspections with interactive features.
- Shows inspection cards with status, dates, and summary statistics
- Provides action buttons for viewing details and downloading PDF reports
- Handles loading states and empty states
- Mobile-first responsive design with proper dark mode contrast

WHAT EACH PART DOES:
1. useState - Manages inspection response data and loading states
2. useEffect - Fetches inspection responses when component mounts
3. Interactive buttons - Download PDF and view details functionality
4. Responsive cards - Adapts to different screen sizes

PSEUDOCODE:
- Display inspection cards in a responsive grid
- Show inspection status, dates, and summary
- Add action buttons for PDF download and details
- Handle loading and empty states gracefully
*/

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function InspectionsList({ inspections }) {
  const [inspectionStats, setInspectionStats] = useState({})
  const [loading, setLoading] = useState(true)

  // Fetch inspection statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsPromises = inspections.map(async (inspection) => {
          const response = await fetch(`/api/inspections/${inspection.id}/stats`)
          if (response.ok) {
            const stats = await response.json()
            return { [inspection.id]: stats }
          }
          return { [inspection.id]: null }
        })

        const results = await Promise.all(statsPromises)
        const statsMap = results.reduce((acc, curr) => ({ ...acc, ...curr }), {})
        setInspectionStats(statsMap)
      } catch (error) {
        console.error('Error fetching inspection stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (inspections.length > 0) {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [inspections])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  // Get stats display
  const getStatsDisplay = (inspectionId) => {
    const stats = inspectionStats[inspectionId]
    if (!stats) return 'Loading...'
    
    return (
      <div className="text-xs text-slate-600 dark:text-slate-300">
        {stats.total || 0} items • {stats.passed || 0} passed • {stats.failed || 0} failed
        {stats.critical_fails > 0 && (
          <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">
            ({stats.critical_fails} critical)
          </span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-3/4"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No Inspections Yet
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Start your first safety inspection to track compliance and identify issues.
        </p>
        <Link
          href="/inspections/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Inspection
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inspections.map((inspection) => {
        const status = getStatusInfo(inspection)
        const stats = inspectionStats[inspection.id]
        
        return (
          <div key={inspection.id} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {inspection.checklists?.name || 'Unknown Checklist'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {inspection.checklists?.category || 'No Category'}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                {status.text}
              </span>
            </div>

            {/* Inspection Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Started:</span>
                <span className="text-slate-900 dark:text-slate-100">{formatDate(inspection.started_at)}</span>
              </div>
              {inspection.submitted_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Completed:</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatDate(inspection.submitted_at)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Inspector:</span>
                <span className="text-slate-900 dark:text-slate-100">{inspection.inspector_id}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-4">
              {getStatsDisplay(inspection.id)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/api/inspections/${inspection.id}/pdf`, '_blank')}
                disabled={!inspection.submitted_at}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              
              <Link
                href={`/inspections/${inspection.id}`}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
