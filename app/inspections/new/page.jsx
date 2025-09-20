/*
DESCRIPTION: Mobile-first inspection form page.
- Accepts checklistId as URL parameter
- Fetches checklist and items server-side
- Renders client form with PASS/FAIL/NA buttons
- Includes note fields and photo capture
- Saves draft to IndexedDB on each change
- Submits inspection data to API

WHAT EACH PART DOES:
1. Server component - Fetches checklist data server-side
2. Client form - Interactive inspection form with mobile-optimized UI
3. Draft saving - Auto-saves to IndexedDB using idb-keyval
4. Photo capture - Mobile camera integration with compression
5. API integration - Submits to inspection API endpoints

PSEUDOCODE:
- Get checklistId from URL searchParams
- Fetch checklist and items from database
- Render client form component
- Handle form interactions and draft saving
- Submit inspection data to API
*/

// Import Next.js components
import { Suspense } from 'react'
import Link from 'next/link'

// Import server-side functions
import { createAdminClient } from '@/lib/supabaseServer'

// Import client components
import InspectionForm from './InspectionForm'
import DashboardLayout from '@/components/DashboardLayout'

/**
 * Server component to fetch checklist data
 */
async function ChecklistData({ checklistId }) {
  try {
    const supabase = createAdminClient()
    
    // Fetch checklist with items
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select(`
        *,
        checklist_items (
          id,
          text,
          critical
        )
      `)
      .eq('id', checklistId)
      .eq('is_active', true)
      .single()

    if (checklistError || !checklist) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Checklist Not Found</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              The requested checklist could not be found or is not active.
            </p>
            <Link href="/admin/checklists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Back to Checklists
            </Link>
          </div>
        </div>
      )
    }

    return <InspectionForm checklist={checklist} />
  } catch (error) {
    console.error('Error fetching checklist:', error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Error</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            An error occurred while loading the checklist.
          </p>
          <Link href="/admin/checklists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Back to Checklists
          </Link>
        </div>
      </div>
    )
  }
}

/**
 * Main inspection page component
 */
export default async function NewInspectionPage({ searchParams }) {
  const resolvedSearchParams = await searchParams
  const checklistId = resolvedSearchParams?.checklistId

  if (!checklistId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Missing Checklist</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Please select a checklist to start an inspection.
          </p>
          <Link href="/admin/checklists" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
            Select Checklist
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/checklists"
            className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Checklists
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">New Inspection</h1>

        {/* Content */}
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4 w-1/2"></div>
          </div>
        }>
          <ChecklistData checklistId={checklistId} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
