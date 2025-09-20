/*
DESCRIPTION: Inspection detail page that shows complete inspection information.
- Fetches and displays detailed inspection data including all responses
- Shows inspection results, photos, and notes
- Provides PDF download functionality
- Mobile-first responsive design with proper dark mode contrast

WHAT EACH PART DOES:
1. Server component that fetches detailed inspection data
2. Displays inspection information, responses, and statistics
3. Shows photos and notes for failed items
4. Provides action buttons for PDF download and navigation

PSEUDOCODE:
- Fetch inspection details with checklist and responses
- Calculate and display statistics
- Show detailed results with photos and notes
- Provide PDF download and navigation actions
*/

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabaseServer'
import Link from 'next/link'
import InspectionDetail from './InspectionDetail'
import DashboardLayout from '@/components/DashboardLayout'

export default async function InspectionDetailPage({ params }) {
  // Check authentication
  const { userId } = await auth()
  
  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Please Sign In</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">You need to be signed in to view inspection details.</p>
          <Link href="/sign-in" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const { id: inspectionId } = await params

  const supabase = createAdminClient()

  // Fetch inspection data with checklist
  const { data: inspection, error: inspectionError } = await supabase
    .from('inspections')
    .select(`
      id,
      checklist_id,
      inspector_id,
      started_at,
      submitted_at,
      checklists (
        id,
        name,
        category
      )
    `)
    .eq('id', inspectionId)
    .single()

  if (inspectionError || !inspection) {
    console.error('Error fetching inspection:', inspectionError)
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Inspection Not Found
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            The requested inspection could not be found or you don't have permission to view it.
          </p>
          <Link
            href="/inspections"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Inspections
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  // Fetch inspection responses with checklist items
  const { data: responses, error: responsesError } = await supabase
    .from('inspection_responses')
    .select(`
      id,
      item_id,
      result,
      note,
      photos,
      checklist_items (
        id,
        text,
        critical
      )
    `)
    .eq('inspection_id', inspectionId)
    .order('id', { ascending: true })

  if (responsesError) {
    console.error('Error fetching inspection responses:', responsesError)
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Error Loading Inspection Data
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            There was a problem loading the inspection responses.
          </p>
          <Link
            href="/inspections"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Inspections
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/inspections"
              className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Inspections
            </Link>
          </div>
          
          <div className="flex gap-3">
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

        {/* Inspection Detail */}
        <InspectionDetail inspection={inspection} responses={responses || []} />
      </div>
    </DashboardLayout>
  )
}
